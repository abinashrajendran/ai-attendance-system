"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdvisorPage() {
    const [name, setName] = useState('');
    const [sid, setSid] = useState('');

    async function addStudent() {
        const { error } = await supabase.from('students').insert([{ student_id: sid, name: name }]);
        if (error) alert("Error: " + error.message);
        else alert("Student Created!");
    }

    return (
        <div className="p-10 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6">Advisor Dashboard</h1>
            <div className="bg-gray-100 p-6 rounded-lg w-96">
                <h2 className="mb-4 font-bold">Create New Student</h2>
                <input className="w-full mb-2 p-2" placeholder="Name" onChange={e => setName(e.target.value)} />
                <input className="w-full mb-4 p-2" placeholder="Student ID" onChange={e => setSid(e.target.value)} />
                <button onClick={addStudent} className="bg-green-600 text-white p-2 w-full rounded">Add Student</button>
            </div>
        </div>
    );
}