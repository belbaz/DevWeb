"use client";

// pages/signup.js
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Rolling from '../../components/rolling';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

const edit = "/images/edit.png";

const Signup = () => {
  const router = useRouter();
  const [pseudoError, setPseudoError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinish, setIsfinish] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatar, setAvatar] = useState("/images/avatar.svg");

  const fileInput = useRef(null);

  const checkPseudo = async () => {
    const pseudo = document.getElementById("Pseudo").value;
    const response = await fetch("/api/user/checkPseudo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo }),
    });
    if (response.status === 409) {
      setPseudoError("This username has already been used.");
    } else {
      setPseudoError("");
    }
  };

  const checkEmail = async () => {
    const email = document.getElementById("Email").value;
    const response = await fetch("/api/user/checkEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.status === 409) {
      setEmailError("This email is already used.");
    } else {
      setEmailError("");
    }
  };

  const loadAvatar = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setAvatar(fileUrl);
    }
  };

  const uploadImage = async (fileToUpload, pseudo) => {
    if (!fileToUpload) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];
      await fetch("/api/auth/uploadAvatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo, imageBase64: base64 }),
      });
    };
    reader.readAsDataURL(fileToUpload);
  };

  const submitSignup = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const name = event.target.Name.value;
    const lastName = event.target.LastName.value;
    const pseudo = event.target.Pseudo.value;
    const email = event.target.Email.value;
    const password = event.target.Password.value;
    await uploadImage(selectedFile, pseudo);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lastName, pseudo, email, password }),
    });
    if (response.status === 200) {
      toast.success("Account created! Please check your email to activate your account.");
      setIsfinish(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 4000);
    } else {
      setIsLoading(false);
      const data = await response.json();
      toast.error(data.error || "Signup error");
    }
  };

  return (
    <Box sx={{
      background: 'none',
      height: '100vh',
      margin: 0,
    }}>
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 430,
          bgcolor: 'black',
          borderRadius: 0,
          boxShadow: 6,
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h3" align="center" sx={{ mb: 2, fontFamily: 'Cinzel, serif', fontWeight: 400, letterSpacing: 3, color: 'white', fontSize: { xs: '2.2rem', sm: '2.5rem', md: '2.8rem' } }}>
          Create an Account
        </Typography>
        <form onSubmit={submitSignup} autoComplete="on">
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <Avatar src={avatar} sx={{ width: 85, height: 85, mb: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Button
                variant="outlined"
                component="label"
                sx={{
                  fontSize: 13,
                  borderRadius: 0,
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
                  mb: 1,
                }}
              >
                Upload Avatar
                <input type="file" accept="image/*" hidden ref={fileInput} onChange={loadAvatar} />
              </Button>
            </Box>
            <TextField
              label="First Name"
              name="Name"
              id="Name"
              placeholder="Your first name"
              variant="outlined"
              fullWidth
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              required
            />
            <TextField
              label="Last Name"
              name="LastName"
              id="LastName"
              placeholder="Your last name"
              variant="outlined"
              fullWidth
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              required
            />
            <TextField
              label="Username"
              name="Pseudo"
              id="Pseudo"
              placeholder="Choose a username"
              variant="outlined"
              fullWidth
              onBlur={checkPseudo}
              error={!!pseudoError}
              helperText={pseudoError}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              required
            />
            <TextField
              label="Email"
              name="Email"
              id="Email"
              placeholder="Your email address"
              variant="outlined"
              fullWidth
              onBlur={checkEmail}
              error={!!emailError}
              helperText={emailError}
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              required
            />
            <TextField
              label="Password"
              name="Password"
              id="Password"
              placeholder="Choose a password"
              type="password"
              variant="outlined"
              fullWidth
              InputLabelProps={{ style: { color: 'rgba(255,255,255,0.8)' } }}
              InputProps={{
                style: {
                  color: 'white',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 0,
                },
              }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 300,
                fontSize: 18,
                letterSpacing: 2,
                borderRadius: 0,
                py: 1.5,
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'white',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.22)',
                  color: 'white',
                },
              }}
              disabled={isLoading}
            >
              {isLoading ? Rolling(40, 40, "#fff") : "Sign Up"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;
