// pages/signup.js
import React, {useRef, useState} from 'react';
import {router} from "next/client";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Footer from "../components/footer";
import Header from "../components/header";
import Rolling from "../components/rolling";

const edit = "/images/edit.png"

const Signup = () => {
    const [modalIsOpenStatus, setModalIsOpenStatus] = useState(false);
    const [pseudoError, setPseudoError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFinish, setIsfinish] = useState(false);

    const checkPseudo = async () => {
        document.getElementById("validInscription").disabled = true;
        const pseudo = document.getElementById("Pseudo").value;

        const response = await fetch("/api/checkPseudo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({pseudo}),
        });

        if (response.status === 409) {
            setPseudoError("Ce pseudo existe déjà");
        } else {
            document.getElementById("validInscription").disabled = false;
            setPseudoError("");
        }
    };

    const checkEmail = async () => {
        document.getElementById("validInscription").disabled = true;
        const email = document.getElementById("Email").value;

        const response = await fetch("/api/checkEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email}),
        });

        if (response.status === 409) {
            setEmailError("Cette email existe déjà");
        } else {
            if (document.getElementById("validInscription")) {
                document.getElementById("validInscription").disabled = false;
                setEmailError("");
            }
        }
    };

    const submitSignup = async (event) => {
        setIsLoading(true);
        event.preventDefault();
        await uploadImage(selectedFile);
        const name = document.getElementById("Name").value;
        const lastName = document.getElementById("LastName").value;
        const pseudo = document.getElementById("Pseudo").value;
        const email = document.getElementById("Email").value;
        const password = document.getElementById("Password").value;

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({name, lastName, pseudo, email, password}),
        });

        if (response.status === 200) {
            if (response.status === 200) {
                // console.log("Compte créer avec succès");
                toast.success("Compte créé avec succès ! Un e-mail d'activation vous a été envoyé.");
                setIsfinish(true)
                // Introduire un délai de 2 secondes avant de tenter de se connecter
                setTimeout(async () => {
                    await router.push("/dashboard");
                }, 6000);
            }

        } else if (response.status === 401) {
            setIsLoading(false);
            document.getElementById("error").innerText = "erreur";
        } else if (response.status === 409) {
            setIsLoading(false);
            const data = await response.json();
            document.getElementById("error").innerText = data.error;
        }
    };

    const handleClick = (route) => {
        router.push(route);
    };

    const fileInput = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatar, setAvatar] = useState('/images/avatar.svg');
    const [valid] = useState('/images/valid.svg');

    const loadAvatar = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedFile(file);
            const fileUrl = URL.createObjectURL(file);
            setAvatar(fileUrl);
        }
    };

    const uploadImage = async (fileToUpload) => {
        const pseudo = document.getElementById("Pseudo").value;

        if (!fileToUpload) {
            console.log("Aucun avatar sélectionné, chargement de l'avatar par défaut");

            const res = await fetch('/api/uploadAvatar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pseudo,
                    fallbackImageUrl: `${window.location.origin}/images/avatar.svg`,
                })
            });

            const data = await res.json();
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result.split(',')[1];

            const res = await fetch('/api/uploadAvatar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pseudo,
                    imageBase64: base64,
                })
            });

            const data = await res.json();
        };

        reader.readAsDataURL(fileToUpload);
    };

    return (
        <div>
            <Header/>
            <div className="body" style={{height: "calc(100vh - 150px)", padding: "100px 50px"}}>
                <div className="box">
                    <p className="title">Signup</p>
                    <form action="/api/login" method="post" onSubmit={submitSignup}>
                        <div className="avatarContainer" onClick={() => fileInput.current.click()}>
                            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            </div>
                            <p style={{margin: 0, paddingTop: "2px"}}>Avatar</p>
                            <div style={{position: 'relative', width: '85px', height: '85px'}}>
                                <img src={avatar} alt="" className="avatar"
                                     style={{objectFit: selectedFile ? "scale-down" : "cover",}}/>
                                <img src={edit} alt="" className="edit"
                                     style={{visibility: selectedFile ? "hidden" : "visible"}}/>
                            </div>
                            <p style={{margin: 0, paddingTop: "2px", paddingBottom: "2px", fontSize: "16px"}}>Choose
                                avatar</p>
                            <input ref={fileInput} type="file" style={{display: 'none'}} accept=".png, .jpeg"
                                   onChange={loadAvatar}/>
                        </div>
                        <div className="form-group">
                            <div className="formlabel">
                                <label className="labelsSignup" form="name">Name</label>
                                <label className="labelsSignup" form="lastName">LastName</label>
                                <label className="labelsSignup" form="pseudo">Pseudo</label>
                                <label style={{paddingTop: emailError ? "35px" : "0.8rem"}} className="labelsSignup"
                                       form="email">Email</label>
                                <label style={{paddingTop: pseudoError ? "35px" : "0.8rem"}} className="labelsSignup"
                                       form="password">Password</label>
                            </div>
                            <div className="formlabel">
                                <input className="inputsSignup" type='text' id="Name" maxLength="19" required/>
                                <input className="inputsSignup" type='text' id="LastName" maxLength="19" required/>
                                <input className="inputsSignup" type='text' id="Pseudo" maxLength="19" required
                                       onChange={checkPseudo}/>
                                <div>
                                    <p style={{color: "red", fontSize: "15px", margin: "0"}}>{pseudoError}</p>
                                </div>
                                <input className="inputsSignup" type='email' id="Email" maxLength="40" required
                                       onChange={checkEmail}/>
                                <div>
                                    <p style={{color: "red", fontSize: "15px", margin: "0"}}>{emailError}</p>
                                </div>
                                <input className="inputsSignup" type="password" id="Password" maxLength="19" required
                                       autoComplete="current-password"/>
                            </div>
                        </div>
                        <br/>
                        <button className="button" id="validInscription" type='submit' disabled={isLoading}>
                            {isFinish ?
                                (
                                    <div>
                                        <img src={valid} alt=""/>
                                    </div>
                                ) : isLoading ?
                                    (
                                        <div>
                                            {Rolling(50, 50, "#000000")}
                                        </div>
                                    ) : (
                                        <p style={{padding: 0, margin: "0.3rem"}}>Signup</p>
                                    )
                            }
                        </button>
                        <p id="error" className="error"></p>
                    </form>
                </div>
                <div style={{paddingTop: "15px"}}>
                    <button className="button" onClick={() => handleClick('/')}>Back</button>
                </div>
                <div>
                    <ToastContainer/>
                </div>
            </div>
            <Footer/>
        </div>);
};

export default Signup;
