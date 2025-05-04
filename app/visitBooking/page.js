"use client";

import 'styles/expoBooking.css';
import { useEffect, useState } from "react";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useRouter } from 'next/navigation';

export default function VisitBookingPage() {
    const [user, setUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [adultCount, setAdultCount] = useState(0);
    const [childCount, setChildCount] = useState(0);
    const [namesAdults, setNamesAdults] = useState([]);
    const [namesChildren, setNamesChildren] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/user/checkUser', { method: 'POST' })
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => setUser(null));
    }, []);

    const getRemaining = (type) => {
        const total = adultCount + childCount;
        if (type === 'adult') return 15 - childCount;
        if (type === 'child') return 15 - adultCount;
        return 0;
    };

    const handleAdultChange = (e) => {
        const value = parseInt(e.target.value);
        if (value + childCount <= 15) {
            setAdultCount(value);
            setNamesAdults(Array(value).fill({}));
        }
    };

    const handleChildChange = (e) => {
        const value = parseInt(e.target.value);
        if (value + adultCount <= 15) {
            setChildCount(value);
            setNamesChildren(Array(value).fill({}));
        }
    };

    const renderNameInputs = (count, names, setNames, isChild) => {
        return Array.from({ length: count }, (_, i) => (
            <div className="nameAgeBlock" key={i}>
                <input
                    type="text"
                    placeholder="Name"
                    value={names[i]?.name || ""}
                    onChange={(e) => {
                        const updated = [...names];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setNames(updated);
                    }}
                />
                <input
                    type="number"
                    placeholder="Age"
                    min={isChild ? 0 : 18}
                    max={isChild ? 17 : 130}
                    value={names[i]?.age ?? ""}
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) => {
                        const age = parseInt(e.target.value, 10);
                        if (isNaN(age)) return;
                        if (isChild && (age < 0 || age > 17)) return;
                        if (!isChild && (age < 18 || age > 130)) return;
                        const updated = [...names];
                        updated[i] = { ...updated[i], age };
                        setNames(updated);
                    }}
                />
            </div>
        ));
    };

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const handlePay = async () => {
        const allNames = [...namesAdults, ...namesChildren];
        const names = allNames.map(n => n.name);
        const ages = allNames.map(n => n.age);

        const res = await fetch('/api/booking/buyVisitTicket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pseudo: user.pseudo,
                date: selectedDate,
                names,
                ages
            })
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `visit_tickets_${user.pseudo}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            router.push("/");
        } else {
            alert("Booking failed.");
        }
    };

    if (!user) return <p>Loading...</p>;

    const totalTickets = adultCount + childCount;
    const totalPrice = (adultCount * 17) + (childCount * 13);

    const allInputsFilled = () => {
        const all = [...namesAdults, ...namesChildren];
        return all.length === totalTickets && all.every(p => p.name?.trim() && typeof p.age === 'number');
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return (
        <div className="bookingContainer">
            <h1 className="formTitle">Purchase Visit Tickets</h1>

            <div className="fieldGroup">
                <label>Date :</label>
                <input
                    type="date"
                    value={selectedDate}
                    min={tomorrowStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                />
            </div>

            <div className="fieldGroup">
                <label>Pseudo :</label>
                <input disabled value={user.pseudo} />
            </div>

            <div className="ticketSelectors">
                <div>
                    <label>Adult Tickets :</label>
                    <select value={adultCount} onChange={handleAdultChange}>
                        {Array.from({ length: getRemaining('adult') + 1 }, (_, i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Children Tickets :</label>
                    <select value={childCount} onChange={handleChildChange}>
                        {Array.from({ length: getRemaining('child') + 1 }, (_, i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>
            </div>

            {adultCount > 0 && (
                <div className="fieldGroup">
                    <h3>Adults</h3>
                    {renderNameInputs(adultCount, namesAdults, setNamesAdults, false)}
                </div>
            )}

            {childCount > 0 && (
                <div className="fieldGroup">
                    <h3>Children</h3>
                    {renderNameInputs(childCount, namesChildren, setNamesChildren, true)}
                </div>
            )}

            {totalTickets > 0 && allInputsFilled() && (
                <button className="purchaseBtn" onClick={openDialog}>Purchase Now !</button>
            )}

            <Dialog open={dialogOpen} onClose={closeDialog}>
                <DialogContent className="dialogContent">
                    <div className="dialogRow">
                        <span>Adult Tickets :</span>
                        <span>{adultCount} ticket(s) × 17 = {adultCount * 17} €</span>
                    </div>
                    <div className="dialogRow">
                        <span>Children Tickets :</span>
                        <span>{childCount} ticket(s) × 13 = {childCount * 13} €</span>
                    </div>
                    <div className="dialogTotal">
                        TOTAL : {totalTickets} ticket(s) — {totalPrice} €
                    </div>
                    <div className="dialogButtons">
                        <button className="dialogCancelBtn" onClick={closeDialog}>Cancel</button>
                        <button className="dialogPayBtn" onClick={handlePay}>PAY</button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
