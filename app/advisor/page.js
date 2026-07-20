"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdvisorPage() {
    const [name, setName] = useState('');
    const [sid, setSid] = useState('');
    const [attendanceList, setAttendanceList] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');

    // Page open aagum pothu history load pannum
    useEffect(() => {
        fetchHistory();
    }, []);

    // 1. Fetch Attendance History (Joined with Student Names)
    async function fetchHistory() {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                marked_at,
                student_id,
                status,
                students ( name )
            `)
            .order('marked_at', { ascending: false });
        
        if (data) setAttendanceList(data);
        if (error) console.error("History Fetch Error:", error);
    }

    // 2. Pre-Register Student with Biometrics (Viral/Face Scan)
    async function registerStudentWithBiometrics() {
        if (!sid || !name) return alert("Please enter Student ID and Name!");
        
        setStatus("Waiting for Fingerprint/Face Scan...");

        try {
            // Step A: First save student to database
            await supabase.from('students').upsert([{ student_id: sid, name: name }]);

            // Step B: Trigger Browser Biometric Registration
            const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
            const userID = new Uint8Array(16); window.crypto.getRandomValues(userID);

            // Intha logic thaan device-oda viral scanner-ah force pannum
            await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: "Attendance System", id: window.location.hostname },
                    user: { id: userID, name: sid, displayName: name },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: { 
                        authenticatorAttachment: "platform", // Forces Fingerprint/FaceID
                        userVerification: "required" 
                    },
                    timeout: 60000
                }
            });

            setStatus("Student & Biometric Registered Successfully!");
            fetchHistory(); // Refresh the list
        } catch (err) {
            console.error(err);
            setStatus("Registration Failed. Ensure device has biometric sensor.");
            alert("Registration failed or cancelled. Use a mobile/laptop with fingerprint sensor.");
        }
    }

    // 3. Set Current GPS Spot as Classroom Location
    async function setClassroomLocation() {
        setStatus("Getting GPS location...");
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const { error } = await supabase
                .from('classrooms')
                .upsert({ id: 1, lat: latitude, lon: longitude, radius: 50 });
            
            if (error) setStatus("Error updating location: " + error.message);
            else setStatus("Classroom Location set to your current spot!");
        }, () => setStatus("GPS Error. Enable location permissions."));
    }

    // 4. Excel Export with Date-Wise Clarification
    function exportToExcel() {
        let filtered = attendanceList;

        // Date wise filter pannura logic
        if (startDate && endDate) {
            filtered = attendanceList.filter(row => {
                const rowDate = new Date(row.marked_at).toISOString().split('T')[0];
                return rowDate >= startDate && rowDate <= endDate;
            });
        }

        if (filtered.length === 0) return alert("No records found for the selected dates!");

        let csv = "Date,Time,Student ID,Student Name,Status\n";
        filtered.forEach(r => {
            const d = new Date(r.marked_at);
            const dateStr = d.toLocaleDateString();
            const timeStr = d.toLocaleTimeString();
            const studentName = r.students?.name || "N/A";
            csv += `${dateStr},${timeStr},${r.student_id},${studentName},Present\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Report_${startDate || 'full'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-blue-900 mb-8 border-b-4 border-blue-600 inline-block">ADVISOR PORTAL</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Registration Section */}
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-700 uppercase">Pre-Register Student</h2>
                        <div className="space-y-4">
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
                                placeholder="Student Full Name" onChange={e => setName(e.target.value)} />
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none transition" 
                                placeholder="Student ID Number" onChange={e => setSid(e.target.value)} />
                            <button onClick={registerStudentWithBiometrics} 
                                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-200">
                                REGISTER BIOMETRICS
                            </button>
                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Student must touch the sensor during registration</p>
                        </div>

                        <h2 className="text-xl font-bold mt-10 mb-4 text-gray-700 uppercase border-t pt-6">Classroom Setup</h2>
                        <button onClick={setClassroomLocation} 
                            className="w-full bg-gray-800 text-white p-4 rounded-xl font-bold hover:bg-black transition shadow-lg">
                            SET CURRENT LOCATION
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2 italic">Sets your current GPS spot as classroom center.</p>
                    </div>

                    {/* History & Export Section */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-2xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-700 uppercase">Attendance History</h2>
                            
                            <div className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-2xl border border-blue-100">
                                <input type="date" className="p-1 border rounded text-xs" onChange={e => setStartDate(e.target.value)} />
                                <span className="text-xs font-bold text-blue-400">TO</span>
                                <input type="date" className="p-1 border rounded text-xs" onChange={e => setEndDate(e.target.value)} />
                                <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition">
                                    EXPORT EXCEL
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-blue-900 text-white text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {attendanceList.map((r, i) => (
                                        <tr key={i} className="border-b hover:bg-blue-50 transition">
                                            <td className="p-4 text-gray-600">{new Date(r.marked_at).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-blue-900">{r.student_id}</td>
                                            <td className="p-4 text-gray-700">{r.students?.name}</td>
                                            <td className="p-4 text-gray-500">{new Date(r.marked_at).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {attendanceList.length === 0 && <p className="p-10 text-center text-gray-400">No attendance records found yet.</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-blue-600 font-bold bg-blue-50 inline-block px-6 py-2 rounded-full border border-blue-100 animate-pulse">
                        {status || "System Ready"}
                    </p>
                </div>
            </div>
        </div>
    );
}