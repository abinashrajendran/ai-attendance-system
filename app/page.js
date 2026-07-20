"use client";
import { useState } from 'react';

export default function StudentPage() {
    const [sid, setSid] = useState('');
    const [status, setStatus] = useState('');

    async function markAttendance() {
        if(!sid) return alert("Enter ID");
        setStatus("Verifying Location...");

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            setStatus("Scan Fingerprint...");

            try {
                // Trigger the registered biometric
                await navigator.credentials.get({
                    publicKey: { challenge: new Uint8Array([1,2,3,4]), timeout: 60000, userVerification: "required", allowCredentials: [] }
                });

                const res = await fetch('/api/attendance', {
                    method: 'POST',
                    body: JSON.stringify({ studentID: sid, lat: latitude, lon: longitude })
                });
                const data = await res.json();
                setStatus(data.message);
            } catch (err) { setStatus("Biometric Verification Failed"); }
        }, () => setStatus("Enable GPS"));
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center border-b-8 border-blue-600">
                <h1 className="text-2xl font-bold mb-6">Attendance</h1>
                <input className="w-full border-2 p-3 rounded-xl mb-4 text-center font-bold" placeholder="STUDENT ID" onChange={e => setSid(e.target.value)} />
                <button onClick={markAttendance} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg">MARK PRESENT</button>
                <p className="mt-4 text-blue-600 font-bold">{status}</p>
            </div>
        </div>
    );
}