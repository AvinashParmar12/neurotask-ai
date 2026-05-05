import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronRight, AlertCircle, Building2, ArrowLeft, CheckCircle, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'employee' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAppContext();

    // Forgot password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [fpEmail, setFpEmail] = useState('');
    const [fpLoading, setFpLoading] = useState(false);
    const [fpSuccess, setFpSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            const user = await login(formData.email, formData.password);
            toast.success('Successfully logged in!');
            switch (user.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'manager': navigate('/manager/dashboard'); break;
                default: navigate('/employee/dashboard'); break;
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Invalid email, password, or role';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFpSubmitEmail = async () => {
        if (!fpEmail.trim()) { toast.error('Please enter your email.'); return; }
        setFpLoading(true);
        try {
            await api.post('/auth/forgotpassword', { email: fpEmail });
            toast.success('Recovery email sent!');
            setFpSuccess(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send recovery email');
        } finally {
            setFpLoading(false);
        }
    };

    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setFpEmail('');
        setFpSuccess(false);
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            {/* Left split-screen (Branding) */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center px-12 xl:px-24">
                <div className="max-w-lg">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-lg">
                        <span className="text-blue-600 text-3xl font-extrabold tracking-tighter">NT</span>
                    </div>

                    <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                        NeuroTask<br />
                    </h1>

                    <p className="text-blue-100 text-lg mb-10 leading-relaxed font-light">
                        Streamline your workflow, coordinate with teams, and
                        monitor real-time task progress in one powerful intelligent workspace.
                    </p>
                </div>
            </div>

            {/* Right split-screen (Form) */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-8 xl:p-12 overflow-y-auto bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 my-auto">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
                        <p className="text-slate-500 mt-2 font-medium">Access your NeuroTask Dashboard</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                                    Login As
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50/50 text-slate-700 font-medium"
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50/50"
                                    placeholder="name@neurotask.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50/50 pr-10"
                                        placeholder="••••••••"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotPassword(true)}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                <>
                                    Secure Login
                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm text-slate-500">
                        <div className="mt-2">
                            Need an account?{' '}
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                Sign up
                            </Link>
                        </div>
                    </div>

                    {/* Demo helper */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                            <button
                                type="button"
                                onClick={() => setFormData({ email: 'admin@neurotask.com', password: 'password', role: 'admin' })}
                                className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors text-center font-medium"
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ email: 'manager@neurotask.com', password: 'password', role: 'manager' })}
                                className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors text-center font-medium"
                            >
                                Manager
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ email: 'employee@neurotask.com', password: 'password', role: 'employee' })}
                                className="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors text-center font-medium"
                            >
                                Employee
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                        <button
                            onClick={closeForgotPassword}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg"
                        >
                            ✕
                        </button>

                        {!fpSuccess ? (
                            <div>
                                <div className="flex items-center justify-center mb-5">
                                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Mail className="h-7 w-7 text-blue-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-1">Forgot Password?</h3>
                                <p className="text-sm text-gray-500 text-center mb-6">Enter your registered email to receive a reset link.</p>
                                <input
                                    type="email"
                                    value={fpEmail}
                                    onChange={(e) => setFpEmail(e.target.value)}
                                    placeholder="name@neurotask.com"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 mb-4"
                                />
                                <button
                                    onClick={handleFpSubmitEmail}
                                    disabled={fpLoading}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center"
                                >
                                    {fpLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue'}
                                </button>
                                <button onClick={closeForgotPassword} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center font-medium">
                                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-5">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                                <p className="text-sm text-gray-500 mb-6">If an account exists for <strong>{fpEmail}</strong>, we have sent a secure password reset link.</p>
                                <button
                                    onClick={closeForgotPassword}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
