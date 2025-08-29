'use server';

import { createClient } from '@/lib/supabase/server';

export interface Vehicle {
  new_account_number: string;
  company: string | null;
  plate: string | null;
  beame_1: string | null;
  beame_2: string | null;
  beame_3: string | null;
  ip_address: string | null;
  id: number;
  status: string | null;
  start_time: string | null;
  reason: string | null;
  return_time: string | null;
}

export interface LiveVehicle {
  new_account_number: string;
  company: string | null;
  plate: string | null;
  beame_1: string | null;
  beame_2: string | null;
  beame_3: string | null;
  ip_address: string | null;
  id: number;
  speed: string | null;
  latitude: string | null;
  longitude: string | null;
  loctime: string | null;
  quality: string | null;
  mileage: string | null;
  pocsagstr: string | null;
  head: string | null;
  geozone: string | null;
  drivername: string | null;
  nameevent: string | null;
  temperature: string | null;
  address: string | null;
}

export interface LateVehicleReport {
  id: number;
  new_account_number: string;
  company: string | null;
  plate: string | null;
  beame_1: string | null;
  beame_2: string | null;
  beame_3: string | null;
  ip_address: string | null;
  status: string | null;
  start_time: string | null;
  reason: string | null;
  return_time: string | null;
  created_at: string | null;
}

export async function getVehiclesByAccountNumber(accountNumber: string): Promise<Vehicle[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('late_vehicles')
      .select('*')
      .eq('new_account_number', accountNumber)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehiclesByAccountNumber:', error);
    throw new Error('Failed to fetch vehicles');
  }
}

export async function getLiveVehiclesByAccountNumber(accountNumber: string): Promise<LiveVehicle[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('live_vehicle_data')
      .select('*')
      .eq('new_account_number', accountNumber)
      .order('loctime', { ascending: false });

    if (error) {
      console.error('Error fetching live vehicles:', error);
      throw new Error('Failed to fetch live vehicles');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLiveVehiclesByAccountNumber:', error);
    throw new Error('Failed to fetch live vehicles');
  }
}

export async function updateVehicleReason(plate: string, reason: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('late_vehicles')
      .update({ reason: reason })
      .eq('plate', plate);

    if (error) {
      console.error('Error updating vehicle reason:', error);
      throw new Error('Failed to update vehicle reason');
    }
  } catch (error) {
    console.error('Error in updateVehicleReason:', error);
    throw new Error('Failed to update vehicle reason');
  }
}

export async function getLateVehicleReportsByCostCenterAndDate(
  costCenterAccountNumber: string, 
  selectedDate: string
): Promise<LateVehicleReport[]> {
  try {
    const supabase = await createClient();
    
    // Convert the selected date to start and end of day for the created_at field
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data, error } = await supabase
      .from('late_vehicles_reports')
      .select('*')
      .eq('new_account_number', costCenterAccountNumber)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching late vehicle reports:', error);
      throw new Error('Failed to fetch late vehicle reports');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLateVehicleReportsByCostCenterAndDate:', error);
    throw new Error('Failed to fetch late vehicle reports');
  }
}

export async function getAllVehiclesWithStartTime(accountNumber: string): Promise<Vehicle[]> {
  try {
    const supabase = await createClient();
    
    // First try to get vehicles from late_vehicles_reports table which has more comprehensive data
    const { data: reportsData, error: reportsError } = await supabase
      .from('late_vehicles_reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .not('start_time', 'is', null)
      .order('start_time', { ascending: false });

    if (reportsError) {
      console.error('Error fetching from late_vehicles_reports:', reportsError);
      // Fallback to late_vehicles table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('late_vehicles')
        .select('*')
        .eq('new_account_number', accountNumber)
        .not('start_time', 'is', null)
        .order('start_time', { ascending: false });

      if (fallbackError) {
        console.error('Error fetching from late_vehicles:', fallbackError);
        throw new Error('Failed to fetch vehicles');
      }

      return fallbackData || [];
    }

    return reportsData || [];
  } catch (error) {
    console.error('Error in getAllVehiclesWithStartTime:', error);
    throw new Error('Failed to fetch vehicles with start times');
  }
}
