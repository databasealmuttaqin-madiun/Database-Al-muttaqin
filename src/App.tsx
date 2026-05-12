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
  const statusColors = {
    aktif: 'border-emerald-500',
    sakit: 'border-rose-500',
    pulang: 'border-amber-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 ${statusColors[status]}`}
      id={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-4xl font-bold text-slate-900 mt-1">{value}</h3>
    </motion.div>
  );
};

const SantriCard = ({ santri }: any) => {
  const statusConfig = {
    aktif: { badge: 'badge-aktif', label: 'Aktif' },
    sakit: { badge: 'badge-sakit', label: 'Sakit' },
    pulang: { badge: 'badge-pulang', label: 'Pulang' },
  };

  const config = statusConfig[santri.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative group hover:border-blue-200 hover:shadow-md transition-all"
      id={`santri-card-${santri.id}`}
    >
      <span className={`badge ${config.badge} absolute top-4 right-4`}>
        {config.label}
      </span>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-900 text-lg leading-tight pr-16">{santri.nama}</h4>
        <p className="text-sm text-slate-500 font-medium">{santri.kelas}</p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'input' | 'search' | 'edit-status'>('dashboard');
  const [santris, setSantris] = useState<Santri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SantriStatus | 'all'>('all');
  
  // Selection state for Update Status
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<SantriStatus>('aktif');

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
            { id: 'search', icon: Search, label: 'Pencarian' },
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
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-8"
              id="search-view"
            >
              <div className="max-w-2xl mx-auto w-full md:hidden">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-lg transition-all outline-none"
                    placeholder="Ketik nama atau kelas..."
                  />
                </div>
              </div>

              {searchQuery && (
                <div className="space-y-8">
                   <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                     <h3 className="font-extrabold text-slate-400 uppercase tracking-[0.2em] text-[10px]">
                       Hasil Pencarian ({filteredSantri.length})
                     </h3>
                     <button onClick={() => setSearchQuery('')} className="text-[10px] uppercase font-bold text-blue-600 hover:underline">Hapus Filter</button>
                   </div>

                   {filteredSantri.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSantri.map((s) => (
                          <SantriCard key={s.id} santri={s} />
                        ))}
                     </div>
                   ) : (
                     <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                       <Users size={64} className="mx-auto mb-6 text-slate-100" />
                       <p className="text-slate-400 font-bold text-lg">Waduh! data "{searchQuery}" tidak ada.</p>
                       <p className="text-sm text-slate-300">Coba cek ejaan atau gunakan kriteria pencarian lain.</p>
                     </div>
                   )}
                </div>
              )}
              
              {!searchQuery && (
                <div className="text-center py-32 select-none">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                     <Search size={48} className="text-blue-200" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-300 uppercase tracking-widest">Siap Mencari...</p>
                  <p className="text-slate-400 text-sm mt-2">Gunakan input pencarian di atas untuk mulai.</p>
                </div>
              )}
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
          { id: 'search', icon: Search },
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
