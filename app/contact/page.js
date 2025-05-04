"use client";

import {useEffect, useState} from "react";
import 'styles/expoBooking.css';
import {toast} from "react-toastify";

export default function Contact() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/user/checkUser", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    setUser(null)
                }
                const data = await response.json();
                setUser(data.pseudo);

            } catch (error) {
                console.error("Error fetching user data:", error);
                toast.error("Unable to load user data. Please try again later.");
            }
        };

        fetchUserData();
    }, []);

    const isFormValid = () =>
        firstName.trim() && lastName.trim() && email.trim() && message.trim();

    const handleSubmit = async () => {
        if (!isFormValid()) return;

        try {
            const response = await fetch("/api/message/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lastName: lastName,
                    firstName: firstName,
                    messageBy: user || null,
                    message: "hello world!",
                    email: email,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setFirstName("");
                setLastName("");
                setEmail("");
                setMessage("");
                toast.success("Your message has been sent successfully!");
            } else {
                const errorData = await response.json();
                console.error("Submission error:", errorData);
                toast.error("Failed to send message. Please try again later.");
            }
        } catch (error) {
            console.error("Network error:", error);
            toast.error("Network error. Please check your connection.");
        }
    };


    return (
        <div className="bookingContainer">
            <h1 className="formTitle">Contact Admin</h1>

            <div className="fieldGroup" style={{display: "flex", gap: "10px"}}>
                <div style={{flex: 1}}>
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                    />
                </div>
                <div style={{flex: 1}}>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="fieldGroup">
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@gmail.com"
                />
            </div>

            <div className="fieldGroup">
                <label>Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={10}
                    style={{resize: "vertical", width: "100%"}}
                />
            </div>

            <button
                className="purchaseBtn"
                onClick={handleSubmit}
                disabled={!isFormValid()}
            >
                Contact
            </button>

            {submitted && (
                <p style={{marginTop: "20px", color: "green"}}>
                    Thank you for contacting us! We'll get back to you shortly.
                </p>
            )}
        </div>
    );
}
//