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

export interface GlobalVehicleStatusCounts {
  total: number;
  onTime: number;
  late: number;
  pending: number;
}

// Get global counts across all cost centers from late_vehicles
export async function getGlobalVehicleStatusCounts(): Promise<GlobalVehicleStatusCounts> {
  try {
    const supabase = await createClient();

    // Total vehicles
    const totalQuery = await supabase
      .from('late_vehicles')
      .select('*', { count: 'exact', head: true });

    // On-time vehicles (various naming variants)
    const onTimeQuery = await supabase
      .from('late_vehicles')
      .select('*', { count: 'exact', head: true })
      .in('status', ['on-time', 'on_time', 'on time']);

    // Late vehicles (including variants)
    const lateQuery = await supabase
      .from('late_vehicles')
      .select('*', { count: 'exact', head: true })
      .in('status', ['late', 'Late', 'not_on_time']);

    // Pending vehicles
    const pendingQuery = await supabase
      .from('late_vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (totalQuery.error || onTimeQuery.error || lateQuery.error || pendingQuery.error) {
      console.error('Error fetching global vehicle counts:', totalQuery.error || onTimeQuery.error || lateQuery.error || pendingQuery.error);
      throw new Error('Failed to fetch global vehicle counts');
    }

    return {
      total: totalQuery.count || 0,
      onTime: onTimeQuery.count || 0,
      late: lateQuery.count || 0,
      pending: pendingQuery.count || 0
    };
  } catch (error) {
    console.error('Error in getGlobalVehicleStatusCounts:', error);
    throw new Error('Failed to fetch global vehicle status counts');
  }
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

export async function updateVehicleReason(vehicleId: number, reason: string): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('late_vehicles')
      .update({ reason: reason })
      .eq('id', vehicleId);

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
    
    // Fetch vehicles from late_vehicles table based on new_account_number
    const { data, error } = await supabase
      .from('late_vehicles')
      .select('*')
      .eq('new_account_number', accountNumber)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching from late_vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllVehiclesWithStartTime:', error);
    throw new Error('Failed to fetch vehicles with start times');
  }
}
