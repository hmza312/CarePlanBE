import db from "../config/db.js";
import env from "dotenv";
import { generateUniqueId } from "../helpers/auth_helper.js";
env.config();

//Delete
const deleteMessageFromPersonalCare = async (tableName, req, res) => {
  try {
    const { residentId, messageId } = req.params;

    // Fetch the current data for the resident
    const [existingData] = await db.execute(
      `SELECT ${tableName} FROM resident_data WHERE resident_id = ?`,
      [residentId]
    );

    // Check if there is existing data
    let currentData = [];
    if (existingData.length && existingData[0][tableName] !== null) {
      if (typeof existingData[0][tableName] === "string") {
        // Parse the string representation of JSON
        currentData = JSON.parse(existingData[0][tableName]);
      } else {
        // If it's already an array, directly assign it
        currentData = existingData[0][tableName];
      }
    }

    // Find the index of the message to be deleted
    const messageIndex = currentData.findIndex(
      (message) => message.id === messageId
    );

    // If message is not found
    if (messageIndex === -1) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Remove the message from the data
    currentData.splice(messageIndex, 1);

    // Update the resident_data table with the modified data
    await db.execute(
      `UPDATE resident_data SET ${tableName} = ? WHERE resident_id = ?`,
      [JSON.stringify(currentData), residentId]
    );

    res.status(200).json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update
async function updateMessage(columnName, residentId, messageId, newMessage) {
  try {
    // Fetch the current data for the resident
    const [existingData] = await db.execute(
      `SELECT ${columnName} FROM resident_data WHERE resident_id = ?`,
      [residentId]
    );

    // Check if there is existing data for the resident
    let currentData = [];
    if (existingData.length && existingData[0][columnName] !== null) {
      if (typeof existingData[0][columnName] === "string") {
        // Parse the string representation of JSON
        currentData = JSON.parse(existingData[0][columnName]);
      } else {
        // If it's already an array, directly assign it
        currentData = existingData[0][columnName];
      }
    }

    // Find the index of the message to update
    const messageIndex = currentData.findIndex(
      (message) => message.id === messageId
    );

    // If message is not found, return 404 error
    if (messageIndex === -1) {
      return { status: 404, message: "Message not found." };
    }

    // Update the message content and timestamp
    currentData[messageIndex].message = newMessage;

    // Update the resident_data table with the modified data
    await db.execute(
      `UPDATE resident_data SET ${columnName} = ? WHERE resident_id = ?`,
      [JSON.stringify(currentData), residentId]
    );

    return { status: 200, message: "Message updated successfully." };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Internal Server Error" };
  }
}

export const feed = async (req, res) => {
  try {
    const { residentId } = req.params;
    console.log(residentId);
    // Fetch resident_data from the database using the resident_id
    const [residentData] = await db.execute(
      "SELECT * FROM resident_data WHERE resident_id = ?",
      [residentId || null]
    );

    // Check if resident_data exists
    if (residentData.length === 0) {
      return res.status(404).json({ message: "Resident data not found." });
    }

    // Return the resident_data
    res.status(200).json(residentData[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_personal_care_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;
    const id = generateUniqueId();
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);

    console.log("User",user[0])
    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT personal_care FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if there is existing personal care data
    let currentPersonalCare = [];

    if (existingData.length && existingData[0].personal_care !== null) {
      if (typeof existingData[0].personal_care === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].personal_care);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].personal_care;
      }
    }

    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET personal_care = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );

    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const get_personal_care_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care data for the resident
    const [residentData] = await db.execute(
      "SELECT personal_care FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    console.log(residentId);
    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].personal_care === null) {
      res.status(200).json(null);
    } else {
      res.status(200).json(residentData[0].personal_care);
    }

    // Parse the personal care data from JSON
    //const personalCareData = JSON.parse(residentData[0].personal_care)

    // Return the personal care data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const delete_pc_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("personal_care", req, res);
};
export const put_pc_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "personal_care",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//

export const get_hygiene_care_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT personal_care_hygiene FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (
      residentData.length === 0 ||
      residentData[0].personal_care_hygiene === null
    ) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      // const personalCareHygieneData = JSON.parse(
      // 	residentData[0].personal_care_hygiene
      // )

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].personal_care_hygiene);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_hygiene_care_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT personal_care_hygiene FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing food intake data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].personal_care_hygiene !== null) {
      if (typeof existingData[0].personal_care_hygiene === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].personal_care_hygiene);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].personal_care_hygiene;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const id = generateUniqueId();
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET personal_care_hygiene = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const delete_ph_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("personal_care_hygiene", req, res);
};
export const put_ph_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "personal_care_hygiene",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_weight_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT weight FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      return res.status(200).json({
        data: residentData[0].weight,
        message: "weight data not found for the resident.",
      });
    }

    // Parse the personal care hygiene data from JSON
    //const weight = JSON.parse(residentData[0].weight)

    // Return the personal care hygiene data
    res.status(200).json(residentData[0].weight);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_weight_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;
    const id = generateUniqueId();
    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT weight FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing weight data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].weight !== null) {
      if (typeof existingData[0].weight === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].weight);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].weight;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    currentPersonalCare.push({
      message,
      timestamp: new Date(),
      posted_by,
      id,
    });
    // Append the new message to the existing personal care data

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET weight = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_weight_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("weight", req, res);
};
export const put_weight_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "weight",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_oxygen_saturation_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT oxygen_saturation FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const oxygen_saturation = JSON.parse(residentData[0].oxygen_saturation)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].oxygen_saturation);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_oxygen_saturation_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT oxygen_saturation FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing oxygen saturation data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].oxygen_saturation !== null) {
      if (typeof existingData[0].oxygen_saturation === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].oxygen_saturation);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].oxygen_saturation;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });
    // Append the new message to the existing personal care data

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET oxygen_saturation = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_os_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("oxygen_saturation", req, res);
};
export const put_os_msg = async (req, res) => {
  console.log("Oxygen Saturation");
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "oxygen_saturation",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_pulse_rate_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT pulse_rate FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].pulse_rate === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const pulse_rate = JSON.parse(residentData[0].pulse_rate)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].pulse_rate);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_pulse_rate_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT pulse_rate FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].pulse_rate !== null) {
      if (typeof existingData[0].pulse_rate === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].pulse_rate);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].pulse_rate;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });
    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET pulse_rate = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_pr_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("pulse_rate", req, res);
};
export const put_pr_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "pulse_rate",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};
//
export const get_temperature_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT temperature FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const temperature = JSON.parse(residentData[0].temperature)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].temperature);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_temperature_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT temperature FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].temperature !== null) {
      if (typeof existingData[0].temperature === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].temperature);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].temperature;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET temperature = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_t_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("temperature", req, res);
};
export const put_t_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "temperature",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_blood_sugar_level_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT blood_sugar_level FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const blood_sugar_level = JSON.parse(residentData[0].blood_sugar_level)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].blood_sugar_level);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_blood_sugar_level_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT blood_sugar_level FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].blood_sugar_level !== null) {
      if (typeof existingData[0].blood_sugar_level === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].blood_sugar_level);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].blood_sugar_level;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET blood_sugar_level = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_bsl_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("blood_sugar_level", req, res);
};
export const put_bsl_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "blood_sugar_level",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_bowel_movement_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT bowel_movement FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const bowel_movement = JSON.parse(residentData[0].bowel_movement)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].bowel_movement);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_bowel_movement_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT bowel_movement FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].bowel_movement !== null) {
      if (typeof existingData[0].bowel_movement === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].bowel_movement);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].bowel_movement;
      }
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET bowel_movement = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_bm_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("bowel_movement", req, res);
};
export const put_bm_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "bowel_movement",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_body_map_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT body_map FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].body_map === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const body_map = JSON.parse(residentData[0].body_map)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].body_map);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_body_map_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT body_map FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing personal care data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].body_map !== null) {
      currentPersonalCare = JSON.parse(existingData[0].body_map);
    }

    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });
    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET body_map = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_bmap_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("body_map", req, res);
};
export const put_bmap_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "body_map",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_food_intake_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT food_intake FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    console.log("residentData", residentData);
    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].food_intake === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const food_intake = JSON.parse(residentData[0].food_intake)

      console.log("food intake", residentData[0].food_intake);
      // Return the personal care hygiene data
      res.status(200).json(residentData[0].food_intake);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_food_intake_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    console.log("Post residentId", residentId);

    const { message } = req.body;

    // Fetch the current food intake data for the resident
    const [existingData] = await db.execute(
      "SELECT food_intake FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    console.log("post existingData", existingData);

    // Check if there is existing food intake data
    let currentFoodIntake = [];
    if (existingData.length && existingData[0].food_intake !== null) {
      if (typeof existingData[0].food_intake === "string") {
        // Parse the string representation of JSON
        currentFoodIntake = JSON.parse(existingData[0].food_intake);
      } else {
        // If it's already an array, directly assign it
        currentFoodIntake = existingData[0].food_intake;
      }
    }

    // Append the new message to the existing food intake data
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    const id = generateUniqueId();
    currentFoodIntake.push({ message, timestamp: new Date(), posted_by, id });

    // Update the resident_data table with the modified food intake data
    await db.execute(
      "UPDATE resident_data SET food_intake = ? WHERE resident_id = ?",
      [JSON.stringify(currentFoodIntake), residentId]
    );

    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_foodi_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("food_intake", req, res);
};
export const put_foodi_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "food_intake",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_fluid_intake_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT fluid_intake FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (residentData.length === 0 || residentData[0].weight === null) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      //const fluid_intake = JSON.parse(residentData[0].fluid_intake)

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].fluid_intake);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_fluid_intake_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT fluid_intake FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (existingData.length && existingData[0].fluid_intake !== null) {
      if (typeof existingData[0].fluid_intake === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(existingData[0].fluid_intake);
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].fluid_intake;
      }
    }

    // Append the new message to the existing personal care data
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });
    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET fluid_intake = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const delete_fluidi_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("fluid_intake", req, res);
};
export const put_fluidi_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "fluid_intake",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};

//
export const get_accident_msg = async (req, res) => {
  try {
    const { residentId } = req.params;

    // Fetch the personal care hygiene data for the resident
    const [residentData] = await db.execute(
      "SELECT incident_accident_form FROM resident_data WHERE resident_id = ?",
      [residentId]
    );

    // Check if resident data exists
    if (
      residentData.length === 0 ||
      residentData[0].incident_accident_form === null
    ) {
      res.status(200).json(null);
    } else {
      // Parse the personal care hygiene data from JSON
      // const incident_accident_form = JSON.parse(
      // 	residentData[0].incident_accident_form
      // )

      // Return the personal care hygiene data
      res.status(200).json(residentData[0].incident_accident_form);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const post_accident_msg = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { message } = req.body;

    // Fetch the current personal care data for the resident
    const [existingData] = await db.execute(
      "SELECT incident_accident_form FROM resident_data WHERE resident_id = ?",
      [residentId]
    );
    // Check if there is existing personal care data
    // Check if there is existing pulse rate data
    let currentPersonalCare = [];
    if (
      existingData.length &&
      existingData[0].incident_accident_form !== null
    ) {
      if (typeof existingData[0].incident_accident_form === "string") {
        // Parse the string representation of JSON
        currentPersonalCare = JSON.parse(
          existingData[0].incident_accident_form
        );
      } else {
        // If it's already an array, directly assign it
        currentPersonalCare = existingData[0].incident_accident_form;
      }
    }

    // Append the new message to the existing personal care data
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.user._id,
    ]);
    const posted_by = user[0].username;
    // Append the new message to the existing personal care data
    const id = generateUniqueId();
    currentPersonalCare.push({ message, timestamp: new Date(), posted_by, id });
    // Update the resident_data table with the modified personal care data
    await db.execute(
      "UPDATE resident_data SET incident_accident_form = ? WHERE resident_id = ?",
      [JSON.stringify(currentPersonalCare), residentId]
    );
    res.status(201).json({ message: "Message posted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const del_ic_msg = async (req, res) => {
  await deleteMessageFromPersonalCare("incident_accident_form", req, res);
};
export const put_ic_msg = async (req, res) => {
  const { residentId, messageId } = req.params;
  const { newMessage } = req.body;
  const { status, message } = await updateMessage(
    "incident_accident_form",
    residentId,
    messageId,
    newMessage
  );
  res.status(status).json({ message });
};
//
