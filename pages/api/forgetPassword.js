// pages/api/forgetPassword.js

import supabase from 'lib/supabaseClient';
import { sendMail } from "../../lib/sendMail";

// function to send a password reset email
export default async function forgetPassword(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).send(`Method ${req.method} Not Allowed`);
	}
	const { email } = req.body;

	try {
		// checks if a user exists with the provided email
		const { data: user, error } = await supabase
			.from('User')
			.select('pseudo, email')
			.eq('email', email)
			.single();

		if (error || !user) {
			return res.status(200).json({ message: "a reset email has been sent if the account exists." });
		}


		try {
			// effectively send email
			await sendMail(user.pseudo, user.email, false);

			return res.status(200).json({ message: "a reset email has been sent if the user exists." });
		} catch (error) {
			return res.status(500).json({ error: "error while sending email :" + error?.message });
		}

	} catch (error) {
		console.error("server error", error);
		return res.status(500).json({ error: "Internal server error" });
	}

}
