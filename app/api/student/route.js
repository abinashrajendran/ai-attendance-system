export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { studentID, name } = await req.json();
        const { error } = await supabase.from('students').insert([{ student_id: studentID, name: name }]);
        
        if (error) return NextResponse.json({ success: false, message: error.message });
        return NextResponse.json({ success: true, message: "Student Created!" });
    } catch (err) {
        return NextResponse.json({ success: false, message: "Server Error" });
    }
}