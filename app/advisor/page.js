"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdvisorPage() {
    const [name, setName] = useState('');
    const [sid, setSid] = useState('');
    const [searchId, setSearchId] = useState('');
    const [attendanceList, setAttendanceList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    useEffect(() => { fetchHistory(); }, []);

    // 1. Fetch Full History
    async function fetchHistory() {
        const { data, error } = await supabase
            .from('attendance')
            .select('*, students(name)')
            .order('marked_at', { ascending: false });
        if (data) {
            setAttendanceList(data);
            setFilteredList(data);
        }
    }

    // 2. Set Current Location as Classroom
    async function setClassroomLocation() {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const { error } = await supabase.from('classrooms').upsert({ id: 1, lat: latitude, lon: longitude, radius: 50 });
            if (error) alert("Location Error: " + error.message);
            else alert("Classroom Location set successfully!");
        });
    }

    // 3. Add Student
    async function addStudent() {
        if(!sid || !name) return alert("Fill all fields");
        const { error } = await supabase.from('students').insert([{ student_id: sid, name: name }]);
        if (error) alert(error.message);
        else { alert("Student Created!"); fetchHistory(); }
    }

    // 4. Analysis: Search by Student ID
    function handleSearch(val) {
        setSearchId(val);
        if (val === '') {
            setFilteredList(attendanceList);
        } else {
            const filtered = attendanceList.filter(item => item.student_id.includes(val));
            setFilteredList(filtered);
        }
    }

    // 5. Export to Excel (CSV)
    function exportToCSV() {
        let csv = "Student ID,Name,Status,Date,Time\n";
        filteredList.forEach(row => {
            const date = new Date(row.marked_at).toLocaleDateString();
            const time = new Date(row.marked_at).toLocaleTimeString();
            csv += `${row.student_id},${row.students?.name || 'N/A'},${row.status},${date},${time}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'attendance_report.csv');
        a.click();
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-8">Advisor Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Management */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Registration</h2>
                    <input className="w-full mb-3 p-3 border rounded-lg" placeholder="Student Name" onChange={e => setName(e.target.value)} />
                    <input className="w-full mb-4 p-3 border rounded-lg" placeholder="Student ID" onChange={e => setSid(e.target.value)} />
                    <button onClick={addStudent} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold mb-4 hover:bg-green-700 transition">Add Student</button>
                    
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Classroom GPS</h2>
                    <button onClick={setClassroomLocation} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        Set Current Location as Class
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Click this while standing inside the classroom.</p>
                </div>

                {/* Right: History & Analysis */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-gray-800">Attendance Analysis</h2>
                        <div className="flex gap-2">
                            <input 
                                className="border p-2 rounded-lg text-sm" 
                                placeholder="Search Student ID..." 
                                value={searchId}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <button onClick={exportToCSV} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Export Excel</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                                    <th className="p-3">Student ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Time</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.map((row, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50 text-sm">
                                        <td className="p-3 font-medium">{row.student_id}</td>
                                        <td className="p-3">{row.students?.name}</td>
                                        <td className="p-3">{new Date(row.marked_at).toLocaleDateString()}</td>
                                        <td className="p-3">{new Date(row.marked_at).toLocaleTimeString()}</td>
                                        <td className="p-3"><span className="text-green-600 font-bold">{row.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredList.length === 0 && <p className="p-10 text-center text-gray-400">No records found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}