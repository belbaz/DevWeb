"use client";

import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import Box from '@mui/material/Box';


// restricts access to its children based on inputted user level
// reads the cookie
export default function CheckUserLevel({ requiredLevel = "debutant", children }) {
	const [hasAccess, setHasAccess] = useState(null);
	const router = useRouter();
	const accessLevels = {
		"debutant": 1,
		"intermediaire": 2,
		"avance": 3,
		"expert": 4
	};

	if (!accessLevels.hasOwnProperty(requiredLevel)) {
		console.log(accessLevels)
		console.error("Invalid requiredLevel parameter : level does not exist");
	}

	useEffect(() => {
		async function checkAuth() {
			try {
				const response = await fetch("/api/user/checkUser", {
					method: "POST"
				});
				const data = await response.json();
				if (response.ok) {
					if (accessLevels[data.level] >= accessLevels[requiredLevel]) {
						setHasAccess(true);
					} else {
						throw new Error("access denied: insufficient level (requires at least " + requiredLevel + ")");
					}
				} else {
					if (data.invalidToken) console.log("invalid token");
					else if (data.noToken) console.log("No token provided");
					else console.log("Unknown error");
					throw new Error("API error : " + data.error);
				}
			} catch (error) {
				toast.error("Cannot access page : " + error.message);
				router.push("/");
			}
		}

		checkAuth();
	}, []);

	if (hasAccess === true) return <Box>{children}</Box>;
	return null;
}