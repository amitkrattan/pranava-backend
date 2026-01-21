const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const adminAuth = require("./middleware/adminAuth");

const router = express.Router();
const studentsPath = path.join(__dirname, "../data/student.json");

function load() {
  return JSON.parse(fs.readFileSync(studentsPath, "utf8"));
}
function save(data) {
  fs.writeFileSync(studentsPath, JSON.stringify(data, null, 2));
}

/* =========================================
   GENERATE / RESET STUDENT PASSWORD (ADMIN)
   ========================================= */
router.post("/generate-student-password", adminAuth, async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: "studentId required" });
  }

  const STUDENTS = load();
  const student = STUDENTS[studentId];

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // generate temp password
  const tempPassword =
    studentId.replace(/[^a-zA-Z0-9]/g, "").slice(-4) +
    Math.floor(1000 + Math.random() * 9000);

  student.passwordHash = await bcrypt.hash(tempPassword, 10);
  student.firstLogin = true;
  student.updatedAt = new Date().toISOString();

  save(STUDENTS);

  // ⚠️ RETURN ONLY ONCE
  res.json({
    success: true,
    studentId,
    tempPassword,
    note: "Show once only. Student must change password on first login."
  });
});

module.exports = router;
