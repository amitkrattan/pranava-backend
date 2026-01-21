require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://pranavavisions.in"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed"));
  },
  credentials: true
}));

app.use(express.json());

/* ================= API HEALTH ================= */
app.get("/api", (req, res) => {
  res.json({ status: "API OK" });
});

app.get("/api/", (req, res) => {
  res.json({ status: "API OK" });
});


/* 🔐 ADMIN APIs */
app.use("/api/auth/admin", require("./routes/adminAuth"));
app.use("/api/admin", require("./routes/adminChangePassword"));
app.use("/api/admin", require("./routes/adminStudents"));

/* 🔐 STUDENT APIs */
app.use("/api/student", require("./routes/studentAuth"));

app.listen(PORT, () => {
  console.log("✅ Backend running on port", PORT);
});
