import express from "express";
import { requireSignIn } from "../middlewares/auth_middleware.js";
import {
  del_bm_msg,
  del_bmap_msg,
  del_bsl_msg,
  del_foodi_msg,
  del_ic_msg,
  del_os_msg,
  del_pr_msg,
  del_t_msg,
  del_weight_msg,
  delete_fluidi_msg,
  delete_pc_msg,
  delete_ph_msg,
  feed,
  get_accident_msg,
  get_blood_sugar_level_msg,
  get_body_map_msg,
  get_bowel_movement_msg,
  get_fluid_intake_msg,
  get_food_intake_msg,
  get_hygiene_care_msg,
  get_oxygen_saturation_msg,
  get_personal_care_msg,
  get_pulse_rate_msg,
  get_temperature_msg,
  get_weight_msg,
  post_accident_msg,
  post_blood_sugar_level_msg,
  post_body_map_msg,
  post_bowel_movement_msg,
  post_fluid_intake_msg,
  post_food_intake_msg,
  post_hygiene_care_msg,
  post_oxygen_saturation_msg,
  post_personal_care_msg,
  post_pulse_rate_msg,
  post_temperature_msg,
  post_weight_msg,
  put_bm_msg,
  put_bmap_msg,
  put_bsl_msg,
  put_fluidi_msg,
  put_foodi_msg,
  put_ic_msg,
  put_os_msg,
  put_pc_msg,
  put_ph_msg,
  put_pr_msg,
  put_t_msg,
  put_weight_msg,
} from "../controllers/personal_care.js";

//router object
const router = express.Router();

//post on resident feed
router.get("/feed/:residentId", requireSignIn, feed);

// Personal Care
router.post(
  "/personal-care-msg/:residentId",
  requireSignIn,
  post_personal_care_msg
);
router.get(
  "/get-personal-care-msg/:residentId",
  requireSignIn,
  get_personal_care_msg
);
router.delete(
  "/del_pc_msg/:residentId/:messageId",
  requireSignIn,
  delete_pc_msg
);
router.put("/put_pc_msg/:residentId/:messageId", requireSignIn, put_pc_msg);

router.post(
  "/post_hygiene_care_msg/:residentId",
  requireSignIn,
  post_hygiene_care_msg
);
router.get(
  "/get_hygiene_care_msg/:residentId",
  requireSignIn,
  get_hygiene_care_msg
);
router.delete(
  "/del_ph_msg/:residentId/:messageId",
  requireSignIn,
  delete_ph_msg
);
router.put("/put_ph_msg/:residentId/:messageId", requireSignIn, put_ph_msg);
// Weight routes
router.post("/post_weight_msg/:residentId", requireSignIn, post_weight_msg);
router.get("/get_weight_msg/:residentId", requireSignIn, get_weight_msg);
router.delete(
  "/del_weight_msg/:residentId/:messageId",
  requireSignIn,
  del_weight_msg
);
router.put(
  "/put_weight_msg/:residentId/:messageId",
  requireSignIn,
  put_weight_msg
);
// oxygen_saturation

router.post(
  "/post_oxygen_saturation_msg/:residentId",
  requireSignIn,
  post_oxygen_saturation_msg
);
router.get(
  "/get_oxygen_saturation_msg/:residentId",
  requireSignIn,
  get_oxygen_saturation_msg
);
router.delete("/del_os_msg/:residentId/:messageId", requireSignIn, del_os_msg);
router.put("/put_os_msg/:residentId/:messageId", requireSignIn, put_os_msg);
// pulse_rate
router.post(
  "/post_pulse_rate_msg/:residentId",
  requireSignIn,
  post_pulse_rate_msg
);
router.get(
  "/get_pulse_rate_msg/:residentId",
  requireSignIn,
  get_pulse_rate_msg
);
router.delete("/del_pr_msg/:residentId/:messageId", requireSignIn, del_pr_msg);
router.put("/put_pr_msg/:residentId/:messageId", requireSignIn, put_pr_msg);
// Temperature
router.post(
  "/post_temperature_msg/:residentId",
  requireSignIn,
  post_temperature_msg
);
router.get(
  "/get_temperature_msg/:residentId",
  requireSignIn,
  get_temperature_msg
);
router.delete("/del_t_msg/:residentId/:messageId", requireSignIn, del_t_msg);
router.put("/put_t_msg/:residentId/:messageId", requireSignIn, put_t_msg);
// blood_sugar_level
router.post(
  "/post_blood_sugar_level_msg/:residentId",
  requireSignIn,
  post_blood_sugar_level_msg
);
router.get(
  "/get_blood_sugar_level_msg/:residentId",
  requireSignIn,
  get_blood_sugar_level_msg
);
router.delete(
  "/del_bsl_msg/:residentId/:messageId",
  requireSignIn,
  del_bsl_msg
);
router.put("/put_bsl_msg/:residentId/:messageId", requireSignIn, put_bsl_msg);
// bowel_movement
router.post(
  "/post_bowel_movement_msg/:residentId",
  requireSignIn,
  post_bowel_movement_msg
);
router.get(
  "/get_bowel_movement_msg/:residentId",
  requireSignIn,
  get_bowel_movement_msg
);
router.delete("/del_bm_msg/:residentId/:messageId", requireSignIn, del_bm_msg);
router.put("/put_bm_msg/:residentId/:messageId", requireSignIn, put_bm_msg);

// body_map
router.post("/post_body_map_msg/:residentId", requireSignIn, post_body_map_msg);
router.get("/get_body_map_msg/:residentId", requireSignIn, get_body_map_msg);

router.delete(
  "/del_bmap_msg/:residentId/:messageId",
  requireSignIn,
  del_bmap_msg
);
router.put("/put_bmap_msg/:residentId/:messageId", requireSignIn, put_bmap_msg);
// food_intake
router.post(
  "/post_food_intake_msg/:residentId",
  requireSignIn,
  post_food_intake_msg
);
router.get(
  "/get_food_intake_msg/:residentId",
  requireSignIn,
  get_food_intake_msg
);
router.delete(
  "/del_foodi_msg/:residentId/:messageId",
  requireSignIn,
  del_foodi_msg
);
router.put(
  "/put_foodi_msg/:residentId/:messageId",
  requireSignIn,
  put_foodi_msg
);
//
router.post(
  "/post_fluid_intake_msg/:residentId",
  requireSignIn,
  post_fluid_intake_msg
);
router.get(
  "/get_fluid_intake_msg/:residentId",
  requireSignIn,
  get_fluid_intake_msg
);
router.delete(
  "/del_fluidi_msg/:residentId/:messageId",
  requireSignIn,
  delete_fluidi_msg
);
router.put(
  "/put_fluidi_msg/:residentId/:messageId",
  requireSignIn,
  put_fluidi_msg
);
//
router.post(
  "/post_incident_accident_msg/:residentId",
  requireSignIn,
  post_accident_msg
);
router.get(
  "/get_incident_accident_msg/:residentId",
  requireSignIn,
  get_accident_msg
);
router.delete("/del_ic_msg/:residentId/:messageId", requireSignIn, del_ic_msg);
router.put("/put_ic_msg/:residentId/:messageId", requireSignIn, put_ic_msg);

export default router;
