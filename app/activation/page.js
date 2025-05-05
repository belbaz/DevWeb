"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';

export default function Activation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isActivating, setIsActivating] = useState(false);
    const [activationStatus, setActivationStatus] = useState(null);

    const handleActivation = async () => {
        setIsActivating(true);
        const token = searchParams.get('token');
        
        if (!token) {
            toast.error("Activation token is missing");
            setActivationStatus('error');
            setIsActivating(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/activeAccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });
            
            const data = await response.json();
            
            if (response.status === 200) {
                setActivationStatus('success');
                toast.success("Account activated successfully");
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setActivationStatus('error');
                toast.error(`Error during activation: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            setActivationStatus('error');
            toast.error("An error occurred during activation");
            console.error(error);
        } finally {
            setIsActivating(false);
        }
    };

    // Auto-activate when token is present
    useEffect(() => {
        const token = searchParams.get('token');
        if (token && !isActivating && !activationStatus) {
            handleActivation();
        }
    }, [searchParams]);

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'transparent'
        }}>
            {/* Simple Header */}
            <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 10
            }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Typography sx={{ 
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: { xs: '1.8rem', sm: '2.5rem' },
                        letterSpacing: '4px',
                        color: 'white',
                        padding: '0 1.5rem',
                        fontWeight: 300
                    }}>
                        MUSEHOME
                    </Typography>
                </Link>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '0 1rem',
                marginTop: '80px', // Space for header
                marginBottom: '60px' // Space for footer
            }}>
                <Box sx={{ 
                    width: '100%',
                    maxWidth: '600px',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
                    padding: { xs: '2rem', sm: '3rem' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <Typography sx={{ 
                        fontFamily: 'var(--font-cinzel)',
                        fontSize: { xs: '1.8rem', sm: '2.2rem' },
                        color: 'white',
                        marginBottom: '2rem',
                        fontWeight: 300,
                        letterSpacing: '2px'
                    }}>
                        Account Activation
                    </Typography>

                    {isActivating ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <CircularProgress sx={{ color: 'white' }} />
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Activating your account...
                            </Typography>
                        </Box>
                    ) : activationStatus === 'success' ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '1.1rem',
                                maxWidth: '450px',
                                mb: 2
                            }}>
                                Your account has been successfully activated!
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem'
                            }}>
                                You will be redirected to the login page in a few seconds...
                            </Typography>
                            <Button 
                                variant="outlined" 
                                onClick={() => router.push('/login')}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 0,
                                    padding: '0.8rem 2rem',
                                    fontSize: '0.9rem',
                                    textTransform: 'none',
                                    letterSpacing: '1.5px',
                                    mt: 2,
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Go to Login
                            </Button>
                        </Box>
                    ) : activationStatus === 'error' ? (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Typography sx={{ 
                                color: 'rgba(255, 0, 0, 0.7)',
                                fontSize: '1.1rem',
                                mb: 2
                            }}>
                                There was an error activating your account.
                            </Typography>
                            <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem',
                                maxWidth: '450px'
                            }}>
                                The activation link may have expired or is invalid. Please try creating a new account or contact support for assistance.
                            </Typography>
                            <Button 
                                variant="outlined" 
                                onClick={() => router.push('/signup')}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 0,
                                    padding: '0.8rem 2rem',
                                    fontSize: '0.9rem',
                                    textTransform: 'none',
                                    letterSpacing: '1.5px',
                                    mt: 2,
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                Create Account
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 3
                        }}>
                            <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '1.1rem',
                                maxWidth: '450px',
                                mb: 2
                            }}>
                                Click the button below to activate your account and start your journey with MUSEHOME.
                            </Typography>
                            <Button 
                                variant="contained" 
                                onClick={handleActivation}
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    borderRadius: 0,
                                    padding: '1rem 2.5rem',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    fontFamily: 'var(--font-roboto)',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        boxShadow: 'none'
                                    }
                                }}
                            >
                                Activate Account
                            </Button>
                            <Typography sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.8rem',
                                mt: 2
                            }}>
                                Please note: Activation links are valid for 1 hour.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Simple Footer */}
            <Box sx={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 10
            }}>
                <Typography sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    letterSpacing: '1px'
                }}>
                    © {new Date().getFullYear()} MUSEHOME. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
}
