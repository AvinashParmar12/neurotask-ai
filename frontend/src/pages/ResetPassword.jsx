import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            toast.success('Password successfully reset!');
            setIsSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-3xl font-extrabold tracking-tighter">NT</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create a strong, secure new password for your NeuroTask account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {isSuccess ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-5">
                                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <ShieldCheck className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Password Updated</h3>
                            <p className="text-sm text-gray-500 mb-6">Your password has been successfully reset. You can now securely log in to your dashboard.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                            >
                                Continue to Login
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Min. 8 chars, 1 uppercase, 1 special char"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    )}
                    
                    <div className="mt-6 flex justify-center">
                        <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
