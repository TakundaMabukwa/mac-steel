import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Fetch all live vehicle data from Supabase
    const { data, error } = await supabase
      .from('live_vehicle_data')
      .select('*')
      .order('loctime', { ascending: false });

    if (error) {
      console.error('Error fetching live vehicle data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch live vehicle data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error in macsteel-live API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
