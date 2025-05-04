import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, TextField, Button } from '@mui/material';
import { motion } from 'framer-motion';
import image from '../../assets/StartX.png';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/admin/login', { username, password });
            console.log(response);
            if (response.data.message === "Login successful") {
                Cookies.set('admin', "admin");
                navigate("/admin");
            } else {
                alert('Login failed: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed: ' + error.response?.data?.message || 'Unknown error occurred');
        }
    };

    useEffect(() => {
        const admin = Cookies.get("admin");
        if(admin) {
            navigate("/admin");
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Left side - Login Form */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-full md:w-1/2 p-8 md:p-12"
                    >
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            gutterBottom 
                            align="center"
                            className="text-white font-bold text-3xl mb-8"
                        >
                            Admin Login
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} className="space-y-6">
                            <TextField
                                label="Username"
                                fullWidth
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-white/10 backdrop-blur-sm rounded-lg"
                                InputProps={{
                                    className: "text-white",
                                }}
                                InputLabelProps={{
                                    className: "text-white/80",
                                }}
                            />
                            <TextField
                                label="Password"
                                fullWidth
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white/10 backdrop-blur-sm rounded-lg"
                                InputProps={{
                                    className: "text-white",
                                }}
                                InputLabelProps={{
                                    className: "text-white/80",
                                }}
                            />
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    fullWidth 
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Login
                                </Button>
                            </motion.div>
                        </Box>
                    </motion.div>

                    {/* Right side - Image */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                            <img 
                                src={image}
                                alt="Auth Visual" 
                                className="w-full h-auto rounded-2xl shadow-2xl relative z-10"
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
