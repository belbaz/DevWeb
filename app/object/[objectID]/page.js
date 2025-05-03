"use client";

import { Button, TextareaAutosize } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:username
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling'; // loading animation
import EditState from '../../../components/editState'; // loading animation
import { category, fieldName } from '../../../components/entityDisplay'; // display the user data
import { desc } from 'framer-motion/client';



export default function ObjectData({ }) {
	const [isObjectValid, setisObjectValid] = useState(false); // true by default to avoid flickering when loading the page, turned off as soon as the api call is done
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [object, setObject] = useState(null); // to store the object data from the API call
	const [self, setSelf] = useState(null); // logged in user data
	const [room, setRoom] = useState(null);
	const [editable, setEditable] = useState(false);

	const params = useParams();
	const router = useRouter();

	const { objectID } = params;
	if (!objectID || isNaN(objectID)) {
		router.push('/');
		return null; // avoid render for forbidden pages
	}

	useEffect(() => {
		getObject();
		getSelf();
	}, [objectID]);

	useEffect(() => {
		object?.room_id ? getRoom(object?.room_id) : null;
	}, [object?.room_id]);

	async function getObject() {
		try {
			const response = await fetch(`/api/objects/getObjectById?id=${encodeURIComponent(objectID)}`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setisObjectValid(data.object != null); // remains false if no data is returned and keeps showing the error message
			setObject(data.object); // set the object data to the state

		} catch (error) {
			toast.error("Error while fetching object data : " + error.message);
		} finally {
			setLoading(false);
		}
	}

	async function getRoom(roomID = object?.room_id) {
		try {
			const response = await fetch(`/api/rooms/getRoomById?id=${encodeURIComponent(roomID)}`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setRoom(data.room); // set the room data to the state

		} catch (error) {
			toast.error("Error while fetching room data : " + error.message);
		} finally {
			setLoading(false);
		}
	}

	// returns the current's user data
	async function getSelf() {
		try {
			const response = await fetch("/api/user/checkUser", {
				method: "POST"
			});
			const data = await response.json();
			if (response.ok) {
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

	async function updateObject() {
		try {
			const response = await fetch(`/api/objects/updateObject?id=${encodeURIComponent(object.id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					brand: object.brand,
					accessLevel: object.accessLevel,
					room_id: object.room_id,
					description: object.description,
				}),
				credentials: "include"
			});

			if (response.ok) {
				toast.success(" object type updated successfully");
			} else {
				const data = await response.json();
				toast.error(data.error || "Error while updating object type");
			}
		} catch (error) {
			toast.error("Error while updating  object type " + error);
		} finally { getSelf(); getObject(); }
	};

	async function deleteObject() {
		try {
			const response = await fetch(`/api/objects/deleteObject?id=${object.id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (response.ok) {
				toast.success("object deleted successfully");
				router.push('/');
			} else {
				const data = await response.json();
				toast.error(data.error || "Error while deleting object");
			}
		} catch (error) {
			console.error("Error while deleting object : ", error);
			toast.error("Error while deleting object");
		} finally { setOpenConfirm(false); }
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
					{!isObjectValid ? ( // error case
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								object not found
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
								Type : {object?.type}
							</Typography>


							<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
								<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
									{self?.level == 'avance' || self?.level == 'expert' ? ( // edit object info
										<>{category('Object information')}
											<TextField
												size="small"
												disabled={!editable}
												label="Brand"
												value={object?.brand}
												type="text"
												name='brand'
												onChange={(e) => setObject({ ...object, brand: e.target.value })}
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
												label="Level access"
												value={object?.accessLevel}
												select
												name='accessLevel'
												onChange={(e) => setObject({ ...object, accessLevel: e.target.value })}
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
												<MenuItem value={"avance"}>avancé</MenuItem>
												<MenuItem value={"expert"}>expert</MenuItem>
											</TextField>
											<Link onClick={() => { router.push("/room/" + object?.room_id) }} sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}>
												{fieldName('Room', room?.name)}
											</Link>
											{category('Additional data')}
											<TextareaAutosize
												value={object?.description}
												disabled={!editable}
												onChange={(e) => { setObject({ ...object, description: e.target.value }); }}
												style={{ resize: 'none', backgroundColor: "#3a3a3a", color: editable ? 'white' : '#9e9e9e', }}
											/>
											{self?.level == 'expert' ? (
												<>
													<Button variant='contained' onClick={() => setOpenConfirm(true)} sx={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: '#8b2000', '&:hover': { backgroundColor: '#c62828' }, transform: 'none !important' }}>
														Delete object type
													</Button>
													<Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
														<DialogTitle>Confirm deletion</DialogTitle>
														<DialogContent>
															<Typography>
																Are you sure you want to delete this object type ? This action cannot be undone and will delete all the objects instances of this type.
															</Typography>
														</DialogContent>
														<DialogActions>
															<Button onClick={() => setOpenConfirm(false)} color="primary" sx={{ transform: 'none !important' }}>
																Cancel
															</Button>
															<Button onClick={deleteObject} color="error" variant="contained" sx={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: '#8b2000', '&:hover': { backgroundColor: '#c62828' }, transform: 'none !important' }}>
																Confirm Delete
															</Button>
														</DialogActions>
													</Dialog>
												</>
											) : null}
										</>
									) : ( // if the user is not an admin, display only the information
										<>
											{category('Object information')}
											<Box>
												{fieldName('Brand', String(object?.brand))}
											</Box>
											<Box>
												{fieldName('Access level', object?.accessLevel)}
											</Box>
											<Link onClick={() => { router.push("/room/" + object?.room_id) }} sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}>
												{fieldName('Room', room?.name)}
											</Link>
											<Box>
												{fieldName('Description', object?.description)}
											</Box>
										</>
									)}
								</Box>
							</Box>
						</Box>
					)}
					{self?.level == 'expert' ? ( // edit object info
						<Box // editstate component only shown if the user is an admin
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'flex-end',
							}}>
							< EditState setEditable={(x) => { setEditable(x) }} onCancel={() => getObject()} onConfirm={() => { updateObject() }} />
						</Box>
					) : null}
				</Box>
			)}
		</Box >
	);
}