"use client";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'next/navigation'; // get /profile/:userID
import React, { useEffect, useState } from "react";


export default function Profile({ }) {
	const params = useParams();
	const router = useRouter();

	const { userID } = params;
	if (!userID || isNaN(userID)) {
		router.push('/');
		return null; // avoid render for forbidden pages
	}

	return (
		<Box sx={{ background: 'none', height: '100vh', margin: 0 }}>
			<Box
				component="main"
				sx={{
					width: '100%',
					maxWidth: 400,
					bgcolor: 'black',
					borderRadius: 0,
					boxShadow: 6,
					p: 5,
					display: 'flex',
					flexDirection: 'column',
					gap: 3,
				}}
			>
				<Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
					Profile of {userID}
				</Typography>

			</Box>
		</Box>
	);
}