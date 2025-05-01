"use client";

import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:username
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling'; // loading animation
import EditState from '../../../components/editState'; // loading animation
import { category, fieldName } from '../../../components/entityDisplay'; // display the user data






export default function Profile({ }) {
	const [isUsernameValid, setisUsernameValid] = useState(true); // true by default to avoid flickering when loading the page, turned off as soon as the api call is done
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = useState(null); // to store the user data from the API call
	const [self, setSelf] = useState(null); // logged in user data
	const [editable, setEditable] = useState(false); // logged in user data

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

			} catch (error) {
				toast.error("Error while fetching user data : " + error.message);
			} finally {
				setLoading(false);
			}
		}

		getProfile();
		getSelf();
	}, [username]);

	// returns the current's user data
	async function getSelf() {
		try {
			const response = await fetch("/api/user/checkUser", {
				method: "POST"
			});
			const data = await response.json();
			if (response.ok) {
				console.log(data, "gertself");
				setSelf(data);
			} else {
				if (data.invalidToken) console.log("invalid token");
				else if (data.noToken) console.log("No token provided");
				else console.log("Unknown error");
				throw new Error("API error : " + data.error);
			}
		} catch (error) {
			toast.error("Cannot get current user's data : " + error.message);
		}
	}

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
					{!isUsernameValid ? ( // error case
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


							{self?.pseudo === userData?.pseudo || self?.level == 'expert' ? ( // edit user info
								<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row' }}>
									<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', textAlign: 'left' }}>
										{category('User information')}
										<TextField
											size="small"
											disabled={!editable}
											label="Name"
											value={userData?.name}
											type="text"
											name='name'
											onChange={(e) => setUserData({ ...userData, name: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										/>
										<TextField
											size="small"
											disabled={!editable}
											label="Last name"
											value={userData?.lastName}
											type="text"
											name='lastName'
											onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										/>
										<TextField
											size="small"
											disabled={!editable}
											label="Birth date"
											value={userData?.birthday}
											type="date"
											name='birthday'
											onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										/>
										<TextField
											size="small"
											disabled={!editable}
											label="Gender"
											value={userData?.gender}
											select
											name='gender'
											onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiSelect-icon': {
													color: editable ? 'white' : '#9e9e9e !important',
												},
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										>
											<MenuItem value={"M"}>M</MenuItem>
											<MenuItem value={"W"}>W</MenuItem>
										</TextField>

										{category('Additional information')}
										<TextField
											size="small"
											disabled={!editable}
											label="Email address"
											value={userData?.email}
											type="email"
											name='email'
											onChange={(e) => setUserData({ ...userData, email: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										/>
										<TextField
											size="small"
											disabled={!editable}
											label="Address"
											value={userData?.address}
											type="email"
											name='email'
											onChange={(e) => setUserData({ ...userData, email: e.target.value })}
											sx={{
												cursor: editable ? 'text' : 'not-allowed',
												backgroundColor: "#3a3a3a",
												borderRadius: 1,
												'&& .MuiInputBase-input': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												},
												'&& .MuiInputLabel-root': {
													color: editable ? 'white' : '#9e9e9e',
												},
												'&& .Mui-disabled': {
													color: editable ? 'white' : '#9e9e9e',
													WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
												}
											}}
											slotProps={{
												input: {
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e',
															WebkitTextFillColor: '#9e9e9e',
														}
													}
												},
												inputLabel: {
													shrink: true,
													sx: {
														'&&.Mui-disabled': {
															color: '#9e9e9e !important',
														}
													}
												}
											}}
										/>
									</Box>

									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
										{category('Experience')}
										{self?.level == 'expert' ? ( // only experts can edit this data
											<>
												<TextField
													size="small"
													disabled={!editable}
													label="Points"
													value={userData?.points}
													type="number"
													name='points'
													onChange={(e) => setUserData({ ...userData, points: e.target.value })}
													sx={{
														cursor: editable ? 'text' : 'not-allowed',
														backgroundColor: "#3a3a3a",
														borderRadius: 1,
														'&& .MuiInputBase-input': {
															color: editable ? 'white' : '#9e9e9e',
															WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
														},
														'&& .MuiInputLabel-root': {
															color: editable ? 'white' : '#9e9e9e',
														},
														'&& .Mui-disabled': {
															color: editable ? 'white' : '#9e9e9e',
															WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
														}
													}}
													slotProps={{
														input: {
															sx: {
																'&&.Mui-disabled': {
																	color: '#9e9e9e',
																	WebkitTextFillColor: '#9e9e9e',
																}
															}
														},
														inputLabel: {
															shrink: true,
															sx: {
																'&&.Mui-disabled': {
																	color: '#9e9e9e !important',
																}
															}
														}
													}}
												/>
												<TextField
													size="small"
													disabled={!editable}
													label="Level"
													value={userData?.level}
													select
													name='level'
													onChange={(e) => setUserData({ ...userData, level: e.target.value })}
													sx={{
														cursor: editable ? 'text' : 'not-allowed',
														backgroundColor: "#3a3a3a",
														borderRadius: 1,
														'&& .MuiSelect-icon': {
															color: editable ? 'white' : '#9e9e9e !important',
														},
														'&& .MuiInputBase-input': {
															color: editable ? 'white' : '#9e9e9e',
															WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
														},
														'&& .MuiInputLabel-root': {
															color: editable ? 'white' : '#9e9e9e',
														},
														'&& .Mui-disabled': {
															color: editable ? 'white' : '#9e9e9e',
															WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
														}
													}}
													slotProps={{
														input: {
															sx: {
																'&&.Mui-disabled': {
																	color: '#9e9e9e',
																	WebkitTextFillColor: '#9e9e9e',
																}
															}
														},
														inputLabel: {
															shrink: true,
															sx: {
																'&&.Mui-disabled': {
																	color: '#9e9e9e !important',
																}
															}
														}
													}}
												>
													<MenuItem value={"debutant"}>débutant</MenuItem>
													<MenuItem value={"intermediaire"}>intermédiaire</MenuItem>
													<MenuItem value={"avance"}>avance</MenuItem>
													<MenuItem value={"expert"}>expert</MenuItem>
												</TextField>
												<Typography component="span" sx={{ fontWeight: 'bold', color: '#595959', mr: -1.5, mt: -1 }}>
													Activated :
													<Checkbox
														readOnly={!editable}
														checked={userData?.isActive}
														sx={{
															'&.Mui-checked': {
																color: editable ? "#7FC7FF" : "grey",
															},
															mb: 0.25,
														}}
													/>
												</Typography>
											</>
										) : (
											<>
												<Box>
													{fieldName('Points', String(userData?.points))}
												</Box>
												<Box>
													{fieldName('Level', userData?.level)}
												</Box>
												<Typography component="span" sx={{ fontWeight: 'bold', color: '#595959', mr: -1.5, mt: -1 }}>
													Activated :
													<Checkbox
														readOnly={true}
														checked={userData?.isActive}
														sx={{
															'&.Mui-checked': {
																color: "grey",
															},
															mb: 0.25,
														}}
													/>
												</Typography>
											</>
										)}
									</Box>
								</Box>

							) : ( // if the user is not the owner of the profile or not an admin, display only the information
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
							)}
						</Box>
					)}
					{self?.pseudo === userData?.pseudo || self?.level == 'expert' ? ( // edit user info

						<Box // editstate component only shown if the user is the owner of the profile or an admin
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'flex-end',
							}}>
							< EditState setEditable={(x) => { setEditable(x) }} />
						</Box>
					) : null}
				</Box>
			)}
		</Box >
	);
}