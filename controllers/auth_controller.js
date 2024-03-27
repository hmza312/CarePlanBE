import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../helpers/auth_helper.js";
import env from "dotenv";
env.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: "",
    pass: "",
  },
  tls: {
    rejectUnauthorized: false,
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});
export const registerController = async (req, res) => {
  var status = "";
  try {
    let { username, password, role, fullname } = req.body;

    if (
      req.body.role == "manager" ||
      req.body.role == "nurse" ||
      req.body.role == "senior carer"
    ) {
      role = 1;
      status = "approve";
    } else {
      role = 0;
      status = "pending";
    }

    // Check if the username is already taken
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into the database
    const user = await db.execute(
      "INSERT INTO users (username, password, role,status,fullname) VALUES (?, ?, ?,?,?)",
      [username, hashedPassword, role, status, fullname || ""]
    );
    const token = jwt.sign({ _id: user[0].insertId }, process.env.JWT_SECRET, {
      expiresIn: "8d",
    });
    if (user && req.body.role != ("manager" || "nurse" || "senior carer")) {
      const mailData = {
        from: "deanelgartesting@gmail.com",
        to: username,
        subject: "Registration",
        text: "You are Registered",
        html: `<h2>Await for admin Approval<h2/>`,
      };

      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
    }
    res.status(201).json({
      success: true,
      token,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    if (!username || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid username or password",
      });
    }
    // Check if the user exists
    const [user] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    console.log("User ", user[0]);
    if (!user || user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    } else if (user[0].status == "pending") {
      console.log(user[0].status);
      return res.status(401).json({ message: "Awaiting Admin Approval" });
    }

    // Verify the password
    const passwordMatch = await comparePassword(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ _id: user[0].id }, process.env.JWT_SECRET, {
      expiresIn: "8d",
    });
    // If username and password are correct, send success message
    res.status(200).send({
      token,
      success: true,
      message: "login successfully",
      user: {
        name: user[0].username,
        role: user[0].role,
        status: user[0].status,
        fullname: user[0].fullname,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }

  //token
};
// Update the password
export const updatePassword = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const [user] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify the current password
    // const passwordMatch = await bcrypt.compare(currentPassword, user[0].password);
    // if (!passwordMatch) {
    //     return res.status(401).json({ message: 'Incorrect current password.' });
    // }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the user's password in the database with the new password
    await db.execute("UPDATE users SET password = ? WHERE username = ?", [
      hashedPassword,
      username,
    ]);

    // Return a success message
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// // Get profile data
// export const getUserProfileController = async (req, res) => {
// 	try {
// 		const user = await userModel
// 			.findById(req.user._id)
// 			.select("-password -firebaseUid -pendingPayment -role")
// 		if (user) {
// 			res.status(200).json(user)
// 		} else {
// 			res.status(404).json({ success: false, message: "User not found" })
// 		}
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({
// 			success: false,
// 			message: "Error while getting user profile",
// 			error,
// 		})
// 	}
// }
// // admin route
// export const getAllusersController = async (req, res) => {
// 	try {
// 		const users = await userModel.find()
// 		const transformedUsers = users.map((user) => ({
// 			_id: user._id,
// 			id: user.email,
// 			totalApicalls: user.totalApiCalls || 0,
// 			remainingApicalls: user.remainingApiCalls || 0,
// 			totallifetimeApicalls: user.totallifetimeApicalls || 0,
// 			invoicecalls: user.invoicecalls || 0,
// 			adreescalls: user.adreescalls || 0,
// 			receiptcalls: user.receiptcalls || 0,
// 			currentsubscription: user.currentsubscription || null,
// 			pastsubscription: user.pastsubscription || null,
// 		}))

// 		res.json(transformedUsers)
// 		// res.json(users)
// 	} catch (error) {
// 		console.log(error)
// 		res.status(500).send({
// 			success: false,
// 			message: "Error WHile Geting Orders",
// 			error,
// 		})
// 	}
// }
