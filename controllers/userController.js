const User = require("../models/User");
const Role = require("../models/Role");

// Create User
const createUser = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      fullName,
      avatarUrl,
      status,
      role,
      loginCount,
    } = req.body;

    // Kiểm tra role có tồn tại không
    const existingRole = await Role.findOne({ _id: role, isDelete: false });
    if (!existingRole) {
      return res
        .status(400)
        .json({ message: "Role không tồn tại hoặc đã bị xóa" });
    }

    const user = new User({
      username,
      password,
      email,
      fullName: fullName || "",
      avatarUrl: avatarUrl || "",
      status: status || false,
      role,
      loginCount: loginCount || 0,
    });

    const savedUser = await user.save();

    // Populate role an toàn
    if (savedUser.role) {
      try {
        await savedUser.populate({
          path: "role",
          match: { isDelete: false },
        });
      } catch (populateError) {
        console.warn(
          "Không thể populate role khi tạo user:",
          populateError.message
        );
      }
    }

    res.status(201).json({
      message: "Tạo user thành công",
      data: savedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        message: `${field} đã tồn tại`,
        field: field,
      });
    } else {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

// Get all users (có tìm kiếm theo username và fullname)
const getAllUsers = async (req, res) => {
  try {
    const { username, fullName, page = 1, limit = 10 } = req.query;
    const query = { isDelete: false };

    // Tìm kiếm theo username
    if (username) {
      query.username = { $regex: username, $options: "i" };
    }

    // Tìm kiếm theo fullName
    if (fullName) {
      query.fullName = { $regex: fullName, $options: "i" };
    }

    const users = await User.find(query)
      .populate({
        path: "role",
        match: { isDelete: false },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      message: "Lấy danh sách user thành công",
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, isDelete: false }).populate({
      path: "role",
      match: { isDelete: false },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      message: "Lấy user thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Get user by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username, isDelete: false }).populate({
      path: "role",
      match: { isDelete: false },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      message: "Lấy user thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Kiểm tra role nếu có cập nhật
    if (updateData.role) {
      const existingRole = await Role.findOne({
        _id: updateData.role,
        isDelete: false,
      });
      if (!existingRole) {
        return res
          .status(400)
          .json({ message: "Role không tồn tại hoặc đã bị xóa" });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: id, isDelete: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    // Populate role an toàn
    if (user.role) {
      try {
        await user.populate({
          path: "role",
          match: { isDelete: false },
        });
      } catch (populateError) {
        console.warn("Không thể populate role:", populateError.message);
        // Tiếp tục mà không populate role
      }
    }

    res.json({
      message: "Cập nhật user thành công",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        message: `${field} đã tồn tại`,
        field: field,
      });
    } else {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

// Soft delete user
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      message: "Xóa user thành công",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Activate user - Kích hoạt tài khoản
const activateUser = async (req, res) => {
  try {
    const { email, username } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !username) {
      return res.status(400).json({
        message: "Email và username là bắt buộc",
        required: ["email", "username"],
      });
    }

    // Tìm user với email và username khớp
    const user = await User.findOne({
      email: email,
      username: username,
      isDelete: false,
    }).populate({
      path: "role",
      match: { isDelete: false },
    });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy user với thông tin email và username này",
      });
    }

    // Kiểm tra nếu user đã được kích hoạt
    if (user.status === true) {
      return res.status(400).json({
        message: "Tài khoản đã được kích hoạt trước đó",
        data: user,
      });
    }

    // Cập nhật status thành true
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { status: true },
      { new: true }
    ).populate({
      path: "role",
      match: { isDelete: false },
    });

    res.json({
      message: "Kích hoạt tài khoản thành công",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  softDeleteUser,
  activateUser,
};
