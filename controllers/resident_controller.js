import moment from "moment"
import db from "../config/db.js"
import env from "dotenv"
env.config()
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: '',
        pass: '',
    },
    tls: {
        rejectUnauthorized: false
    },
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});
export const createResident = async (req, res) => {
	try {
		// Extract resident information from request body
		let { name, birthday, roomNumber } = req.body
		console.log("REQ Body Birthday ",birthday)
		const originalDate = new Date(birthday);
		const formattedDate = originalDate.toISOString().split('T')[0];
		console.log("formatted Date ",formattedDate)
		// Insert new resident into the database
		const [resident] = await db.execute(
			"INSERT INTO residents (name, birthday, room_number) VALUES (?, ?, ?)",
			[name, formattedDate, roomNumber]
		)
		const residentId = resident.insertId

		// Insert the resident key into the resident_care_plan table
		await db.execute(
			"INSERT INTO resident_care_plan (resident_id, name, birthday, room_number) VALUES (?, ?, ?, ?)",
			[residentId, name, formattedDate, roomNumber]
		)
		await db.execute(
			"INSERT INTO resident_care_plan (resident_id, name, birthday, room_number) VALUES (?, ?, ?, ?)",
			[residentId, name, formattedDate, roomNumber]
		)
		await db.execute("INSERT INTO resident_data (resident_id) VALUES (?)", [
			residentId,
		])
		// Return success message
		res.status(201).json({ message: "New resident created successfully." })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
export const approveRegularStaff = async (req, res) => {
	try {
		const { userId } = req.params
		const [existingUser] = await db.execute(
			"SELECT * FROM users WHERE id = ?",
			[userId]
		  );
		// Update user's status to approved in the database
		await db.execute('UPDATE users SET status = "approve" WHERE id = ?', [
			userId,
		])
		if(existingUser[0]){
			const mailData = {
			  from: 'deanelgartesting@gmail.com',
			  to: existingUser[0].username,
			  subject: "Registration",
			  text: 'Admin Approval',
			  html: `<h2>You have been successfully approved by admin<h2/>`,
		  };
	  
	  
		  transporter.sendMail(mailData, (error, info) => {
			  if (error) {
				  return console.log(error);
			  }
		  });
		  }
		// Return success message
		res.status(200).json({ message: "Regular staff approved successfully." })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
export const declineRegularStaff = async (req, res) => {
	try {
		const { userId } = req.params

		// Delete user from the database
		await db.execute("DELETE FROM users WHERE id = ?", [userId])

		// Return success message
		res.status(200).json({ message: "Regular staff declined successfully." })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
export const editResident = async (req, res) => {
	try {
		const { residentId } = req.params
		const {
			name,
			birthday,
			roomNumber,
			care_instructions,
			medication_schedule,
			age,
			medical_history,
			allergies,
			medications,
			key_contacts,
			support,
			behavior,
			personal_care,
			mobility,
			sleep,
			nutrition,
		} = req.body
		const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [
			req.user._id,
		])
		// console.log(user)
		const [resident] = await db.execute(
			"SELECT * FROM resident_care_plan WHERE resident_id = ?",
			[residentId]
		)
		const [existcarePlan] = await db.execute(
			"SELECT * FROM resident_care_plan WHERE resident_id = ?",
			[residentId]
		)
		// console.log(existcarePlan[0])
		const formattedDate = moment(resident[0].birthday).format("YYYY-MM-DD")
		// console.log({ formattedDate, birthday })
		// Replace undefined values with null
		const nullableName = name !== undefined ? name : resident[0].name
		const nullableBirthday = birthday !== undefined ? birthday : formattedDate
		const nullableRoomNumber =
			roomNumber !== undefined ? roomNumber : resident[0].room_number
		const nullableCareInstructions =
			care_instructions !== undefined
				? care_instructions
				: existcarePlan[0].care_instructions
		const nullableMedicationSchedule =
			medication_schedule !== undefined
				? medication_schedule
				: existcarePlan[0].medication_schedule
		const nullableAge = age !== undefined ? age : existcarePlan[0].age
		const nullableMedicalHistory =
			medical_history !== undefined
				? medical_history
				: existcarePlan[0].medical_history
		const nullableAllergies =
			allergies !== undefined ? allergies : existcarePlan[0].allergies
		const nullableMedications =
			medications !== undefined ? medications : existcarePlan[0].medications
		const nullableKeyContacts =
			key_contacts !== undefined ? key_contacts : existcarePlan[0].key_contacts
		const nullableSupport =
			support !== undefined ? support : existcarePlan[0].support
		const nullableBehavior =
			behavior !== undefined ? behavior : existcarePlan[0].behavior
		const nullablePersonalCare =
			personal_care !== undefined
				? personal_care
				: existcarePlan[0].personal_care
		const nullableMobility =
			mobility !== undefined ? mobility : existcarePlan[0].mobility
		const nullableSleep = sleep !== undefined ? sleep : existcarePlan[0].sleep
		const nullableNutrition =
			nutrition !== undefined ? nutrition : existcarePlan[0].nutrition

		// Update resident care plan and details in the database
		const [updated_resident] = await db.execute(
			`
				UPDATE resident_care_plan 
				SET 
					name = ?, 
					birthday = ?, 
					room_number = ?,
					care_instructions = ?, 
					medication_schedule = ?, 
					age = ?, 
					medical_history = ?, 
					allergies = ?, 
					medications = ?, 
					key_contacts = ?, 
					support = ?, 
					behavior = ?, 
					personal_care = ?, 
					mobility = ?, 
					sleep = ?, 
					nutrition = ? ,
					updated_by = ?
				WHERE resident_id = ?
			`,
			[
				nullableName,
				nullableBirthday,
				nullableRoomNumber,
				nullableCareInstructions,
				nullableMedicationSchedule,
				nullableAge,
				nullableMedicalHistory,
				nullableAllergies,
				nullableMedications,
				nullableKeyContacts,
				nullableSupport,
				nullableBehavior,
				nullablePersonalCare,
				nullableMobility,
				nullableSleep,
				nullableNutrition,
				user[0].username,
				residentId,
			]
		)

		await db.execute(
			"UPDATE residents SET name = ?, birthday = ?, room_number = ? WHERE id = ?",
			[nullableName, nullableBirthday, nullableRoomNumber, residentId]
		)
		const [carePlan] = await db.execute(
			"SELECT * FROM resident_care_plan WHERE resident_id = ?",
			[residentId]
		)
		// Return success message
		res.status(200).json({ carePlan: carePlan[0] })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const resident_feed = async (req, res) => {
	try {
		const { residentId } = req.params
		const { message } = req.body

		// Insert post on resident's feed in the database
		await db.execute(
			"INSERT INTO resident_feed (resident_id, message) VALUES (?, ?)",
			[residentId, message]
		)

		// Return success message
		res.status(201).json({ message: "Posted on resident feed successfully." })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
export const GetCarePlan = async (req, res) => {
	try {
		const { residentId } = req.params

		// Fetch resident care plan from the database
		const [carePlan] = await db.execute(
			"SELECT * FROM resident_care_plan WHERE resident_id = ?",
			[residentId]
		)

		// Check if care plan exists for the resident
		if (carePlan.length === 0) {
			return res
				.status(404)
				.json({ message: "Care plan not found for the resident." })
		}

		// Return care plan details
		res.status(200).json({ carePlan: carePlan[0] })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
