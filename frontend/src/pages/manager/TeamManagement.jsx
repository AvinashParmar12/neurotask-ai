import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, UserPlus, Shield, X, Plus } from 'lucide-react';

const TeamManagement = () => {
    const { currentUser, teams, users, createTeam, updateTeam, deleteTeam } = useAppContext();

    // Find all teams managed by current manager
    const myTeams = teams.filter(t => t.managerId === currentUser?.id);

    // State for currently selected team to manage
    const [selectedTeamId, setSelectedTeamId] = useState(myTeams.length > 0 ? myTeams[0].id : null);

    // Active team object based on selection
    const activeTeam = myTeams.find(t => t.id === selectedTeamId) || null;

    const [isCreating, setIsCreating] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    // Get all available employees
    const allEmployees = users.filter(u => u.role === 'employee');

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        const newTeam = await createTeam(currentUser.id, teamName, selectedMembers);
        setSelectedTeamId(newTeam.id); // Auto-select the newly created team
        setIsCreating(false);
        setTeamName('');
        setSelectedMembers([]);
    };

    const handleAddMember = (employeeId) => {
        if (!activeTeam) return;
        if (!activeTeam.memberIds.includes(employeeId)) {
            updateTeam(activeTeam.id, { memberIds: [...activeTeam.memberIds, employeeId] });
        }
    };

    const handleRemoveMember = (employeeId) => {
        if (!activeTeam) return;
        updateTeam(activeTeam.id, { memberIds: activeTeam.memberIds.filter(id => id !== employeeId) });
    };

    const handleDeleteTeam = () => {
        if (!activeTeam) return;
        if (window.confirm(`Are you sure you want to delete the team "${activeTeam.name}"? This action cannot be undone.`)) {
            deleteTeam(activeTeam.id);
            // After deletion, myTeams will automatically update.
            // If there's another team, select it. Otherwise, set to null.
            const remainingTeams = teams.filter(t => t.managerId === currentUser?.id && t.id !== activeTeam.id);
            if (remainingTeams.length > 0) {
                setSelectedTeamId(remainingTeams[0].id);
            } else {
                setSelectedTeamId(null);
            }
        }
    };

    // If no team exists and not currently creating
    if (myTeams.length === 0 && !isCreating) {
        if (!currentUser) {
            return <div className="p-8 text-center text-gray-500">Loading user data...</div>;
        }
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <Users className="h-16 w-16 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You don't have a team yet</h2>
                <p className="text-gray-500 mb-8 max-w-md">Create your first team to start assigning and managing tasks for your employees and track their progress efficiently.</p>
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Team
                </button>
            </div>
        );
    }

    // Creating a Team View
    if (isCreating) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
                    <p className="mt-1 text-sm text-gray-500">Pick a name and select initial members.</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleCreateTeam}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                            <input
                                type="text"
                                required
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g. Frontend Rangers"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                            <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                {allEmployees.map(emp => (
                                    <div key={emp.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600 mr-3">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                <div className="text-xs text-gray-500">{emp.email}</div>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(emp.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedMembers([...selectedMembers, emp.id]);
                                                else setSelectedMembers(selectedMembers.filter(id => id !== emp.id));
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </div>
                                ))}
                                {allEmployees.length === 0 && (
                                    <div className="p-4 text-center text-sm text-gray-500">No employees available currently.</div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                            >
                                Save Team
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Existing Team Management Layout
    const teamMembers = activeTeam ? allEmployees.filter(emp => activeTeam.memberIds.includes(emp.id)) : [];
    const availableEmployees = activeTeam ? allEmployees.filter(emp => !activeTeam.memberIds.includes(emp.id)) : allEmployees;

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your teams and assign resources.</p>
                </div>
                {myTeams.length > 0 && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Team
                    </button>
                )}
            </div>

            {myTeams.length > 0 && (
                <div className="mb-6 border-b border-gray-200">
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                        {myTeams.map((team) => (
                            <button
                                key={team.id}
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTeamId === team.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTeam && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Current Members Column */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                                    Current Team Members ({teamMembers.length})
                                </h3>
                                <button
                                    onClick={handleDeleteTeam}
                                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                                >
                                    Delete Team
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {teamMembers.map(member => (
                                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 mr-4 border-2 border-white shadow-sm ring-1 ring-blue-50">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{member.name}</h4>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-flex mr-4 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                                title="Remove from Team"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {teamMembers.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">Your team is empty. Add members from the right.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Employees Column */}
                    <div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="text-lg font-medium text-gray-900">Add Available Employees</h3>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                                {availableEmployees.map(emp => (
                                    <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center overflow-hidden">
                                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium mr-3">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddMember(emp.id)}
                                            className="ml-2 flex-shrink-0 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                                            title="Add to Team"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {availableEmployees.length === 0 && (
                                    <div className="p-6 text-center text-sm text-gray-500">No other employees available in the system.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagement;
