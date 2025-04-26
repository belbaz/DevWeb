import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Footer() {
	return (
		<footer className="footer">
			<p>&copy; 2025 MuseHome All rights reserved.</p>
		</footer>
	);
}

export function MuiFooter() {
	return (
		<AppBar position="fixed" sx={{ top: "auto", bottom: 0, backgroundColor: "#00796b", mt: 2, display: "flex", alignItems: "center" }}>
			<Typography variant="body2" sx={{ m: 1 }}>
				© {new Date().getFullYear()} MuseHomee. All rights reserved.
			</Typography>
		</AppBar>
	);
}

