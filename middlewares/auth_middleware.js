import JWT from "jsonwebtoken";
import db from "../config/db.js";
import env from "dotenv";
env.config();
//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized request");
    }
    let tokenSplit = req.headers.authorization.split(" ")[1];
    console.log(tokenSplit, token);
    if (tokenSplit === "null") {
      return res.status(401).send("Unauthorized request");
    }
    let payload = JWT.verify(tokenSplit, process.env.JWT_SECRET);
    if (!payload) {
      return res.status(401).send("Unauthorized request");
    }
    // if (!token) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized Access: Token is missing." });
    // }
    // const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.log(error);
  }
};

//admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);

    // Check if user is admin (role = 1)
    if (!user || user.length === 0 || user[0].role !== 1) {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
