/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Search, 
  Menu, 
  X,
  CreditCard,
  GraduationCap,
  Activity,
  Home,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Filter,
  Loader2,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { santriService } from './lib/supabase';
import { Santri, SantriStatus } from './types';

// Components
const StatCard = ({ title, value, delay = 0, status }: { title: string, value: number, delay?: number, status: SantriStatus }) => {
  const statusColors: Record<string, string> = {
    aktif: 'border-emerald-500',
    sakit: 'border-rose-500',
    pulang: 'border-amber-500'
  };

  const colorClass = statusColors[status] || 'border-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 ${colorClass}`}
      id={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-4xl font-bold text-slate-900 mt-1">{value}</h3>
    </motion.div>
  );
};

const SantriCard = ({ santri }: any) => {
  const statusConfig: Record<string, { badge: string; label: string }> = {
    aktif: { badge: 'badge-aktif', label: 'Aktif' },
    sakit: { badge: 'badge-sakit', label: 'Sakit' },
    pulang: { badge: 'badge-pulang', label: 'Pulang' },
  };

  const statusKey = (santri?.status || 'aktif').toLowerCase().trim();
  const config = statusConfig[statusKey] || statusConfig['aktif'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
      id={`santri-card-${santri?.id || Math.random()}`}
    >
      <span className={`badge ${config.badge} absolute top-4 right-4`}>
        {config.label}
      </span>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 text-lg leading-tight pr-16">{santri?.nama || 'Tanpa Nama'}</h4>
        <p className="text-sm text-slate-500 font-medium">{santri?.kelas || 'Tanpa Kelas'}</p>
      </div>
      {santri?.nfc_id && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-500">
          <CreditCard size={12} className="text-blue-500" />
          <span>NFC: {santri.nfc_id}</span>
        </div>
      )}
    </motion.div>
  );
};

const SupabaseRLSGuide = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sqlDisableRLS = `ALTER TABLE santri DISABLE ROW LEVEL SECURITY;`;
  
  const sqlEnablePolicies = `-- Buat polisi SELECT (BACA)
CREATE POLICY "Allow public select" ON santri FOR SELECT USING (true);

-- Buat polisi INSERT (TAMBAH)
CREATE POLICY "Allow public insert" ON santri FOR INSERT WITH CHECK (true);

-- Buat polisi UPDATE (PERBARUI)
CREATE POLICY "Allow public update" ON santri FOR UPDATE USING (true) WITH CHECK (true);`;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-850 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-widest">
        <AlertCircle size={18} />
        <span>Solusi Gagal Input & Update (Supabase RLS)</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        Penting: Hambatan berupa error <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-300 text-[10px]">row-level security policy</code> atau <code className="bg-slate-800 px-1 py-0.5 rounded text-rose-300 text-[10px]">Gagal update</code> terjadi dikarenakan keamanan <b>Row Level Security (RLS)</b> sedang aktif di tabel Supabase dan menutup akses penulisan publik.
      </p>

      <div className="space-y-4 pt-2 border-t border-slate-800/80">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-slate-200">⚡ Solusi 1 - Matikan RLS (Paling Praktis):</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Buka Dashboard Supabase Anda, cari menu <b className="text-slate-200">SQL Editor</b> di samping kiri, buat New Query, tempelkan perintah berikut, lalu tekan <b className="text-blue-400">Run</b>:
          </p>
          <div className="relative bg-[#0c101c] p-3 rounded-lg border border-slate-800 font-mono text-xs flex justify-between items-center text-emerald-400">
            <span className="truncate pr-2">{sqlDisableRLS}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(sqlDisableRLS, 'disable')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] px-3 py-1.5 rounded font-bold whitespace-nowrap active:scale-95 transition-all"
            >
              {copied === 'disable' ? 'Tersalin! ✅' : 'Salin SQL 📋'}
            </button>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <p className="text-xs font-bold text-slate-200">🔒 Solusi 2 - Aktifkan Izin Akses Umum (Tanpa Mematikan RLS):</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Bila ingin RLS tetap menyala, copy query ini lalu jalankan di <b className="text-slate-200">SQL Editor</b> Supabase Anda untuk membuka hak akses SELECT, INSERT, dan UPDATE:
          </p>
          <div className="relative bg-[#0c101c] p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300">
            <pre className="overflow-x-auto whitespace-pre leading-relaxed pr-2">{sqlEnablePolicies}</pre>
            <div className="flex justify-end pt-2 mt-2 border-t border-slate-800/40">
              <button
                type="button"
                onClick={() => copyToClipboard(sqlEnablePolicies, 'policies')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] px-3 py-1.5 rounded font-bold active:scale-95 transition-all"
              >
                {copied === 'policies' ? 'Tersalin! ✅' : 'Salin Semua SQL 📋'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'input' | 'nfc' | 'edit-status'>('dashboard');
  const [santris, setSantris] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SantriStatus | 'all'>('all');
  
  // Selection state for Update Status
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<SantriStatus>('aktif');

  // NFC specific states
  const [selectedNfcKelas, setSelectedNfcKelas] = useState<string>('');
  const [selectedNfcSantriId, setSelectedNfcSantriId] = useState<number | null>(null);
  const [nfcSerialInput, setNfcSerialInput] = useState<string>('');
  const [searchNfcSerial, setSearchNfcSerial] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ nama: '', kelas: '', status: 'aktif' as SantriStatus });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchSantri = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await santriService.getAllSantri();
      setSantris(data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Gagal memuat data dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSantri();
  }, []);

  const stats = useMemo(() => {
    return {
      aktif: santris.filter(s => s.status === 'aktif').length,
      sakit: santris.filter(s => s.status === 'sakit').length,
      pulang: santris.filter(s => s.status === 'pulang').length,
      total: santris.length
    };
  }, [santris]);

  const classes = useMemo(() => {
    const set = new Set(santris.map(s => s.kelas));
    return Array.from(set).sort();
  }, [santris]);

  const santriInSelectedClass = useMemo(() => {
    return santris.filter(s => s.kelas === selectedKelas);
  }, [santris, selectedKelas]);

  const santriInSelectedNfcClass = useMemo(() => {
    return santris.filter(s => s.kelas === selectedNfcKelas);
  }, [santris, selectedNfcKelas]);

  const foundNfcSantri = useMemo(() => {
    if (!searchNfcSerial.trim()) return null;
    return santris.find(s => s.nfc_id?.toLowerCase().trim() === searchNfcSerial.toLowerCase().trim());
  }, [santris, searchNfcSerial]);

  const filteredSantri = useMemo(() => {
    return santris.filter(s => {
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.kelas.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [santris, searchQuery, statusFilter]);

  const handleUpdateStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSantriId) return;

    try {
      setSubmitting(true);
      setMessage(null);
      const updated = await santriService.updateSantriStatus(selectedSantriId, newStatus);
      
      // Check if any row was actually updated
      if (!updated.id) {
        throw new Error('Update gagal. Pastikan RLS di Supabase mengizinkan UPDATE.');
      }

      setMessage({ type: 'success', text: 'Status santri berhasil diperbarui' });
      await fetchSantri(); // Ensure data is re-fetched before timeout
      
      setTimeout(() => {
        setActiveTab('data');
        setMessage(null);
        setSelectedSantriId(null);
        setSelectedKelas('');
      }, 1500);
    } catch (error: any) {
      console.error('Update status error:', error);
      setMessage({ type: 'error', text: `Gagal: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNfc = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedNfcSantriId || !nfcSerialInput.trim()) return;

    try {
      setSubmitting(true);
      setMessage(null);
      const updated = await santriService.updateSantriNfc(selectedNfcSantriId, nfcSerialInput.trim());
      
      if (!updated.id) {
        throw new Error('Update NFC gagal. Pastikan tabel "santri" memiliki kolom "nfc_id" (tipe TEXT) di Supabase.');
      }

      setMessage({ type: 'success', text: `NFC serial "${nfcSerialInput}" berhasil dikoordinasikan untuk ${updated.nama}` });
      await fetchSantri();
      
      setTimeout(() => {
        setActiveTab('data');
        setMessage(null);
        setSelectedNfcSantriId(null);
        setSelectedNfcKelas('');
        setNfcSerialInput('');
      }, 1500);
    } catch (error: any) {
      console.error('Update NFC error:', error);
      setMessage({ type: 'error', text: `Gagal menautkan NFC: ${error.message || 'Error tidak diketahui'}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSantri = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.kelas) return;

    try {
      setSubmitting(true);
      setMessage(null);
      const result = await santriService.addSantri(formData);
      
      if (!result.id) {
        throw new Error('Gagal menyimpan. Cek Policy INSERT di Supabase.');
      }

      setMessage({ type: 'success', text: 'Data santri berhasil didaftarkan' });
      setFormData({ nama: '', kelas: '', status: 'aktif' });
      await fetchSantri();
      
      setTimeout(() => {
        setActiveTab('data');
        setMessage(null);
      }, 1500);
    } catch (error: any) {
      console.error('Submit error:', error);
      setMessage({ 
        type: 'error', 
        text: `Gagal: ${error.message}` 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-0 md:pl-64 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f172a] h-screen fixed left-0 top-0 z-40 overflow-hidden">
        <div className="p-8 flex flex-col gap-1 border-b border-slate-800/50" id="site-logo">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">PONDOK PESANTREN AL MUTTAQIN</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Database Pondok</p>
        </div>

        <nav className="mt-6 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'data', icon: Users, label: 'Data Siswa' },
            { id: 'edit-status', icon: Activity, label: 'Ubah Status' },
            { id: 'input', icon: UserPlus, label: 'Input Santri' },
            { id: 'nfc', icon: CreditCard, label: 'Menu NFC' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              id={`nav-desktop-${item.id}`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-[9px] text-slate-500 mb-2 uppercase font-bold tracking-wider">Supabase Connection</p>
            <p className="text-[10px] font-mono text-emerald-400 truncate opacity-70">jangan lupa pagi sore nya</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 md:flex hidden items-center justify-between px-8 sticky top-0 z-30 shadow-sm shadow-slate-100">
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau kelas santri..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 w-80 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                />
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('input')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-blue-200 flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Santri
              </button>
              <div className="h-8 w-[1px] bg-slate-200 mx-2" />
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-sm">
                AD
              </div>
           </div>
        </header>

        <main className="p-4 md:p-8 flex-1">
          {/* Mobile Header */}
          <header className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:hidden">
              <div className="flex flex-col">
                <h1 className="font-bold text-lg text-slate-900 leading-tight">PONDOK PESANTREN AL MUTTAQIN</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeTab}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">AD</div>
          </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
              id="dashboard-view"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Ringkasan Statistik</h2>
                  <p className="text-slate-500 text-sm">Halo Admin, berikut perkembangan data santri hari ini.</p>
                </div>
                <div className="text-[10px] text-slate-500 font-bold px-3 py-1 bg-white rounded-lg border border-slate-200 uppercase tracking-widest">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Santri Aktif" value={stats.aktif} status="aktif" delay={0.1} />
                <StatCard title="Santri Sakit" value={stats.sakit} status="sakit" delay={0.2} />
                <StatCard title="Santri Pulang" value={stats.pulang} status="pulang" delay={0.3} />
              </div>

              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Statistik Kehadiran
                  </h3>
                  <p className="text-xs font-bold text-slate-400">Total: {stats.total} Santri</p>
                </div>
                <div className="flex items-center h-5 rounded-full bg-slate-100 overflow-hidden mb-8 border border-white">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.aktif / stats.total) * 100}%` }} className="h-full bg-emerald-500" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.pulang / stats.total) * 100}%` }} className="h-full bg-amber-500" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.sakit / stats.total) * 100}%` }} className="h-full bg-rose-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                   <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Aktif</span>
                     </div>
                     <p className="text-2xl font-bold text-emerald-900">{stats.aktif}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/50">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full bg-amber-500" />
                       <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pulang</span>
                     </div>
                     <p className="text-2xl font-bold text-amber-900">{stats.pulang}</p>
                   </div>
                   <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100/50">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full bg-rose-500" />
                       <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Sakit</span>
                     </div>
                     <p className="text-2xl font-bold text-rose-900">{stats.sakit}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
              id="data-view"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Data Santri Terkini</h2>
                  <p className="text-slate-500 text-sm">Kelola status dan informasi santri secara berkala.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  {(['all', 'aktif', 'sakit', 'pulang'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                        statusFilter === status 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search bar inside student data for both desktop and mobile */}
              <div className="relative group max-w-md shadow-sm rounded-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau kelas siswa..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl py-3.5 pl-11 pr-12 w-full text-sm outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-medium text-slate-700"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-center">
                  <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
                  <h4 className="font-bold text-rose-900 mb-2">Terjadi Kesalahan</h4>
                  <p className="text-rose-600 text-sm mb-6">{error}</p>
                  <button 
                    onClick={fetchSantri}
                    className="bg-rose-600 text-white font-bold px-6 py-2 rounded-xl text-sm"
                  >
                    Coba Lagi
                  </button>
                  <div className="mt-8 text-left text-xs bg-white/50 p-4 rounded-lg border border-rose-100">
                    <p className="font-bold mb-2">Tips Penyelesaian:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-500">
                      <li>Pastikan tabel <b>santri</b> sudah ada di Supabase.</li>
                      <li>Pastikan kolom <b>nama, kelas, status</b> sudah ada.</li>
                      <li>Cek apakah <b>RLS (Row Level Security)</b> di Supabase sudah memiliki Policy untuk SELECT.</li>
                    </ul>
                  </div>
                </div>
              )}

              {!error && loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-300">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="font-semibold text-sm uppercase tracking-widest">Sinkronisasi Data...</p>
                </div>
              ) : filteredSantri.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSantri.map((s) => (
                    <SantriCard key={s.id} santri={s} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-slate-200" size={32} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2 text-xl">Data Belum Tersedia</h4>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm">Tidak ditemukan data santri untuk kategori yang Anda pilih saat ini.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
              id="input-view"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold">Input Santri Baru</h2>
                <p className="text-gray-500">Silahkan lengkapi formulir di bawah ini.</p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <p className="text-sm font-medium">{message.text}</p>
                </motion.div>
              )}

              <form onSubmit={handleAddSantri} className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Informasi Personal</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <Users size={18} />
                      </div>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                        placeholder="Nama Lengkap Santri"
                        required
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <GraduationCap size={18} />
                      </div>
                      <input
                        type="text"
                        value={formData.kelas}
                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                        placeholder="Kelas / Jenjang Pendidikan"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Status Kedatangan (Default: AKTIF)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['aktif', 'sakit', 'pulang'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`py-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
                          formData.status === s 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic font-medium px-1">* Santri baru otomatis berstatus Aktif jika tidak diubah</p>
                </div>

                <button
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                >
                  {submitting ? <Loader2 className="animate-spin" size={24} /> : <Plus size={24} />}
                  Daftarkan Santri
                </button>
              </form>

              {/* RLS Troubleshooting Guide */}
              <div className="mt-8">
                <SupabaseRLSGuide />
              </div>
            </motion.div>
          )}

          {activeTab === 'edit-status' && (
            <motion.div
              key="edit-status"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
              id="edit-status-view"
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold">Ubah Status Santri</h2>
                <p className="text-gray-500">Update keberadaan santri yang sudah terdaftar.</p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <p className="text-sm font-medium">{message.text}</p>
                </motion.div>
              )}

              <form onSubmit={handleUpdateStatus} className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Pilih Kelas</label>
                  <select
                    value={selectedKelas}
                    onChange={(e) => {
                      setSelectedKelas(e.target.value);
                      setSelectedSantriId(null);
                    }}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <AnimatePresence>
                  {selectedKelas && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Pilih Santri</label>
                      <select
                        value={selectedSantriId || ''}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          setSelectedSantriId(id);
                          const s = santris.find(x => x.id === id);
                          if (s) setNewStatus(s.status);
                        }}
                        className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer"
                        required
                      >
                        <option value="">-- Pilih Nama Santri --</option>
                        {santriInSelectedClass.map(s => (
                          <option key={s.id} value={s.id}>{s.nama} ({s.status})</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedSantriId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Status Baru</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['aktif', 'sakit', 'pulang'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewStatus(s)}
                            className={`py-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
                              newStatus === s 
                              ? 'border-blue-600 bg-blue-50 text-blue-700' 
                              : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  disabled={submitting || !selectedSantriId}
                  className="w-full bg-slate-900 border border-slate-800 hover:bg-black text-white font-bold py-5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                  Update Status Santri
                </button>
              </form>

              {/* RLS Troubleshooting Guide */}
              <div className="mt-8">
                <SupabaseRLSGuide />
              </div>
            </motion.div>
          )}

          {activeTab === 'nfc' && (
            <motion.div
              key="nfc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-8 max-w-4xl mx-auto"
              id="nfc-view"
            >
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sistem Kartu NFC</h2>
                <p className="text-slate-500 text-sm">Registrasi serial number kartu NFC siswa dan lacak kepemilikan kartu.</p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-100' 
                      : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <p className="text-sm font-medium">{message.text}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Section 1: Cek Pemilik Kartu (Scan/Lookup) */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Search size={18} className="text-blue-600" />
                      Cari Pemilik Kartu NFC
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Masukkan atau tempelkan serial number kartu NFC untuk mendeteksi siapa pemiliknya secara instan.</p>
                  </div>

                  <div className="relative group">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-650 transition-colors" />
                    <input
                      type="text"
                      value={searchNfcSerial}
                      onChange={(e) => setSearchNfcSerial(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-semibold uppercase tracking-wider text-slate-800"
                      placeholder="Tempel / ketik serial number NFC..."
                    />
                    {searchNfcSerial && (
                      <button
                        type="button"
                        onClick={() => setSearchNfcSerial('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Deteksi Owner Result */}
                  <div className="pt-4 border-t border-slate-100">
                    {searchNfcSerial.trim() === '' ? (
                      <div className="text-center py-10 text-slate-350 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <CreditCard size={40} className="mx-auto text-slate-200 mb-3 animate-pulse" />
                        <p className="text-xs font-semibold text-slate-500">Menunggu pemindaian kartu...</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Silakan scan kartu atau masukkan Serial Number di atas.</p>
                      </div>
                    ) : foundNfcSantri ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-xl space-y-3 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-1/3 -translate-y-1/3" />
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Kartu NFC Aktif & Terdaftar ✅
                        </span>
                        
                        <div className="space-y-1 pt-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identitas Pemilik</p>
                          <h4 className="font-extrabold text-[#0f172a] text-lg leading-tight">{foundNfcSantri.nama}</h4>
                          <p className="text-sm text-slate-600 font-semibold">Kelas: {foundNfcSantri.kelas}</p>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-[10px] text-slate-400 font-bold">Status Kehadiran:</span>
                            <span className={`badge text-[10px] px-2 py-0.5 font-bold rounded capitalize ${
                              foundNfcSantri.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' :
                              foundNfcSantri.status === 'sakit' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {foundNfcSantri.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-rose-50/50 border border-rose-100 p-5 rounded-xl text-center space-y-2"
                      >
                        <AlertCircle size={24} className="text-rose-400 mx-auto" />
                        <p className="font-bold text-rose-900 text-sm">Kartu Tidak Dikenali</p>
                        <p className="text-xs text-rose-500 leading-normal">
                          Nomor kartu <code className="bg-rose-100 hover:bg-rose-200 px-1 py-0.5 rounded font-mono font-bold text-[11px] text-rose-800 uppercase">{searchNfcSerial}</code> belum terdaftar pada siswa manapun.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNfcSerialInput(searchNfcSerial);
                            // Set focus / open assignment fields
                          }}
                          className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-md transition-all active:scale-95 mt-1"
                        >
                          Tautkan Kartu Ini Ke Siswa
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Section 2: Registrasi Kartu NFC Baru */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <UserPlus size={18} className="text-blue-600" />
                      Registrasi Kartu NFC Siswa
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Tautkan serial number kartu NFC ke identitas santri yang sudah terdaftar.</p>
                  </div>

                  <form onSubmit={handleUpdateNfc} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Pilih Kelas</label>
                      <select
                        value={selectedNfcKelas}
                        onChange={(e) => {
                          setSelectedNfcKelas(e.target.value);
                          setSelectedNfcSantriId(null);
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer text-sm text-slate-700"
                        required
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedNfcKelas && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Pilih Santri</label>
                          <select
                            value={selectedNfcSantriId || ''}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setSelectedNfcSantriId(id);
                              const s = santris.find(x => x.id === id);
                              if (s && s.nfc_id) {
                                setNfcSerialInput(s.nfc_id);
                              } else {
                                setNfcSerialInput('');
                              }
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-bold appearance-none cursor-pointer text-sm text-slate-700"
                            required
                          >
                            <option value="">-- Pilih Nama Santri --</option>
                            {santriInSelectedNfcClass.map(s => (
                              <option key={s.id} value={s.id}>{s.nama} {s.nfc_id ? `(NFC Terdaftar: ${s.nfc_id})` : '(Belum ada kartu)'}</option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                      {selectedNfcSantriId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Serial Number NFC/RFID</label>
                          <input
                            type="text"
                            value={nfcSerialInput}
                            onChange={(e) => setNfcSerialInput(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all font-semibold uppercase text-sm text-slate-800 tracking-wider"
                            placeholder="Ketik/Scan No. Seri baru..."
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={submitting || !selectedNfcSantriId || !nfcSerialInput.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed mt-2"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                      Simpan Serial NFC
                    </button>
                  </form>
                </div>
              </div>

              {/* NFC SQL Guide & Troubleshooting */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-widest">
                  <AlertCircle size={18} />
                  <span>Petunjuk Penting - Kolom Database NFC</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apabila penyimpanan NFC menyebabkan error, hal tersebut berarti kolom <code className="bg-slate-800 px-1.5 py-0.5 rounded text-rose-300 text-[10px] font-mono">nfc_id</code> belum terdaftar di tabel <b>santri</b> Supabase Anda. 
                  Sila salin perintah SQL di bawah ini dan jalankan pada <b className="text-slate-200">SQL Editor</b> Supabase Anda untuk menambahkan kolom tersebut secara otomatis:
                </p>
                <div className="relative bg-[#0c101c] p-3 rounded-lg border border-slate-800 font-mono text-xs flex justify-between items-center text-emerald-400">
                  <span className="truncate pr-2">ALTER TABLE santri ADD COLUMN IF NOT EXISTS nfc_id TEXT;</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("ALTER TABLE santri ADD COLUMN IF NOT EXISTS nfc_id TEXT;");
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] px-3 py-1.5 rounded font-bold whitespace-nowrap active:scale-95 transition-all"
                  >
                    {copiedSql ? 'Tersalin! ✅' : 'Salin SQL 📋'}
                  </button>
                </div>
              </div>

              {/* List of currently registered NFC cards */}
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    Daftar Kartu NFC Terdaftar
                  </h3>
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-bold">
                    {santris.filter(s => s.nfc_id).length} Kartu
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                        <th className="pb-3 pl-2">Nama Santri</th>
                        <th className="pb-3">Kelas</th>
                        <th className="pb-3">Nomor Seri NFC</th>
                        <th className="pb-3 text-right pr-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {santris.filter(s => s.nfc_id).length > 0 ? (
                        santris.filter(s => s.nfc_id).map(s => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pl-2 font-bold text-slate-850">{s.nama}</td>
                            <td className="py-3 text-slate-500 font-semibold">{s.kelas}</td>
                            <td className="py-3 font-mono font-bold text-blue-600 uppercase tracking-widest">{s.nfc_id}</td>
                            <td className="py-3 text-right pr-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchNfcSerial(s.nfc_id || '');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                              >
                                Detail Card 🔍
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                            Belum ada kartu NFC yang ditautkan ke siswa.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'data', icon: Users },
          { id: 'edit-status', icon: Activity },
          { id: 'input', icon: UserPlus },
          { id: 'nfc', icon: CreditCard },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`p-3 rounded-2xl transition-all relative ${
              activeTab === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            }`}
            id={`nav-mobile-${item.id}`}
          >
            <item.icon size={22} className={activeTab === item.id ? 'stroke-[2.5px]' : ''} />
            {activeTab === item.id && (
              <motion.div 
                layoutId="nav-pill-mobile" 
                className="absolute -top-1 left-0 right-0 mx-auto w-1 h-1 bg-blue-600 rounded-full" 
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
