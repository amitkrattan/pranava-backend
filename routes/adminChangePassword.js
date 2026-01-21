// backend/routes/adminChangePassword.js

console.log("✅ adminChangePassword routes loaded");

const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const router = express.Router();

/* ================= FILE PATHS ================= */

const ADMIN_FILE = path.resolve(__dirname, "../data/admin.json");
const STUDENT_FILE = path.resolve(__dirname, "../data/student.json");

/* ================= HELPERS ================= */

function loadAdmin() {
  return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8"));
}

function saveAdmin(admin) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2));
}

function loadStudents() {
  return JSON.parse(fs.readFileSync(STUDENT_FILE, "utf8"));
}

function saveStudents(data) {
  fs.writeFileSync(STUDENT_FILE, JSON.stringify(data, null, 2));
}

function generatePassword() {
  return Math.random().toString(36).slice(-8);
}

/* =================================================
   1️⃣ ADMIN CHANGE OWN PASSWORD
   ================================================= */

router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const admin = loadAdmin();
    const match = await bcrypt.compare(currentPassword, admin.password);

    if (!match) {
      return res.status(401).json({ error: "Wrong current password" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    saveAdmin(admin);

    return res.json({ success: true });

  } catch (err) {
    console.error("ADMIN CHANGE PASSWORD ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =================================================
   2️⃣ ADMIN GENERATE / RESET STUDENT PASSWORD
   ================================================= */

router.post("/generate-student-password", async (req, res) => {
  console.log("🔥 generate-student-password ROUTE HIT");

  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId required" });
    }

    const students = loadStudents();

    if (!students[studentId]) {
      return res.status(404).json({ error: "Student not found" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    students[studentId].password = hashedPassword;
    students[studentId].firstLogin = true;

    saveStudents(students);

    return res.json({
      success: true,
      password: plainPassword   // ⚠️ frontend par ek hi baar dikhao
    });

  } catch (err) {
    console.error("GENERATE STUDENT PASSWORD ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ================= EXPORT (MUST BE LAST LINE) ================= */

module.exports = router;
