"use client";
import { useState } from 'react';

export default function AdvisorPage() {
    const [name, setName] = useState('');
    const [sid, setSid] = useState('');

    async function addStudent() {
        if(!name || !sid) return alert("Fill all fields");
        
        const res = await fetch('/api/student', {
            method: 'POST',
            body: JSON.stringify({ studentID: sid, name: name })
        });
        const data = await res.json();
        alert(data.message);
    }

    return (
        <div className="p-10 flex flex-col items-center min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">Advisor Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="mb-4 font-bold text-gray-700">Create New Student</h2>
                <input className="w-full mb-2 p-2 border rounded" placeholder="Name" onChange={e => setName(e.target.value)} />
                <input className="w-full mb-4 p-2 border rounded" placeholder="Student ID" onChange={e => setSid(e.target.value)} />
                <button onClick={addStudent} className="bg-green-600 text-white p-2 w-full rounded font-bold hover:bg-green-700">Add Student</button>
            </div>
            <a href="/" className="mt-4 text-blue-600 underline text-sm">Go back to Attendance Page</a>
        </div>
    );
}