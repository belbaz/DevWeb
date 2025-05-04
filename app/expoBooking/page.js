"use client";

import 'styles/expoBooking.css';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useRouter } from 'next/navigation';


export default function ExpoBookingPage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    const [expo, setExpo] = useState(null);
    const [user, setUser] = useState(null);
    const [dateOptions, setDateOptions] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [maxAvailable, setMaxAvailable] = useState(10);

    const [adultCount, setAdultCount] = useState(0);
    const [childCount, setChildCount] = useState(0);
    const [namesAdults, setNamesAdults] = useState([]);
    const [namesChildren, setNamesChildren] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    // Fetch user and expo data
    useEffect(() => {
        fetch('/api/user/checkUser', { method: 'POST' })
            .then(res => res.json())
            .then(data => setUser(data))
            .catch(() => setUser(null));

        fetch('/api/booking/getAllExposData')
            .then(res => res.json())
            .then(async (data) => {
                const found = data.find(e => e.name === title);
                if (!found) return;
                setExpo(found);

                const validDates = [];
                for (let d of found.dates) {
                    const res = await fetch('/api/booking/expoAvailability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, date: d })
                    });
                    const txt = await res.text();
                    if (!txt.includes("Sold Out") && !txt.includes("Expired")) {
                        validDates.push({ date: d, label: new Date(d).toLocaleDateString() });
                    }
                }

                setDateOptions(validDates);
                if (validDates.length > 0) setSelectedDate(validDates[0].date);
            });
    }, [title]);

    // Update maxAvailable when date changes
    useEffect(() => {
        if (!selectedDate) return;

        fetch('/api/booking/expoAvailability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, date: selectedDate })
        })
            .then(res => res.text())
            .then(data => {
                const match = data.match(/^(\d+)/);
                if (match) {
                    const available = parseInt(match[1]);
                    setMaxAvailable(available);
                    setAdultCount(0);
                    setChildCount(0);
                    setNamesAdults([]);
                    setNamesChildren([]);
                }
            });
    }, [selectedDate, title]);

    const getRemaining = (type) => {
        if (type === 'adult') return maxAvailable - childCount;
        if (type === 'child') return maxAvailable - adultCount;
        return 0;
    };

    const handleAdultChange = (e) => {
        const value = parseInt(e.target.value);
        if (value + childCount <= maxAvailable) {
            setAdultCount(value);
            setNamesAdults(Array(value).fill({}));
        }
    };

    const handleChildChange = (e) => {
        const value = parseInt(e.target.value);
        if (value + adultCount <= maxAvailable) {
            setChildCount(value);
            setNamesChildren(Array(value).fill({}));
        }
    };

    const renderNameInputs = (count, names, setNames, isChild) => {
        const fields = [];
        for (let i = 0; i < count; i++) {
            fields.push(
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
                        onKeyDown={(e) => e.preventDefault()} // bloque toutes les saisies clavier
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
            );
        }
        return fields;
    };

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const handlePay = () => {
        const allNames = [...namesAdults, ...namesChildren];
        const names = allNames.map(n => n.name);
        const ages = allNames.map(n => n.age);

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/booking/buyExpoTicket";
        form.style.display = "none";

        const appendInput = (name, value) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        };

        appendInput("pseudo", user.pseudo);
        appendInput("title", title);
        appendInput("date", selectedDate);
        appendInput("names", JSON.stringify(names));
        appendInput("ages", JSON.stringify(ages));

        document.body.appendChild(form);
        form.submit();

        setTimeout(() => {
            router.push(`/expoInstance/${expo.id}`);
        }, 1500);
    };


    if (!expo || !user) return <p>Loading...</p>;

    const totalTickets = adultCount + childCount;
    const totalPrice = (adultCount * expo.priceAdult) + (childCount * expo.priceChild);

    const allInputsFilled = () => {
        const all = [...namesAdults, ...namesChildren];
        return all.length === totalTickets && all.every(p => p.name?.trim() && typeof p.age === 'number');
    };


    return (
        <div className="bookingContainer">
            <h1 className="formTitle">Purchase Expo Tickets</h1>

            <div className="fieldGroup">
                <label>Title :</label>
                <input disabled value={expo.name} />
            </div>

            <div className="fieldGroup">
                <label>Date :</label>
                <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                    {dateOptions.map((d, i) => (
                        <option key={i} value={d.date}>{d.label}</option>
                    ))}
                </select>
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
                        <span>{adultCount} × {expo.priceAdult} = {adultCount * expo.priceAdult} €</span>
                    </div>
                    <div className="dialogRow">
                        <span>Children Tickets :</span>
                        <span>{childCount} × {expo.priceChild} = {childCount * expo.priceChild} €</span>
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
