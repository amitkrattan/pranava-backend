const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const router = express.Router();
const ADMIN_FILE = path.join(__dirname, "../data/admin.json");

/* ===============================
   LOAD ADMIN FILE
   =============================== */
function loadAdmin() {
  return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8"));
}

/* ===============================
   ADMIN LOGIN
   =============================== */
   const STUDENTS_FILE = path.join(__dirname, "../data/students.json");

function loadStudents() {
  if (!fs.existsSync(STUDENTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STUDENTS_FILE, "utf8"));
}

function saveStudents(data) {
  fs.writeFileSync(STUDENTS_FILE, JSON.stringify(data, null, 2));
}

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = loadAdmin();

    /* ===== FILE DEBUG ===== */
    console.log("ADMIN FILE PATH:", ADMIN_FILE);
    console.log("ADMIN FILE CONTENT:", admin);

    /* ===== REQUEST DEBUG ===== */
    console.log("LOGIN ATTEMPT EMAIL:", email);
    console.log("ADMIN FILE EMAIL:", admin.email);

    /* ===== BASIC CHECK ===== */
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (admin.email !== email) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    /* ===== PASSWORD DEBUG ===== */
    console.log("PLAIN PASSWORD (RAW):", password);
    console.log("PLAIN PASSWORD LENGTH:", password.length);
    console.log("HASH FROM FILE:", admin.password);
    console.log("HASH LENGTH:", admin.password.length);

    const match = await bcrypt.compare(password, admin.password);
    console.log("BCRYPT MATCH:", match);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    /* ===== TOKEN ===== */
    const token = jwt.sign(
      { role: "admin", email },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      admin: { email }
    });

  } catch (err) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =================================================
   ADMIN → GENERATE STUDENT PASSWORD
   POST /api/admin/generate-student-password
================================================== */
router.post("/generate-student-password", (req, res) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "studentId required" });
  }

  const students = loadStudents();

  if (!students[studentId]) {
    return res.status(404).json({ error: "Student not found" });
  }

  const newPassword = generatePassword();

  students[studentId].password = newPassword;
  students[studentId].firstLogin = true;

  saveStudents(students);

  return res.json({
    success: true,
    password: newPassword
  });
});
module.exports = router;