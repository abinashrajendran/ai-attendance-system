"use client";
import { useState } from 'react';

export default function StudentPage() {
    const [sid, setSid] = useState('');
    const [msg, setMsg] = useState('');

    async function handleAttendance() {
        if(!sid) return alert("Enter Student ID");
        setMsg("Checking Location...");

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            setMsg("Location OK. Verify Biometrics...");
            
            try {
                await navigator.credentials.get({
                    publicKey: { challenge: new Uint8Array([1,2,3,4]), timeout: 60000, userVerification: "required", allowCredentials: [] }
                });

                const res = await fetch('/api/attendance', {
                    method: 'POST',
                    body: JSON.stringify({ studentID: sid, lat: latitude, lon: longitude })
                });
                const data = await res.json();
                setMsg(data.message);
            } catch (err) {
                setMsg("Biometric verification failed.");
            }
        }, () => setMsg("Please enable GPS"));
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold mb-6">Student Attendance</h1>
                <input className="w-full border p-3 rounded-lg mb-4" placeholder="Student ID" onChange={e => setSid(e.target.value)} />
                <button onClick={handleAttendance} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Mark Present</button>
                <p className="mt-4 font-semibold text-gray-600">{msg}</p>
                <div className="mt-6">
                   <a href="/advisor" className="text-sm text-blue-500 hover:underline">Advisor Dashboard</a>
                </div>
            </div>
        </div>
    );
}