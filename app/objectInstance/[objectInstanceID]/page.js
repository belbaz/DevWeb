"use client";

import { Button, MenuItem } from '@mui/material';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import { useParams, useRouter } from 'next/navigation'; // get /objectInstance/:objectInstanceID
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling'; // loading animation
import EditState from '../../../components/editState'; // loading animation
import { category, fieldName } from '../../../components/entityDisplay'; // display the object instance data



export default function ObjectInstance({ }) {
	const [isObjectInstanceValid, setisObjectInstanceValid] = useState(false); // true by default to avoid flickering when loading the page, turned off as soon as the api call is done
	const [loading, setLoading] = useState(true);
	const [objectInstanceData, setObjectInstanceData] = useState(null); // to store the objectInstance data from the API call
	const [objectTypes, setObjectTypes] = useState(null);
	const [self, setSelf] = useState(null); // logged in objectInstance data
	const [editable, setEditable] = useState(false);

	const params = useParams();
	const router = useRouter();

	const { objectInstanceID } = params;
	if (!objectInstanceID) {
		router.push('/');
		return null; // avoid render for forbidden pages
	}

	useEffect(() => {
		getObjectData();
		getObjects();
		getSelf();
	}, [objectInstanceID]);

	async function getObjectData() {
		try {
			const response = await fetch(`/api/objectData/getDatasByInstance?id=${encodeURIComponent(objectInstanceID)}`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			console.log("object instance data", data);
			setisObjectInstanceValid(data.instance !== null); // remains false if no data is returned and keeps showing the error message
			setObjectInstanceData(data.instance); // set the object instance data to the state

		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
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
				setSelf({ ...data, level: 'expert' });
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
			console.log("all objects", data);
			setObjectTypes(data.objects); // set the filtered object instance data to the state
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		} finally {
			setLoading(false);
		}
	}

	async function updateObjectData() {
		try {
			const response = await fetch(`/api/objectData/updateObjectData?id=${encodeURIComponent(objectInstanceData.id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: objectInstanceData.data,
					type_Object: objectInstanceData.type_Object
				}),
				credentials: "include"
			});

			if (response.ok) {
				toast.success(" object data updated successfully");
			} else {
				const data = await response.json();
				toast.error(data.error || "Error while updating object data");
			}
		} catch (error) {
			toast.error("Error while updating  object data " + error);
		} finally { getSelf(); getObjectData(); }
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
					{!isObjectInstanceValid ? ( // error case
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								Object instance not found
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
								Object instance
							</Typography>


							{['avance', 'expert'].includes(self?.level) ? ( // edit object instance info
								<Box sx={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'row' }}>
									<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '70%', maxWidth: '1000px' }}>
										{category('Information')}
										<TextField
											size="small"
											disabled={!editable}
											label="Object Type"
											value={objectInstanceData?.type_Object}
											select
											name='type_Object'
											onChange={(e) => setObjectInstanceData({ ...objectInstanceData, type_Object: e.target.value })}
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
										>
											{Array.isArray(objectTypes) && objectTypes.map((objectType) => (
												<MenuItem key={objectType.type} value={objectType.type}>
													{objectType.type}
												</MenuItem>
											))}
										</TextField>
										{category('Additional data')}
										<TextareaAutosize
											value={JSON.stringify(objectInstanceData?.data || {}, null, 2)}
											disabled={!editable}
											onChange={(e) => { setObjectInstanceData(); }}
											style={{ resize: 'none', backgroundColor: "#3a3a3a", color: editable ? 'white' : '#9e9e9e', }}
										/>
									</Box>
								</Box>

							) : (
								<Box sx={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'row' }}>
									<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '70%', maxWidth: '1000px' }}>
										{category('Information')}
										<Box>
											{fieldName('Object type', objectInstanceData?.type_Object)}
										</Box>
										<Box>
											{category('Additional data')}
											{Object.entries(objectInstanceData.data).map(([key, value]) => (
												<Box>{fieldName(key, value)}</Box>
											))}
										</Box>
									</Box>
								</Box>
							)}
						</Box>
					)}
					{['avance', 'expert'].includes(self?.level) ? ( // edit user info

						<Box // editstate component only shown if the user is the owner of the profile or an admin
							sx={{
								width: '100%',
								display: 'flex',
								justifyContent: 'flex-end',
							}}>
							< EditState setEditable={(x) => { setEditable(x) }} onCancel={() => getObjectData()} onConfirm={() => { updateObjectData() }} />
						</Box>
					) : null}
				</Box>
			)}
		</Box >
	);
}