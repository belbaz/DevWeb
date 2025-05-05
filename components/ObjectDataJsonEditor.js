import { Button, MenuItem, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';

import { category, fieldName } from './entityDisplay';
import objectDataFields from '../lib/objectDataFields';


/**
 * component that allows to dynamically edit a json object, add new fields, remove fields, or simply view it
 * 
 * @param object the object to display/edit
 * @param setObject the function to set the object
 * @param objectType the type of the object that will be used for knowing which fields to edit
 * @param editable if the object is editable or not : fales = view only
 */
export default function ObjectDataJsonEditor({ object = null, setObject = () => { }, objectType, editable = false }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
			{Array.isArray(objectDataFields(objectType)) && objectDataFields(objectType).map((item, index) => (
				<Box 
					key={`field-${item}-${index}`} 
					sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
				>
					{editable ? (
						<>
							<TextField
								disabled
								value={item}
								sx={{
									cursor: editable ? 'text' : 'not-allowed',
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
									'&& .Mui-disabled': {
										WebkitTextFillColor: '#9e9e9e',
									}
								}}
							/>
							<Typography variant="body1">→</Typography>
							<TextField
								onChange={(e) => setObject({ ...object, [item]: e.target.value })}
								value={object ? object[item] : null}
								sx={{
									cursor: editable ? 'text' : 'not-allowed',
									backgroundColor: "#3a3a3a",
									borderRadius: 1,
									'&& .MuiSelect-icon': {
										color: 'white',
									},
									'&& .MuiInputBase-input': {
										color: 'white',
									},
									'&& .MuiInputLabel-root': {
										color: '#9e9e9e',
									},
								}}
							/>
							<Button
								onClick={() => setObject({ ...object, [item]: "" })}
								variant="outline"
								sx={{
									'&:hover': {
										backgroundColor: '#c62828',
										transform: 'none !important',
									},
								}}
							>
								<DeleteIcon sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} />
							</Button>
						</>
					) : (
						<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
							{fieldName(item, object ? object[item] : null)}
						</Box>
					)}
				</Box>
			))}
		</Box >
	);
}