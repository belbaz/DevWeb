"use client";

import { Button, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling';
import EditState from '../../../components/editState';
import { category, fieldName } from '../../../components/entityDisplay';

export default function ObjectInstance({ }) {
	const [isObjectInstanceValid, setisObjectInstanceValid] = useState(false);
	const [loading, setLoading] = useState(true);
	const [objectInstanceData, setObjectInstanceData] = useState(null);
	const [self, setSelf] = useState(null);
	const [editable, setEditable] = useState(false);
	const [instanceIndex, setInstanceIndex] = useState(null); // AJOUT

	const params = useParams();
	const router = useRouter();

	const { objectInstanceID } = params;
	if (!objectInstanceID) {
		router.push('/');
		return null;
	}

	useEffect(() => {
		getObjectData();
		getSelf();
	}, [objectInstanceID]);

	useEffect(() => {
		async function fetchAndFindIndex() {
			try {
				const all = await fetch('/api/objectData/listAllDatas');
				const { objectData } = await all.json();

				if (objectInstanceData?.id && objectData?.length > 0) {
					const index = objectData.findIndex(o => o.id === objectInstanceData.id);
					setInstanceIndex(index + 1);
				}
			} catch (error) {
				console.error("Error fetching index: ", error);
			}
		}
		if (objectInstanceData?.id) {
			fetchAndFindIndex();
		}
	}, [objectInstanceData]);

	async function getObjectData() {
		try {
			const response = await fetch(`/api/objectData/getDatasByInstance?id=${encodeURIComponent(objectInstanceID)}`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}
			const data = await response.json();
			setisObjectInstanceValid(data.instance !== null);
			setObjectInstanceData(data.instance);
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		} finally {
			setLoading(false);
		}
	}

	async function getSelf() {
		try {
			const response = await fetch("/api/user/checkUser", { method: "POST" });
			const data = await response.json();
			if (response.ok) {
				setSelf({ ...data, level: 'expert' });
			} else {
				console.log(data.invalidToken ? "invalid token" : data.noToken ? "No token provided" : "Unknown error");
				throw new Error("API error : " + data.error);
			}
		} catch (error) {
			toast.error("Cannot get current user's data : " + error.message);
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
			toast.error("Error while updating object data " + error);
		} finally {
			getSelf();
			getObjectData();
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
				<Box component="main" sx={{
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
					{!isObjectInstanceValid ? (
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								Object instance not found
							</Typography>
							<Button sx={{
								mt: 2,
								background: 'rgba(255, 255, 255, 0.2)',
								color: 'white',
								fontSize: '0.85rem',
								fontFamily: 'var(--font-roboto)',
							}} onClick={() => router.push('/')}>
								return to home
							</Button>
						</Box>
					) : (
						<Box>
							<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								{instanceIndex ? `${objectInstanceData?.type_Object} n°${instanceIndex}` : "Loading..."}
							</Typography>

							{['avance', 'expert'].includes(self?.level) ? (
								<Box sx={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'row' }}>
									<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '70%', maxWidth: '1000px' }}>
										{category('Information')}
										<Box>{fieldName('Object type', objectInstanceData?.type_Object)}</Box>
										{category('Datas')}
										<TextareaAutosize
											value={JSON.stringify(objectInstanceData?.data || {}, null, 2)}
											disabled={!editable}
											onChange={(e) => { setObjectInstanceData(); }}
											style={{ resize: 'none', backgroundColor: "#3a3a3a", color: editable ? 'white' : '#9e9e9e' }}
										/>
									</Box>
								</Box>
							) : (
								<Box sx={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'row' }}>
									<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '70%', maxWidth: '1000px' }}>
										{category('Information')}
										<Box>
											{category('Datas')}
											{Object.entries(objectInstanceData.data).map(([key, value]) => (
												<Box key={key}>{fieldName(key, value)}</Box>
											))}
										</Box>
									</Box>
								</Box>
							)}
						</Box>
					)}

					{['avance', 'expert'].includes(self?.level) && (
						<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
							<EditState setEditable={setEditable} onCancel={getObjectData} onConfirm={updateObjectData} />
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}
