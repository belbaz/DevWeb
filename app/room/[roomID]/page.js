"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { useParams, useRouter } from 'next/navigation'; // get /room/:id
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling'; // loading animation
import EditState from '../../../components/editState'; // loading animation
import { category, fieldName } from '../../../components/entityDisplay'; // display the user data



export default function Room({ }) {
	const [isRoomValid, setisRoomValid] = useState(false); // true by default to avoid flickering when loading the page, turned off as soon as the api call is done
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

	const [roomData, setRoomData] = useState(null); // to store the room data from the API call
	const [self, setSelf] = useState(null); // logged in user data


	const params = useParams();
	const router = useRouter();

	const { roomID } = params;
	if (!roomID || isNaN(roomID)) {
		router.push('/');
		return null; // avoid render for forbidden pages
	}

	useEffect(() => {
		getRoom();
		getSelf();
	}, [roomID]);

	async function getRoom() {
		try {
			const response = await fetch(`/api/rooms/getRoomById?id=${encodeURIComponent(roomID)}`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setisRoomValid(data.room != null); // remains false if no data is returned and keeps showing the error message
			setRoomData(data.room); // set the room data to the state

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

	async function deleteRoom() {
		try {
			const response = await fetch("/api/user/deleteAccount", {
				method: "DELETE",
				credentials: "include"
			});

			if (response.ok) {
				toast.success("room deleted successfully");
				router.push('/');
			} else {
				const data = await response.json();
				toast.error(data.error || "Error while deleting room");
			}
		} catch (error) {
			console.error("Error while deleting room : ", error);
			toast.error("Error while deleting room");
		} finally { setOpenConfirmDelete(false); }
	}

	async function updateRoom() {
		try {
			console.log("updating room with data : ", roomData);
			const response = await fetch("/api/rooms/updateRoom", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: roomData.id,
					floor: roomData.floor,
					levelAcces: roomData.levelAcces,
					roomtype: roomData.roomtype,
					name: roomData.name,
				}),
				credentials: "include"
			});

			if (response.ok) {
				toast.success("Room updated successfully");
			} else {
				const data = await response.json();
				toast.error(data.error || "Error while updating room");
			}
		} catch (error) {
			console.error("Error while updating room : ", error);
			toast.error("Error while updating room");
		} finally { getSelf(); getRoom(); }
	};

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
					{!isRoomValid ? ( // error case
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								room not found
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
								{roomData?.name}
							</Typography>


							<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
								<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
									{self?.level == 'intermediaire' || self?.level == 'avance' || self?.level == 'expert' ? ( // edit room info
										<>{category('Room information')}
											<TextField
												size="small"
												disabled={!editable}
												label="Floor"
												value={roomData?.floor}
												type="number"
												name='floor'
												onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
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
												label="Access level"
												value={roomData?.levelAcces}
												select
												name='levelAcces'
												onChange={(e) => setRoomData({ ...roomData, levelAcces: e.target.value })}
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
											<TextField
												size="small"
												disabled={!editable}
												label="Room type"
												value={roomData?.roomtype}
												select
												name='roomtype'
												onChange={(e) => setRoomData({ ...roomData, roomtype: e.target.value })}
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
												<MenuItem value={"hall"}>Hall</MenuItem>
												<MenuItem value={"exposition permanente"}>Exposition permanente</MenuItem>
												<MenuItem value={"réserve"}>réserve</MenuItem>
											</TextField>
											<TextField
												size="small"
												disabled={!editable}
												label="Name"
												value={roomData?.name}
												type="text"
												name='name'
												onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
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
											{self?.level == 'expert' ? (
												<>
													<Button variant='contained' onClick={() => setOpenConfirmDelete(true)} sx={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: '#8b2000', '&:hover': { backgroundColor: '#c62828' }, transform: 'none !important' }}>
														Delete room
													</Button>
													<Dialog open={openConfirmDelete} onClose={() => setOpenConfirmDelete(false)}>
														<DialogTitle>Confirm deletion</DialogTitle>
														<DialogContent>
															<Typography>
																Are you sure you want to delete this room? This action cannot be undone.
															</Typography>
														</DialogContent>
														<DialogActions>
															<Button onClick={() => setOpenConfirmDelete(false)} color="primary" sx={{ transform: 'none !important' }}>
																Cancel
															</Button>
															<Button onClick={deleteRoom} color="error" variant="contained" sx={{ display: 'flex', justifyContent: 'space-evenly', backgroundColor: '#8b2000', '&:hover': { backgroundColor: '#c62828' }, transform: 'none !important' }}>
																Confirm Delete
															</Button>
														</DialogActions>
													</Dialog>
												</>
											) : null}
										</>
									) : ( // if the user is not an admin, display only the information
										<>
											{category('Room information')}
											<Box>
												{fieldName('Floor', String(roomData?.floor))}
											</Box>
											<Box>
												{fieldName('Level access', roomData?.levelAcces)}
											</Box>
											<Box>
												{fieldName('Room type', roomData?.roomtype)}
											</Box>
										</>
									)}
								</Box>
							</Box>

						</Box>
					)}
					{self?.level == 'expert' ? ( // edit room info
						<Box // editstate component only shown if the user is an admin
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'flex-end',
							}}>
							< EditState setEditable={(x) => { setEditable(x); }} onCancel={() => getRoom()} onConfirm={() => { updateRoom() }} />
						</Box>
					) : null}
				</Box>
			)}
		</Box>
	);
}