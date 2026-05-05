import React, { useState, useMemo } from 'react';
import { BarChart as BarIcon, PieChart as PieIcon, Activity, Download, Check, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAppContext } from '../../context/AppContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const Reports = () => {
    const { tasks = [], users = [] } = useAppContext();
    const [downloading, setDownloading] = useState(null);

    // Compute Chart Data: Status Overview
    const statusData = useMemo(() => {
        let pending = 0, inProgress = 0, completed = 0;
        tasks.forEach(t => {
            if (t.status === 'pending') pending++;
            else if (t.status === 'in-progress') inProgress++;
            else if (t.status === 'completed') completed++;
        });

        return [
            { name: 'Pending', value: pending, color: '#f59e0b' },
            { name: 'In Progress', value: inProgress, color: '#3b82f6' },
            { name: 'Completed', value: completed, color: '#10b981' }
        ].filter(d => d.value > 0); // Only show non-zero wedges
    }, [tasks]);

    // Compute Chart Data: Workload Tracking (Pending vs Completed per employee)
    const workloadData = useMemo(() => {
        const teamMap = {};
        
        // Grab all employees
        users.forEach(u => {
            if (u.role === 'employee') {
                teamMap[u._id] = { name: u.name, 'Pending Tasks': 0, 'Completed Tasks': 0, status: 'Light' };
            }
        });

        tasks.forEach(t => {
            let employeeId = null;
            if (t.assigneeId) {
                employeeId = typeof t.assigneeId === 'object' ? t.assigneeId._id : t.assigneeId;
            }
            if (employeeId && teamMap[employeeId]) {
                if (t.status !== 'completed') {
                    teamMap[employeeId]['Pending Tasks'] += 1;
                } else {
                    teamMap[employeeId]['Completed Tasks'] += 1;
                }
            }
        });

        const list = Object.values(teamMap).map(emp => {
            let status = 'Light';
            if (emp['Pending Tasks'] > 4) status = 'Overloaded';
            else if (emp['Pending Tasks'] >= 2) status = 'Optimal';
            return { ...emp, status };
        });

        return list.sort((a, b) => b['Pending Tasks'] - a['Pending Tasks']); // Most overloaded first
    }, [tasks, users]);

    const handleDownload = (reportName) => {
        setDownloading(reportName);

        setTimeout(() => {
            const doc = new jsPDF();

            // Header Elements
            doc.setFontSize(18);
            doc.setTextColor(41, 128, 185);
            doc.text('NeuroTask System Report', 20, 20);

            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text(`Title: ${reportName}`, 20, 35);

            doc.setFontSize(11);
            doc.setTextColor(127, 140, 141);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 45);

            // Divider
            doc.setDrawColor(189, 195, 199);
            doc.setLineWidth(0.5);
            doc.line(20, 50, 190, 50);

            // Live Analytics Parsing
            const totalActiveTasks = tasks.filter(t => t.status !== 'completed').length;
            const totalCompletedTasks = tasks.filter(t => t.status === 'completed').length;
            const completionRate = tasks.length > 0 ? Math.round((totalCompletedTasks / tasks.length) * 100) : 0;

            doc.setFontSize(16);
            doc.setTextColor(52, 73, 94);
            doc.text('Performance Metrics Snapshot', 20, 65);

            doc.setFontSize(12);
            let yCursor = 80;
            doc.text(`• Total Active Workload Items: ${totalActiveTasks}`, 25, yCursor); yCursor += 10;
            doc.text(`• Total Completed Items: ${totalCompletedTasks}`, 25, yCursor); yCursor += 10;
            doc.text(`• Global Completion Rate: ${completionRate}%`, 25, yCursor); yCursor += 20;

            // Generate Live Team Roster stats if they exist
            if (workloadData.length > 0) {
                doc.setFontSize(14);
                doc.text('Active Team Benchmarks:', 20, yCursor); yCursor += 10;
                
                doc.setFontSize(11);
                workloadData.forEach(emp => {
                    const line = `  - ${emp.name}: ${emp['Pending Tasks']} tasks assigned | Load: [${emp.status.toUpperCase()}]`;
                    doc.text(line, 20, yCursor);
                    yCursor += 10;
                });
            }

            doc.save(`${reportName.replace(/ /g, '_').toLowerCase()}.pdf`);
            setDownloading(null);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-10">
            <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">Track and export dynamic team productivity metrics.</p>
                </div>
                <button
                    onClick={() => handleDownload('Master Analytics Report')}
                    disabled={downloading === 'Master Analytics Report'}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all"
                >
                    {downloading === 'Master Analytics Report' ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generating...
                        </span>
                    ) : (
                        <>
                            <Download className="-ml-1 mr-2 h-5 w-5" />
                            Export Live Blueprint
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                
                {/* Dynamic Status Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center mb-6">
                        <PieIcon className="h-6 w-6 text-purple-600 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Task Status Distribution</h3>
                    </div>
                    {statusData.length > 0 ? (
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip wrapperStyle={{ borderRadius: '10px' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Activity className="h-12 w-12 mb-3 opacity-20" />
                            <p>No active tasks populated.</p>
                        </div>
                    )}
                </div>

                {/* Dynamic Employee Workload Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center mb-6">
                        <Activity className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Team Workload Radar</h3>
                    </div>
                    {workloadData.length > 0 ? (
                        <div className="flex-1 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={workloadData}
                                    margin={{ top: 20, right: 0, left: -25, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} allowDecimals={false} />
                                    <Tooltip 
                                        cursor={{fill: '#F3F4F6'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Pending Tasks" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="Completed Tasks" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <BarIcon className="h-12 w-12 mb-3 opacity-20" />
                            <p>Team data insufficient for visualization.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Detailed Live Roster</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tasks</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Completed</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Calculated State</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workloadData.length > 0 ? (
                                workloadData.map((emp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{emp.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp['Pending Tasks']}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{emp['Completed Tasks']}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.status === 'Overloaded' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1"/>Overloaded</span>}
                                            {emp.status === 'Optimal' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1"/>Optimal Focus</span>}
                                            {emp.status === 'Light' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Light Workload</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No team data recorded in current database snapshot.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
