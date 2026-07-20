"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdvisorPage() {
    const [name, setName] = useState('');
    const [sid, setSid] = useState('');
    const [attendanceList, setAttendanceList] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => { fetchHistory(); }, []);

    async function fetchHistory() {
        const { data } = await supabase.from('attendance').select('*, students(name)').order('marked_at', { ascending: false });
        setAttendanceList(data || []);
    }

    // --- FINGERPRINT PRE-REGISTRATION ---
    async function registerStudentWithFingerprint() {
        if (!sid || !name) return alert("Enter Student ID and Name first!");

        try {
            // 1. Create Student Profile
            await supabase.from('students').upsert([{ student_id: sid, name: name }]);

            // 2. Browser Fingerprint Registration
            const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
            const userID = new Uint8Array(16); window.crypto.getRandomValues(userID);

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: "Attendance System" },
                    user: { id: userID, name: sid, displayName: name },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: { authenticatorAttachment: "platform" },
                    timeout: 60000
                }
            });

            // 3. Save to Database
            const credentialID = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
            await supabase.from('student_credentials').upsert([{
                student_id: sid,
                credential_id: credentialID,
                public_key: "registered_on_device" // Security purpose-kaaga placeholder
            }]);

            alert("Student Registered with Fingerprint!");
            fetchHistory();
        } catch (err) {
            alert("Fingerprint Registration Failed: " + err.message);
        }
    }

    // --- EXCEL EXPORT (DATE WISE) ---
    function exportExcel() {
        const filtered = attendanceList.filter(row => {
            const rowDate = new Date(row.marked_at).toISOString().split('T')[0];
            return rowDate >= startDate && rowDate <= endDate;
        });

        let csv = "Date,Time,ID,Name,Status\n";
        filtered.forEach(r => {
            const d = new Date(r.marked_at);
            csv += `${d.toLocaleDateString()},${d.toLocaleTimeString()},${r.student_id},${r.students?.name},Present\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `Attendance_${startDate}_to_${endDate}.csv`;
        a.click();
    }

    return (
        <div className="p-6 max-w-6xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-8">Advisor Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 shadow rounded-xl border">
                    <h2 className="font-bold mb-4">Register Student</h2>
                    <input className="w-full border p-2 mb-2 rounded" placeholder="Name" onChange={e => setName(e.target.value)} />
                    <input className="w-full border p-2 mb-4 rounded" placeholder="Student ID" onChange={e => setSid(e.target.value)} />
                    <button onClick={registerStudentWithFingerprint} className="w-full bg-blue-600 text-white p-3 rounded font-bold">Register Fingerprint</button>
                    <p className="text-xs text-gray-500 mt-2 italic text-center">Student must be present to touch the sensor</p>
                </div>

                <div className="md:col-span-2 bg-white p-6 shadow rounded-xl border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">Attendance History</h2>
                        <div className="flex gap-2 items-center text-xs">
                            <input type="date" className="border p-1" onChange={e => setStartDate(e.target.value)} />
                            <input type="date" className="border p-1" onChange={e => setEndDate(e.target.value)} />
                            <button onClick={exportExcel} className="bg-green-700 text-white px-3 py-1 rounded">Excel</button>
                        </div>
                    </div>
                    <div className="h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead><tr className="bg-gray-100"><th className="p-2">Date</th><th className="p-2">ID</th><th className="p-2">Name</th></tr></thead>
                            <tbody>
                                {attendanceList.map((r, i) => (
                                    <tr key={i} className="border-b"><td>{new Date(r.marked_at).toLocaleDateString()}</td><td>{r.student_id}</td><td>{r.students?.name}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}