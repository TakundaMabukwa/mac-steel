'use server';

import { createClient } from '@/lib/supabase/server';

export interface Report {
  id: number;
  created_at: string;
  new_account_number: string | null;
  daily: boolean | null;
  weekly: boolean | null;
  monthly: boolean | null;
  month: string | null;
  url: string | null;
}

export async function getReportsByAccountNumber(accountNumber: string): Promise<Report[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      throw new Error('Failed to fetch reports');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReportsByAccountNumber:', error);
    throw new Error('Failed to fetch reports');
  }
}

export async function getLatestDailyReport(accountNumber: string): Promise<Report | null> {
  try {
    const supabase = await createClient();
    
    // Get the most recent daily report for the previous day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('daily', true)
      .gte('month', yesterdayString)
      .lte('month', yesterdayString)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching daily report:', error);
      throw new Error('Failed to fetch daily report');
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getLatestDailyReport:', error);
    throw new Error('Failed to fetch daily report');
  }
}

export async function getLatestWeeklyReport(accountNumber: string): Promise<Report | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('weekly', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching weekly report:', error);
      throw new Error('Failed to fetch weekly report');
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getLatestWeeklyReport:', error);
    throw new Error('Failed to fetch weekly report');
  }
}

export async function getLatestMonthlyReport(accountNumber: string): Promise<Report | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('monthly', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching monthly report:', error);
      throw new Error('Failed to fetch monthly report');
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error in getLatestMonthlyReport:', error);
    throw new Error('Failed to fetch monthly report');
  }
}
