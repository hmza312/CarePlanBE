import express from "express";
import cors from "cors";
import env from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import feedRoutes from "./routes/feed_routes.js";
env.config();
import db from "./config/db.js";
const app = express();
app.use(
  cors({
    credentials: true,
    origin: "*",

    // origin: function (origin, callback) {
    //   // allow requests with no origin
    //   // (like mobile apps or curl requests)
    //   if (!origin) return callback(null, true);
    //   if (allowedOrigins.indexOf(origin) === -1) {
    //     const msg =
    //       "The CORS policy for this site does not " +
    //       "allow access from the specified Origin.";
    //     return callback(new Error(msg), false);
    //   }
    //   return callback(null, true);
    // },
    // https://strange-dirndl-deer.cyclic.app
  })
);

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
