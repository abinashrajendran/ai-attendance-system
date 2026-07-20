export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const { studentID, lat, lon } = await req.json();

    // 1. Database-la irunthu Advisor set panna classroom location-ah edukkom
    const { data: classroom } = await supabase.from('classrooms').select('*').eq('id', 1).single();
    
    // 2. Distance Calculation (Haversine)
    const R = 6371e3;
    const dLat = (classroom.lat - lat) * Math.PI / 180;
    const dLon = (classroom.lon - lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI/180) * Math.cos(classroom.lat * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));

    if (distance <= classroom.radius) {
        await supabase.from('attendance').insert([{ student_id: studentID }]);
        return NextResponse.json({ success: true, message: "Present Marked!" });
    } else {
        return NextResponse.json({ success: false, message: `Out of range! Distance: ${Math.round(distance)}m` });
    }
}