const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose
  .connect("mongodb://localhost:27017/user_management", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối MongoDB thành công");
  })
  .catch((error) => {
    console.error("Lỗi kết nối MongoDB:", error);
  });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ message: "Server đang hoạt động", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Có lỗi xảy ra!", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint không tồn tại" });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
