const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/adminProtected");

const router = express.Router();

const STUDENT_FILE = path.join(__dirname, "../data/student.json");

/* ===============================
   HELPERS
   =============================== */
function loadStudents() {
  try {
    return JSON.parse(fs.readFileSync(STUDENT_FILE, "utf8")) || {};
  } catch {
    return {};
  }
}

function saveStudents(data) {
  fs.writeFileSync(STUDENT_FILE, JSON.stringify(data, null, 2));
}

/* ===============================
   GENERATE / RESET STUDENT PASSWORD
   POST /api/admin/generate-student-password
   =============================== */
router.post("/generate-student-password", adminAuth, async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res
        .status(400)
        .json({ error: "studentId is required" });
    }

    const students = loadStudents();
    const student = students[studentId];

    if (!student) {
      return res
        .status(404)
        .json({ error: "Student not found" });
    }

    // 🔑 generate temporary password
    const tempPassword =
      Math.random().toString(36).slice(-8) +
      Math.floor(Math.random() * 90 + 10);

    const hashed = await bcrypt.hash(tempPassword, 10);

    // 🔐 update student record
    student.password = hashed;
    student.firstLogin = true;

    saveStudents(students);

    console.log("🔑 Password generated for:", studentId);

    res.json({
      success: true,
      password: tempPassword
    });

  } catch (err) {
    console.error("❌ Password generation failed", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
