const Role = require("../models/Role");

// Create Role
const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    const role = new Role({
      name,
      description: description || "",
    });

    const savedRole = await role.save();

    res.status(201).json({
      message: "Tạo role thành công",
      data: savedRole,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Tên role đã tồn tại",
        field: "name",
      });
    } else {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { isDelete: false };

    const roles = await Role.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Role.countDocuments(query);

    res.json({
      message: "Lấy danh sách role thành công",
      data: roles,
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

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({ _id: id, isDelete: false });

    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }

    res.json({
      message: "Lấy role thành công",
      data: role,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const role = await Role.findOneAndUpdate(
      { _id: id, isDelete: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }

    res.json({
      message: "Cập nhật role thành công",
      data: role,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Tên role đã tồn tại",
        field: "name",
      });
    } else {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }
};

// Soft delete role
const softDeleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: true },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: "Không tìm thấy role" });
    }

    res.json({
      message: "Xóa role thành công",
      data: role,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  softDeleteRole,
};
