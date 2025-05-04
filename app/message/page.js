"use client";

import { useEffect, useState } from "react";
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const fetchMessages = async () => {
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
    };

    const markAsRead = async (id) => {
        try {
            await fetch("/api/message/markAsRead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id }),
            });

            setMessages((prev) =>
                prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
            );
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Inbox
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={8}>
                    <CircularProgress />
                </Box>
            ) : messages.length === 0 ? (
                <Typography align="center" color="text.secondary">
                    No messages.
                </Typography>
            ) : (
                <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {messages.map(({ id, firstName, lastName, message, createdAt, read, messageBy }) => (
                        <Paper
                            key={id}
                            elevation={2}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 2,
                                backgroundColor: read
                                    ? theme.palette.background.paper
                                    : theme.palette.mode === "dark"
                                        ? "#1e293b" // Dark mode background for unread messages
                                        : "#ffeb3b", // Lighter yellow background for unread messages to make them stand out
                                borderRadius: 2,
                                boxShadow: read
                                    ? "none"
                                    : "0 2px 10px rgba(0, 0, 0, 0.2)", // Add shadow to unread messages for emphasis
                            }}
                        >
                            <Box flex={1} minWidth={0}>
                                {/* Affichage de messageBy en premier */}
                                <Typography fontWeight={read ? "normal" : "bold"} variant="h6">
                                    {messageBy}
                                </Typography>
                                {/* Affichage de firstName et lastName sur la ligne suivante */}
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {firstName} {lastName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: "100%" }}
                                >
                                    {message}
                                </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(createdAt).toLocaleString()}
                                </Typography>

                                <Tooltip title={read ? "Seen" : "New"}>
                                    <IconButton
                                        onClick={() => markAsRead(id)}
                                        sx={{
                                            color: read ? theme.palette.grey[500] : theme.palette.primary.main, // Make the button more visible
                                            transition: "color 0.3s",
                                            "&:hover": {
                                                color: theme.palette.primary.dark, // Darken on hover for better visibility
                                            },
                                        }}
                                    >
                                        {read ? (
                                            <VisibilityIcon />
                                        ) : (
                                            <VisibilityOffIcon />
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
