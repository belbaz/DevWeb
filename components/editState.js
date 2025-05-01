import React, { useState } from 'react';

import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

// visual component for entities edition state
// onconfirm triggered if the user confirms on the check
// oncancel triggered if the user cancels on the cross or pen
export const EditState = ({ setEditable = () => { }, onConfirm = () => { }, onCancel = () => { } }) => {
	const [isEditing, setIsEditing] = useState(false);

	const toggleEditing = () => {
		setIsEditing(!isEditing);
		setEditable(!isEditing);
	};

	return (
		<Stack direction="row" spacing={2} alignItems="center">
			<Fade
				in={isEditing}
				timeout={{
					enter: 370,
					exit: 100
				}}>
				<Stack direction="row" spacing={1}>
					<CloseIcon
						onClick={() => {
							toggleEditing();
							onCancel();
						}}
						sx={{ cursor: 'pointer', '&:hover': { color: 'error.main' }, transition: 'color 0.2s ease-in-out', }}
					/>
					<CheckIcon
						onClick={() => {
							toggleEditing();
							onConfirm();
						}}
						sx={{ cursor: 'pointer', '&:hover': { color: 'success.main' }, transition: 'color 0.2s ease-in-out', }}
					/>
				</Stack>
			</Fade>

			<EditIcon
				onClick={() => {
					toggleEditing();
					onCancel();
				}}
				sx={{ cursor: 'pointer', '&:hover': { color: 'steelblue' }, transition: 'color 0.2s ease-in-out' }} />
		</Stack>
	);
};

export default EditState;