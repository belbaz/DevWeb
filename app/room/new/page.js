"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:username
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { category } from '../../../components/entityDisplay'; // display the user data
import Rolling from '../../../components/rolling';




export default function Room({ }) {
	const [openConfirm, setOpenConfirm] = useState(false);
	const [roomData, setRoomData] = useState(null); // to store the room data from the API call
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	useEffect(() => {
	}, []);

	async function insertRoom() {
		setIsLoading(true);
		try {
			if (!roomData?.floor || !roomData?.name || !roomData?.roomtype) {
				throw new Error("Please fill all the fields");
			}
			const response = await fetch("/api/rooms/addRoom", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					name: roomData.name,
					floor: parseInt(roomData.floor, 10),
					levelAcces: roomData.levelAcces,
					roomtype: roomData.roomtype
				}),
			});

			if (response.ok) {
				const data = await response.json();

				toast.success("room inserted successfully");
				router.push('/room/' + data?.created[0]?.id); // redirect to the new room page with returned id
			} else {
				const data = await response.json();
				throw new Error(data.error || "Error while inserting room");
			}
		} catch (error) {
			toast.error(error);
		} finally { setIsLoading(false); setOpenConfirm(false); }
	}

	return (
		<Box sx={{ background: 'none', height: '100vh', margin: 0 }} >
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
				}}>
				<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
					Insert new room
				</Typography>

				<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
						<>{category('Room information')}
							<TextField
								size="small"
								label="Name"
								value={roomData?.name}
								type="text"
								name='name'
								onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
								sx={{
									backgroundColor: "#3a3a3a",

									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
								}}
							/>
							<TextField
								size="small"
								label="Floor"
								value={roomData?.floor}
								type="number"
								name='floor'
								onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
								sx={{
									backgroundColor: "#3a3a3a",

									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
								}}
							/>
							<TextField
								size="small"
								label="Access level"
								value={roomData?.levelAcces}
								select
								name='levelAcces'
								onChange={(e) => setRoomData({ ...roomData, levelAcces: e.target.value })}
								sx={{
									cursor: 'text',
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
								}}
							>
								<MenuItem value={"debutant"}>débutant</MenuItem>
								<MenuItem value={"intermediaire"}>intermédiaire</MenuItem>
								<MenuItem value={"avance"}>avancé</MenuItem>
								<MenuItem value={"expert"}>expert</MenuItem>
							</TextField>
							<TextField
								size="small"
								label="Room type"
								value={roomData?.roomtype}
								select
								name='roomtype'
								onChange={(e) => setRoomData({ ...roomData, roomtype: e.target.value })}
								sx={{
									cursor: 'text',
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
								}}
							>
								<MenuItem value={"hall"}>Hall</MenuItem>
								<MenuItem value={"exposition permanente"}>Exposition permanente</MenuItem>
								<MenuItem value={"réserve"}>réserve</MenuItem>
							</TextField>
							<>
								{isLoading ? (
									Rolling(40, 40, "#fff")
								) : (
									<Button variant='contained' onClick={() => setOpenConfirm(true)} color="success"
										sx={{
											transform: 'none !important',
											'&:hover': {
												backgroundColor: '#4caf50',
											},
										}}>
										Insert room
									</Button>
								)}
								<Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
									<DialogTitle>Confirm Insertion</DialogTitle>
									<DialogContent>
										<Typography>
											A new room will be created.
										</Typography>
									</DialogContent>
									<DialogActions>
										{isLoading ? (
											Rolling(40, 40, "#fff")
										) : (
											<>
												<Button onClick={() => setOpenConfirm(false)} color="primary" sx={{ transform: 'none !important' }}>
													Cancel
												</Button>
												<Button onClick={insertRoom} color="success" variant="contained" sx={{ display: 'flex', justifyContent: 'space-evenly', '&:hover': { backgroundColor: '#4caf50' }, transform: 'none !important' }}>
													Confirm
												</Button>
											</>
										)}
									</DialogActions>
								</Dialog>
							</>
						</>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}