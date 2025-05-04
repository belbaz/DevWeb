"use client";

import {useEffect, useState} from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Container,
    List,
    IconButton,
    Tooltip,
    useTheme,
    Paper,
    Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {toast} from "react-toastify";

const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const markAsRead = async (id) => {
        try {
            await fetch("/api/message/markAsRead", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({id}),
            });

            setMessages((prev) =>
                prev.map((msg) => (msg.id === id ? {...msg, read: true} : msg))
            );
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                const authCheck = await fetch("/api/user/checkUser", {
                    method: "POST",
                    credentials: "include",
                });

                const data = await authCheck.json();

                if (!data.level || data.level !== "expert") {
                    toast.error("You do not have permission to access this resource.");
                } else {
                    try {
                        const res = await fetch("/api/message/getMessage", {
                            method: "GET",
                            credentials: "include",
                        });
                        const data = await res.json();
                        setMessages(data);
                    } catch (error) {
                        console.error("Fetch error:", error);
                    } finally {
                        setLoading(false);
                    }
                }
            } catch (error) {
                toast.error("An error occurred while checking permissions.");
                console.error("Auth check error:", error);
            }
        };

        checkAuthAndFetch();
    }, []);

    return (
        <Container sx={{py: 4}}>
            <Typography variant="h4" gutterBottom fontWeight="500" color="primary.main">
                Message Admin
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={8}>
                    <CircularProgress color="primary"/>
                </Box>
            ) : messages.length === 0 ? (
                <Typography align="center" color="text.secondary" sx={{mt: 4}}>
                    No messages.
                </Typography>
            ) : (
                <List sx={{display: "flex", flexDirection: "column", gap: 2, mt: 3}}>
                    {messages.map(({id, firstName, lastName, message, createdAt, read, messageBy}) => (
                        <Paper
                            key={id}
                            elevation={read ? 1 : 3}
                            sx={{
                                display: "flex",
                                alignItems: "stretch",
                                justifyContent: "space-between",
                                p: 0,
                                borderRadius: 2,
                                overflow: "hidden",
                                borderLeft: read
                                    ? "none"
                                    : `4px solid ${theme.palette.primary.main}`,
                                transition: "all 0.2s ease",
                                backgroundColor: read
                                    ? theme.palette.background.paper
                                    : theme.palette.mode === "dark"
                                        ? theme.palette.background.paper
                                        : "#f5f9ff", // Subtle light blue for unread in light mode
                            }}
                        >
                            <Box flex={1} p={2} minWidth={0}>
                                <Box display="flex" alignItems="center" mb={0.5} gap={1}>
                                    <Typography fontWeight="600" variant="subtitle1" sx={{color: theme.palette.primary.main}}>
                                        {messageBy}
                                    </Typography>
                                    {!read && (
                                        <Chip
                                            label="New"
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{height: 20, fontSize: '0.7rem'}}
                                        />
                                    )}
                                </Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {firstName} {lastName} • {new Date(createdAt).toLocaleString()}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        mt: 1,
                                        color: theme.palette.text.primary,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontWeight: read ? 'normal' : 500,
                                    }}
                                >
                                    {message}
                                </Typography>
                            </Box>

                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    px: 1,
                                    backgroundColor: theme.palette.mode === "dark"
                                        ? "rgba(0,0,0,0.1)"
                                        : "rgba(0,0,0,0.03)",
                                    borderLeft: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <Tooltip title={read ? "Seen" : "Mark as read"}>
                                    <IconButton
                                        onClick={() => markAsRead(id)}
                                        sx={{
                                            backgroundColor: read
                                                ? theme.palette.mode === "dark"
                                                    ? "rgba(255,255,255,0.1)"
                                                    : "rgba(0,0,0,0.07)"
                                                : theme.palette.primary.main,
                                            color: read
                                                ? theme.palette.mode === "dark"
                                                    ? "rgba(255,255,255,0.7)"
                                                    : theme.palette.grey[700]
                                                : "#fff",
                                            width: 40,
                                            height: 40,
                                            transition: "all 0.2s",
                                            border: read
                                                ? `1px solid ${theme.palette.divider}`
                                                : "none",
                                            "&:hover": {
                                                backgroundColor: read
                                                    ? theme.palette.mode === "dark"
                                                        ? "rgba(255,255,255,0.2)"
                                                        : "rgba(0,0,0,0.12)"
                                                    : theme.palette.primary.dark,
                                                color: read
                                                    ? theme.palette.mode === "dark"
                                                        ? "#fff"
                                                        : theme.palette.grey[900]
                                                    : "#fff",
                                            },
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: 0,
                                        }}
                                    >
                                        {read ? (
                                            <VisibilityIcon fontSize="small" />
                                        ) : (
                                            <VisibilityOffIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Paper>
                    ))}
                </List>
            )}
        </Container>
    );
};

export default MessagesPage;