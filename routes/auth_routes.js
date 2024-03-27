import express from "express";
import {
  loginController,
  registerController,
  updatePassword,
} from "../controllers/auth_controller.js";
import { isAdmin, requireSignIn } from "../middlewares/auth_middleware.js";
import {
  GetCarePlan,
  approveRegularStaff,
  createResident,
  declineRegularStaff,
  editResident,
  resident_feed,
} from "../controllers/resident_controller.js";
import { residents, staffMembers } from "../controllers/member_resident.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/update-password", updatePassword);

//................................  Resident
// New Resident
router.post("/create-resident", requireSignIn, isAdmin, createResident);
router.put(
  "/approve-regular-staff/:userId",
  requireSignIn,
  isAdmin,
  approveRegularStaff
);
router.post(
  "/decline-regular-staff",
  requireSignIn,
  isAdmin,
  declineRegularStaff
);
// GetCarePlan
router.get("/care-plan/:residentId", requireSignIn, GetCarePlan);
// Edit CarePlan
router.put("/edit-care-plan/:residentId", requireSignIn, editResident);

//post on resident feed
router.get("/residents/:residentId/feed", requireSignIn, resident_feed);

// .................................Other Staff Members
// All Staff Members
router.get("/staff-members", requireSignIn, staffMembers);
// All Residents
router.get("/residents", requireSignIn, residents);

export default router;
