const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Student = require("./models/Student");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("GetPay Backend Running...");
});
app.get("/test", async (req, res) => {
  const studentCount = await Student.countDocuments();
  res.json({ message: "Models working!", totalStudents: studentCount });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
