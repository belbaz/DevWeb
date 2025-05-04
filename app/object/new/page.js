"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import Box from '@mui/material/Box';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import { toast } from 'react-toastify';
import { category } from '../../../components/entityDisplay'; // display the user data
import Rolling from '../../../components/rolling';
import { get } from 'js-cookie';


export default function Room({ }) {
	const [openConfirm, setOpenConfirm] = useState(false);
	const [object, setObject] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	useEffect(() => {
		getRooms();
	}, []);

	async function getRooms() {
		try {
			const response = await fetch(`/api/rooms/getRooms`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			setRooms(data.rooms);
			
			// Si des rooms sont disponibles, sélectionner la première par défaut
			if (data.rooms && data.rooms.length > 0) {
				setObject(prev => ({
					...prev,
					room_id: data.rooms[0].id
				}));
			}
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		}
	}

	async function insertObject() {
		setIsLoading(true);
		try {
			if (!object?.type || !object?.brand || !object?.description) {
				throw new Error("Please fill all the fields");
			}
			const response = await fetch("/api/objects/addObject", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					type: object.type,
					brand: object.brand,
					description: object.description,
				}),
			});

			if (response.ok) {
				const data = await response.json();

				toast.success("object inserted successfully");
				router.push('/object/' + data?.created[0]?.id); // redirect to the new room page with returned id
			} else {
				const data = await response.json();
				throw new Error(data.error || "Unknown error while inserting object");
			}
		} catch (error) {
			toast.error(error.message || "An unexpected error occurred");
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
					New object type
				</Typography>

				<Box sx={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
					<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
						<>{category('Object information')}
							<TextField
								size="small"
								label="Type"
								value={object?.type}
								type="text"
								name='type'
								onChange={(e) => setObject({ ...object, type: e.target.value })}
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
								label="Brand"
								value={object?.brand}
								type="text"
								name='brand'
								onChange={(e) => setObject({ ...object, brand: e.target.value })}
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
							{category('Description')}
							<TextareaAutosize
								value={object?.description}
								onChange={(e) => { setObject({ ...object, description: e.target.value }); }}
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
											A new Object will be created.
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