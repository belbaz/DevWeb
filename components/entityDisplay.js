import React from 'react';
import { Box, Typography } from '@mui/material';

export const fieldName = (label, value) => (
	<Box>
		<Typography component="span" sx={{ fontWeight: 'bold', color: '#595959' }}>
			{label + " "}
		</Typography>
		: {value || 'unknown'}
	</Box>
);

export const category = (label) => (
	<Typography
		variant="h6"
		sx={{
			fontWeight: 'bold',
			fontSize: '1.2rem',
			marginBottom: 1,
			position: 'relative',
			display: 'inline-block',
			ml: -1,
			mt: 3
		}}
	>
		{label}
		<Box
			sx={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				width: '100%',
				height: '1px',
				backgroundColor: 'grey',
			}}
		/>
	</Typography>
);