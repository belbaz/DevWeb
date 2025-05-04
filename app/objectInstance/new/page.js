"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { category } from '../../../components/entityDisplay'; // display the user data
import Rolling from '../../../components/rolling';


export default function Room({ }) {
	const [openConfirm, setOpenConfirm] = useState(false);
	const [objectInstance, setObjectInstance] = useState(null);
	const [rooms, setRooms] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [objectTypes, setObjectTypes] = useState(null);

	useEffect(() => {
		getObjects();
		getRooms();
	}, []);

	const router = useRouter();

	async function getRooms() {
		try {
			const response = await fetch(`/api/rooms/getRooms`, { method: "GET" });

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setRooms(data.rooms); // suppose que le backend retourne { rooms: [...] }
		} catch (error) {
			toast.error("Error while fetching rooms : " + error.message);
		}
	}


	async function insertObject() {
		setIsLoading(true);
		try {
			if (!objectInstance?.data || !objectInstance?.type_Object) {
				throw new Error("Please fill all the fields");
			}
			const response = await fetch("/api/objectData/addData", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					data: objectInstance.data,
					type_Object: objectInstance.type_Object
				}),
			});

			if (response.ok) {
				const data = await response.json();

				toast.success("object inserted successfully");
				router.push('/objectInstance/' + data.created.id); // redirect to the new room page with returned id
			} else {
				const data = await response.json();
				throw new Error(data.error || "Unknown error while inserting room");
			}
		} catch (error) {
			toast.error(error.message || "An unexpected error occurred");
		} finally { setIsLoading(false); setOpenConfirm(false); }
	}

	async function getObjects() {
		try {
			const response = await fetch(`/api/objects/getObjects`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setObjectTypes(data.objects); // set the filtered object instance data to the state
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		}
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
					New object instance
				</Typography>

				<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
						<>{category('Object information')}
							<TextField
								size="small"
								label="Object Type"
								value={objectInstance?.type_Object}
								select
								name='type_Object'
								onChange={(e) => setObjectInstance({ ...objectInstance, type_Object: e.target.value })}
								sx={{
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: 'white',
									},
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
								{Array.isArray(objectTypes) && objectTypes.map((objectType) => (
									<MenuItem key={objectType.type} value={objectType.type}>
										{objectType.type}
									</MenuItem>
								))}
							</TextField>

							<TextField
								size="small"
								label="Room"
								value={objectInstance?.room_id || ''}
								select
								name="room_id"
								onChange={(e) => setObjectInstance({ ...objectInstance, room_id: e.target.value })}
								sx={{
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiInputBase-input': {
										color: 'white',
										WebkitTextFillColor: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: 'white',
									},
								}}
							>
								{rooms.map((room) => (
									<MenuItem key={room.id} value={room.id}>
										{room.name} (Floor {room.floor})
									</MenuItem>
								))}
							</TextField>


							{category('Datas')}
							<TextareaAutosize
								value={objectInstance?.data}
								onChange={(e) => { setObjectInstance({ ...objectInstance, data: e.target.value }); }}
								style={{ resize: 'none', backgroundColor: "#3a3a3a", color: 'white', }}
							/>

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
										Insert Object
									</Button>
								)}
								<Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
									<DialogTitle>Confirm Insertion</DialogTitle>
									<DialogContent>
										<Typography>
											A new Object Instance will be created.
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
												<Button onClick={insertObject} color="success" variant="contained" sx={{ display: 'flex', justifyContent: 'space-evenly', '&:hover': { backgroundColor: '#4caf50' }, transform: 'none !important' }}>
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