"use client";

import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Scale, CreditCard, RefreshCw, Plus,
  Trash2, Search, ArrowRight, ShieldAlert, Award, FileText, CheckCircle, Upload,
  Layers, LogOut, Tag, UserPlus, X, Calendar
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

const WASTE_SUBTYPES = {
  'Plastik': ['PET Campur', 'Kerasan', 'Bodongan', 'Gelas Plastik', 'Kantong HD'],
  'Kertas': ['Koran', 'Buku', 'Dus/Karton', 'HVS', 'Kertas Duplex'],
  'Logam': ['Besi Tipis', 'Besi Tebal', 'Aluminium', 'Kaleng', 'Tembaga'],
  'Kaca': ['Botol Kaca Bening', 'Botol Kaca Cokelat', 'Pecahan Kaca'],
  'Minyak': ['Minyak Jelantah'],
  'Lainnya': ['Elektronik', 'Karet', 'Styrofoam', 'Lain-lain']
};

const getPengepulForCategory = (kategori) => {
  if (kategori === 'Minyak') return 'Metro Oil';
  return 'Bali Wastu Lestari';
};

const SAMPLE_NASABAHS = [
  { customer_id: 'WW-BA-0041', name: 'Siti Rahayu', pos_id: 'BA' },
  { customer_id: 'WW-BA-0027', name: 'Budi Wahyono', pos_id: 'BA' },
  { customer_id: 'WW-BA-0088', name: 'Murti Astuti', pos_id: 'BA' },
  { customer_id: 'WW-BA-0013', name: 'Dewi Hapsari', pos_id: 'BA' },
  { customer_id: 'WW-BA-0109', name: 'Rudi Santoso', pos_id: 'BA' },
  { customer_id: 'WW-BA-0076', name: 'Putri Ningrum', pos_id: 'BA' },
  { customer_id: 'WW-BA-0142', name: 'Hani Lestari', pos_id: 'BA' }
];

const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getInitials = (name) => {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 1).toUpperCase();
  return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
};

const formatNasabahId = (id, posId = 'BA') => {
  if (!id) return `WW-${(posId || 'BA').toUpperCase()}-0001`;
  if (id.startsWith('WW-')) return id;
  const numPart = id.replace(/[^0-9]/g, '').padStart(4, '0') || '0001';
  const regionPart = (posId || 'BA').toUpperCase();
  return `WW-${regionPart}-${numPart}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '14 Jan 2023';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function Home() {
  // Simulation Role States
  const [activeRole, setActiveRole] = useState('ADMIN_POS'); // ADMIN_PUSAT or ADMIN_POS
  const [activePosId, setActivePosId] = useState('BA'); // Baliarum default
  const [posList, setPosList] = useState([]);

  // Data State
  const [metrics, setMetrics] = useState({});
  const [nasabahs, setNasabahs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedVendorPrices, setSelectedVendorPrices] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('V-BB');

  // UI Tabs / Modals
  const [pusatTab, setPusatTab] = useState('dashboard'); // dashboard, pos, pricing, logs
  const [posTab, setPosTab] = useState('dashboard'); // dashboard, nasabah, penimbangan, jenis_sampah, tabungan, penarikan, harga_sampah, laporan_bulanan, history, pengaturan
  const [settingsSubTab, setSettingsSubTab] = useState('profil'); // profil, pengguna, jadwal, backup

  // Search & Filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [nasabahFilterStatus, setNasabahFilterStatus] = useState('ALL');
  const [transaksiFilterStatus, setTransaksiFilterStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('SETORAN'); // SETORAN, NASABAH, HARGA, PENARIKAN
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);

  // Forms state
  const [newPosForm, setNewPosForm] = useState({ pos_id: '', pos_name: '', address: '' });
  const [newNasabahForm, setNewNasabahForm] = useState({ name: '', address: '', phone: '' });

  // Price Update State
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceForm, setPriceForm] = useState({ buy_price: '', sell_price: '' });

  // Penimbangan Deposit Form State
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [nasabahSearchText, setNasabahSearchText] = useState('');
  const [isNasabahSuggestOpen, setIsNasabahSuggestOpen] = useState(false);
  const [tanggalSetor, setTanggalSetor] = useState(getCurrentDateTimeLocal());
  const [weighItems, setWeighItems] = useState([
    { kategori: '', jenis: '', berat: '', pengepul: 'Bali Wastu Lestari' }
  ]);
  const [weighSummary, setWeighSummary] = useState(null);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState(1);

  // Global Toast / Alert state
  const [toastMsg, setToastMsg] = useState('');
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // 1. Fetch POS list & categories on load
  useEffect(() => {
    fetchPOS();
    fetchVendors();
    fetchCategories();
  }, []);

  // 2. Fetch dependencies when active POS or role changes
  useEffect(() => {
    refreshData();
  }, [activeRole, activePosId, selectedVendorId]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const showAlert = (text, type = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  const refreshData = () => {
    fetchMetrics();
    fetchNasabahList();
    fetchHistory();
    fetchAuditLogs();
    if (selectedVendorId) {
      fetchVendorPrices(selectedVendorId);
    }
  };

  // --- API FETCH CALLS ---

  const fetchPOS = async () => {
    try {
      const res = await fetch(`${API_BASE}/pos`);
      const data = await res.json();
      setPosList(data);
      if (data.length > 0 && !data.find(p => p.pos_id === activePosId)) {
        setActivePosId(data[0].pos_id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE}/pos/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/prices/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMetrics = async () => {
    try {
      const query = activeRole === 'ADMIN_POS' ? `?pos_id=${activePosId}` : '';
      const res = await fetch(`${API_BASE}/transactions/metrics${query}`);
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNasabahList = async () => {
    try {
      const posQuery = activeRole === 'ADMIN_POS' ? `pos_id=${activePosId}` : '';
      const searchQuery = customerSearch ? `search=${customerSearch}` : '';
      const query = [posQuery, searchQuery].filter(Boolean).join('&');

      const res = await fetch(`${API_BASE}/nasabah?${query}`);
      const data = await res.json();
      setNasabahs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const query = activeRole === 'ADMIN_POS' ? `?pos_id=${activePosId}` : '';
      const res = await fetch(`${API_BASE}/transactions/history${query}`);
      const data = await res.json();
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit`);
      const data = await res.json();
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVendorPrices = async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE}/prices/vendor/${vendorId}`);
      const data = await res.json();
      setSelectedVendorPrices(data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- ACTIONS ---

  const handleRegisterNasabah = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/nasabah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newNasabahForm, pos_id: activePosId })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Nasabah '${data.name}' berhasil terdaftar (${data.customer_id})`);
        setNewNasabahForm({ name: '', address: '', phone: '' });
        setIsModalOpen(false);
        refreshData();
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const availableNasabahs = nasabahs.length > 0 ? nasabahs : SAMPLE_NASABAHS;

  const filteredNasabahSuggestions = availableNasabahs.filter(n => {
    const query = (nasabahSearchText || '').trim().toLowerCase();
    if (!query) return false;
    const name = (n.name || '').toLowerCase();
    const id = (n.customer_id || '').toLowerCase();
    const formattedId = formatNasabahId(n.customer_id, n.pos_id).toLowerCase();
    const nameWords = name.split(/\s+/);
    return (
      name.startsWith(query) ||
      nameWords.some(w => w.startsWith(query)) ||
      id.startsWith(query) ||
      formattedId.startsWith(query)
    );
  });

  const handleDepositSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedNasabah && !nasabahSearchText) {
      showAlert('Silakan masukkan/pilih nama nasabah terlebih dahulu', 'danger');
      return;
    }
    const validItems = weighItems.filter(item => item.kategori && item.berat);
    if (validItems.length === 0) {
      showAlert('Silakan isi minimal 1 detail sampah', 'danger');
      return;
    }

    try {
      showToast(`Setoran (${validItems.length} detail sampah) berhasil disimpan ✓`);
      setIsModalOpen(false);
      setWeighItems([{ kategori: '', jenis: '', berat: '', pengepul: 'Bali Wastu Lestari' }]);
      setSelectedNasabah(null);
      setNasabahSearchText('');
      refreshData();
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!selectedNasabah || !withdrawAmount) return;
    try {
      const res = await fetch(`${API_BASE}/transactions/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedNasabah.customer_id,
          pos_id: activePosId,
          amount: parseFloat(withdrawAmount),
          proof_image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample_receipt.png',
          created_by: `admin-pos-${activePosId.toLowerCase()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Penarikan Rp ${parseFloat(withdrawAmount).toLocaleString('id-ID')} berhasil dicairkan!`);
        setIsModalOpen(false);
        setWithdrawAmount('');
        setSelectedNasabah(null);
        refreshData();
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };



  const renderSidebarItem = (id, label, icon, currentTab, setTab) => {
    const isActive = currentTab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        className={`sb-item ${isActive ? 'active' : ''}`}
      >
        {icon} {label}
      </button>
    );
  };

  const pageTitles = {
    dashboard: { title: 'Dashboard', sub: '/ Ringkasan Operasional' },
    nasabah: { title: 'Data Nasabah', sub: '/ Daftar Nasabah' },
    transaksi: { title: 'Transaksi Setor', sub: '/ Semua Transaksi' },
    penimbangan: { title: 'Transaksi Setor', sub: '/ Form & Catat Timbangan' },
    jenis: { title: 'Jenis Sampah', sub: '/ Kategori Sampah' },
    jenis_sampah: { title: 'Jenis Sampah', sub: '/ Kategori Sampah' },
    tabungan: { title: 'Tabungan', sub: '/ Rekening Nasabah' },
    penarikan: { title: 'Penarikan Saldo', sub: '/ Kelola Penarikan' },
    harga: { title: 'Harga Sampah', sub: '/ Daftar Harga' },
    harga_sampah: { title: 'Harga Sampah', sub: '/ Daftar Harga' },
    laporan: { title: 'Laporan Bulanan', sub: '/ Rekap Bulanan' },
    laporan_bulanan: { title: 'Laporan Bulanan', sub: '/ Rekap Bulanan' },
    history: { title: 'Riwayat Ledger', sub: '/ Log Mutasi POS' },
    pengaturan: { title: 'Pengaturan', sub: '/ Konfigurasi Sistem' }
  };

  const currentTitle = activeRole === 'ADMIN_PUSAT' 
    ? { title: 'Pusat Administrative Console', sub: `/ Master Panel - ${pusatTab}` }
    : (pageTitles[posTab] || { title: 'Dashboard', sub: '/ Ringkasan Operasional' });

  return (
    <div className="app-shell">
      {/* Global Alert Notification */}
      {alertMsg.text && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 1000,
          background: alertMsg.type === 'danger' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {alertMsg.type === 'danger' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alertMsg.text}</span>
        </div>
      )}

      {/* Toast Popup Notification */}
      {toastMsg && (
        <div className="toast show">
          <span className="toast-dot"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ════════════════ LEFT SIDEBAR ════════════════ */}
      <aside className="sidebar">
        <div className="flex flex-col grow">
          {/* Brand Logo Header */}
          <div className="sb-logo" style={{ paddingLeft: '20px' }}>
            <div className="sb-icon">🌿</div>
            <div>
              <div className="sb-name">Wadhah Wangi</div>
              <div className="sb-tag">
                {activeRole === 'ADMIN_PUSAT' ? 'Pusat Admin' : 'Bank Sampah'}
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sb-nav">
            {activeRole === 'ADMIN_PUSAT' ? (
              <>
                <div className="sb-sec">Pengelolaan</div>
                {renderSidebarItem('dashboard', 'Overview', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M14 9q-.425 0-.712-.288T13 8V4q0-.425.288-.712T14 3h6q.425 0 .713.288T21 4v4q0 .425-.288.713T20 9zM4 13q-.425 0-.712-.288T3 12V4q0-.425.288-.712T4 3h6q.425 0 .713.288T11 4v8q0 .425-.288.713T10 13zm10 8q-.425 0-.712-.288T13 20v-8q0-.425.288-.712T14 11h6q.425 0 .713.288T21 12v8q0 .425-.288.713T20 21zM4 21q-.425 0-.712-.288T3 20v-4q0-.425.288-.712T4 15h6q.425 0 .713.288T11 16v4q0 .425-.288.713T10 21z" />
                  </svg>
                ), pusatTab, setPusatTab)}
                {renderSidebarItem('pos', 'POS & Vendors', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                  </svg>
                ), pusatTab, setPusatTab)}
                {renderSidebarItem('pricing', 'Master Price', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7m15.91 4.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.11 0-2 .89-2 2v7c0 .55.22 1.05.59 1.41l8.99 9c.37.36.87.59 1.42.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.56-.23-1.06-.59-1.42" />
                  </svg>
                ), pusatTab, setPusatTab)}
                {renderSidebarItem('logs', 'Audit Trail', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M14.71 2.29A1 1 0 0 0 14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71zM9 19H7v-6h2zm4 0h-2v-8h2zm4 0h-2v-4h2zM13 9V3.5L18.5 9z" />
                  </svg>
                ), pusatTab, setPusatTab)}
              </>
            ) : (
              <>
                <div className="sb-sec">Utama</div>
                {renderSidebarItem('dashboard', 'Dashboard', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M14 9q-.425 0-.712-.288T13 8V4q0-.425.288-.712T14 3h6q.425 0 .713.288T21 4v4q0 .425-.288.713T20 9zM4 13q-.425 0-.712-.288T3 12V4q0-.425.288-.712T4 3h6q.425 0 .713.288T11 4v8q0 .425-.288.713T10 13zm10 8q-.425 0-.712-.288T13 20v-8q0-.425.288-.712T14 11h6q.425 0 .713.288T21 12v8q0 .425-.288.713T20 21zM4 21q-.425 0-.712-.288T3 20v-4q0-.425.288-.712T4 15h6q.425 0 .713.288T11 16v4q0 .425-.288.713T10 21z" />
                  </svg>
                ), posTab, setPosTab)}
                
                {/* Active customers pill count */}
                <button
                  onClick={() => setPosTab('nasabah')}
                  className={`sb-item ${posTab === 'nasabah' ? 'active' : ''}`}
                >
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '10px' }}>
                    <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                  </svg>
                  Nasabah <span className="sb-pill">{nasabahs.length || 142}</span>
                </button>

                {renderSidebarItem('penimbangan', 'Transaksi Setor', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M17.997 4.17A3 3 0 0 1 20 7v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 2.003-2.83A4 4 0 0 0 10 8h4a4 4 0 0 0 3.98-3.597zM15 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-4H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m-1-9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4z" />
                  </svg>
                ), posTab, setPosTab)}
                {renderSidebarItem('jenis_sampah', 'Jenis Sampah', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="m21.82 15.42l-2.5 4.33c-.49.86-1.4 1.31-2.32 1.25h-2v2l-2.5-4.5L15 14v2h2.82l-2.22-3.85l4.33-2.5l1.8 3.12c.52.77.59 1.8.09 2.65M9.21 3.06h5c.98 0 1.83.57 2.24 1.39l1 1.74l1.73-1l-2.64 4.41l-5.15.09l1.73-1l-1.41-2.45l-2.21 3.85l-4.34-2.5l1.8-3.12c.41-.83 1.26-1.41 2.25-1.41m-4.16 16.7l-2.5-4.33c-.49-.85-.42-1.87.09-2.64l1-1.73l-1.73-1l5.14.08l2.65 4.42l-1.73-1L6.56 16H11v5H7.4a2.51 2.51 0 0 1-2.35-1.24" />
                  </svg>
                ), posTab, setPosTab)}

                <div className="sb-sec">Keuangan</div>
                {renderSidebarItem('tabungan', 'Tabungan', (
                  <svg className="ic" viewBox="0 0 48 48" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <g fill="currentColor">
                      <path fillRule="evenodd" d="M14.953 16.63c4.816 1.86 10.603 1.86 15.418-.002a29.3 29.3 0 0 1 5.153 7.487c.872.134 1.707.38 2.49.723c-1.427-3.644-3.841-7.186-6.436-9.838l3.694-5.4a16 16 0 0 0-1.886-1.054C30.946 7.361 27.027 6 22.711 6c-4.406 0-8.431 1.42-10.886 2.621q-.366.18-.684.35c-.427.23-.787.444-1.069.629L13.74 15c-8.59 9.038-14.99 26.997 8.971 26.997a37 37 0 0 0 4.906-.3a10 10 0 0 1-1.713-1.826q-1.472.124-3.193.126c-5.785 0-9.413-1.091-11.58-2.591c-2.075-1.437-2.986-3.37-3.115-5.632c-.134-2.35.585-5.093 1.932-7.87c1.285-2.648 3.079-5.197 5.005-7.274m14.251-1.702l2.958-4.323c-2.75.198-6.023.844-9.173 1.756c-2.25.65-4.749.551-7.065.124a25 25 0 0 1-1.737-.386l1.92 2.827c4.116 1.465 8.982 1.465 13.097.002m-15.4-5.012c.8.238 1.635.445 2.483.602c2.15.396 4.307.454 6.146-.079a54 54 0 0 1 6.53-1.471C27.123 8.414 24.972 8 22.71 8c-3.445 0-6.658.961-8.907 1.916" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M22.67 28c1.021 0 1.953.383 2.66 1.013a10 10 0 0 0-.892 2.051A2 2 0 0 0 22.67 30v4c.517 0 .988-.196 1.343-.518a10 10 0 0 0 .134 2.236A4 4 0 0 1 22.67 36v1h-2v-1a4 4 0 0 1-3.772-2.667a1 1 0 1 1 1.886-.666A2 2 0 0 0 20.67 34v-4a4 4 0 0 1 0-8v-1h2v1a4 4 0 0 1-3.772 2.667a1 1 0 1 1-1.886.666A2 2 0 0 0 22.67 24zm-2-4a2 2 0 0 0 0 4z" clipRule="evenodd" />
                      <path d="m35 34.42l1.19-1.067l1.335 1.49L34 38.001l-3.524-3.16l1.335-1.489L33 34.419V30h2z" />
                      <path fillRule="evenodd" d="M34 42a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12" clipRule="evenodd" />
                    </g>
                  </svg>
                ), posTab, setPosTab)}
                {renderSidebarItem('penarikan', 'Penarikan', (
                  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="m18.935 13.945l-.67-3.648c-.29-1.576-.435-2.364-1.008-2.83S15.86 7 14.213 7H9.787c-1.647 0-2.47 0-3.044.467c-.573.466-.718 1.254-1.008 2.83l-.67 3.648c-.6 3.271-.901 4.907.024 5.98C6.014 21 7.724 21 11.142 21h1.716c3.418 0 5.128 0 6.053-1.074s.625-2.71.024-5.98Z" />
                    <path strokeLinejoin="round" d="M12 10.5V17m-2.5-2l2.5 2.5l2.5-2.5" />
                  </svg>
                ), posTab, setPosTab)}
                {renderSidebarItem('harga_sampah', 'Harga Sampah', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7m15.91 4.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.11 0-2 .89-2 2v7c0 .55.22 1.05.59 1.41l8.99 9c.37.36.87.59 1.42.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.56-.23-1.06-.59-1.42" />
                  </svg>
                ), posTab, setPosTab)}

                <div className="sb-sec">Laporan</div>
                {renderSidebarItem('laporan_bulanan', 'Laporan Bulanan', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M14.71 2.29A1 1 0 0 0 14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71zM9 19H7v-6h2zm4 0h-2v-8h2zm4 0h-2v-4h2zM13 9V3.5L18.5 9z" />
                  </svg>
                ), posTab, setPosTab)}
                {renderSidebarItem('history', 'Riwayat Ledger', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8z" />
                  </svg>
                ), posTab, setPosTab)}

                <div className="sb-sec">Sistem</div>
                {renderSidebarItem('pengaturan', 'Pengaturan', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2" />
                  </svg>
                ), posTab, setPosTab)}
              </>
            )}
          </nav>

          {/* User Footer Profile */}
          <div className="sb-footer">
            <div className="sb-av">AS</div>
            <div>
              <div className="sb-un">Admin Sistem</div>
              <div className="sb-ur">Pengelola Bank</div>
            </div>
            <button className="sb-logout" title="Keluar" onClick={() => showToast('Disimulasi log out')}>
              <svg viewBox="0 0 14 14" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                <path fillRule="evenodd" d="M2.5.351a40.5 40.5 0 0 1 5.74 0c1.136.081 2.072.874 2.264 1.932a2.25 2.25 0 0 0-2.108 2.28H4.754a2.25 2.25 0 0 0 0 4.5h3.642a2.25 2.25 0 0 0 2.145 2.281l-.004.085c-.06 1.2-1.06 2.132-2.296 2.22a40.5 40.5 0 0 1-5.742 0C1.263 13.561.263 12.63.203 11.43a91 91 0 0 1 0-8.859C.263 1.372 1.263.439 2.5.351m7.356 5.462L9.661 4.7a1 1 0 0 1 1.432-1.067c1.107.553 2.178 1.624 2.731 2.731a1 1 0 0 1 0 .895c-.553 1.107-1.624 2.178-2.731 2.731A1 1 0 0 1 9.66 8.924l.195-1.111H4.754a1 1 0 1 1 0-2z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <div className="main-content">
        {/* Topbar Header — CONTAINS THE UNIFIED ACTION BUTTONS */}
        <header className="topbar">
          <span className="tb-title">
            {currentTitle.title} <span className="tb-sub">{currentTitle.sub}</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="sim-toggle-group">
              <button 
                className={`sim-toggle-btn ${activeRole === 'ADMIN_PUSAT' ? 'active' : ''}`}
                onClick={() => setActiveRole('ADMIN_PUSAT')}
              >
                Pusat Admin
              </button>
              <button 
                className={`sim-toggle-btn ${activeRole === 'ADMIN_POS' ? 'active' : ''}`}
                onClick={() => setActiveRole('ADMIN_POS')}
              >
                POS Local
              </button>
            </div>

            <button className="btn btn-ghost" onClick={() => showToast('Laporan berhasil diekspor ✓')}>↓ Ekspor</button>
            
            <div className="speed-dial-container">
              <button 
                className="btn btn-gold" 
                style={{ width: '108px', justifyContent: 'center' }}
                onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
              >
                {isAddDropdownOpen ? <X size={16} /> : <Plus size={16} />}
                <span>{isAddDropdownOpen ? 'Tutup' : 'Tambah'}</span>
              </button>

              {isAddDropdownOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 45 }} 
                    onClick={() => setIsAddDropdownOpen(false)} 
                  />
                  <div className="speed-dial-stack">
                    <button 
                      className="speed-dial-pill"
                      onClick={() => {
                        setModalType('SETORAN');
                        setIsModalOpen(true);
                        setIsAddDropdownOpen(false);
                      }}
                    >
                      <Scale size={18} />
                      <span>Penimbangan</span>
                    </button>

                    <button 
                      className="speed-dial-pill"
                      onClick={() => {
                        setModalType('NASABAH');
                        setIsModalOpen(true);
                        setIsAddDropdownOpen(false);
                      }}
                    >
                      <UserPlus size={18} />
                      <span>Nasabah</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="page">
          {activeRole === 'ADMIN_PUSAT' ? (
            /* ─── PUSAT ADMIN VIEW ─── */
            <div>
              <div className="ph2 mb-4">
                <div className="ph2-l">
                  <div className="pt">Pusat <span>Dashboard</span></div>
                  <div className="ps">Ringkasan konsolidasi operasional seluruh POS node</div>
                </div>
              </div>

              <div className="stats mb-6">
                <div className="stat hl">
                  <div className="stat-top"><div className="si si-w">🏢</div><span className="trend t-uw">Active</span></div>
                  <div className="stat-num">{posList.length} POS</div>
                  <div className="stat-lbl">Total Node Pos Terdaftar</div>
                </div>
                <div className="stat">
                  <div className="stat-top"><div className="si si-g">💰</div></div>
                  <div className="stat-num">Rp {(metrics.totalCustomerBalance || 4837500).toLocaleString('id-ID')}</div>
                  <div className="stat-lbl">Total Tabungan Nasabah</div>
                </div>
                <div className="stat">
                  <div className="stat-top"><div className="si si-gr">📈</div><span className="trend t-up">30%</span></div>
                  <div className="stat-num">Rp {(metrics.totalPusatProfit || 1450000).toLocaleString('id-ID')}</div>
                  <div className="stat-lbl">Profit Share Pusat</div>
                </div>
                <div className="stat">
                  <div className="stat-top"><div className="si si-a">🏬</div><span className="trend t-up">70%</span></div>
                  <div className="stat-num">Rp {(metrics.totalPosProfit || 3387500).toLocaleString('id-ID')}</div>
                  <div className="stat-lbl">Profit Share POS Node</div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div className="panel-title">Daftar POS & Penanggung Jawab</div>
                </div>
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>ID POS</th>
                        <th>Nama POS</th>
                        <th>Alamat</th>
                        <th>Status Node</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posList.map(pos => (
                        <tr key={pos.pos_id}>
                          <td><span className="mono" style={{ fontWeight: 700 }}>{pos.pos_id}</span></td>
                          <td><strong className="mn">{pos.pos_name}</strong></td>
                          <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{pos.address}</td>
                          <td><span className="badge b-g">Aktif Operational</span></td>
                          <td>
                            <button className="btn btn-sm btn-ghost" onClick={() => { setActivePosId(pos.pos_id); setActiveRole('ADMIN_POS'); }}>
                              Kelola Node
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ─── POS LOCAL ADMIN VIEWS ─── */
            <>
              {/* PAGE: DASHBOARD */}
              {(posTab === 'dashboard') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Ringkasan <span>Operasional</span></div>
                      <div className="ps">Periode Februari 2025 · Diperbarui Hari Ini, 09:14 WIB</div>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M13 20V8.8c.5-.2 1-.5 1.3-.9l3.5 1.3l-2.9 6.8c-.5 2 1 3 3.5 3s4.1-1 3.5-3l-2.6-6.3l.9.3l.7-1.9L15 6c0-1.2-.7-2.4-2-2.9c-1.2-.5-2.5 0-3.3.9L3.9 2l-.7 1.8l1.6.6L2.1 11c-.5 2 1 3 3.5 3s4.1-1 3.5-3L6.6 5.1L9 6c0 1.2.7 2.4 2 2.9V20H2v2h20v-2zm6.9-4h-3l1.5-3.8zM7.1 11h-3l1.5-3.8zm4-5.3c.2-.5.8-.8 1.3-.6s.8.8.6 1.3s-.8.8-1.3.6s-.8-.8-.6-1.3"/>
                          </svg>
                        </div>
                        <span className="trend t-uw">↑ 12%</span>
                      </div>
                      <div className="stat-num">{metrics.totalWeightKg ? `${metrics.totalWeightKg} kg` : '1.247 kg'}</div>
                      <div className="stat-lbl">Total Sampah Bulan Ini</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                          </svg>
                        </div>
                        <span className="trend t-up">↑ 8 baru</span>
                      </div>
                      <div className="stat-num">{nasabahs.length || 142}</div>
                      <div className="stat-lbl">Nasabah Aktif</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 48 48" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <g fill="currentColor">
                              <path fillRule="evenodd" d="M14.953 16.63c4.816 1.86 10.603 1.86 15.418-.002a29.3 29.3 0 0 1 5.153 7.487c.872.134 1.707.38 2.49.723c-1.427-3.644-3.841-7.186-6.436-9.838l3.694-5.4a16 16 0 0 0-1.886-1.054C30.946 7.361 27.027 6 22.711 6c-4.406 0-8.431 1.42-10.886 2.621q-.366.18-.684.35c-.427.23-.787.444-1.069.629L13.74 15c-8.59 9.038-14.99 26.997 8.971 26.997a37 37 0 0 0 4.906-.3a10 10 0 0 1-1.713-1.826q-1.472.124-3.193.126c-5.785 0-9.413-1.091-11.58-2.591c-2.075-1.437-2.986-3.37-3.115-5.632c-.134-2.35.585-5.093 1.932-7.87c1.285-2.648 3.079-5.197 5.005-7.274m14.251-1.702l2.958-4.323c-2.75.198-6.023.844-9.173 1.756c-2.25.65-4.749.551-7.065.124a25 25 0 0 1-1.737-.386l1.92 2.827c4.116 1.465 8.982 1.465 13.097.002m-15.4-5.012c.8.238 1.635.445 2.483.602c2.15.396 4.307.454 6.146-.079a54 54 0 0 1 6.53-1.471C27.123 8.414 24.972 8 22.71 8c-3.445 0-6.658.961-8.907 1.916" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M22.67 28c1.021 0 1.953.383 2.66 1.013a10 10 0 0 0-.892 2.051A2 2 0 0 0 22.67 30v4c.517 0 .988-.196 1.343-.518a10 10 0 0 0 .134 2.236A4 4 0 0 1 22.67 36v1h-2v-1a4 4 0 0 1-3.772-2.667a1 1 0 1 1 1.886-.666A2 2 0 0 0 20.67 34v-4a4 4 0 0 1 0-8v-1h2v1a4 4 0 0 1-3.772 2.667a1 1 0 1 1-1.886.666A2 2 0 0 0 22.67 24zm-2-4a2 2 0 0 0 0 4z" clipRule="evenodd" />
                              <path d="m35 34.42l1.19-1.067l1.335 1.49L34 38.001l-3.524-3.16l1.335-1.489L33 34.419V30h2z" />
                              <path fillRule="evenodd" d="M34 42a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12" clipRule="evenodd" />
                            </g>
                          </svg>
                        </div>
                        <span className="trend t-up">↑ 14%</span>
                      </div>
                      <div className="stat-num">
                        {metrics.totalCustomerBalance 
                          ? `Rp ${(metrics.totalCustomerBalance / 1000000).toFixed(1).replace('.', ',')}jt` 
                          : 'Rp 4,8jt'}
                      </div>
                      <div className="stat-lbl">Total Tabungan</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M17.997 4.17A3 3 0 0 1 20 7v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 2.003-2.83A4 4 0 0 0 10 8h4a4 4 0 0 0 3.98-3.597zM15 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-4H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m-1-9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4z" />
                          </svg>
                        </div>
                        <span className="trend t-up">↑ 18</span>
                      </div>
                      <div className="stat-num">{history.length || 238}</div>
                      <div className="stat-lbl">Transaksi Bulan Ini</div>
                    </div>
                  </div>

                  <div className="g2 dashboard-grid">
                    <div className="panel g2-main-panel">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">Setoran Terbaru</div>
                          <div className="panel-sub">{history.length || 6} dari {history.length || 238} transaksi</div>
                        </div>
                        <span className="panel-link" onClick={() => setPosTab('penimbangan')}>Lihat semua →</span>
                      </div>
                      <div className="tw g2-tw">
                        <table className="g2-table">
                          <thead>
                            <tr>
                              <th>Nasabah</th>
                              <th>ID</th>
                              <th>Berat Total</th>
                              <th>Harga</th>
                              <th>Waktu</th>
                              <th>Tanggal Penimbangan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.length > 0 ? (
                              history.slice(0, 6).map((h, i) => (
                                <tr key={h.id || i}>
                                  <td>
                                    <div className="tdm">
                                      <div className="av">{getInitials(h.customer_name)}</div>
                                      <div className="mn">{h.customer_name}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="td-d">
                                      {formatNasabahId(h.customer_id, h.pos_id || activePosId)}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="mono tw-c">
                                      {h.details?.[0]?.quantity ? `${h.details[0].quantity} kg` : '3,5 kg'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="mono tp-c">
                                      Rp. {(h.amount || 5250).toLocaleString('id-ID')}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="td-d">
                                      {h.created_at ? new Date(h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WITA' : '11.35 WITA'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="td-d">
                                      {formatDate(h.created_at || h.date) || '24 Feb 2026'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <>
                                <tr><td><div className="tdm"><div className="av">SR</div><div className="mn">Siti Rahayu</div></div></td><td><span className="td-d">WW-BA-0041</span></td><td><span className="mono tw-c">3,5 kg</span></td><td><span className="mono tp-c">Rp. 5.250</span></td><td><span className="td-d">11.35 WITA</span></td><td><span className="td-d">24 Feb 2026</span></td></tr>
                                <tr><td><div className="tdm"><div className="av">BW</div><div className="mn">Budi Wahyono</div></div></td><td><span className="td-d">WW-BA-0027</span></td><td><span className="mono tw-c">7,2 kg</span></td><td><span className="mono tp-c">Rp. 7.200</span></td><td><span className="td-d">10.50 WITA</span></td><td><span className="td-d">24 Feb 2026</span></td></tr>
                                <tr><td><div className="tdm"><div className="av">MA</div><div className="mn">Murti Astuti</div></div></td><td><span className="td-d">WW-BA-0088</span></td><td><span className="mono tw-c">2,0 kg</span></td><td><span className="mono tp-c">Rp. 6.000</span></td><td><span className="td-d">09.15 WITA</span></td><td><span className="td-d">24 Feb 2026</span></td></tr>
                                <tr><td><div className="tdm"><div className="av">DH</div><div className="mn">Dewi Hapsari</div></div></td><td><span className="td-d">WW-BA-0013</span></td><td><span className="mono tw-c">5,5 kg</span></td><td><span className="mono tp-c">Rp. 2.750</span></td><td><span className="td-d">14.20 WITA</span></td><td><span className="td-d">23 Feb 2026</span></td></tr>
                                <tr><td><div className="tdm"><div className="av">RS</div><div className="mn">Rudi Santoso</div></div></td><td><span className="td-d">WW-BA-0109</span></td><td><span className="mono tw-c">1,8 kg</span></td><td><span className="mono tp-c">Rp. 7.200</span></td><td><span className="td-d">11.05 WITA</span></td><td><span className="td-d">23 Feb 2026</span></td></tr>
                                <tr><td><div className="tdm"><div className="av">PN</div><div className="mn">Putri Ningrum</div></div></td><td><span className="td-d">WW-BA-0076</span></td><td><span className="mono tw-c">4,1 kg</span></td><td><span className="mono tp-c">Rp. 6.150</span></td><td><span className="td-d">08.45 WITA</span></td><td><span className="td-d">22 Feb 2026</span></td></tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="g2-side-stack">
                      <div className="panel">
                        <div className="panel-head">
                          <div><div className="panel-title">Komposisi Sampah</div><div className="panel-sub">Berat bulan ini</div></div>
                        </div>
                        <div className="wl">
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#4a90d9' }}></span>Plastik</span><span className="wv">380 kg<span className="wp">30%</span></span></div><div className="bt"><div className="bf" style={{ width: '30%', background: '#4a90d9' }}></div></div></div>
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#e8b323' }}></span>Kertas</span><span className="wv">315 kg<span className="wp">25%</span></span></div><div className="bt"><div className="bf" style={{ width: '25%', background: '#e8b323' }}></div></div></div>
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#3d6b40' }}></span>Logam</span><span className="wv">226 kg<span className="wp">18%</span></span></div><div className="bt"><div className="bf" style={{ width: '18%', background: '#3d6b40' }}></div></div></div>
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#7a5c2e' }}></span>Kaca</span><span className="wv">163 kg<span className="wp">13%</span></span></div><div className="bt"><div className="bf" style={{ width: '13%', background: '#7a5c2e' }}></div></div></div>
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#e67e22' }}></span>Minyak</span><span className="wv">100 kg<span className="wp">8%</span></span></div><div className="bt"><div className="bf" style={{ width: '8%', background: '#e67e22' }}></div></div></div>
                          <div className="wr"><div className="wm"><span className="wn"><span className="wd" style={{ background: '#b06030' }}></span>Lainnya</span><span className="wv">63 kg<span className="wp">6%</span></span></div><div className="bt"><div className="bf" style={{ width: '6%', background: '#b06030' }}></div></div></div>
                        </div>
                        <div className="ms">
                          <div className="ms-c"><div className="ms-v">1.247</div><div className="ms-l">Total kg</div></div>
                          <div className="ms-c"><div className="ms-v">6</div><div className="ms-l">Kategori</div></div>
                        </div>
                      </div>

                      <div className="panel">
                        <div className="panel-head"><div className="panel-title">Aktivitas Terkini</div></div>
                        <div className="al">
                          <div className="ai"><div className="adot"></div><div><div className="at"><strong>Siti Rahayu</strong> setor 3,5 kg plastik</div><div className="atime">09:14 WIB</div></div></div>
                          <div className="ai"><div className="adot"></div><div><div className="at"><strong>Budi W.</strong> tarik Rp 50.000</div><div className="atime">08:52 WIB</div></div></div>
                          <div className="ai"><div className="adot"></div><div><div className="at">Nasabah baru <strong>Hani Lestari</strong></div><div className="atime">08:30 WIB</div></div></div>
                          <div className="ai"><div className="adot"></div><div><div className="at">Harga <strong>logam</strong> → Rp 3.000/kg</div><div className="atime">07:00 WIB</div></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: NASABAH */}
              {posTab === 'nasabah' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Data <span>Nasabah</span></div>
                      <div className="ps">{nasabahs.length || 142} nasabah terdaftar · Februari 2025</div>
                    </div>
                    <div className="ph2-r">
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--faint)' }} />
                        <input
                          className="fi"
                          type="text"
                          placeholder="Cari nasabah..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') fetchNasabahList(); }}
                          style={{ paddingLeft: '34px', width: '220px', height: '36px' }}
                        />
                      </div>
                      <button className="btn btn-gold" onClick={() => { setModalType('NASABAH'); setIsModalOpen(true); }}>+ Nasabah Baru</button>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                          </svg>
                        </div>
                        <span className="trend t-up">+8</span>
                      </div>
                      <div className="stat-num">{nasabahs.length || 142}</div>
                      <div className="stat-lbl">Total Nasabah</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: 'var(--forest)',
                            WebkitMaskImage: 'url("https://api.iconify.design/famicons:checkmark-circle.svg")',
                            maskImage: 'url("https://api.iconify.design/famicons:checkmark-circle.svg")',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain'
                          }} />
                        </div>
                        <span className="trend t-up">92%</span>
                      </div>
                      <div className="stat-num">131</div>
                      <div className="stat-lbl">Nasabah Aktif</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: 'var(--forest)',
                            WebkitMaskImage: 'url("https://api.iconify.design/material-symbols:add-circle-rounded.svg")',
                            maskImage: 'url("https://api.iconify.design/material-symbols:add-circle-rounded.svg")',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain'
                          }} />
                        </div>
                        <span className="trend t-up">↑ 4</span>
                      </div>
                      <div className="stat-num">8</div>
                      <div className="stat-lbl">Baru Bulan Ini</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: 'var(--forest)',
                            WebkitMaskImage: 'url("https://api.iconify.design/mingcute:wallet-4-fill.svg")',
                            maskImage: 'url("https://api.iconify.design/mingcute:wallet-4-fill.svg")',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain'
                          }} />
                        </div>
                      </div>
                      <div className="stat-num">Rp 33rb</div>
                      <div className="stat-lbl">Rata-rata Tabungan</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div><div className="panel-title">Daftar Nasabah</div></div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          className="fi" 
                          style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}
                          value={nasabahFilterStatus}
                          onChange={(e) => setNasabahFilterStatus(e.target.value)}
                        >
                          <option value="ALL">Semua Status</option>
                          <option value="ACTIVE">Aktif</option>
                          <option value="INACTIVE">Tidak Aktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="tabs">
                      <button className={`tab ${nasabahFilterStatus === 'ALL' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('ALL')}>
                        Semua ({nasabahs.length || 142})
                      </button>
                      <button className={`tab ${nasabahFilterStatus === 'ACTIVE' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('ACTIVE')}>
                        Aktif (131)
                      </button>
                      <button className={`tab ${nasabahFilterStatus === 'INACTIVE' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('INACTIVE')}>
                        Tidak Aktif (11)
                      </button>
                    </div>

                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Nasabah</th>
                            <th>ID Nasabah</th>
                            <th>Alamat</th>
                            <th>Bergabung</th>
                            <th>Tabungan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nasabahs.length > 0 ? (
                            nasabahs.map(n => (
                              <tr key={n.customer_id}>
                                <td>
                                  <div className="tdm">
                                    <div className="av">{getInitials(n.name)}</div>
                                    <div>
                                      <div className="mn">{n.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>{formatNasabahId(n.customer_id, n.pos_id || activePosId)}</span></td>
                                <td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{n.address}</td>
                                <td><span className="td-d">{formatDate(n.created_at)}</span></td>
                                <td><span className="mono tp-c">Rp. {parseFloat(n.balance || 0).toLocaleString('id-ID')}</span></td>
                                <td><span className={`badge ${n.status === 'INACTIVE' ? 'b-r' : 'b-g'}`}>{n.status === 'INACTIVE' ? 'Tidak Aktif' : 'Aktif'}</span></td>
                                <td>
                                  <div className="td-act">
                                    <button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button>
                                    <button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <>
                              <tr><td><div className="tdm"><div className="av">SR</div><div><div className="mn">Siti Rahayu</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0041</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Melati No. 12, RT 03</td><td><span className="td-d">14 Jan 2023</span></td><td><span className="mono tp-c">Rp. 87.500</span></td><td><span className="badge b-g">Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av">BW</div><div><div className="mn">Budi Wahyono</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0027</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Mawar No. 5, RT 01</td><td><span className="td-d">05 Nov 2022</span></td><td><span className="mono tp-c">Rp. 124.000</span></td><td><span className="badge b-g">Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av">MA</div><div><div className="mn">Murti Astuti</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0088</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Anggrek No. 8, RT 07</td><td><span className="td-d">18 Mar 2024</span></td><td><span className="mono tp-c">Rp. 42.000</span></td><td><span className="badge b-g">Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av">DH</div><div><div className="mn">Dewi Hapsari</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0013</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Kenanga No. 3, RT 04</td><td><span className="td-d">12 Agt 2022</span></td><td><span className="mono tp-c">Rp. 215.000</span></td><td><span className="badge b-g">Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av" style={{ background: 'var(--red-s)', borderColor: 'rgba(200,60,60,.2)', color: 'var(--red)' }}>PN</div><div><div className="mn">Putri Ningrum</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0076</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Dahlia No. 19, RT 02</td><td><span className="td-d">01 Jun 2023</span></td><td><span className="mono" style={{ color: 'var(--muted)' }}>Rp. 0</span></td><td><span className="badge b-r">Tidak Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av av-g">HL</div><div><div className="mn">Hani Lestari</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink)' }}>WW-BA-0142</span></td><td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Jl. Tulip No. 7, RT 05</td><td><span className="td-d">24 Feb 2025</span></td><td><span className="mono" style={{ color: 'var(--muted)' }}>Rp. 0</span></td><td><span className="badge b-g">Aktif</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost" onClick={() => showToast('Edit detail')}>Edit</button><button className="btn btn-sm btn-ghost" onClick={() => showToast('Detail nasabah')}>Detail</button></div></td></tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: TRANSAKSI SETOR */}
              {(posTab === 'transaksi' || posTab === 'penimbangan') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Transaksi <span>Setor</span></div>
                      <div className="ps">{history.length || 238} transaksi bulan ini</div>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat hl">
                      <div className="stat-top"><div className="si si-w">📋</div><span className="trend t-uw">+18</span></div>
                      <div className="stat-num">{history.length || 238}</div>
                      <div className="stat-lbl">Total Transaksi</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-g">✅</div><span className="trend t-up">84%</span></div>
                      <div className="stat-num">200</div>
                      <div className="stat-lbl">Terverifikasi</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-a">⏳</div></div>
                      <div className="stat-num">30</div>
                      <div className="stat-lbl">Menunggu Proses</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-gr">⚖</div><span className="trend t-up">↑ 12%</span></div>
                      <div className="stat-num">1.247 kg</div>
                      <div className="stat-lbl">Total Berat</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div className="panel-title">Semua Transaksi</div>
                    </div>
                    <div className="tabs">
                      <button className={`tab ${transaksiFilterStatus === 'ALL' ? 'on' : ''}`} onClick={() => setTransaksiFilterStatus('ALL')}>Semua</button>
                      <button className={`tab ${transaksiFilterStatus === 'VERIFIED' ? 'on' : ''}`} onClick={() => setTransaksiFilterStatus('VERIFIED')}>Terverifikasi</button>
                      <button className={`tab ${transaksiFilterStatus === 'PROSES' ? 'on' : ''}`} onClick={() => setTransaksiFilterStatus('PROSES')}>Proses</button>
                      <button className={`tab ${transaksiFilterStatus === 'REJECTED' ? 'on' : ''}`} onClick={() => setTransaksiFilterStatus('REJECTED')}>Ditolak</button>
                    </div>

                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>ID Transaksi</th>
                            <th>Nasabah</th>
                            <th>Jenis Sampah</th>
                            <th>Berat</th>
                            <th>Nilai (Rp)</th>
                            <th>Poin</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-238</span></td><td><div className="tdm"><div className="av">SR</div><div><div className="mn">Siti Rahayu</div></div></div></td><td style={{ color: 'var(--muted)' }}>Plastik</td><td><span className="mono tw-c">3,5 kg</span></td><td><span className="mono">Rp 5.250</span></td><td><span className="mono tp-c">350</span></td><td><span className="badge b-g">Terverifikasi</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Detail</button></td></tr>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-237</span></td><td><div className="tdm"><div className="av">BW</div><div><div className="mn">Budi Wahyono</div></div></div></td><td style={{ color: 'var(--muted)' }}>Kertas</td><td><span className="mono tw-c">7,2 kg</span></td><td><span className="mono">Rp 7.200</span></td><td><span className="mono tp-c">504</span></td><td><span className="badge b-g">Terverifikasi</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Detail</button></td></tr>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-236</span></td><td><div className="tdm"><div className="av">MA</div><div><div className="mn">Murti Astuti</div></div></div></td><td style={{ color: 'var(--muted)' }}>Logam</td><td><span className="mono tw-c">2,0 kg</span></td><td><span className="mono">Rp 6.000</span></td><td><span className="mono tp-c">600</span></td><td><span className="badge b-y">Proses</span></td><td><span className="td-d">24 Feb 25</span></td><td><div className="td-act"><button className="btn btn-sm btn-gold" onClick={() => showToast('Transaksi terverifikasi!')}>✓ Verifikasi</button></div></td></tr>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-235</span></td><td><div className="tdm"><div className="av">DH</div><div><div className="mn">Dewi Hapsari</div></div></div></td><td style={{ color: 'var(--muted)' }}>Kaca</td><td><span className="mono tw-c">5,5 kg</span></td><td><span className="mono">Rp 2.750</span></td><td><span className="mono tp-c">275</span></td><td><span className="badge b-g">Terverifikasi</span></td><td><span className="td-d">23 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Detail</button></td></tr>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-234</span></td><td><div className="tdm"><div className="av">RS</div><div><div className="mn">Rudi Santoso</div></div></div></td><td style={{ color: 'var(--muted)' }}>Elektronik</td><td><span className="mono tw-c">1,8 kg</span></td><td><span className="mono">Rp 7.200</span></td><td><span className="mono tp-c">720</span></td><td><span className="badge b-y">Proses</span></td><td><span className="td-d">23 Feb 25</span></td><td><div className="td-act"><button className="btn btn-sm btn-gold" onClick={() => showToast('Transaksi terverifikasi!')}>✓ Verifikasi</button></div></td></tr>
                          <tr><td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#TRX-2502-233</span></td><td><div className="tdm"><div className="av">PN</div><div><div className="mn">Putri Ningrum</div></div></div></td><td style={{ color: 'var(--muted)' }}>Plastik</td><td><span className="mono tw-c">4,1 kg</span></td><td><span className="mono">Rp 6.150</span></td><td><span className="mono tp-c">410</span></td><td><span className="badge b-r">Ditolak</span></td><td><span className="td-d">22 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Detail</button></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: JENIS SAMPAH */}
              {(posTab === 'jenis' || posTab === 'jenis_sampah') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Jenis <span>Sampah</span></div>
                      <div className="ps">5 kategori aktif terdaftar</div>
                    </div>
                  </div>

                  <div className="card-grid">
                    <div className="card">
                      <div className="card-icon" style={{ background: '#e8f4fd' }}>♻️</div>
                      <div className="card-name">Plastik</div>
                      <div className="card-price">Rp 1.500 / kg</div>
                      <div className="card-meta">Termasuk: botol PET, kantong, wadah plastik keras</div>
                      <div className="card-footer">
                        <div><div style={{ fontSize: '10px', color: 'var(--faint)' }}>Disetor bulan ini</div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>412 kg</div></div>
                        <div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button></div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-icon" style={{ background: '#fdf8e8' }}>📰</div>
                      <div className="card-name">Kertas</div>
                      <div className="card-price">Rp 1.000 / kg</div>
                      <div className="card-meta">Termasuk: koran, karton, kertas HVS, dus</div>
                      <div className="card-footer">
                        <div><div style={{ fontSize: '10px', color: 'var(--faint)' }}>Disetor bulan ini</div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>337 kg</div></div>
                        <div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button></div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-icon" style={{ background: '#f0f5f0' }}>🔩</div>
                      <div className="card-name">Logam</div>
                      <div className="card-price">Rp 3.000 / kg</div>
                      <div className="card-meta">Termasuk: besi, aluminium, tembaga, kaleng</div>
                      <div className="card-footer">
                        <div><div style={{ fontSize: '10px', color: 'var(--faint)' }}>Disetor bulan ini</div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>236 kg</div></div>
                        <div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button></div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-icon" style={{ background: '#e8f5f0' }}>🍶</div>
                      <div className="card-name">Kaca</div>
                      <div className="card-price">Rp 500 / kg</div>
                      <div className="card-meta">Termasuk: botol kaca, pecahan kaca</div>
                      <div className="card-footer">
                        <div><div style={{ fontSize: '10px', color: 'var(--faint)' }}>Disetor bulan ini</div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>174 kg</div></div>
                        <div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button></div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-icon" style={{ background: '#f5eee8' }}>💻</div>
                      <div className="card-name">Elektronik</div>
                      <div className="card-price">Rp 4.000 / kg</div>
                      <div className="card-meta">Termasuk: HP rusak, PCB, kabel, baterai</div>
                      <div className="card-footer">
                        <div><div style={{ fontSize: '10px', color: 'var(--faint)' }}>Disetor bulan ini</div><div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>88 kg</div></div>
                        <div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button></div>
                      </div>
                    </div>

                    <div className="card" style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surf2)' }} onClick={() => showToast('Tambah jenis baru')}>
                      <div style={{ fontSize: '28px', opacity: .3, marginBottom: '10px' }}>+</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>Tambah Jenis Sampah</div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: TABUNGAN */}
              {posTab === 'tabungan' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Tabungan <span>Nasabah</span></div>
                      <div className="ps">Saldo aktif 142 nasabah</div>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat hl">
                      <div className="stat-top"><div className="si si-w">💰</div><span className="trend t-uw">↑ 14%</span></div>
                      <div className="stat-num">Rp 4,8jt</div>
                      <div className="stat-lbl">Total Tabungan</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-g">📊</div></div>
                      <div className="stat-num">Rp 33rb</div>
                      <div className="stat-lbl">Rata-rata / Nasabah</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-a">⭐</div></div>
                      <div className="stat-num">Rp 215rb</div>
                      <div className="stat-lbl">Tabungan Tertinggi</div>
                    </div>
                    <div className="stat">
                      <div className="stat-top"><div className="si si-gr">📅</div><span className="trend t-up">bulan ini</span></div>
                      <div className="stat-num">Rp 620rb</div>
                      <div className="stat-lbl">Total Masuk</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div><div className="panel-title">Rekening Tabungan</div><div className="panel-sub">Saldo dan riwayat per nasabah</div></div>
                    </div>

                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Nasabah</th>
                            <th>No. Rekening</th>
                            <th>Saldo</th>
                            <th>Masuk Bulan Ini</th>
                            <th>Keluar Bulan Ini</th>
                            <th>Tgl Update</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td><div className="tdm"><div className="av">DH</div><div><div className="mn">Dewi Hapsari</div><div className="mid">BSW-0013</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0013-25</span></td><td><span className="mono tp-c">Rp 215.000</span></td><td><span className="mono tw-c">+ Rp 52.750</span></td><td><span className="mono" style={{ color: 'var(--red)' }}>- Rp 0</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                          <tr><td><div className="tdm"><div className="av">BW</div><div><div className="mn">Budi Wahyono</div><div className="mid">BSW-0027</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0027-25</span></td><td><span className="mono tp-c">Rp 124.000</span></td><td><span className="mono tw-c">+ Rp 74.200</span></td><td><span className="mono" style={{ color: 'var(--red)' }}>- Rp 50.000</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                          <tr><td><div className="tdm"><div className="av">SR</div><div><div className="mn">Siti Rahayu</div><div className="mid">BSW-0041</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0041-25</span></td><td><span className="mono tp-c">Rp 87.500</span></td><td><span className="mono tw-c">+ Rp 35.500</span></td><td><span className="mono" style={{ color: 'var(--red)' }}>- Rp 0</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                          <tr><td><div className="tdm"><div className="av">PN</div><div><div className="mn">Putri Ningrum</div><div className="mid">BSW-0076</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0076-25</span></td><td><span className="mono" style={{ color: 'var(--muted)' }}>Rp 0</span></td><td><span className="mono" style={{ color: 'var(--muted)' }}>-</span></td><td><span className="mono" style={{ color: 'var(--muted)' }}>-</span></td><td><span className="td-d">22 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                          <tr><td><div className="tdm"><div className="av">MA</div><div><div className="mn">Murti Astuti</div><div className="mid">BSW-0088</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0088-25</span></td><td><span className="mono tp-c">Rp 42.000</span></td><td><span className="mono tw-c">+ Rp 42.000</span></td><td><span className="mono" style={{ color: 'var(--red)' }}>- Rp 0</span></td><td><span className="td-d">24 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                          <tr><td><div className="tdm"><div className="av">RS</div><div><div className="mn">Rudi Santoso</div><div className="mid">BSW-0109</div></div></div></td><td><span className="mono" style={{ fontSize: '11px' }}>TAB-0109-25</span></td><td><span className="mono tp-c">Rp 57.000</span></td><td><span className="mono tw-c">+ Rp 57.000</span></td><td><span className="mono" style={{ color: 'var(--red)' }}>- Rp 0</span></td><td><span className="td-d">23 Feb 25</span></td><td><button className="btn btn-sm btn-ghost">Riwayat</button></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: PENARIKAN */}
              {posTab === 'penarikan' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Penarikan <span>Saldo</span></div>
                      <div className="ps">Kelola permintaan penarikan nasabah</div>
                    </div>
                  </div>

                  <div className="g2" style={{ gridTemplateColumns: '1fr 280px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="stat hl"><div className="stat-top"><div className="si si-w">↑</div><span className="trend t-uw">bulan ini</span></div><div className="stat-num">Rp 620rb</div><div className="stat-lbl">Total Dicairkan</div></div>
                        <div className="stat"><div className="stat-top"><div className="si si-a">⏳</div></div><div className="stat-num">5</div><div className="stat-lbl">Menunggu Proses</div></div>
                        <div className="stat"><div className="stat-top"><div className="si si-g">✅</div></div><div className="stat-num">28</div><div className="stat-lbl">Selesai Bulan Ini</div></div>
                      </div>

                      <div className="panel">
                        <div className="panel-head"><div className="panel-title">Permintaan Penarikan</div></div>
                        <div className="tabs">
                          <button className="tab on">Semua</button>
                          <button className="tab">Menunggu (5)</button>
                          <button className="tab">Selesai</button>
                        </div>
                        <div className="tw">
                          <table>
                            <thead>
                              <tr>
                                <th>Nasabah</th>
                                <th>Nominal</th>
                                <th>Saldo Sisa</th>
                                <th>Metode</th>
                                <th>Status</th>
                                <th>Tgl Req</th>
                                <th>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td><div className="tdm"><div className="av">BW</div><div><div className="mn">Budi Wahyono</div></div></div></td><td><span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>Rp 50.000</span></td><td><span className="mono tw-c">Rp 74.000</span></td><td style={{ fontSize: '12px', color: 'var(--muted)' }}>Tunai</td><td><span className="badge b-g">Selesai</span></td><td><span className="td-d">24 Feb</span></td><td><button className="btn btn-sm btn-ghost">Cetak</button></td></tr>
                              <tr><td><div className="tdm"><div className="av">SR</div><div><div className="mn">Siti Rahayu</div></div></div></td><td><span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>Rp 30.000</span></td><td><span className="mono tw-c">Rp 57.500</span></td><td style={{ fontSize: '12px', color: 'var(--muted)' }}>Transfer</td><td><span className="badge b-y">Menunggu</span></td><td><span className="td-d">24 Feb</span></td><td><div className="td-act"><button className="btn btn-sm btn-gold" onClick={() => showToast('Penarikan diproses!')}>✓ Proses</button></div></td></tr>
                              <tr><td><div className="tdm"><div className="av">MA</div><div><div className="mn">Murti Astuti</div></div></div></td><td><span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>Rp 20.000</span></td><td><span className="mono tw-c">Rp 22.000</span></td><td style={{ fontSize: '12px', color: 'var(--muted)' }}>Tunai</td><td><span className="badge b-y">Menunggu</span></td><td><span className="td-d">23 Feb</span></td><td><div className="td-act"><button className="btn btn-sm btn-gold" onClick={() => showToast('Penarikan diproses!')}>✓ Proses</button></div></td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="balance-card">
                        <div className="balance-label">Total Saldo Nasabah</div>
                        <div className="balance-amount">Rp 4.837.500</div>
                        <div className="balance-sub">142 rekening aktif · Per 24 Feb 2025</div>
                      </div>

                      <div className="panel">
                        <div className="panel-head"><div className="panel-title">Syarat Penarikan</div></div>
                        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: '1.6' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>•</span><span>Minimum penarikan <strong style={{ color: 'var(--ink)' }}>Rp 10.000</strong></span></div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>•</span><span>Penarikan hanya pada hari <strong style={{ color: 'var(--ink)' }}>Sabtu</strong></span></div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>•</span><span>Bawa <strong style={{ color: 'var(--ink)' }}>buku tabungan</strong> & KTP</span></div>
                            <div style={{ display: 'flex', gap: '8px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>•</span><span>Transfer via BCA/BNI/Mandiri</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: HARGA SAMPAH */}
              {(posTab === 'harga' || posTab === 'harga_sampah') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Harga <span>Sampah</span></div>
                      <div className="ps">Daftar harga beli per kategori · Diperbarui 24 Feb 2025</div>
                    </div>
                  </div>

                  <div className="panel mb-4">
                    <div className="panel-head"><div className="panel-title">Tabel Harga Berlaku</div><div className="panel-sub">Harga per kilogram</div></div>
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Jenis Sampah</th>
                            <th>Harga / kg</th>
                            <th>Poin / kg</th>
                            <th>Min. Setor</th>
                            <th>Berlaku Sejak</th>
                            <th>Diperbarui Oleh</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><div className="tdm"><div className="av" style={{ background: '#e8f4fd', borderColor: '#bdd7f0', color: '#2563a8' }}>♻</div><div><div className="mn">Plastik</div><div className="mid">Botol PET, kantong, hdpe</div></div></div></td>
                            <td><span className="price-big">Rp 1.500<span className="price-unit">/kg</span></span></td>
                            <td><span className="mono tp-c">100 pts</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>0,5 kg</td>
                            <td><span className="td-d">01 Feb 2025</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>Admin Sistem</td>
                            <td><button className="btn btn-sm btn-ghost">Edit</button></td>
                          </tr>
                          <tr>
                            <td><div className="tdm"><div className="av" style={{ background: '#fdf8e8', borderColor: '#e8d89a', color: '#9a6800' }}>📰</div><div><div className="mn">Kertas</div><div className="mid">Koran, karton, HVS, dus</div></div></div></td>
                            <td><span className="price-big">Rp 1.000<span className="price-unit">/kg</span></span></td>
                            <td><span className="mono tp-c">70 pts</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>1 kg</td>
                            <td><span className="td-d">01 Feb 2025</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>Admin Sistem</td>
                            <td><button className="btn btn-sm btn-ghost">Edit</button></td>
                          </tr>
                          <tr>
                            <td><div className="tdm"><div className="av" style={{ background: '#f0f5f0', borderColor: '#9fc4a0', color: '#3d6b40' }}>🔩</div><div><div className="mn">Logam</div><div className="mid">Besi, aluminium, tembaga</div></div></div></td>
                            <td><span className="price-big">Rp 3.000<span className="price-unit">/kg</span></span></td>
                            <td><span className="mono tp-c">300 pts</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>0,5 kg</td>
                            <td><span className="td-d">24 Feb 2025</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>Admin Sistem</td>
                            <td><div style={{ display: 'flex', gap: '6px' }}><button className="btn btn-sm btn-ghost">Edit</button><span className="badge b-g" style={{ fontSize: '9.5px' }}>Baru diupdate</span></div></td>
                          </tr>
                          <tr>
                            <td><div className="tdm"><div className="av" style={{ background: '#e8f5f0', borderColor: '#9fc4b0', color: '#2d7a5e' }}>🍶</div><div><div className="mn">Kaca</div><div className="mid">Botol kaca, pecahan</div></div></div></td>
                            <td><span className="price-big">Rp 500<span className="price-unit">/kg</span></span></td>
                            <td><span className="mono tp-c">50 pts</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>2 kg</td>
                            <td><span className="td-d">01 Jan 2025</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>Admin Sistem</td>
                            <td><button className="btn btn-sm btn-ghost">Edit</button></td>
                          </tr>
                          <tr>
                            <td><div className="tdm"><div className="av" style={{ background: '#f5eee8', borderColor: '#d4b896', color: '#7a5c2e' }}>💻</div><div><div className="mn">Elektronik</div><div className="mid">HP, PCB, kabel, baterai</div></div></div></td>
                            <td><span className="price-big">Rp 4.000<span className="price-unit">/kg</span></span></td>
                            <td><span className="mono tp-c">400 pts</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>0,1 kg</td>
                            <td><span className="td-d">01 Feb 2025</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--muted)' }}>Admin Sistem</td>
                            <td><button className="btn btn-sm btn-ghost">Edit</button></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: LAPORAN */}
              {(posTab === 'laporan' || posTab === 'laporan_bulanan') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Laporan <span>Bulanan</span></div>
                      <div className="ps">Rekap operasional bank sampah</div>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat hl"><div className="stat-top"><div className="si si-w">⚖</div><span className="trend t-uw">↑ 12%</span></div><div className="stat-num">1.247 kg</div><div className="stat-lbl">Total Sampah</div></div>
                    <div className="stat"><div className="stat-top"><div className="si si-g">💵</div><span className="trend t-up">↑ 14%</span></div><div className="stat-num">Rp 1,8jt</div><div className="stat-lbl">Total Nilai Sampah</div></div>
                    <div className="stat"><div className="stat-top"><div className="si si-a">↑</div></div><div className="stat-num">Rp 620rb</div><div className="stat-lbl">Total Penarikan</div></div>
                    <div className="stat"><div className="stat-top"><div className="si si-gr">📋</div></div><div className="stat-num">238</div><div className="stat-lbl">Total Transaksi</div></div>
                  </div>

                  <div className="g2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="panel">
                      <div className="panel-head"><div className="panel-title">Tren Berat Sampah (kg)</div><div className="panel-sub">6 bulan terakhir</div></div>
                      <div style={{ padding: '16px 18px' }}>
                        <div className="chart-placeholder">
                          <div className="bar-item" style={{ height: '55%' }}><span className="bar-label">Sep</span></div>
                          <div className="bar-item" style={{ height: '62%' }}><span className="bar-label">Okt</span></div>
                          <div className="bar-item" style={{ height: '70%' }}><span className="bar-label">Nov</span></div>
                          <div className="bar-item" style={{ height: '68%' }}><span className="bar-label">Des</span></div>
                          <div className="bar-item" style={{ height: '78%' }}><span className="bar-label">Jan</span></div>
                          <div className="bar-item hi" style={{ height: '88%' }}><span className="bar-label">Feb</span></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '11px', color: 'var(--faint)' }}>
                          <span>Maks: <strong style={{ color: 'var(--ink)' }}>1.247 kg</strong> (Feb)</span>
                          <span>Min: <strong style={{ color: 'var(--ink)' }}>842 kg</strong> (Sep)</span>
                          <span>Rata-rata: <strong style={{ color: 'var(--ink)' }}>1.024 kg</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-head"><div className="panel-title">Tren Nilai (Rp)</div><div className="panel-sub">6 bulan terakhir</div></div>
                      <div style={{ padding: '16px 18px' }}>
                        <div className="chart-placeholder">
                          <div className="bar-item" style={{ height: '48%' }}><span className="bar-label">Sep</span></div>
                          <div className="bar-item" style={{ height: '56%' }}><span className="bar-label">Okt</span></div>
                          <div className="bar-item" style={{ height: '65%' }}><span className="bar-label">Nov</span></div>
                          <div className="bar-item" style={{ height: '72%' }}><span className="bar-label">Des</span></div>
                          <div className="bar-item" style={{ height: '80%' }}><span className="bar-label">Jan</span></div>
                          <div className="bar-item hi" style={{ height: '92%' }}><span className="bar-label">Feb</span></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', fontSize: '11px', color: 'var(--faint)' }}>
                          <span>Maks: <strong style={{ color: 'var(--ink)' }}>Rp 1,8jt</strong> (Feb)</span>
                          <span>Min: <strong style={{ color: 'var(--ink)' }}>Rp 980rb</strong> (Sep)</span>
                          <span>Rata-rata: <strong style={{ color: 'var(--ink)' }}>Rp 1,4jt</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: RIWAYAT LEDGER */}
              {posTab === 'history' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Riwayat <span>Ledger POS</span></div>
                      <div className="ps">Rekapitulasi log transaksi & mutasi saldo</div>
                    </div>
                  </div>

                  <div className="panel mb-4">
                    <div className="panel-head">
                      <div className="panel-title">Riwayat Mutasi Saldo</div>
                    </div>
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Tanggal</th>
                            <th>ID Nasabah</th>
                            <th>Nama</th>
                            <th>Tipe</th>
                            <th>Jumlah Mutasi</th>
                            <th>Bagi Hasil (POS / Pusat)</th>
                            <th>Rincian / Bukti</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>Belum ada mutasi transaksi.</td>
                            </tr>
                          ) : (
                            history.map((item, idx) => (
                              <tr key={item.id || idx}>
                                <td><span className="td-d">{new Date(item.date).toLocaleDateString('id-ID')}</span></td>
                                <td><span className="mono" style={{ fontSize: '11px' }}>{item.customer_id}</span></td>
                                <td><strong className="mn">{item.customer_name}</strong></td>
                                <td>
                                  <span className={`badge ${item.type === 'DEPOSIT' ? 'b-g' : 'b-r'}`}>
                                    {item.type}
                                  </span>
                                </td>
                                <td>
                                  <span className={`mono ${item.type === 'DEPOSIT' ? 'tw-c' : ''}`} style={{ color: item.type === 'WITHDRAWAL' ? 'var(--red)' : undefined, fontWeight: 700 }}>
                                    {item.type === 'DEPOSIT' ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                                  </span>
                                </td>
                                <td>
                                  {item.type === 'DEPOSIT' ? (
                                    <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                                      Rp {item.pos_profit.toLocaleString('id-ID')} / Rp {item.pusat_profit.toLocaleString('id-ID')}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--faint)' }}>-</span>
                                  )}
                                </td>
                                <td style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                                  {item.type === 'WITHDRAWAL' ? (
                                    <a href={item.proof_image_url} target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontWeight: 600 }}>
                                      Lihat Bukti Transfer
                                    </a>
                                  ) : (
                                    <span>{item.details?.map(d => `${d.name} (${d.quantity} ${d.unit})`).join(', ')}</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: PENGATURAN */}
              {posTab === 'pengaturan' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Pengaturan <span>Sistem</span></div>
                      <div className="ps">Kelola konfigurasi Bank Sampah Wadhah Wangi</div>
                    </div>
                  </div>

                  <div className="g2" style={{ gridTemplateColumns: '220px 1fr' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        className={`sb-item ${settingsSubTab === 'profil' ? 'active' : ''}`}
                        style={{ borderRadius: '8px', color: settingsSubTab === 'profil' ? 'var(--forest)' : 'var(--muted)', background: settingsSubTab === 'profil' ? 'var(--gold)' : 'none', fontWeight: settingsSubTab === 'profil' ? '600' : '400' }}
                        onClick={() => setSettingsSubTab('profil')}
                      >
                        🏛 Profil Bank
                      </button>
                      <button 
                        className={`sb-item ${settingsSubTab === 'pengguna' ? 'active' : ''}`}
                        style={{ borderRadius: '8px', color: settingsSubTab === 'pengguna' ? 'var(--forest)' : 'var(--muted)', background: settingsSubTab === 'pengguna' ? 'var(--gold)' : 'none', fontWeight: settingsSubTab === 'pengguna' ? '600' : '400' }}
                        onClick={() => setSettingsSubTab('pengguna')}
                      >
                        👤 Pengguna
                      </button>
                      <button 
                        className={`sb-item ${settingsSubTab === 'jadwal' ? 'active' : ''}`}
                        style={{ borderRadius: '8px', color: settingsSubTab === 'jadwal' ? 'var(--forest)' : 'var(--muted)', background: settingsSubTab === 'jadwal' ? 'var(--gold)' : 'none', fontWeight: settingsSubTab === 'jadwal' ? '600' : '400' }}
                        onClick={() => setSettingsSubTab('jadwal')}
                      >
                        📅 Jadwal
                      </button>
                      <button 
                        className={`sb-item ${settingsSubTab === 'backup' ? 'active' : ''}`}
                        style={{ borderRadius: '8px', color: settingsSubTab === 'backup' ? 'var(--forest)' : 'var(--muted)', background: settingsSubTab === 'backup' ? 'var(--gold)' : 'none', fontWeight: settingsSubTab === 'backup' ? '600' : '400' }}
                        onClick={() => setSettingsSubTab('backup')}
                      >
                        💾 Backup
                      </button>
                    </div>

                    <div>
                      {settingsSubTab === 'profil' && (
                        <div className="panel">
                          <div className="panel-head"><div className="panel-title">Profil Bank Sampah</div></div>
                          <div className="mb" style={{ padding: '20px 22px' }}>
                            <div className="fr">
                              <div className="fg"><label className="fl">Nama Bank Sampah</label><input className="fi" defaultValue="Bank Sampah Wadhah Wangi" /></div>
                              <div className="fg"><label className="fl">Kode Bank</label><input className="fi" defaultValue="BSWW-2025" /></div>
                            </div>
                            <div className="fg"><label className="fl">Alamat</label><input className="fi" defaultValue="Jl. Lingkungan Hidup No. 1, RT 05 RW 02" /></div>
                            <div className="fr">
                              <div className="fg"><label className="fl">Kelurahan</label><input className="fi" defaultValue="Wadhah Indah" /></div>
                              <div className="fg"><label className="fl">Kecamatan</label><input className="fi" defaultValue="Sukamaju" /></div>
                            </div>
                            <div className="fr">
                              <div className="fg"><label className="fl">Kota</label><input className="fi" defaultValue="Bandung" /></div>
                              <div className="fg"><label className="fl">Provinsi</label><input className="fi" defaultValue="Jawa Barat" /></div>
                            </div>
                          </div>
                          <div className="mf">
                            <button className="btn btn-ghost">Batal</button>
                            <button className="btn btn-gold" onClick={() => showToast('Profil berhasil disimpan ✓')}>Simpan Perubahan</button>
                          </div>
                        </div>
                      )}

                      {settingsSubTab === 'pengguna' && (
                        <div className="panel">
                          <div className="panel-head"><div className="panel-title">Manajemen Pengguna</div><button className="btn btn-gold btn-sm">+ Tambah User</button></div>
                          <div className="tw">
                            <table>
                              <thead>
                                <tr><th>Nama</th><th>Username</th><th>Role</th><th>Status</th><th>Terakhir Login</th><th>Aksi</th></tr>
                              </thead>
                              <tbody>
                                <tr><td><div className="tdm"><div className="av av-g">AS</div><div><div className="mn">Admin Sistem</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px' }}>admin</span></td><td><span className="badge b-g">Super Admin</span></td><td><span className="badge b-g">Aktif</span></td><td><span className="td-d">Sekarang</span></td><td><button className="btn btn-sm btn-ghost">Edit</button></td></tr>
                                <tr><td><div className="tdm"><div className="av">OP</div><div><div className="mn">Operator 1</div></div></div></td><td><span className="mono" style={{ fontSize: '11.5px' }}>operator1</span></td><td><span className="badge b-y">Operator</span></td><td><span className="badge b-g">Aktif</span></td><td><span className="td-d">23 Feb 25</span></td><td><div className="td-act"><button className="btn btn-sm btn-ghost">Edit</button><button className="btn btn-sm btn-red">Hapus</button></div></td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {settingsSubTab === 'jadwal' && (
                        <div className="panel">
                          <div className="panel-head"><div className="panel-title">Jadwal Operasional</div></div>
                          <div className="mb" style={{ padding: '20px 22px' }}>
                            <div className="fr">
                              <div className="fg"><label className="fl">Hari Buka</label><select className="fsel" defaultValue="Sabtu"><option>Sabtu</option><option>Minggu</option><option>Sabtu & Minggu</option></select></div>
                              <div className="fg"><label className="fl">Jam Buka</label><input className="fi" defaultValue="08:00" /></div>
                            </div>
                            <div className="fr">
                              <div className="fg"><label className="fl">Jam Tutup</label><input className="fi" defaultValue="12:00" /></div>
                              <div className="fg"><label className="fl">Periode Laporan</label><select className="fsel" defaultValue="Bulanan"><option>Bulanan</option><option>Mingguan</option></select></div>
                            </div>
                          </div>
                          <div className="mf"><button className="btn btn-gold" onClick={() => showToast('Jadwal berhasil disimpan ✓')}>Simpan</button></div>
                        </div>
                      )}

                      {settingsSubTab === 'backup' && (
                        <div className="panel">
                          <div className="panel-head"><div className="panel-title">Backup & Restore Data</div></div>
                          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ background: 'var(--surf2)', border: '1px solid var(--line)', borderRadius: '99px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div><div style={{ fontWeight: 600, fontSize: '13.5px' }}>Backup Otomatis</div><div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>Terakhir: 24 Feb 2025 02:00 WIB</div></div>
                              <button className="btn btn-gold" onClick={() => showToast('Backup berhasil dibuat ✓')}>Backup Sekarang</button>
                            </div>
                            <div style={{ background: 'var(--red-s)', border: '1px solid rgba(200,60,60,.15)', borderRadius: '9px', padding: '18px' }}>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--red)', marginBottom: '6px' }}>⚠ Zona Berbahaya</div>
                              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>Reset data akan menghapus semua transaksi dan tidak dapat dikembalikan.</div>
                              <button className="btn btn-red btn-sm" onClick={() => showToast('Fungsi reset dibatasi')}>Reset Data Sistem</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Interactive Modal Dialog */}
      {isModalOpen && (
        <div className="ov" onClick={(e) => { if (e.target.classList.contains('ov')) setIsModalOpen(false); }}>
          <div className="modal">
            <div className="mh">
              <div>
                <div className="mt">
                  {modalType === 'SETORAN' && 'Setoran Baru'}
                  {modalType === 'NASABAH' && 'Registrasi Nasabah Baru'}
                  {modalType === 'HARGA' && 'Update Harga Sampah'}
                  {modalType === 'PENARIKAN' && 'Penarikan Saldo Nasabah'}
                </div>
                <div className="msub">
                  {modalType === 'SETORAN' && 'Isi data setoran sampah nasabah'}
                  {modalType === 'NASABAH' && 'Input data profil nasabah baru'}
                  {modalType === 'HARGA' && 'Ubah daftar harga beli per kg'}
                  {modalType === 'PENARIKAN' && 'Input nominal pencairan saldo'}
                </div>
              </div>
              <button className="mx" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="mb">
              {modalType === 'SETORAN' && (
                <>
                  {/* Row 1: Kode Nasabah & Tanggal Setor */}
                  <div className="fr">
                    <div className="fg">
                      <label className="fl">Kode Nasabah</label>
                      <input 
                        className="fi" 
                        value={selectedNasabah ? formatNasabahId(selectedNasabah.customer_id, selectedNasabah.pos_id) : (nasabahSearchText ? 'WW-BA-0041' : '')}
                        placeholder="WW-BA-0041"
                        disabled 
                        style={{ background: '#f4f6f3', color: '#8a9e8a', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="fg">
                      <label className="fl">Tanggal Setor</label>
                      <input 
                        className="fi" 
                        type="datetime-local"
                        value={tanggalSetor}
                        onChange={(e) => setTanggalSetor(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Nama Nasabah with Typeahead Suggestions */}
                  <div className="fg" style={{ position: 'relative' }}>
                    <label className="fl">Nama Nasabah</label>
                    <input 
                      className="fi" 
                      placeholder="Nama lengkap nasabah" 
                      value={nasabahSearchText}
                      onChange={(e) => {
                        setNasabahSearchText(e.target.value);
                        setIsNasabahSuggestOpen(true);
                        if (!e.target.value) setSelectedNasabah(null);
                      }}
                      onFocus={() => setIsNasabahSuggestOpen(true)}
                    />
                    {isNasabahSuggestOpen && nasabahSearchText && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 240 }} onClick={() => setIsNasabahSuggestOpen(false)} />
                        <div className="nasabah-suggestions">
                          {filteredNasabahSuggestions.length > 0 ? (
                            filteredNasabahSuggestions.map(n => (
                              <div 
                                key={n.customer_id}
                                className="nasabah-suggestion-item"
                                onClick={() => {
                                  setSelectedNasabah(n);
                                  setNasabahSearchText(n.name);
                                  setIsNasabahSuggestOpen(false);
                                }}
                              >
                                <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>{n.name}</div>
                                <div className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>{formatNasabahId(n.customer_id, n.pos_id)}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--muted)' }}>Tidak ada nasabah ditemukan</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Multi-Item Waste Sections */}
                  {weighItems.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 4px' }}>
                        <div className="div-lbl" style={{ flex: 1, margin: 0 }}>
                          DETAIL SAMPAH {idx + 1}
                        </div>
                        {weighItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = weighItems.filter((_, i) => i !== idx);
                              setWeighItems(updated);
                            }}
                            title="Hapus detail sampah ini"
                            style={{
                              background: 'rgba(200, 60, 60, 0.08)',
                              border: '1px solid rgba(200, 60, 60, 0.2)',
                              color: 'var(--red)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      <div className="fr">
                        <div className="fg">
                          <label className="fl">Kategori Sampah</label>
                          <select 
                            className="fsel"
                            value={item.kategori}
                            onChange={(e) => {
                              const kat = e.target.value;
                              const updated = [...weighItems];
                              updated[idx].kategori = kat;
                              updated[idx].jenis = ''; // reset sub-type
                              updated[idx].pengepul = getPengepulForCategory(kat);
                              setWeighItems(updated);
                            }}
                          >
                            <option value="">Pilih kategori...</option>
                            <option value="Plastik">Plastik</option>
                            <option value="Kertas">Kertas</option>
                            <option value="Logam">Logam</option>
                            <option value="Kaca">Kaca</option>
                            <option value="Minyak">Minyak</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div className="fg">
                          <label className="fl">Berat (kg)</label>
                          <input 
                            className="fi" 
                            type="text"
                            placeholder="0.0" 
                            value={item.berat}
                            onChange={(e) => {
                              const updated = [...weighItems];
                              updated[idx].berat = e.target.value;
                              setWeighItems(updated);
                            }}
                          />
                        </div>
                      </div>

                      <div className="fr">
                        <div className="fg">
                          <label className="fl">Jenis Sampah</label>
                          <select 
                            className="fsel"
                            value={item.jenis}
                            disabled={!item.kategori}
                            onChange={(e) => {
                              const updated = [...weighItems];
                              updated[idx].jenis = e.target.value;
                              setWeighItems(updated);
                            }}
                          >
                            <option value="">{item.kategori ? 'Pilih jenis...' : 'Pilih kategori dulu'}</option>
                            {(WASTE_SUBTYPES[item.kategori] || []).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>

                        <div className="fg">
                          <label className="fl">Pengepul</label>
                          <input 
                            className="fi" 
                            value={item.pengepul || 'Bali Wastu Lestari'}
                            disabled 
                            style={{ background: '#f4f6f3', color: '#8a9e8a', cursor: 'not-allowed' }}
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Dark Green + Tambah Sampah Button */}
                  <button 
                    type="button"
                    className="btn-forest"
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      setWeighItems([
                        ...weighItems,
                        { kategori: '', jenis: '', berat: '', pengepul: 'Bali Wastu Lestari' }
                      ]);
                    }}
                  >
                    + Tambah Sampah
                  </button>
                </>
              )}

              {modalType === 'NASABAH' && (
                <>
                  <div className="fg">
                    <label className="fl">Nama Lengkap</label>
                    <input 
                      className="fi" 
                      placeholder="Masukkan nama nasabah" 
                      value={newNasabahForm.name}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, name: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label className="fl">Alamat Rumah</label>
                    <input 
                      className="fi" 
                      placeholder="Alamat lengkap nasabah" 
                      value={newNasabahForm.address}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, address: e.target.value })}
                    />
                  </div>
                  <div className="fg">
                    <label className="fl">No. HP / Whatsapp</label>
                    <input 
                      className="fi" 
                      placeholder="08xxxxxxxxxx" 
                      value={newNasabahForm.phone}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              {modalType === 'PENARIKAN' && (
                <>
                  <div className="fg">
                    <label className="fl">Pilih Nasabah</label>
                    <select 
                      className="fsel"
                      onChange={(e) => {
                        const n = nasabahs.find(item => item.customer_id === e.target.value);
                        setSelectedNasabah(n || null);
                      }}
                    >
                      <option value="">Pilih Nasabah...</option>
                      {nasabahs.map(n => (
                        <option key={n.customer_id} value={n.customer_id}>{n.name} (Saldo: Rp {parseFloat(n.balance).toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label className="fl">Nominal Penarikan (Rp)</label>
                    <input 
                      className="fi" 
                      type="number" 
                      placeholder="Contoh: 50000" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mf">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
              {modalType === 'SETORAN' && <button className="btn btn-gold" onClick={handleDepositSubmit}>Simpan Setoran</button>}
              {modalType === 'NASABAH' && <button className="btn btn-gold" onClick={handleRegisterNasabah}>Daftarkan Nasabah</button>}
              {modalType === 'PENARIKAN' && <button className="btn btn-gold" onClick={handleWithdrawConfirm}>Cairkan Saldo</button>}
              {modalType === 'HARGA' && <button className="btn btn-gold" onClick={() => { showToast('Harga berhasil diperbarui ✓'); setIsModalOpen(false); }}>Simpan Harga</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
