export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const CLASS_LAT = 13.0827; 
const CLASS_LON = 80.2707; 
const RADIUS = 50;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export async function POST(req) {
    try {
        const { studentID, lat, lon } = await req.json();

        // Database logic
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', studentID)
            .single();

        if (!student || studentError) {
            return NextResponse.json({ success: false, message: "Student not found!" });
        }

        const distance = calculateDistance(lat, lon, CLASS_LAT, CLASS_LON);
        if (distance > RADIUS) {
            return NextResponse.json({ success: false, message: `Too far! ${Math.round(distance)}m away.` });
        }

        await supabase.from('attendance').insert([{ student_id: studentID, status: 'Present' }]);
        return NextResponse.json({ success: true, message: "Attendance Marked Successfully!" });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" });
    }
}