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
    
    // Get the most recent daily report for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('daily', true)
      .gte('created_at', yesterdayString + 'T00:00:00')
      .lte('created_at', yesterdayString + 'T23:59:59')
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
    
    // Get the current week's report (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust for Sunday
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const mondayString = monday.toISOString();
    const sundayString = sunday.toISOString();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('weekly', true)
      .gte('created_at', mondayString)
      .lte('created_at', sundayString)
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
    
    // Get the current month's report
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const firstDayString = firstDayOfMonth.toISOString();
    const lastDayString = lastDayOfMonth.toISOString();
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('new_account_number', accountNumber)
      .eq('monthly', true)
      .gte('created_at', firstDayString)
      .lte('created_at', lastDayString)
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
