'use server';

import { createClient } from '@/lib/supabase/server';

export interface MacSteelCostCenter {
  id: number;
  created_at: string;
  new_account_number: string | null;
  company: string | null;
  geozone: string | null;
  entry_exit_points: any | null;
  exit_time: string | null;
}

export interface VehicleReport {
  id: number;
  created_at: string;
  new_account_number: string | null;
  daily: boolean | null;
  weekly: boolean | null;
  monthly: boolean | null;
  month: string | null;
  url: string | null;
}

export async function getAllMacSteelCostCenters(): Promise<MacSteelCostCenter[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('mac_steel')
      .select('*')
      .order('company', { ascending: true });

    if (error) {
      console.error('Error fetching mac_steel cost centers:', error);
      throw new Error('Failed to fetch cost centers');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllMacSteelCostCenters:', error);
    throw new Error('Failed to fetch cost centers');
  }
}

export async function getMacSteelCostCentersPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: MacSteelCostCenter[]; total: number; hasMore: boolean }> {
  try {
    const supabase = await createClient();
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from('mac_steel')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching mac_steel count:', countError);
      throw new Error('Failed to fetch cost centers count');
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('mac_steel')
      .select('*')
      .order('company', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching mac_steel cost centers:', error);
      throw new Error('Failed to fetch cost centers');
    }

    const total = count || 0;
    const hasMore = to < total - 1;

    return {
      data: data || [],
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error in getMacSteelCostCentersPaginated:', error);
    throw new Error('Failed to fetch cost centers');
  }
}

export interface CostCenterDropdown {
  id: number;
  new_account_number: string | null;
  company: string | null;
}

export async function getMacSteelCostCentersForDropdownPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: CostCenterDropdown[]; total: number; hasMore: boolean }> {
  try {
    const supabase = await createClient();
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from('mac_steel')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching mac_steel count:', countError);
      throw new Error('Failed to fetch cost centers count');
    }

    // Get paginated data with only required fields
    const { data, error } = await supabase
      .from('mac_steel')
      .select('id, new_account_number, company')
      .order('company', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching mac_steel cost centers:', error);
      throw new Error('Failed to fetch cost centers');
    }

    const total = count || 0;
    const hasMore = to < total - 1;

    return {
      data: data || [],
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error in getMacSteelCostCentersForDropdownPaginated:', error);
    throw new Error('Failed to fetch cost centers');
  }
}

export async function getVehicleReportsByAccountAndMonth(
  newAccountNumber: string,
  month: string,
  year: string
): Promise<VehicleReport[]> {
  try {
    const supabase = await createClient();
    
    // Create date range for the month
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', newAccountNumber)
      .gte('month', startDate)
      .lte('month', endDate)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching vehicle reports:', error);
      throw new Error('Failed to fetch vehicle reports');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehicleReportsByAccountAndMonth:', error);
    throw new Error('Failed to fetch vehicle reports');
  }
}

export interface VehicleWithStatus {
  id: number;
  created_at: string;
  new_account_number: string | null;
  company: string | null;
  plate: string | null;
  status: string | null;
  start_time: string | null;
  reason: string | null;
}

export async function getVehiclesWithStatusByAccountAndMonth(
  newAccountNumber: string,
  month: string,
  year: string
): Promise<VehicleWithStatus[]> {
  try {
    const supabase = await createClient();
    
    // Create date range for the month
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('late_vehicles')
      .select('id, created_at, new_account_number, company, plate, status, start_time, reason')
      .eq('new_account_number', newAccountNumber)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles with status:', error);
      throw new Error('Failed to fetch vehicles with status');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVehiclesWithStatusByAccountAndMonth:', error);
    throw new Error('Failed to fetch vehicles with status');
  }
}
