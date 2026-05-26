import { createClient } from '@supabase/supabase-js';
import { Santri, SantriStatus } from '../types';

const getEnv = (key: string) => {
  return (import.meta as any).env[key] || (process.env as any)[key];
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://loljdygrqzzydmqpycnh.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_Eg9nidzOresgrUzYQ7TgKw_FNkvOVHX';

console.log('Initializing Supabase with URL:', supabaseUrl.substring(0, 10) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const santriService = {
  async getAllSantri() {
    console.log('Fetching all santri...');
    const { data, error } = await supabase
      .from('santri')
      .select('*')
      .order('nama', { ascending: true });
    
    if (error) {
      console.error('Supabase Error (getAllSantri):', error);
      throw error;
    }
    console.log(`Fetched ${data?.length || 0} santri items`);
    return (data || []) as Santri[];
  },

  async addSantri(santri: Omit<Santri, 'id' | 'created_at'>) {
    console.log('Attempting to add santri:', santri);
    const { data, error } = await supabase
      .from('santri')
      .insert([santri])
      .select();
    
    if (error) {
      console.error('Supabase Error (addSantri):', error);
      throw error;
    }
    console.log('Successfully added santri:', data?.[0]);
    return (data?.[0] || {}) as Santri;
  },

  async updateSantriStatus(id: number, status: SantriStatus) {
    console.log(`Attempting to update santri ID ${id} to status: ${status}`);
    const { data, error } = await supabase
      .from('santri')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Supabase Error (updateSantriStatus):', error);
      throw error;
    }
    console.log('Successfully updated santri:', data?.[0]);
    return (data?.[0] || {}) as Santri;
  },

  async updateSantriNfc(id: number, nfcId: string) {
    console.log(`Attempting to update NFC for ID ${id} to: ${nfcId}`);
    const { data, error } = await supabase
      .from('santri')
      .update({ nfc_id: nfcId })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Supabase Error (updateSantriNfc):', error);
      throw error;
    }
    console.log('Successfully updated NFC:', data?.[0]);
    return (data?.[0] || {}) as Santri;
  },

  async searchSantri(query: string) {
    const { data, error } = await supabase
      .from('santri')
      .select('*')
      .ilike('nama', `%${query}%`)
      .order('nama', { ascending: true });
    
    if (error) throw error;
    return data as Santri[];
  }
};
