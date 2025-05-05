"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
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
	const [isRoomValid, setisRoomValid] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editable, setEditable] = useState(false);
	const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

	const [roomData, setRoomData] = useState(null);
	const [self, setSelf] = useState(null);
	const [objectID, setObjectID] = useState(null);
	const [objects, setObjects] = useState(null);
	const [currentObject, setCurrentObject] = useState(null);
	const [globalIndexMap, setGlobalIndexMap] = useState({});
	const [expoList, setExpoList] = useState([]);

	const params = useParams();
	const router = useRouter();

	const { roomID } = params;
	if (!roomID || isNaN(roomID)) {
		router.push('/');
		return null;
	}

	useEffect(() => {
		async function fetchExpos() {
			try {
				const response = await fetch("/api/expo/list");
				const data = await response.json();
				setExpoList(data.expos);
			} catch (err) {
				console.error("Error when charging expos :", err);
			}
		}

		if (roomData?.roomtype === "exposition") {
			fetchExpos();
		}
	}, [roomData?.roomtype]);



	useEffect(() => {
		getRoom();
		getSelf();
		if (roomID) getObjectsByRoom();
	}, [roomID]);

	useEffect(() => {
		if (objectID) {
			const selectedObject = objects.find((object) => object.id === objectID);
			setCurrentObject(selectedObject);
		}
	}, [objectID]);

	useEffect(() => {
		async function fetchGlobalIndexes() {
			try {
				const response = await fetch('/api/objectData/listAllDatas');
				const { objectData: allData } = await response.json();
				const indexMap = {};
				objects?.forEach(obj => {
					const sameType = allData.filter(o => o.type_Object === obj.type_Object);
					const index = sameType.findIndex(o => o.id === obj.id);
					if (index >= 0) indexMap[obj.id] = index + 1;
				});
				setGlobalIndexMap(indexMap);
			} catch (error) {
				console.error("Erreur index global :", error);
			}
		}
		if (objects?.length > 0) fetchGlobalIndexes();
	}, [objects]);

	async function getRoom() {
		try {
			const response = await fetch(`/api/rooms/getRoomById?id=${encodeURIComponent(roomID)}`);
			if (!response.ok) throw new Error((await response.json()).error || "Unknown error");
			const data = await response.json();
			setisRoomValid(data.room != null);
			setRoomData(data.room);
		} catch (error) {
			toast.error("Error while fetching room data : " + error.message);
		} finally {
			setLoading(false);
		}
	}

	async function getObjectsByRoom() {
		try {
			const response = await fetch(`/api/objectData/getObjectDataByRoom?id=${encodeURIComponent(roomID)}`);
			if (!response.ok) throw new Error((await response.json()).error || "Unknown error");
			const data = await response.json();
			setObjects(data.objectData);
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		}
	}

	async function getSelf() {
		try {
			const response = await fetch("/api/user/checkUser", { method: "POST" });
			const data = await response.json();
			if (response.ok) setSelf(data);
			else throw new Error("API error : " + data.error);
		} catch (error) {
			toast.error("Cannot get current user's data : " + error.message);
		}
	}

	async function deleteRoom() {
		try {
			const response = await fetch(`/api/rooms/deleteRoom?id=${roomData.id}`, {
				method: "DELETE",
				credentials: "include",
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
			const response = await fetch("/api/rooms/updateRoom", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: roomData.id,
					floor: roomData.floor,
					levelAcces: roomData.levelAcces,
					roomtype: roomData.roomtype,
					name: roomData.name,
					expo_id: roomData.roomtype === "exposition" ? roomData.expo_id : null
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
		<Box sx={{ background: 'none', height: 'auto', margin: 0 }} >

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
									{self?.level == 'intermediate' || self?.level == 'advanced' || self?.level == 'expert' ? ( // edit room info
										<>{category('Room informations')}
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
												<MenuItem value={"exposition"}>Exposition</MenuItem>
												<MenuItem value={"storage"}>storage</MenuItem>
											</TextField>

											{roomData?.roomtype === "exposition" && (
												<TextField
													size="small"
													disabled={!editable}
													label="Exposition"
													value={roomData?.expo_id || ''}
													select
													name='expo_id'
													onChange={(e) => setRoomData({ ...roomData, expo_id: parseInt(e.target.value) })}
													sx={{
														cursor: editable ? 'text' : 'not-allowed',
														backgroundColor: "#3a3a3a",
														borderRadius: 1,
														'&& .MuiSelect-icon': { color: editable ? 'white' : '#9e9e9e !important' },
														'&& .MuiInputBase-input': { color: editable ? 'white' : '#9e9e9e' },
														'&& .MuiInputLabel-root': { color: editable ? 'white' : '#9e9e9e' },
														'&& .Mui-disabled': {
															color: editable ? 'white' : '#9e9e9e',
															WebkitTextFillColor: editable ? 'white' : '#9e9e9e',
														}
													}}
												>
													{expoList.map((expo) => (
														<MenuItem key={expo.id} value={expo.id}>
															{expo.name}
														</MenuItem>
													))}

												</TextField>
											)}

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
											{category('Room informations')}
											<Box>
												{fieldName('Floor', String(roomData?.floor))}
											</Box>
											<Box>
												{fieldName('Level access', roomData?.levelAcces)}
											</Box>
											<Box>
												{fieldName('Room type', roomData?.roomtype)}
											</Box>
											{roomData?.roomtype === "exposition" && roomData?.expo_id && (
												<Box>
													{fieldName('Exposition', expoList.find(e => e.id === roomData.expo_id)?.name || `Exposition ${roomData.expo_id}`)}
												</Box>
											)}

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

			{self?.level == 'beginner' || self?.level == 'intermediate' || self?.level == 'advanced' || self?.level == 'expert' ? (
				<Box sx={{ background: 'none', height: '100vh', margin: 0 }}>
					{self?.level && (
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
							<TextField
								size="small"
								label="Object"
								value={objectID || ''}
								select
								onChange={(e) => setObjectID(Number(e.target.value))}
								sx={{
									cursor: 'text',
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiSelect-icon': { color: 'white' },
									'&& .MuiInputBase-input': { color: 'white' },
									'&& .MuiInputLabel-root': { color: '#9e9e9e' }
								}}
							>
								{Array.isArray(objects) && objects.length > 0 ? (
									objects.map((object) => (
										<MenuItem key={object.id} value={object.id}>
											{`${object.type_Object} n°${globalIndexMap[object.id] || '?'}`}
										</MenuItem>
									))
								) : (
									<MenuItem value="" disabled>
										No objects available in this room
									</MenuItem>
								)}
							</TextField>

							{currentObject ? (
								<>
									{category('Object informations')}
									<Box>{fieldName('Type', currentObject?.type_Object)}</Box>
									{Object.entries(typeof currentObject.data === 'string' ?
										JSON.parse(currentObject.data)
										:
										currentObject.data).map(([key, value]) => (
										<Box key={key}>
											{fieldName(key, String(value))}
										</Box>
									))
									}

									{['advanced', 'expert', 'intermediate'].includes(self?.level) && currentObject?.id && (
										<Button
											variant="contained"
											sx={{ mt: 2, width: 'fit-content' }}
											onClick={() => router.push(`/objectInstance/${currentObject.id}`)}
										>
											See object
										</Button>
									)}
								</>
							) : (
								<Box sx={{ mt: 2, color: 'white' }}>
									<Typography variant="h6">No object selected</Typography>
								</Box>
							)}
						</Box>
					)}
				</Box>
			) : null}

		</Box>
	);
}