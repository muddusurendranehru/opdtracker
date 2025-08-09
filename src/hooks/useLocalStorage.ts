import { useState, useEffect, useCallback } from 'react';

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
}

export function useLocalStorage(date: string) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  const saveToStorage = useCallback((data: RecordRow[]) => {
    const storageKey = `clinic:records:${date}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [date]);

  const loadFromStorage = useCallback(() => {
    try {
      setLoading(true);
      const storageKey = `clinic:records:${date}`;
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        const records = JSON.parse(localData);
        setRows(records);
      } else {
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
        };
        setRows([initialRow]);
        saveToStorage([initialRow]);
      }
    } catch (err) {
      console.error('Error loading records:', err);
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
      };
      setRows([initialRow]);
    } finally {
      setLoading(false);
    }
  }, [date, saveToStorage]);

  const addRow = useCallback(() => {
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
    };
    
    setRows(prev => {
      const updated = [...prev, newRow];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const updateRow = useCallback((id: string, patch: Partial<RecordRow>) => {
    setRows(prev => {
      const updated = prev.map(row => 
        row.id === id ? { ...row, ...patch } : row
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removeRow = useCallback((id: string) => {
    setRows(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearDay = useCallback(() => {
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
    };
    
    setRows([initialRow]);
    saveToStorage([initialRow]);
  }, [saveToStorage]);

  // Load records on date change
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    rows,
    loading,
    addRow,
    updateRow,
    removeRow,
    clearDay,
    computeRowTotal,
  };
}