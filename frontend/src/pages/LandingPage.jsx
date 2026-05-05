import React from 'react';
import { Link } from 'react-router-dom';
import {
    BrainCircuit,
    Bot,
    Zap,
    ShieldCheck,
    BarChart3,
    Users,
    ArrowRight
} from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation Bar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex flex-shrink-0 items-center gap-3">
                            <div className="h-10 w-10 bg-[#0a1128] rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-[#00c2ff] font-bold text-xl italic">NT</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-slate-900 text-xl font-extrabold tracking-tight leading-none mb-1">NeuroTask</span>

                            </div>
                        </div>

                        {/* Right CTA */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main>
                <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                        <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-b border-gray-200 pb-20">


                        <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                            Task Management, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Reimagined.
                            </span>
                        </h1>

                        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed font-light">
                            NeuroTask is an enterprise workflow platform that utilizes Agentic AI to automate planning, monitor risks, and intelligently manage your team's workload.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg transition-all group"
                            >
                                Create Account
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-slate-200 text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Enterprise Capabilities</h2>
                            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Intelligent System Roles</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Admin */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="h-7 w-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Executive Admin</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    Full system oversight. Monitor cross-department performance, manage platform users, and configure the underlying AI operational models.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div> System-wide Analytics
                                    </li>
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></div> Agent Configuration
                                    </li>
                                </ul>
                            </div>

                            {/* Manager */}
                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                    <Users className="h-7 w-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Project Manager</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    Orchestrate teams effortlessly. Assign tasks with AI-generated sub-steps, receive predictive alerts on delayed projects, and balance workloads.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div> Risk Intelligence Alerts
                                    </li>
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div> Automated Task Planning
                                    </li>
                                </ul>
                            </div>

                            {/* Employee */}
                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="h-14 w-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                                    <Zap className="h-7 w-7 text-cyan-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Employee</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    Focus on execution. Manage assigned tasks through a dynamic Kanban board, receive AI-generated tips, and track daily productivity.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2"></div> AI Daily Briefings
                                    </li>
                                    <li className="flex items-center text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2"></div> Automated Reminders
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Layer Section */}
                <div className="py-20 bg-slate-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                                    Powered by a Autonomous AI Layer
                                </h2>
                                <p className="text-lg text-slate-300 mb-8 leading-relaxed font-light">
                                    NeuroTask doesn't just store tasks; it actively manages them. Our AI layer operates in the background to streamline management workflows.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                        <BrainCircuit className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                                        <div className="ml-4">
                                            <h4 className="text-white font-bold mb-1">Task Sub-Step Generation</h4>
                                            <p className="text-slate-400 text-sm">Automatically break down complex assignments into actionable bullet points.</p>
                                        </div>
                                    </div>
                                    <div className="flex bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                        <BarChart3 className="h-6 w-6 text-indigo-400 mt-1 flex-shrink-0" />
                                        <div className="ml-4">
                                            <h4 className="text-white font-bold mb-1">Predictive Risk Assessment</h4>
                                            <p className="text-slate-400 text-sm">Flags tasks structurally likely to miss deadlines based on historical completion rates.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Dashboard preview */}
                            <div className="relative rounded-2xl bg-slate-800 p-2 shadow-2xl border border-slate-700">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 rounded-2xl pointer-events-none"></div>
                                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                                    {/* Mock Header */}
                                    <div className="h-10 bg-slate-800 flex items-center px-4 border-b border-slate-700 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    {/* Mock Content */}
                                    <div className="p-6">
                                        <div className="h-4 w-1/3 bg-slate-700 rounded mb-8"></div>
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700 p-4">
                                                <div className="h-3 w-1/2 bg-slate-600 rounded mb-4"></div>
                                                <div className="h-8 w-1/3 bg-blue-500 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700 p-4">
                                                <div className="h-3 w-1/2 bg-slate-600 rounded mb-4"></div>
                                                <div className="h-8 w-1/3 bg-indigo-500 rounded"></div>
                                            </div>
                                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700 p-4">
                                                <div className="h-3 w-1/2 bg-slate-600 rounded mb-4"></div>
                                                <div className="h-8 w-1/3 bg-cyan-500 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="h-32 bg-slate-800 rounded-lg border border-slate-700"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-[#0a1128] rounded-lg flex items-center justify-center">
                            <span className="text-[#00c2ff] font-bold text-sm italic">NT</span>
                        </div>
                        <span className="text-slate-900 font-bold tracking-tight">NeuroTask</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        &copy; 2026 NeuroTask Systems. MERN Stack implementation with Agentic AI.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
