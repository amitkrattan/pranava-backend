const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const studentAuth = require("../middleware/studentAuth");

const router = express.Router();
const studentsPath = path.join(__dirname, "../data/students.json");

function load() { return JSON.parse(fs.readFileSync(studentsPath, "utf8")); }
function save(data) { fs.writeFileSync(studentsPath, JSON.stringify(data, null, 2)); }

router.post("/change-password", studentAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Old & new password required" });

  const STUDENTS = load();
  const student = STUDENTS[req.student.id];
  if (!student) return res.status(404).json({ error: "Student not found" });

  const ok = await bcrypt.compare(oldPassword, student.passwordHash);
  if (!ok) return res.status(401).json({ error: "Old password incorrect" });

  if (newPassword.length < 6)
    return res.status(400).json({ error: "Min 6 chars" });

  student.passwordHash = await bcrypt.hash(newPassword, 10);
  student.firstLogin = false;
  save(STUDENTS);

  // (Optional) issue fresh token without force flag
  const token = jwt.sign(
"jsonwebtoken").sign(
    { id: student.id, role: "student", forcePasswordChange: false },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ success: true, token });
});

module.exports = router;
