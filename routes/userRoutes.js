const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  softDeleteUser,
  activateUser,
} = require("../controllers/userController");

// User routes
router.post("/", createUser);
router.post("/activate", activateUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);
router.put("/:id", updateUser);
router.delete("/:id", softDeleteUser);

module.exports = router;
