import React from 'react';
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom"; // Import Link here
import './Login.css'; // Import the CSS file

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(""); // Clear previous errors

        try {
            // Step 1: Check if user exists in `users` table
            console.log("Attempting to look up user:", email);
            const { data: userData, error: userLookupError } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            console.log("User Lookup Result - Data:", userData);
            console.log("User Lookup Result - Error:", userLookupError);

            if (userLookupError || !userData) {
                // User not found in 'users' table, redirect to signup
                alert("User not found. Redirecting to signup...");
                navigate("/signup");
                return;
            }

            // Step 2: Try logging in using Supabase Auth
            console.log("User found in custom table, attempting Supabase Auth login...");
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                throw authError; // This will be caught by the outer catch block
            }

            console.log("Login successful, navigating to /home");
            navigate("/home");
        } catch (err) {
            console.error("Login process error:", err);
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h1 className="login-title">Login</h1>
                
                {error && <div className="error-message">{error}</div>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                    className="login-input"
                    required
                />
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"} // Toggle type based on state
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                        }}
                        className="login-input"
                        required
                    />
                    <button
                        type="button" // Important: type="button" to prevent form submission
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-button"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                <button 
                    type="submit"
                    disabled={loading}
                    className="login-button"
                >
                    {loading ? 'Loading...' : 'Login'}
                </button>

                <div className="login-link-container">
                    Don't have an account?{' '}
                    <Link to="/signup" className="login-link">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;