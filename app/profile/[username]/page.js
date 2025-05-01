"use client";

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:username
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling'; // loading animation
import { category, fieldName } from '../../../components/entityDisplay'; // display the user data






export default function Profile({ }) {
	const [isUsernameValid, setisUsernameValid] = useState(true); // true by default to avoid flickering when loading the page, turned off as soon as the api call is done
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = useState(null); // to store the user data from the API call
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
				setUserData(data.data); // set the user data to the state
				console.log(data, "test");

			} catch (error) {
				toast.error("Error while fetching user data : " + error.message);
			} finally {
				setLoading(false);
			}
		}

		getProfile();
	}, [username]);


	return (
		<Box sx={{ background: 'none', height: '100vh', margin: 0 }} >

			{loading ? (
				<Box>
					<p style={{ fontSize: "30px", marginBottom: "5px" }}>Loading...</p>
					<div>{Rolling(50, 50, "#000000")}</div>
				</Box>
			) : (
				<Box
					component="main"
					sx={{
						width: { xs: '100vw', sm: '80vw' },
						maxWidth: '1000px',
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
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								user not found
							</Typography>
							<Button
								sx={{
									mt: 2,
									background: 'rgba(255, 255, 255, 0.2)',
									border: 'none',
									color: 'white',
									cursor: 'pointer',
									transition: 'background 0.3s ease',
									outline: 'none',
									fontSize: '0.85rem',
									fontFamily: 'var(--font-roboto)',
								}}
								onClick={() => router.push('/')}
							>return to home</Button>
						</Box>
					) : (
						<Box>
							<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								{/* import pfp */}
								{userData?.pseudo}
							</Typography>

							<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
								<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', textAlign: 'left' }}>
									{category('User information')}
									<Box>
										{fieldName('Full name', userData?.name + " " + userData?.lastName)}
									</Box>
									<Box>
										{fieldName('Birthday', userData?.birthday)}
									</Box>
									<Box>
										{fieldName('Gender', userData?.gender)}
									</Box>
									{category('Additional information')}
									<Box>
										{fieldName('Mail', userData?.email)}
									</Box>
									<Box>
										{fieldName('Address', userData?.address)}
									</Box>
									<Box>
										{fieldName('Activated', userData?.isActive ? 'yes' : 'no')}
									</Box>
								</Box>

								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
									{category('Experience')}
									<Box>
										{fieldName('Points', String(userData?.points))}
									</Box>
									<Box>
										{fieldName('Level', userData?.level)}
									</Box>
								</Box>
							</Box>

							{/* <TextField
								type="text"
								sx={{
									backgroundColor: "rgba(255, 255, 255, 0.2)",
									borderRadius: 1,
									outline: 'none',
									'& .MuiInputBase-input': {
										color: 'white',
									},
								}}
							/> */}
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}