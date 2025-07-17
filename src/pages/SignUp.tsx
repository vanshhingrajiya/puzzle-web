import React from 'react';
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import './Login.css'; // Import the CSS file

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState(""); // For success messages
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        setError(""); // Clear previous errors
        setMessage(""); // Clear previous messages

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                throw authError;
            }

            // Check if a user object was returned from auth.signUp
            if (data.user) {
                // Removed: Client-side insert into public.users
                // This is now handled by a database trigger (handle_new_user function)

                // Handle redirection based on Supabase's email confirmation settings
                if (data.session) {
                    // User is immediately logged in (e.g., email confirmation is off)
                    setMessage("Signup successful! Redirecting to home...");
                    navigate("/home");
                } else {
                    // User created, but email confirmation is required
                    setMessage("Please check your email to confirm your account.");
                    // Optionally, redirect to a confirmation message page
                    // navigate("/confirm-email");
                }
            } else {
                // This case might happen if email confirmation is on and no session is created
                // but the user object is still null (less common with recent Supabase versions)
                setMessage("Signup process initiated. Please check your email for further instructions.");
            }

        } catch (err) {
            console.error("Signup process error:", err);
            setError(err.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSignup} className="login-form">
                <h1 className="login-title">Sign Up</h1>
                
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                        setMessage("");
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
                    {loading ? 'Loading...' : 'Sign Up'}
                </button>

                <div className="login-link-container">
                    Already have an account?{' '}
                    <Link to="/" className="login-link">
                        Login
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Signup;