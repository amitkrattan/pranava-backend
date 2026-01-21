const express = require("express");
const fs = require("fs");
const path = require("path");

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
   SAVE / UPDATE STUDENT (ADMIN)
   POST /api/admin/student/save
   =============================== */
router.post("/student/save", (req, res) => {

  console.log("🔥 AUTO SAVE HIT", req.body);

  const { id, name, email, role } = req.body;

  if (!id || !name) {
    return res.status(400).json({
      success: false,
      error: "Student id and name required"
    });
  }

  const students = loadStudents();
  const existing = students[id] || {};

  students[id] = {
    id,
    name,
    email: email || existing.email || "",
    role: role || existing.role || "student",
    password: existing.password || null,
    firstLogin:
      typeof existing.firstLogin === "boolean"
        ? existing.firstLogin
        : true,
    createdAt: existing.createdAt || new Date().toISOString()
  };

  saveStudents(students);

  res.json({ success: true });
});

module.exports = router;
