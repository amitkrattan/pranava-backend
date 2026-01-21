const express = require("express");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get("/", adminAuth, (req, res) => {
  res.json({ courses: [] });
});

router.post("/assign", adminAuth, (req, res) => {
  res.json({ success: true });
});

module.exports = router;
