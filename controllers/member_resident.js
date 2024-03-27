import db from "../config/db.js"
export const staffMembers = async (req, res) => {
	try {
		// Fetch all staff members from the database except the current user
		const [staffMembers] = await db.execute(
			"SELECT * FROM users WHERE id != ?",
			[req.user._id]
		)

		// Return the list of staff members
		res.status(200).json({ staffMembers })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}

export const residents = async (req, res) => {
	try {
		// Fetch all residents from the database
		const [residents] = await db.execute("SELECT * FROM residents")

		// Return the list of residents
		res.status(200).json({ residents })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Internal Server Error" })
	}
}
