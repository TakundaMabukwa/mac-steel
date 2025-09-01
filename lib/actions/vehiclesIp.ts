'use server';

import { createClient } from '@/lib/supabase/server';

export interface VehicleIp {
  id: number;
  new_account_number: string;
  company: string | null;
  comment: string | null;
  group_name: string | null; // Now required since column exists
  new_registration: string | null;
  beame_1: string | null;
  beame_2: string | null;
  beame_3: string | null;
  ip_address: string | null;
  products: any[];
  active: boolean | null;
  vin_number: string | null;
  loan: boolean | null;
  account_number: string | null;
  loan_return_date: string | null;
}

export async function getVehiclesByAccountNumber(
  newAccountNumber: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: VehicleIp[]; total: number; hasMore: boolean }> {
  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from('vehicles_ip')
      .select('*', { count: 'exact', head: true })
      .eq('new_account_number', newAccountNumber);

    if (countError) {
      console.error('Error getting count:', countError);
      throw new Error('Failed to get vehicle count');
    }

    // Get paginated data - include all columns including group_name
    const { data, error } = await supabase
      .from('vehicles_ip')
      .select('id, new_account_number, company, comment, group_name, new_registration, beame_1, beame_2, beame_3, ip_address, products, active, vin_number, loan, account_number, loan_return_date')
      .eq('new_account_number', newAccountNumber)
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching vehicles:', error);
      throw new Error('Failed to fetch vehicles');
    }

    const total = count || 0;
    const hasMore = to < total - 1;

    return { data: data || [], total, hasMore };
  } catch (error) {
    console.error('Error in getVehiclesByAccountNumber:', error);
    throw error;
  }
}

export async function getVehicleCountByAccountNumber(
  newAccountNumber: string
): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('vehicles_ip')
      .select('*', { count: 'exact', head: true })
      .eq('new_account_number', newAccountNumber);

    if (error) {
      console.error('Error getting vehicle count:', error);
      throw new Error('Failed to get vehicle count');
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getVehicleCountByAccountNumber:', error);
    throw error;
  }
}

// Test function to check database connectivity and permissions
export async function testVehicleUpdate(vehicleId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Try a simple select first
    const { data, error } = await supabase
      .from('vehicles_ip')
      .select('id, new_account_number')
      .eq('id', vehicleId)
      .single();

    if (error) {
      return { success: false, error: `Select failed: ${error.message}` };
    }

    console.log('Test select successful:', data);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Test failed' 
    };
  }
}

export async function updateVehicleLoan(
  vehicleId: number,
  currentAccountNumber: string,
  newAccountNumber: string,
  loanReturnDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    console.log('Updating vehicle loan with:', {
      vehicleId,
      currentAccountNumber,
      newAccountNumber,
      loanReturnDate
    });

    // Validate input data
    if (!vehicleId || !currentAccountNumber || !newAccountNumber || !loanReturnDate) {
      throw new Error('Missing required parameters for vehicle loan update');
    }

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(loanReturnDate)) {
      throw new Error(`Invalid date format: ${loanReturnDate}. Expected YYYY-MM-DD`);
    }

    // Check if the new account number exists in mac_steel table
    const { data: costCenterExists, error: costCenterError } = await supabase
      .from('mac_steel')
      .select('id')
      .eq('new_account_number', newAccountNumber)
      .single();

    if (costCenterError || !costCenterExists) {
      throw new Error(`Cost center with account number ${newAccountNumber} does not exist`);
    }

    console.log('Cost center validation passed:', costCenterExists);
    
    // First, let's check if the vehicle exists and get its current data
    const { data: existingVehicle, error: fetchError } = await supabase
      .from('vehicles_ip')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      throw new Error(`Vehicle not found: ${fetchError.message}`);
    }

    console.log('Found existing vehicle:', existingVehicle);
    
    // Check if we have permission to update this vehicle
    console.log('Checking update permissions...');
    
    // Now update the vehicle - try updating fields one by one to isolate the issue
    console.log('Attempting to update vehicle fields one by one...');

    // Update account_number first
    const { error: error1 } = await supabase
      .from('vehicles_ip')
      .update({ account_number: currentAccountNumber })
      .eq('id', vehicleId);

    if (error1) {
      console.error('Error updating account_number:', error1);
      throw new Error(`Failed to update account_number: ${error1.message}`);
    }
    console.log('account_number updated successfully');

    // Update new_account_number
    const { error: error2 } = await supabase
      .from('vehicles_ip')
      .update({ new_account_number: newAccountNumber })
      .eq('id', vehicleId);

    if (error2) {
      console.error('Error updating new_account_number:', error2);
      throw new Error(`Failed to update new_account_number: ${error2.message}`);
    }
    console.log('new_account_number updated successfully');

    // Update loan status
    const { error: error3 } = await supabase
      .from('vehicles_ip')
      .update({ loan: true })
      .eq('id', vehicleId);

    if (error3) {
      console.error('Error updating loan:', error3);
      throw new Error(`Failed to update loan: ${error3.message}`);
    }
    console.log('loan status updated successfully');

    // Update loan_return_date
    const { error: error4 } = await supabase
      .from('vehicles_ip')
      .update({ loan_return_date: loanReturnDate })
      .eq('id', vehicleId);

    if (error4) {
      console.error('Error updating loan_return_date:', error4);
      throw new Error(`Failed to update loan_return_date: ${error4.message}`);
    }
    console.log('loan_return_date updated successfully');

    console.log('All fields updated successfully');

    console.log('Vehicle loan updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in updateVehicleLoan:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update vehicle loan' 
    };
  }
}

export async function getVehicleTableSchema(): Promise<{ success: boolean; error?: string; columns?: string[] }> {
  try {
    const supabase = await createClient();
    
    // Get the table schema by selecting all columns from one row
    const { data, error } = await supabase
      .from('vehicles_ip')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      return { success: false, error: `Schema query failed: ${error.message}` };
    }
    
    const columns = Object.keys(data);
    console.log('Available columns in vehicles_ip table:', columns);
    
    return { success: true, columns };
  } catch (error) {
    console.error('Schema query error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Schema query failed' 
    };
  }
}
