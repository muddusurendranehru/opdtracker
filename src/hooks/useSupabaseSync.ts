import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RecordRow {
  id: string;
  name: string;
  review: string;
  free: boolean;
  amount: string;
  includeTwoE: boolean;
  twoE: string;
  includeLab: boolean;
  lab: string;
  obs: string;
  includeExtra: boolean;
  extra: string;
  synced?: boolean;
}

export function useSupabaseSync(date: string) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseEnabled] = useState(!!supabase);

  const parseNum = (v: string | number | null | undefined): number => {
    if (v === null || v === undefined) return 0;
    const s = String(v).trim();
    if (!s) return 0;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };

  const computeRowTotal = (r: RecordRow): number => {
    const amount = r.free ? 0 : parseNum(r.amount);
    const twoE = r.includeTwoE ? parseNum(r.twoE) : 0;
    const lab = r.includeLab ? parseNum(r.lab) : 0;
    const extra = r.includeExtra ? parseNum(r.extra) : 0;
    return amount + twoE + lab + extra;
  };

  const testConnection = useCallback(async () => {
    if (!supabase) {
      console.log('Supabase not configured');
      return false;
    }
    
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('patient_records').select('count').limit(1);
      if (error) throw error;
      console.log('✅ Supabase connection successful!');
      return true;
    } catch (err) {
      console.error('❌ Supabase connection failed:', err);
      return false;
    }
  }, []);

  const loadTodayRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test Supabase connection first
      const supabaseConnected = await testConnection();
      
      // Load from localStorage (primary storage)
      const storageKey = `opd:records:${date}`;
      const localData = localStorage.getItem(storageKey);
      let localRecords: RecordRow[] = [];
      
      if (localData) {
        localRecords = JSON.parse(localData);
        console.log(`📁 Loaded ${localRecords.length} records from localStorage for ${date}`);
      }

      // Try to load from Supabase if connected
      if (supabaseConnected) {
        try {
          console.log('🔄 Loading records from Supabase...');
          const { data: supabaseRecords, error } = await supabase!
            .from('patient_records')
            .select('*')
            .eq('record_date', date)
            .order('created_at', { ascending: true });

          if (error) throw error;

          if (supabaseRecords && supabaseRecords.length > 0) {
            console.log(`☁️ Loaded ${supabaseRecords.length} records from Supabase`);
            
            // Convert Supabase records to local format
            const convertedRecords: RecordRow[] = supabaseRecords.map(record => ({
              id: record.id,
              name: record.patient_name || '',
              review: record.visit_type || '',
              free: record.is_free || false,
              amount: String(record.consultation_fee || 0),
              includeTwoE: record.include_procedure || false,
              twoE: String(record.procedure_fee || 0),
              includeLab: record.include_tests || false,
              lab: String(record.test_fee || 0),
              obs: record.notes || '',
              includeExtra: record.include_additional || false,
              extra: String(record.additional_fee || 0),
              synced: true,
            }));

            setRows(convertedRecords);
            // Also save to localStorage as backup
            localStorage.setItem(storageKey, JSON.stringify(convertedRecords));
            return;
          }
        } catch (err) {
          console.error('Failed to load from Supabase:', err);
          setError('Failed to sync with cloud database');
        }
      }
      if (localRecords.length === 0) {
        // Create initial empty row
        const initialRow: RecordRow = {
          id: crypto.randomUUID(),
          name: '',
          review: '',
          free: false,
          amount: '',
          includeTwoE: false,
          twoE: '',
          includeLab: false,
          lab: '',
          obs: '',
          includeExtra: false,
          extra: '',
          synced: true, // Local storage is always "synced"
        };
        setRows([initialRow]);
        localStorage.setItem(storageKey, JSON.stringify([initialRow]));
      } else {
        // Mark records as synced based on Supabase availability
        const syncedRecords = localRecords.map(r => ({ ...r, synced: supabaseConnected || r.synced }));
        setRows(syncedRecords);
      }
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records');
      
      // Create initial empty row on error
      const initialRow: RecordRow = {
        id: crypto.randomUUID(),
        name: '',
        review: '',
        free: false,
        amount: '',
        includeTwoE: false,
        twoE: '',
        includeLab: false,
        lab: '',
        obs: '',
        includeExtra: false,
        extra: '',
        synced: true,
      };
      setRows([initialRow]);
    } finally {
      setLoading(false);
    }
  }, [date, testConnection]);

  const addRow = useCallback(async () => {
    const newRow: RecordRow = {
      id: crypto.randomUUID(),
      name: '',
      review: '',
      free: false,
      amount: '',
      includeTwoE: false,
      twoE: '',
      includeLab: false,
      lab: '',
      obs: '',
      includeExtra: false,
      extra: '',
      synced: false,
    };
    
    setRows(prev => {
      const updated = [...prev, newRow];
      // Save to localStorage immediately
      const storageKey = `opd:records:${date}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log('➕ Added new patient row');
      return updated;
    });
  }, [date]);

  const updateRow = useCallback(async (id: string, patch: Partial<RecordRow>) => {
    console.log('📝 Updating row:', id, 'with patch:', patch);
    
    setRows(prev => {
      const updated = prev.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, ...patch, synced: false }; // Mark as needing sync
          console.log('💾 Updated row data:', updatedRow);
          return updatedRow;
        }
        return row;
      });
      
      // Save to localStorage immediately
      const storageKey = `opd:records:${date}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log('💾 Saved to localStorage');
      
      // Sync to Supabase in background
      if (supabase) {
        syncToSupabase(updated.find(r => r.id === id)!);
      }
      
      return updated;
    });
  }, [date]);

  const syncToSupabase = useCallback(async (record: RecordRow) => {
    if (!supabase || !record.name.trim()) return; // Don't sync empty records
    
    try {
      setSyncing(true);
      console.log('🚀 Syncing to Supabase:', record.name);
      
      const supabaseRecord = {
        id: record.id,
        record_date: date,
        patient_name: record.name,
        visit_type: record.review,
        is_free: record.free,
        consultation_fee: record.free ? 0 : parseNum(record.amount),
        include_procedure: record.includeTwoE,
        procedure_fee: record.includeTwoE ? parseNum(record.twoE) : 0,
        include_tests: record.includeLab,
        test_fee: record.includeLab ? parseNum(record.lab) : 0,
        include_additional: record.includeExtra,
        additional_fee: record.includeExtra ? parseNum(record.extra) : 0,
        notes: record.obs,
        total_amount: computeRowTotal(record),
      };

      const { error } = await supabase
        .from('patient_records')
        .upsert(supabaseRecord, { onConflict: 'id' });

      if (error) throw error;

      console.log('✅ Synced to Supabase successfully');
      
      // Mark as synced in local state
      setRows(prev => prev.map(r => 
        r.id === record.id ? { ...r, synced: true } : r
      ));
      
    } catch (err) {
      console.error('❌ Sync to Supabase failed:', err);
      setError('Failed to sync to cloud database');
    } finally {
      setSyncing(false);
    }
  }, [date, computeRowTotal]);
  const removeRow = useCallback(async (id: string) => {
    // Remove from Supabase first if connected
    if (supabase) {
      try {
        await supabase.from('patient_records').delete().eq('id', id);
        console.log('🗑️ Removed from Supabase');
      } catch (err) {
        console.error('Failed to remove from Supabase:', err);
      }
    }
    
    setRows(prev => {
      const updated = prev.filter(r => r.id !== id);
      // Save to localStorage immediately
      const storageKey = `opd:records:${date}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log('🗑️ Removed patient row');
      return updated;
    });
  }, [date]);

  const clearDay = useCallback(async () => {
    // Clear from Supabase first if connected
    if (supabase) {
      try {
        await supabase.from('patient_records').delete().eq('record_date', date);
        console.log('🧹 Cleared Supabase records for', date);
      } catch (err) {
        console.error('Failed to clear Supabase records:', err);
      }
    }
    
    // Clear localStorage
    const storageKey = `opd:records:${date}`;
    localStorage.removeItem(storageKey);
    
    // Reset to single empty row
    const initialRow: RecordRow = {
      id: crypto.randomUUID(),
      name: '',
      review: '',
      free: false,
      amount: '',
      includeTwoE: false,
      twoE: '',
      includeLab: false,
      lab: '',
      obs: '',
      includeExtra: false,
      extra: '',
      synced: false,
    };
    
    setRows([initialRow]);
    localStorage.setItem(storageKey, JSON.stringify([initialRow]));
    console.log('🧹 Cleared all records for', date);
  }, [date]);

  // Load records on date change
  useEffect(() => {
    loadTodayRecords();
  }, [loadTodayRecords]);

  return {
    rows,
    loading,
    syncing,
    error,
    supabaseEnabled,
    testConnection,
    addRow,
    updateRow,
    removeRow,
    clearDay,
    computeRowTotal,
  };
}