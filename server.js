import express from "express";
import cors from "cors";
import env from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import feedRoutes from "./routes/feed_routes.js";
env.config();
import db from "./config/db.js";
const app = express();
app.use(cors());
const PORT = process.env.PORT;
app.use(express.json());

//routes
app.use("/api/v1/auth", authRoutes, feedRoutes);

// Default Route
app.get("/", async (req, res) => {
  res.send("Welcome to the care home");
});
app.listen(PORT, async () => {
  console.log(`Application is running on the ${PORT}`);
});
