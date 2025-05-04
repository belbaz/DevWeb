"use client";

import { Button, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import Rolling from '../../../components/rolling';
import EditState from '../../../components/editState';
import ObjectDataJsonEditor from '../../../components/ObjectDataJsonEditor';
import { category, fieldName } from '../../../components/entityDisplay';

export default function ObjectInstance({ }) {
	const [isObjectInstanceValid, setisObjectInstanceValid] = useState(false);
	const [loading, setLoading] = useState(true);
	const [objectInstanceData, setObjectInstanceData] = useState(null);
	const [roomData, setRoomData] = useState(null);
	const [rawJsonInput, setRawJsonInput] = useState('');
	const [self, setSelf] = useState(null);
	const [editable, setEditable] = useState(false);
	const [instanceIndex, setInstanceIndex] = useState(null);
	const [objectType, setObjectType] = useState(null);

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
		if (objectInstanceData?.room_id) {
			getRoomData(objectInstanceData.room_id);
		}
	}, [objectInstanceData?.room_id]);


	useEffect(() => {
		async function fetchAndFindIndex() {
			try {
				const all = await fetch('/api/objectData/listAllDatas');
				const { objectData } = await all.json();
				if (objectInstanceData?.id && objectData?.length > 0) {
					const sameTypeObjects = objectData.filter(o => o.type_Object === objectInstanceData.type_Object);
					const index = sameTypeObjects.findIndex(o => o.id === objectInstanceData.id);
					setInstanceIndex(index + 1);
				}
			} catch (error) {
				console.error("Error fetching index: ", error);
			}
		}
		if (objectInstanceData?.id) {
			fetchAndFindIndex();
			getObjects();
		}
	}, [objectInstanceData]);

	async function getObjects() { // missing route to get a single object from object type name (only id !!)
		try {
			const response = await fetch(`/api/objects/getObjects`, {
				method: "GET"
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}

			const data = await response.json();
			const matchingObjectType = data.objects.find(obj => obj.type === objectInstanceData?.type_Object); // find the matching object type
			setObjectType(matchingObjectType); // set the filtered object instance data to the state
		} catch (error) {
			toast.error("Error while fetching object instance data : " + error.message);
		}
	}

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

	async function getRoomData(roomId) {
		console.log("Fetching room with ID:", roomId); // DEBUG
		if (!roomId || isNaN(Number(roomId))) {
			console.warn("Invalid roomId:", roomId);
			return;
		}

		try {
			const response = await fetch(`/api/rooms/getRoomById?id=${encodeURIComponent(roomId)}`);
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Unknown error");
			}
			const data = await response.json();
			setRoomData(data.room);
		} catch (error) {
			console.error("Error fetching room data: ", error);
			toast.error("Error while fetching room data: " + error.message);
		}
	}

	async function updateObjectData() {
		try {
			const response = await fetch(`/api/objectData/updateObjectData?id=${encodeURIComponent(objectInstanceData.id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(objectInstanceData.data),
				credentials: "include"
			});
			if (response.ok) {
				toast.success("Object data updated successfully");
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
				<Box component="main" sx={{ width: { xs: '100vw', sm: '80vw' }, maxWidth: '1000px', bgcolor: 'black', borderRadius: 0, boxShadow: 6, p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
					{!isObjectInstanceValid ? (
						<Box>
							<Typography variant="h1" align="center" sx={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								Object instance not found
							</Typography>
							<Button sx={{ mt: 2, background: 'rgba(255, 255, 255, 0.2)', color: 'white', fontSize: '0.85rem', fontFamily: 'var(--font-roboto)' }} onClick={() => router.push('/')}>return to home</Button>
						</Box>
					) : (
						<Box>
							<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
								{instanceIndex ? `${objectInstanceData?.type_Object} n°${instanceIndex}` : "Loading..."}
							</Typography>

							<Box sx={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'row' }}>
								<Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '100%', maxWidth: '1000px' }}>
									{category('Information')}
									<Link onClick={() => { router.push("/object/" + objectType?.id) }} sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}>
										{fieldName('Object type', objectInstanceData?.type_Object)}
									</Link>

									{objectInstanceData?.room_id && roomData && (
										<Link
											onClick={() => router.push("/room/" + objectInstanceData.room_id)}
											sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 'bold' }}
										>
											{fieldName('Room', roomData.name)}
										</Link>
									)}


									{category('Datas')}
									{['avance', 'expert'].includes(self?.level) ? (
										<ObjectDataJsonEditor
											object={objectInstanceData?.data}
											setObject={(param) => setObjectInstanceData({ ...objectInstanceData, data: param })}
											objectType={objectInstanceData?.type_Object}
											editable={editable}
										/>
									) : (
										<Box>
											{Object.entries(objectInstanceData.data).map(([key, value]) => (
												<Box key={key}>{fieldName(key, value)}</Box>
											))}
										</Box>
									)}
								</Box>
							</Box>
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
