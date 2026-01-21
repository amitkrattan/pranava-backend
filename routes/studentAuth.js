const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const STUDENT_FILE = path.join(__dirname, "../data/student.json");
const JWT_SECRET = process.env.JWT_SECRET || "PV_SECRET_KEY";

/* ===== auth middleware ===== */
function studentAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ===== helpers ===== */
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
   STUDENT LOGIN
   POST /api/student/login
   =============================== */
router.post("/login", async (req, res) => {
  console.log("🔐 STUDENT LOGIN HIT", req.body);

  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const students = loadStudents();
  const student = students[id];

  if (!student || !student.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, student.password);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: student.id,
      role: "student"
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    student: {
      id: student.id,
      firstLogin: student.firstLogin === true
    }
  });
});

/* ===============================
   CHANGE PASSWORD (FIRST LOGIN)
   POST /api/student/change-password
   =============================== */
router.post("/change-password", studentAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const students = loadStudents();
  const student = students[id];

  const ok = await bcrypt.compare(oldPassword, student.password);
  if (!ok) {
    return res.status(401).json({ error: "Old password incorrect" });
  }

  student.password = await bcrypt.hash(newPassword, 10);
  student.firstLogin = false;

  saveStudents(students);

  res.json({ success: true });
});

module.exports = router;
