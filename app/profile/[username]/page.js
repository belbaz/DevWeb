"use client";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:username
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';


export default function Profile({ }) {
	const [isUsernameValid, setisUsernameValid] = useState(null);
	const params = useParams();
	const router = useRouter();

	const { username } = params;
	if (!username) {
		router.push('/');
		return null; // avoid render for forbidden pages
	}

	useEffect(() => {
		async function getProfile() {
			try {
				const response = await fetch(`/api/user/getUserProfil?pseudo=${encodeURIComponent(username)}`, {
					method: "GET"
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Unknown error");
				}

				const data = await response.json();
				setisUsernameValid(data.data !== null); // remains false if no data is returned and keeps showing the error message
				console.log(data, "test");

			} catch (error) {
				toast.error("Error while fetching user data : " + error.message);
			}
		}

		getProfile();
	}, [username]);


	return (
		<Box sx={{ background: 'none', height: '100vh', margin: 0 }}>
			<Box
				component="main"
				sx={{
					width: '100%',
					maxWidth: 400,
					bgcolor: 'black',
					borderRadius: 0,
					boxShadow: 6,
					p: 5,
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}
			>
				{!isUsernameValid ? (
					<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
						User not found
					</Typography>
				) :
					<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
						{username}
					</Typography>
				}

			</Box>
		</Box >
	);
}