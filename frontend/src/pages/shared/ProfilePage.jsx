import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Mail, Shield, Calendar, Edit3, Save, X, CheckCircle, Camera, Briefcase, Lock, Eye, EyeOff } from 'lucide-react';

const ProfilePage = () => {
    const { currentUser, users, teams, tasks, updateUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: currentUser?.name || '', email: currentUser?.email || '' });
    const [saved, setSaved] = useState(false);

    // Change password states
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    if (!currentUser) return null;

    const userTasks = tasks.filter(t => t.assigneeId === currentUser.id || t.managerId === currentUser.id);
    const completedTasks = userTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = userTasks.filter(t => t.status === 'pending').length;

    const userTeams = teams.filter(t =>
        t.managerId === currentUser.id || (t.memberIds && t.memberIds.includes(currentUser.id))
    );

    const handleSave = () => {
        if (!editData.name.trim() || !editData.email.trim()) return;
        updateUser(currentUser.id, { name: editData.name.trim(), email: editData.email.trim() });
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData({ name: currentUser.name, email: currentUser.email });
    };

    const handleChangePassword = () => {
        setPwError('');
        if (!passwordData.current) { setPwError('Enter your current password.'); return; }
        if (passwordData.newPass.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
        if (passwordData.newPass !== passwordData.confirm) { setPwError('New passwords do not match.'); return; }
        // Mock: accept any current password (no real auth yet)
        updateUser(currentUser.id, { password: passwordData.newPass });
        setPwSuccess(true);
        setPasswordData({ current: '', newPass: '', confirm: '' });
        setTimeout(() => { setPwSuccess(false); setShowChangePassword(false); }, 2000);
    };

    const roleConfig = {
        admin: { color: 'purple', label: 'Administrator', icon: Shield },
        manager: { color: 'blue', label: 'Manager', icon: Briefcase },
        employee: { color: 'green', label: 'Employee', icon: User },
    };

    const role = roleConfig[currentUser.role] || roleConfig.employee;
    const RoleIcon = role.icon;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Success notification */}
            {saved && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center text-green-700 text-sm">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Profile updated successfully!
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`h-32 bg-gradient-to-r ${currentUser.role === 'admin' ? 'from-purple-500 to-indigo-600' :
                    currentUser.role === 'manager' ? 'from-blue-500 to-cyan-600' :
                        'from-green-500 to-teal-600'
                    }`}></div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-4">
                        <div className={`h-28 w-28 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold bg-gradient-to-br ${currentUser.role === 'admin' ? 'from-purple-500 to-purple-700' :
                            currentUser.role === 'manager' ? 'from-blue-500 to-blue-700' :
                                'from-green-500 to-green-700'
                            }`}>
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>

                    </div>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                            <div className="flex items-center mt-1 space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${role.color}-100 text-${role.color}-700`}>
                                    <RoleIcon className="h-3.5 w-3.5 mr-1.5" />
                                    {role.label}
                                </span>
                                <span className="text-sm text-gray-500">{currentUser.email}</span>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                <Edit3 className="h-4 w-4 mr-2" />Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Save className="h-4 w-4 mr-2" />Save Changes
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <X className="h-4 w-4 mr-1" />Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                    <p className="text-3xl font-bold text-gray-900">{userTasks.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Total Tasks</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                    <p className="text-sm text-gray-500 mt-1">Completed</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                    <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
                    <p className="text-sm text-gray-500 mt-1">In Progress</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                    <p className="text-3xl font-bold text-amber-600">{pendingTasks}</p>
                    <p className="text-sm text-gray-500 mt-1">Pending</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-400" />
                        Personal Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-900">{currentUser.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                            <p className="text-sm font-medium text-gray-900 capitalize">{currentUser.role}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                            <p className="text-sm font-mono text-gray-500">{currentUser.id}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Lock className="h-5 w-5 mr-2 text-gray-400" />
                                Password & Security
                            </h2>
                            {!showChangePassword && (
                                <button
                                    onClick={() => setShowChangePassword(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {!showChangePassword ? (
                            <p className="text-sm text-gray-500">Password last changed: <span className="font-medium text-gray-700">Recently</span></p>
                        ) : (
                            <div className="space-y-3">
                                {pwError && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>
                                )}
                                {pwSuccess && (
                                    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2" />Password changed successfully!
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwordData.current}
                                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                            placeholder="Enter current password"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                        <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={passwordData.newPass}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                                            placeholder="Min 6 characters"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        placeholder="Re-enter new password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        onClick={handleChangePassword}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                    <button
                                        onClick={() => { setShowChangePassword(false); setPwError(''); setPasswordData({ current: '', newPass: '', confirm: '' }); }}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Teams */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                            {currentUser.role === 'manager' ? 'Teams You Manage' : 'Your Teams'}
                        </h2>
                        {userTeams.length === 0 ? (
                            <p className="text-sm text-gray-500">No teams assigned yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {userTeams.map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{team.name}</p>
                                            <p className="text-xs text-gray-500">{team.memberIds.length} member(s)</p>
                                        </div>
                                        {team.managerId === currentUser.id && (
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Owner</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                            Activity Summary
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Productivity Rate</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-green-500 rounded-full h-2 transition-all"
                                    style={{ width: `${userTasks.length > 0 ? (completedTasks / userTasks.length) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm text-gray-600">Teams Involved</span>
                                <span className="text-sm font-semibold text-gray-900">{userTeams.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">High Priority Tasks</span>
                                <span className="text-sm font-semibold text-red-600">
                                    {userTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
