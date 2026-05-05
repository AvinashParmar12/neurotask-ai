import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronRight, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'employee' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { register } = useAppContext();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.");
            return;
        }

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800)); // Mock delay
            const user = await register(formData.name, formData.email, formData.password, formData.role);

            switch (user.role) {
                case 'admin': navigate('/admin/dashboard'); break;
                case 'manager': navigate('/manager/dashboard'); break;
                default: navigate('/employee/dashboard'); break;
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex flex-row-reverse">
            {/* Right split-screen (Branding) */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-center px-12 xl:px-24">
                <div className="max-w-lg">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-lg">
                        <span className="text-indigo-600 text-3xl font-extrabold tracking-tighter">NT</span>
                    </div>

                    <h1 className="text-white text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                        Join NeuroTask<br />

                    </h1>

                    <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-light">
                        Start experiencing the future of task management with intelligent automation, smart routing, and dynamic deadlines.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-indigo-50">
                            <CheckCircle2 className="h-6 w-6 text-indigo-300" />
                            <span className="text-lg font-medium">Smart AI Task Planning</span>
                        </div>
                        <div className="flex items-center gap-3 text-indigo-50">
                            <CheckCircle2 className="h-6 w-6 text-indigo-300" />
                            <span className="text-lg font-medium">Predictive Risk Analysis</span>
                        </div>
                        <div className="flex items-center gap-3 text-indigo-50">
                            <CheckCircle2 className="h-6 w-6 text-indigo-300" />
                            <span className="text-lg font-medium">Automated Communications</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Left split-screen (Form) */}
            <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-8 xl:p-12 overflow-y-auto bg-gray-50">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100 my-auto">

                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 mt-2 font-medium">Setup your NeuroTask Profile</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center text-sm">
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 shadow-sm rounded-2xl overflow-hidden border border-slate-200">
                            <div className="p-1 px-1.5 focus-within:bg-slate-50 transition-colors relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-slate-400" />
                                </div>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2.5 border-none focus:ring-0 focus:outline-none bg-transparent text-slate-700 font-medium"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="border-t border-slate-100 p-1 px-1.5 focus-within:bg-slate-50 transition-colors">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border-none focus:ring-0 focus:outline-none bg-transparent placeholder-slate-400 text-slate-900 font-medium"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="border-t border-slate-100 p-1 px-1.5 focus-within:bg-slate-50 transition-colors">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border-none focus:ring-0 focus:outline-none bg-transparent placeholder-slate-400 text-slate-900 font-medium"
                                    placeholder="name@neurotask.com"
                                />
                            </div>

                            <div className="border-t border-slate-100 p-1 px-1.5 relative focus-within:bg-slate-50 transition-colors">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border-none focus:ring-0 focus:outline-none bg-transparent placeholder-slate-400 pr-10 text-slate-900 font-medium"
                                    placeholder="Password"
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

                            <div className="border-t border-slate-100 p-1 px-1.5 focus-within:bg-slate-50 transition-colors">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2.5 border-none focus:ring-0 focus:outline-none bg-transparent placeholder-slate-400 text-slate-900 font-medium"
                                    placeholder="Confirm Password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                <>
                                    Register Account
                                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in directly
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
