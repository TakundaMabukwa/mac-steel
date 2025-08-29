'use server';

import { createClient } from '@/lib/supabase/server';

export interface MacSteelCostCenter {
  id: number;
  created_at: string;
  new_account_number: string | null;
  company: string | null;
  geozone: string | null;
  entry_exit_points: Record<string, unknown> | null;
  exit_time: string | null;
}

export async function getCostCenters(): Promise<MacSteelCostCenter[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('mac_steel')
      .select('*')
      .not('geozone', 'is', null)
      .order('company', { ascending: true });

    if (error) {
      console.error('Error fetching cost centers:', error);
      throw new Error('Failed to fetch cost centers');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCostCenters:', error);
    throw new Error('Failed to fetch cost centers');
  }
}

export async function updateCostCenterExitTime(
  accountNumber: string, 
  newExitTime: string
): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('mac_steel')
      .update({ exit_time: newExitTime })
      .eq('new_account_number', accountNumber);

    if (error) {
      console.error('Error updating exit time:', error);
      throw new Error('Failed to update exit time');
    }
  } catch (error) {
    console.error('Error in updateCostCenterExitTime:', error);
    throw new Error('Failed to update exit time');
  }
}
