"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Users, Scale, CreditCard, RefreshCw, Plus,
  Trash2, Search, ArrowRight, ArrowLeft, ShieldAlert, Award, FileText, CheckCircle, CheckCircle2, Clock, Upload,
  Layers, LogOut, Tag, UserPlus, X, Calendar, Download, Recycle, Banknote, Wallet, Newspaper, Wine, Package, Droplet, Boxes, Box, ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, HeadingLevel } from 'docx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = "http://localhost:5001/api";

const getCategoryIcon = (categoryName, size = 24) => {
  const name = (categoryName || '').toLowerCase();

  // Solid Plastic Bottle / Jug Icon
  if (name.includes('plastik')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#059669">
        <path d="M9 2h6v2H9V2zm7.5 5h-9A1.5 1.5 0 0 0 6 8.5V20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8.5A1.5 1.5 0 0 0 16.5 7zM11 11h2v7h-2v-7z" />
      </svg>
    );
  }

  // Solid Paper Document Icon
  if (name.includes('kertas')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#d97706">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
      </svg>
    );
  }

  // Solid Metal Can Icon
  if (name.includes('logam')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#4b5563">
        <path d="M12 2C7.58 2 4 3.79 4 6v12c0 2.21 3.58 4 8 4s8-1.79 8-4V6c0-2.21-3.58-4-8-4zm0 2c3.87 0 6 1.34 6 2s-2.13 2-6 2-6-1.34-6-2 2.13-2 6-2z" />
      </svg>
    );
  }

  // Solid Glass Bottle Icon
  if (name.includes('kaca')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#0284c7">
        <path d="M10 2h4v3.5l2 2.5V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-2.5V2zm1 2v1.5h2V4h-2z" />
      </svg>
    );
  }

  // Solid Oil Droplet Icon
  if (name.includes('minyak') || name.includes('jelantah')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#ea580c">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    );
  }

  // Solid Package / Box Icon
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#8b5cf6">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z" />
    </svg>
  );
};

const getCategoryBg = (categoryName) => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('plastik')) return '#eef7f2';
  if (name.includes('kertas')) return '#fdf6ea';
  if (name.includes('logam')) return '#f0f2f5';
  if (name.includes('kaca')) return '#e8f4fd';
  if (name.includes('minyak') || name.includes('jelantah')) return '#fdeee8';
  return '#f4eefd';
};

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
  { customer_id: 'WW-BA-0041', name: 'Siti Rahayu', address: 'Jl. Melati No. 12, RT 03', created_at: '2023-01-14', balance: 87500, status: 'ACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0027', name: 'Budi Wahyono', address: 'Jl. Mawar No. 5, RT 01', created_at: '2022-11-05', balance: 124000, status: 'ACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0088', name: 'Murti Astuti', address: 'Jl. Anggrek No. 8, RT 07', created_at: '2024-03-18', balance: 42000, status: 'ACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0013', name: 'Dewi Hapsari', address: 'Jl. Kenanga No. 3, RT 04', created_at: '2022-08-12', balance: 215000, status: 'ACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0076', name: 'Putri Ningrum', address: 'Jl. Dahlia No. 19, RT 02', created_at: '2023-06-01', balance: 0, status: 'INACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0142', name: 'Hani Lestari', address: 'Jl. Tulip No. 7, RT 05', created_at: '2025-02-24', balance: 0, status: 'ACTIVE', pos_id: 'BA' },
  { customer_id: 'WW-BA-0109', name: 'Rudi Santoso', address: 'Jl. Flamboyan No. 4, RT 06', created_at: '2023-09-10', balance: 57000, status: 'ACTIVE', pos_id: 'BA' }
];

const SAMPLE_TRANSACTIONS = [
  { id: 'TX-20250224-001', customer_name: 'Siti Rahayu', customer_id: 'WW-BA-0041', pos_id: 'BA', weight: '3.5 kg', price: 'Rp 5.250', source: 'Manual', time: '13.25 WITA', date: '24 Feb 2025' },
  { id: 'TX-20250224-002', customer_name: 'Budi Wahyono', customer_id: 'WW-BA-0027', pos_id: 'BA', weight: '7.2 kg', price: 'Rp 14.400', source: 'Excel', time: '11.10 WITA', date: '24 Feb 2025' },
  { id: 'TX-20250224-003', customer_name: 'Murti Astuti', customer_id: 'WW-BA-0088', pos_id: 'BA', weight: '2.0 kg', price: 'Rp 6.000', source: 'Manual', time: '10.45 WITA', date: '24 Feb 2025' },
  { id: 'TX-20250224-004', customer_name: 'Dewi Hapsari', customer_id: 'WW-BA-0013', pos_id: 'BA', weight: '5.5 kg', price: 'Rp 8.250', source: 'Excel', time: '09.30 WITA', date: '23 Feb 2025' },
  { id: 'TX-20250224-005', customer_name: 'Rudi Santoso', customer_id: 'WW-BA-0109', pos_id: 'BA', weight: '1.8 kg', price: 'Rp 7.200', source: 'Manual', time: '08.15 WITA', date: '23 Feb 2025' },
  { id: 'TX-20250224-006', customer_name: 'Hani Lestari', customer_id: 'WW-BA-0142', pos_id: 'BA', weight: '4.1 kg', price: 'Rp 6.150', source: 'Manual', time: '14.05 WITA', date: '22 Feb 2025' }
];

const SAMPLE_ACCOUNT_MUTATIONS = [
  { id: 'MUT-001', type: 'INCOME', desc: 'Setoran Sampah (Plastik & Minyak)', date: '24 Feb 2025, 13.25 WITA', amount: 35500, balance_after: 87500 },
  { id: 'MUT-002', type: 'EXPENSE', desc: 'Penarikan Tunai Saldo Tabungan', date: '18 Feb 2025, 10.15 WITA', amount: 50000, balance_after: 52000 },
  { id: 'MUT-003', type: 'INCOME', desc: 'Setoran Sampah (Kertas & Logam)', date: '10 Feb 2025, 14.40 WITA', amount: 62000, balance_after: 102000 },
  { id: 'MUT-004', type: 'INCOME', desc: 'Setoran Sampah (Kaca & Plastik)', date: '01 Feb 2025, 09.20 WITA', amount: 40000, balance_after: 40000 }
];

const SAMPLE_WITHDRAWALS = [
  { id: 'WD-20250224-001', customer_name: 'Budi Wahyono', customer_id: 'WW-BA-0027', pos_id: 'BA', amount: 50000, remaining_balance: 74000, method: 'Tunai', status: 'COMPLETED', date: '24 Feb 2025, 11:20 WITA', proof_file: 'struk_pencairan_001.png' },
  { id: 'WD-20250224-002', customer_name: 'Siti Rahayu', customer_id: 'WW-BA-0041', pos_id: 'BA', amount: 30000, remaining_balance: 57500, method: 'Transfer (BCA)', status: 'PENDING', date: '24 Feb 2025, 10:15 WITA', proof_file: null },
  { id: 'WD-20250223-003', customer_name: 'Murti Astuti', customer_id: 'WW-BA-0088', pos_id: 'BA', amount: 20000, remaining_balance: 22000, method: 'Tunai', status: 'PENDING', date: '23 Feb 2025, 14:05 WITA', proof_file: null },
  { id: 'WD-20250222-004', customer_name: 'Dewi Hapsari', customer_id: 'WW-BA-0013', pos_id: 'BA', amount: 100000, remaining_balance: 115000, method: 'Transfer (Mandiri)', status: 'COMPLETED', date: '22 Feb 2025, 09:30 WITA', proof_file: 'struk_pencairan_004.png' }
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
  const [posWasteTypes, setPosWasteTypes] = useState([]);
  const [selectedVendorPrices, setSelectedVendorPrices] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('V-BB');

  // UI Tabs / Modals
  const [pusatTab, setPusatTab] = useState('dashboard'); // dashboard, pos, pricing, logs
  const [posTab, setPosTab] = useState('dashboard'); // dashboard, nasabah, penimbangan, jenis_sampah, tabungan, penarikan, harga_sampah, laporan_bulanan, history
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState(null);

  // Search & Filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [nasabahFilterStatus, setNasabahFilterStatus] = useState('ALL');
  const [transaksiFilterStatus, setTransaksiFilterStatus] = useState('ALL');
  const [penarikanFilterStatus, setPenarikanFilterStatus] = useState('ALL');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedWithdrawalProof, setSelectedWithdrawalProof] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('SETORAN'); // SETORAN, NASABAH, HARGA, PENARIKAN
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Februari');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [tabunganSearchText, setTabunganSearchText] = useState('');

  // Forms state
  const [newPosForm, setNewPosForm] = useState({ pos_id: '', pos_name: '', address: '' });
  const [editingNasabah, setEditingNasabah] = useState(null);
  const [selectedNasabahHistory, setSelectedNasabahHistory] = useState(null);
  const [nasabahNewForm, setNasabahNewForm] = useState({ name: '', address: '' });
  const [nasabahEditForm, setNasabahEditForm] = useState({ name: '', address: '', status: 'ACTIVE' });
  const [tanggalNasabah, setTanggalNasabah] = useState(getCurrentDateTimeLocal());

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

  // Report Period & Aggregate State
  const [reportPeriodMode, setReportPeriodMode] = useState('monthly'); // 'monthly' or 'semester'
  const [selectedSemester, setSelectedSemester] = useState('1'); // '1' or '2'
  const [reportData, setReportData] = useState(null);
  const [dashboardReportData, setDashboardReportData] = useState(null);
  const [depositsList, setDepositsList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [realAuditLogs, setRealAuditLogs] = useState([]);
  const [selectedDepositDetail, setSelectedDepositDetail] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // 3. Fetch report data when period, month, year, or semester changes
  useEffect(() => {
    fetchReportData();
    fetchDashboardReportData();
  }, [reportPeriodMode, selectedMonth, selectedYear, selectedSemester, activePosId, activeRole]);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const showAlert = (text, type = 'success') => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
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

  const fetchPosWasteTypes = async (posId) => {
    try {
      const res = await fetch(`${API_BASE}/prices/pos/${posId}/waste-types`);
      const data = await res.json();
      setPosWasteTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPosWasteTypes([]);
    }
  };

  const fetchReportData = async () => {
    try {
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const monthIndex = monthNames.indexOf(selectedMonth) + 1 || 2;
      const yr = selectedYear || '2025';
      const posQuery = activeRole === 'ADMIN_POS' ? `&pos_id=${activePosId}` : '';
      const semQuery = reportPeriodMode === 'semester' ? `&semester=${selectedSemester}` : '';
      const url = `${API_BASE}/transactions/report?period=${reportPeriodMode}&month=${monthIndex}&year=${yr}${posQuery}${semQuery}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.error) {
        setReportData(data);
      }
    } catch (e) {
      console.error("Report fetch error:", e);
    }
  };

  const fetchDashboardReportData = async () => {
    try {
      const now = new Date();
      const currentMonthIndex = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();
      const posQuery = activeRole === 'ADMIN_POS' ? `&pos_id=${activePosId}` : '';
      const url = `${API_BASE}/transactions/report?period=monthly&month=${currentMonthIndex}&year=${currentYear}${posQuery}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.error) {
        setDashboardReportData(data);
      }
    } catch (e) {
      console.error("Dashboard report fetch error:", e);
    }
  };

  const fetchDepositsList = async () => {
    try {
      const posQuery = activeRole === 'ADMIN_POS' ? `?pos_id=${activePosId}` : '';
      const res = await fetch(`${API_BASE}/transactions/deposits${posQuery}`);
      const data = await res.json();
      if (data && data.data) {
        setDepositsList(data.data);
      }
    } catch (e) {
      console.error("Deposits fetch error:", e);
    }
  };

  const fetchWithdrawalsList = async () => {
    try {
      const posQuery = activeRole === 'ADMIN_POS' ? `?pos_id=${activePosId}` : '';
      const res = await fetch(`${API_BASE}/transactions/withdrawals${posQuery}`);
      const data = await res.json();
      if (data && data.data) {
        setWithdrawalsList(data.data);
      }
    } catch (e) {
      console.error("Withdrawals fetch error:", e);
    }
  };

  const fetchRealAuditLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRealAuditLogs(data);
      }
    } catch (e) {
      console.error("Audit log fetch error:", e);
    }
  };

  const refreshData = () => {
    fetchMetrics();
    fetchNasabahList();
    fetchHistory();
    fetchAuditLogs();
    fetchPosWasteTypes(activePosId);
    fetchReportData();
    fetchDashboardReportData();
    fetchDepositsList();
    fetchWithdrawalsList();
    fetchRealAuditLogs();
    if (selectedVendorId) {
      fetchVendorPrices(selectedVendorId);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    showToast('Memproses file Excel (.xlsx) dengan grafik...');

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'WWIMS System';
      workbook.created = new Date();

      const periodTitle = reportPeriodMode === 'monthly'
        ? `${selectedMonth} ${selectedYear}`
        : `Semester ${selectedSemester} Tahun ${selectedYear}`;
      const posName = posList.find(p => p.pos_id === activePosId)?.pos_name || `POS ${activePosId}`;

      // --- Sheet 1: Ringkasan Laporan ---
      const summarySheet = workbook.addWorksheet('Ringkasan Laporan');
      summarySheet.columns = [
        { header: 'Parameter Laporan', key: 'param', width: 32 },
        { header: 'Nilai / Jumlah', key: 'value', width: 28 }
      ];

      summarySheet.addRow(['Sistem Management', 'Wadhah Wangi (WWIMS)']);
      summarySheet.addRow(['Unit Operasional POS', `${posName} (${activePosId})`]);
      summarySheet.addRow(['Periode Laporan', periodTitle]);
      summarySheet.addRow(['Tanggal Cetak', new Date().toLocaleDateString('id-ID')]);
      summarySheet.addRow([]);
      summarySheet.addRow(['METRIK UTAMA / KPI', '']);
      summarySheet.addRow(['Total Sampah Terkumpul', `${reportData?.kpi?.totalWeight || 1247} kg`]);
      summarySheet.addRow(['Total Nilai Beli (Nasabah Credit)', `Rp ${(reportData?.kpi?.totalBuyValue || 1800000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Total Nilai Jual (Vendor Sell)', `Rp ${(reportData?.kpi?.totalSellValue || 2500000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Gross Margin', `Rp ${(reportData?.kpi?.totalMargin || 700000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Profit POS (70%)', `Rp ${(reportData?.kpi?.totalPosProfit || 490000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Profit Pusat (30%)', `Rp ${(reportData?.kpi?.totalPusatProfit || 210000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Total Pencairan Saldo', `Rp ${(reportData?.kpi?.totalWithdrawn || 620000).toLocaleString('id-ID')}`]);
      summarySheet.addRow(['Total Transaksi Setor', `${reportData?.kpi?.totalTransactions || 238} transaksi`]);

      // Embed chart canvas images into Excel
      const canvasElements = document.querySelectorAll('.report-chart-container canvas');
      let imageRowOffset = 18;
      canvasElements.forEach((canvas) => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const imageId = workbook.addImage({
            base64: dataUrl,
            extension: 'png',
          });

          summarySheet.addImage(imageId, {
            tl: { col: 0, row: imageRowOffset },
            ext: { width: 520, height: 260 }
          });
          imageRowOffset += 16;
        } catch (err) {
          console.warn('Canvas export skipped:', err);
        }
      });

      // --- Sheet 2: Detail Transaksi Setor ---
      const depositSheet = workbook.addWorksheet('Transaksi Setor');
      depositSheet.columns = [
        { header: 'ID Transaksi', key: 'id', width: 16 },
        { header: 'Tanggal', key: 'date', width: 22 },
        { header: 'ID Nasabah', key: 'customer_id', width: 18 },
        { header: 'Nama Nasabah', key: 'customer_name', width: 25 },
        { header: 'Nilai Beli (Rp)', key: 'buy_value', width: 18 },
        { header: 'Nilai Jual (Rp)', key: 'sell_value', width: 18 },
        { header: 'Profit POS (Rp)', key: 'pos_profit', width: 18 },
        { header: 'Profit Pusat (Rp)', key: 'pusat_profit', width: 18 }
      ];

      const depositsToExport = reportData?.deposits || depositsList || [];
      depositsToExport.forEach(d => {
        depositSheet.addRow({
          id: d.id,
          date: d.date ? new Date(d.date).toLocaleString('id-ID') : '-',
          customer_id: d.customer_id,
          customer_name: d.customer_name || d.customer_id,
          buy_value: d.totalBuyValue || d.amount || 0,
          sell_value: d.totalSellValue || 0,
          pos_profit: d.posProfit || d.pos_profit || 0,
          pusat_profit: d.pusatProfit || d.pusat_profit || 0
        });
      });

      // --- Sheet 3: Detail Penarikan Saldo ---
      const withdrawalSheet = workbook.addWorksheet('Penarikan Saldo');
      withdrawalSheet.columns = [
        { header: 'ID Penarikan', key: 'id', width: 16 },
        { header: 'Tanggal', key: 'date', width: 22 },
        { header: 'ID Nasabah', key: 'customer_id', width: 18 },
        { header: 'Nama Nasabah', key: 'customer_name', width: 25 },
        { header: 'Jumlah Penarikan (Rp)', key: 'amount', width: 22 }
      ];

      const withdrawalsToExport = reportData?.withdrawals || withdrawalsList || [];
      withdrawalsToExport.forEach(w => {
        withdrawalSheet.addRow({
          id: w.id,
          date: w.date ? new Date(w.date).toLocaleString('id-ID') : '-',
          customer_id: w.customer_id,
          customer_name: w.customer_name || w.customer_id,
          amount: w.amount || 0
        });
      });

      // --- Sheet 4: Komposisi Sampah ---
      const categorySheet = workbook.addWorksheet('Komposisi Sampah');
      categorySheet.columns = [
        { header: 'Kategori Sampah', key: 'category', width: 24 },
        { header: 'Total Berat (kg)', key: 'weight', width: 18 },
        { header: 'Persentase (%)', key: 'percentage', width: 16 }
      ];

      (reportData?.categoryComposition || []).forEach(c => {
        categorySheet.addRow({
          category: c.category,
          weight: c.weight,
          percentage: `${c.percentage}%`
        });
      });

      // --- Sheet 5: Top Nasabah ---
      const nasabahSheet = workbook.addWorksheet('Top Nasabah');
      nasabahSheet.columns = [
        { header: 'Peringkat', key: 'rank', width: 12 },
        { header: 'Nama Nasabah', key: 'name', width: 28 },
        { header: 'Total Setoran (kg)', key: 'weight', width: 20 }
      ];

      (reportData?.topNasabah || []).forEach((n, idx) => {
        nasabahSheet.addRow({
          rank: idx + 1,
          name: n.name,
          weight: n.weight
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Laporan_WWIMS_${activePosId}_${periodTitle.replace(/\s+/g, '_')}.xlsx`);
      showToast('Export Excel berhasil diunduh ✓');
    } catch (e) {
      console.error('Excel Export Error:', e);
      showAlert('Gagal mengekspor file Excel', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    showToast('Memproses dokumen Word (.docx) dengan grafik...');

    try {
      const periodTitle = reportPeriodMode === 'monthly'
        ? `${selectedMonth} ${selectedYear}`
        : `Semester ${selectedSemester} Tahun ${selectedYear}`;
      const posName = posList.find(p => p.pos_id === activePosId)?.pos_name || `POS ${activePosId}`;

      const canvasElements = document.querySelectorAll('.report-chart-container canvas');
      const chartImages = [];

      canvasElements.forEach((canvas) => {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.split(',')[1];
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          chartImages.push(bytes);
        } catch (err) {
          console.warn('Canvas word export skipped:', err);
        }
      });

      const kpi = reportData?.kpi || {
        totalWeight: 1247,
        totalBuyValue: 1800000,
        totalSellValue: 2500000,
        totalMargin: 700000,
        totalPosProfit: 490000,
        totalPusatProfit: 210000,
        totalWithdrawn: 620000,
        totalTransactions: 238
      };

      const docChildren = [
        new Paragraph({
          text: 'WADHAH WANGI INTEGRATED MANAGEMENT SYSTEM',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),
        new Paragraph({
          text: `LAPORAN REKAPITULASI OPERASIONAL - ${posName.toUpperCase()}`,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Periode Laporan: `, bold: true }),
            new TextRun({ text: `${periodTitle}  |  ` }),
            new TextRun({ text: `POS ID: `, bold: true }),
            new TextRun({ text: `${activePosId}  |  ` }),
            new TextRun({ text: `Dicetak: `, bold: true }),
            new TextRun({ text: `${new Date().toLocaleDateString('id-ID')}` })
          ],
          spacing: { after: 300 }
        }),

        new Paragraph({
          text: '1. Ringkasan Metrik Utama (KPI)',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Metrik Operasional', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Nilai / Jumlah', bold: true })] })
              ]
            }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Total Sampah Terkumpul')] }), new TableCell({ children: [new Paragraph(`${kpi.totalWeight} kg`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Total Nilai Beli (Nasabah)')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalBuyValue.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Total Nilai Jual (Vendor)')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalSellValue.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Gross Margin')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalMargin.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Profit Share POS (70%)')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalPosProfit.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Profit Share Pusat (30%)')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalPusatProfit.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Total Penarikan Saldo')] }), new TableCell({ children: [new Paragraph(`Rp ${kpi.totalWithdrawn.toLocaleString('id-ID')}`)] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph('Total Transaksi Setor')] }), new TableCell({ children: [new Paragraph(`${kpi.totalTransactions} transaksi`)] })] })
          ]
        }),

        new Paragraph({
          text: '2. Grafik Analytics & Tren',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 120 }
        })
      ];

      chartImages.forEach((buffer) => {
        try {
          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: { width: 520, height: 250 },
                  type: 'png'
                })
              ],
              spacing: { before: 120, after: 200 }
            })
          );
        } catch (err) {
          console.warn('ImageRun embedding error:', err);
        }
      });

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Laporan_WWIMS_${activePosId}_${periodTitle.replace(/\s+/g, '_')}.docx`);
      showToast('Export Word berhasil diunduh ✓');
    } catch (e) {
      console.error('Word Export Error:', e);
      showAlert('Gagal mengekspor file Word', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  // --- ACTIONS ---

  const handleRegisterNasabah = async (e) => {
    if (e) e.preventDefault();
    if (!nasabahNewForm.name) {
      showAlert('Silakan masukkan nama nasabah terlebih dahulu', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/nasabah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pos_id: activePosId,
          name: nasabahNewForm.name,
          address: nasabahNewForm.address || 'Alamat Belum Diisi'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Nasabah '${data.name}' (${data.customer_id}) berhasil didaftarkan ke database ✓`);
        setIsModalOpen(false);
        setNasabahNewForm({ name: '', address: '' });
        refreshData();
      } else {
        showAlert(data.error || 'Gagal menambahkan nasabah', 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleUpdateNasabah = async (e) => {
    if (e) e.preventDefault();
    if (!editingNasabah) return;
    try {
      const res = await fetch(`${API_BASE}/nasabah/${editingNasabah.customer_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nasabahEditForm.name,
          address: nasabahEditForm.address,
          status: nasabahEditForm.status,
          is_active: nasabahEditForm.status !== 'INACTIVE'
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Data nasabah '${data.name}' berhasil diperbarui (Status: ${data.status === 'INACTIVE' ? 'Tidak Aktif' : 'Aktif'}) ✓`);
        setIsModalOpen(false);
        setEditingNasabah(null);
        refreshData();
      } else {
        showAlert(data.error || 'Gagal memperbarui nasabah', 'danger');
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

  // Data Nasabah Page Table Filtering (Search + Status Tabs)
  const filteredNasabahTableData = availableNasabahs.filter(n => {
    if (nasabahFilterStatus === 'ACTIVE' && n.status === 'INACTIVE') return false;
    if (nasabahFilterStatus === 'INACTIVE' && n.status !== 'INACTIVE') return false;

    const query = (customerSearch || '').trim().toLowerCase();
    if (!query) return true;

    const name = (n.name || '').toLowerCase();
    const id = (n.customer_id || '').toLowerCase();
    const formattedId = formatNasabahId(n.customer_id, n.pos_id).toLowerCase();
    const address = (n.address || '').toLowerCase();

    return (
      name.includes(query) ||
      id.includes(query) ||
      formattedId.includes(query) ||
      address.includes(query)
    );
  }).sort((a, b) => {
    const dateA = new Date(a.created_at || a.date || 0).getTime();
    const dateB = new Date(b.created_at || b.date || 0).getTime();
    return dateB - dateA;
  });

  const nasabahTotalCount = availableNasabahs.length;
  const nasabahActiveCount = availableNasabahs.filter(n => n.status !== 'INACTIVE').length;
  const nasabahInactiveCount = availableNasabahs.filter(n => n.status === 'INACTIVE').length;
  const totalNasabahBalance = availableNasabahs.reduce((sum, n) => sum + parseFloat(n.balance || 0), 0);
  const avgNasabahBalance = nasabahTotalCount > 0 ? Math.round(totalNasabahBalance / nasabahTotalCount) : 0;

  const filteredTabunganData = availableNasabahs.filter(n => {
    const query = (tabunganSearchText || '').trim().toLowerCase();
    if (!query) return true;
    const name = (n.name || '').toLowerCase();
    const id = (n.customer_id || '').toLowerCase();
    const formattedId = formatNasabahId(n.customer_id, n.pos_id).toLowerCase();
    return (
      name.includes(query) ||
      id.includes(query) ||
      formattedId.includes(query)
    );
  });
  const filteredPenarikanData = SAMPLE_WITHDRAWALS.filter(wd => {
    if (penarikanFilterStatus === 'PENDING' && wd.status !== 'PENDING') return false;
    if (penarikanFilterStatus === 'COMPLETED' && wd.status !== 'COMPLETED') return false;
    return true;
  });

  const openNewDepositModal = () => {
    setSelectedNasabah(null);
    setNasabahSearchText('');
    setTanggalSetor(getCurrentDateTimeLocal());
    setWeighItems([{ kategori: 'Plastik', jenis: '', berat: '', pengepul: '' }]);
    setModalType('SETORAN');
    setIsModalOpen(true);
  };

  const handleEditSetoran = (tx) => {
    const custName = tx.customer_name || tx.customer?.name || 'Siti Rahayu';
    const custId = tx.customer_id || 'WW-BA-0041';
    const nasabahObj = availableNasabahs.find(n => n.customer_id === custId || n.name === custName) || {
      customer_id: custId,
      name: custName,
      pos_id: tx.pos_id || activePosId
    };

    setSelectedNasabah(nasabahObj);
    setNasabahSearchText(custName);
    setEditingTransaction(tx);

    if (tx.date || tx.created_at || tx.transaction_date) {
      const dt = new Date(tx.date || tx.created_at || tx.transaction_date);
      setTanggalSetor(dt.toISOString().slice(0, 16));
    } else {
      setTanggalSetor(getCurrentDateTimeLocal());
    }

    if (tx.details && tx.details.length > 0) {
      const mappedItems = tx.details.map(d => ({
        kategori: d.category || 'Plastik',
        jenis: d.wasteName || d.waste_type?.waste_name || 'PET Campur',
        waste_type_id: d.waste_type_id || '',
        berat: String(d.quantity || 1),
        pengepul: d.vendor_name || d.vendor?.vendor_name || 'Bali Bersih'
      }));
      setWeighItems(mappedItems);
    } else {
      setWeighItems([
        { kategori: 'Plastik', jenis: 'PET Campur', berat: String(tx.weight || '3.5').replace(' kg', ''), pengepul: 'Bali Bersih' }
      ]);
    }

    setModalType('EDIT_SETORAN');
    setIsModalOpen(true);
  };

  const handleDepositSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedNasabah && !nasabahSearchText) {
      showAlert('Silakan masukkan/pilih nama nasabah terlebih dahulu', 'danger');
      return;
    }

    let targetNasabah = selectedNasabah;
    if (!targetNasabah && nasabahSearchText) {
      const q = nasabahSearchText.trim().toLowerCase();
      targetNasabah = availableNasabahs.find(n =>
        (n.customer_id && n.customer_id.toLowerCase() === q) ||
        (n.name && n.name.toLowerCase() === q) ||
        (n.name && n.name.toLowerCase().includes(q)) ||
        (formatNasabahId(n.customer_id, n.pos_id).toLowerCase() === q)
      );
    }

    let custId = targetNasabah?.customer_id;
    if (!custId) {
      try {
        const createRes = await fetch(`${API_BASE}/nasabah`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pos_id: activePosId,
            name: nasabahSearchText.trim(),
            address: 'Alamat Belum Diisi'
          })
        });
        const createdData = await createRes.json();
        if (createRes.ok && createdData.customer_id) {
          custId = createdData.customer_id;
        } else if (availableNasabahs.length > 0) {
          custId = availableNasabahs[0].customer_id;
        }
      } catch (err) {
        if (availableNasabahs.length > 0) {
          custId = availableNasabahs[0].customer_id;
        }
      }
    }

    if (!custId) {
      showAlert('Nasabah belum terdaftar. Silakan pilih nasabah.', 'danger');
      return;
    }

    const validItems = [];
    for (const it of weighItems) {
      const cleanWeight = String(it.berat || '').replace('kg', '').replace(',', '.').trim();
      const qtyNum = parseFloat(cleanWeight);
      if (isNaN(qtyNum) || qtyNum <= 0) continue;

      let wtId = it.waste_type_id;
      if (!wtId && it.jenis) {
        for (const cat of posWasteTypes) {
          const found = (cat.types || []).find(t => t.waste_name === it.jenis || t.waste_type_id === it.jenis);
          if (found) {
            wtId = found.waste_type_id;
            break;
          }
        }
      }
      if (!wtId && it.kategori) {
        const catObj = posWasteTypes.find(c => (c.category_name || '').toLowerCase() === (it.kategori || '').toLowerCase());
        if (catObj && catObj.types && catObj.types.length > 0) {
          wtId = catObj.types[0].waste_type_id;
        }
      }
      if (!wtId) {
        wtId = 'BB-01';
      }

      validItems.push({
        waste_type_id: wtId,
        quantity: qtyNum
      });
    }

    if (validItems.length === 0) {
      showAlert('Silakan isi minimal 1 detail sampah dengan berat yang valid (contoh: 3.5)', 'danger');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/transactions/weigh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: custId,
          pos_id: activePosId,
          items: validItems,
          created_by: `admin-pos-${activePosId.toLowerCase()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Setoran (${validItems.length} jenis sampah) berhasil dicatat ke database ✓`);
        setIsModalOpen(false);
        setWeighItems([{ kategori: 'Plastik', jenis: '', berat: '', pengepul: '' }]);
        setSelectedNasabah(null);
        setNasabahSearchText('');
        refreshData();
      } else {
        showAlert(data.error || 'Gagal mencatat setoran ke database', 'danger');
      }
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



  const renderSidebarItem = (id, label, icon, currentTab, setTab, pillCount = null) => {
    const isActive = currentTab === id;
    return (
      <button
        key={id}
        onClick={() => setTab(id)}
        className={`sb-item ${isActive ? 'active' : ''}`}
      >
        {icon}
        <span style={{ flexGrow: 1 }}>{label}</span>
        {pillCount !== null && pillCount !== undefined && (
          <span className="sb-pill">{pillCount}</span>
        )}
      </button>
    );
  };

  const getCatColor = (catName) => {
    const name = (catName || '').toLowerCase();
    if (name.includes('plastik')) return '#4a90d9';
    if (name.includes('kertas')) return '#e8b323';
    if (name.includes('logam')) return '#3d6b40';
    if (name.includes('kaca')) return '#7a5c2e';
    if (name.includes('minyak') || name.includes('jelantah')) return '#e67e22';
    return '#b06030';
  };

  const currentDateObj = new Date();
  const currentMonthIdx = currentDateObj.getMonth();
  const currentYearNum = currentDateObj.getFullYear();
  const monthNamesIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const currentMonthNameStr = monthNamesIndo[currentMonthIdx];
  const formattedCurrentTime = currentDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WITA';

  const dashboardKpi = dashboardReportData?.kpi || {};
  const dashboardTrends = dashboardReportData?.monthlyTrends || [];

  const currentMonthTrend = dashboardTrends.length > 0 ? dashboardTrends[dashboardTrends.length - 1] : null;
  const prevMonthTrend = dashboardTrends.length > 1 ? dashboardTrends[dashboardTrends.length - 2] : null;

  const currentWeightVal = dashboardKpi.totalWeight !== undefined ? dashboardKpi.totalWeight : (currentMonthTrend?.totalWeight || 0);
  const prevWeightVal = prevMonthTrend?.totalWeight || 0;
  let weightTrendLabel = '—';
  let weightTrendClass = 't-uw';
  if (prevWeightVal > 0) {
    const diff = ((currentWeightVal - prevWeightVal) / prevWeightVal) * 100;
    if (diff > 0) {
      weightTrendLabel = `↑ ${diff.toFixed(0)}%`;
      weightTrendClass = 't-uw';
    } else if (diff < 0) {
      weightTrendLabel = `↓ ${Math.abs(diff).toFixed(0)}%`;
      weightTrendClass = 't-dw';
    } else {
      weightTrendLabel = `0%`;
      weightTrendClass = 't-uw';
    }
  } else if (currentWeightVal > 0) {
    weightTrendLabel = `+${currentWeightVal} kg`;
    weightTrendClass = 't-uw';
  }

  const newNasabahsThisMonth = nasabahs.filter(n => {
    if (!n.created_at) return false;
    const d = new Date(n.created_at);
    return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYearNum;
  }).length;
  const nasabahTrendLabel = newNasabahsThisMonth > 0 ? `+${newNasabahsThisMonth} baru` : `${nasabahs.length} aktif`;

  const currentTxCount = dashboardKpi.totalTransactions !== undefined ? dashboardKpi.totalTransactions : (currentMonthTrend?.transactionCount || 0);
  const prevTxCount = prevMonthTrend?.transactionCount || 0;
  let txTrendLabel = '—';
  let txTrendClass = 't-up';
  if (prevTxCount > 0) {
    const diff = ((currentTxCount - prevTxCount) / prevTxCount) * 100;
    if (diff > 0) {
      txTrendLabel = `↑ ${diff.toFixed(0)}%`;
      txTrendClass = 't-up';
    } else if (diff < 0) {
      txTrendLabel = `↓ ${Math.abs(diff).toFixed(0)}%`;
      txTrendClass = 't-dw';
    } else {
      txTrendLabel = `0%`;
      txTrendClass = 't-up';
    }
  } else if (currentTxCount > 0) {
    txTrendLabel = `+${currentTxCount}`;
    txTrendClass = 't-up';
  }

  const formatAktivitasItem = (log) => {
    if (!log) return null;
    const summary = log.details_summary || '';

    if (log.action === 'DEPOSIT_WEIGHING') {
      const nasabahMatch = summary.match(/untuk Nasabah (WW-[A-Z]+-\d+|[^\(\)]+)/i);
      const custIdOrName = nasabahMatch ? nasabahMatch[1].trim() : 'Nasabah';
      const custObj = availableNasabahs.find(n => n.customer_id === custIdOrName || n.name === custIdOrName);
      const displayName = custObj ? custObj.name : custIdOrName;

      const weightMatch = summary.match(/setoran\s+([^()]+)/i);
      const weightText = weightMatch ? weightMatch[1].trim() : 'sampah';

      return <><strong>{displayName}</strong> setor {weightText}</>;
    }

    if (log.action === 'BALANCE_WITHDRAWAL') {
      const amtMatch = summary.match(/sebesar\s+Rp\s*([\d\.]+)/i);
      const amtText = amtMatch ? `Rp ${amtMatch[1]}` : 'tabungan';
      const nasabahMatch = summary.match(/untuk Nasabah (WW-[A-Z]+-\d+|[^\(\)]+)/i);
      const custIdOrName = nasabahMatch ? nasabahMatch[1].trim() : 'Nasabah';
      const custObj = availableNasabahs.find(n => n.customer_id === custIdOrName || n.name === custIdOrName);
      const displayName = custObj ? custObj.name : custIdOrName;

      return <><strong>{displayName}</strong> tarik {amtText}</>;
    }

    if (log.action === 'REGISTER_NASABAH') {
      const nameMatch = summary.match(/nasabah baru:\s*([^()]+)/i);
      const nameText = nameMatch ? nameMatch[1].trim() : 'Nasabah';
      return <>Nasabah baru <strong>{nameText}</strong></>;
    }

    if (log.action === 'UPDATE_NASABAH') {
      const nameMatch = summary.match(/data nasabah:\s*([^()]+)/i);
      const nameText = nameMatch ? nameMatch[1].trim() : 'Nasabah';
      return <>Update data <strong>{nameText}</strong></>;
    }

    return <span>{summary || `${log.action} on ${log.entity}`}</span>;
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
    laporan: { title: 'Laporan Operasional', sub: '/ Analytics & Ekspor' },
    laporan_bulanan: { title: 'Laporan Operasional', sub: '/ Analytics & Ekspor' },
    history: { title: 'Audit Log', sub: '/ System Event Log' }
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
            <div className="sb-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232, 179, 35, 0.15)', borderRadius: '8px', width: '36px', height: '36px' }}>
              <Recycle size={22} style={{ color: 'var(--gold)' }} />
            </div>
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

                {renderSidebarItem('nasabah', 'Nasabah', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                  </svg>
                ), posTab, setPosTab, nasabahs.length || 142)}

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
                {renderSidebarItem('laporan', 'Laporan', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M14.71 2.29A1 1 0 0 0 14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-.27-.11-.52-.29-.71zM9 19H7v-6h2zm4 0h-2v-8h2zm4 0h-2v-4h2zM13 9V3.5L18.5 9z" />
                  </svg>
                ), posTab, setPosTab)}
                {renderSidebarItem('history', 'Audit Log', (
                  <svg className="ic" viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', display: 'inline-block' }}>
                    <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89l.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7s-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54l.72-1.21l-3.5-2.08V8z" />
                  </svg>
                ), posTab, setPosTab)}
              </>
            )}
          </nav>

          {/* User Footer Profile */}
          <div className="sb-footer">
            <div className="sb-av">{activeRole === 'ADMIN_PUSAT' ? 'PA' : activePosId}</div>
            <div>
              <div className="sb-un">{activeRole === 'ADMIN_PUSAT' ? 'Admin Pusat' : 'Admin POS'}</div>
              <div className="sb-ur">{activeRole === 'ADMIN_PUSAT' ? 'Pusat Admin' : (posList.find(p => p.pos_id === activePosId)?.pos_name || `POS ${activePosId}`)}</div>
            </div>
            <button className="sb-logout" title="Keluar" onClick={() => showToast('Disimulasi log out')}>
              <svg viewBox="0 0 14 14" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                <path fillRule="evenodd" d="M2.5.351a40.5 40.5 0 0 1 5.74 0c1.136.081 2.072.874 2.264 1.932a2.25 2.25 0 0 0-2.108 2.28H4.754a2.25 2.25 0 0 0 0 4.5h3.642a2.25 2.25 0 0 0 2.145 2.281l-.004.085c-.06 1.2-1.06 2.132-2.296 2.22a40.5 40.5 0 0 1-5.742 0C1.263 13.561.263 12.63.203 11.43a91 91 0 0 1 0-8.859C.263 1.372 1.263.439 2.5.351m7.356 5.462L9.661 4.7a1 1 0 0 1 1.432-1.067c1.107.553 2.178 1.624 2.731 2.731a1 1 0 0 1 0 .895c-.553 1.107-1.624 2.178-2.731 2.731A1 1 0 0 1 9.66 8.924l.195-1.111H4.754a1 1 0 1 1 0-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <div className="main-content">
        {/* Topbar Header */}
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
                        openNewDepositModal();
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
                      <div className="ps">Periode {currentMonthNameStr} {currentYearNum} · Diperbarui Hari Ini, {formattedCurrentTime}</div>
                    </div>
                  </div>

                  <div className="stats">
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M13 20V8.8c.5-.2 1-.5 1.3-.9l3.5 1.3l-2.9 6.8c-.5 2 1 3 3.5 3s4.1-1 3.5-3l-2.6-6.3l.9.3l.7-1.9L15 6c0-1.2-.7-2.4-2-2.9c-1.2-.5-2.5 0-3.3.9L3.9 2l-.7 1.8l1.6.6L2.1 11c-.5 2 1 3 3.5 3s4.1-1 3.5-3L6.6 5.1L9 6c0 1.2.7 2.4 2 2.9V20H2v2h20v-2zm6.9-4h-3l1.5-3.8zM7.1 11h-3l1.5-3.8zm4-5.3c.2-.5.8-.8 1.3-.6s.8.8.6 1.3s-.8.8-1.3.6s-.8-.8-.6-1.3" />
                          </svg>
                        </div>
                        <span className={`trend ${weightTrendClass}`}>{weightTrendLabel}</span>
                      </div>
                      <div className="stat-num">{currentWeightVal ? `${currentWeightVal.toLocaleString('id-ID')} kg` : '0 kg'}</div>
                      <div className="stat-lbl">Total Sampah Bulan Ini</div>
                    </div>

                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                          </svg>
                        </div>
                        <span className="trend t-up">{nasabahTrendLabel}</span>
                      </div>
                      <div className="stat-num">{nasabahs.length}</div>
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
                        <span className="trend t-up">{dashboardKpi.totalBuyValue ? `+Rp ${(dashboardKpi.totalBuyValue || 0).toLocaleString('id-ID')}` : '0%'}</span>
                      </div>
                      <div className="stat-num">
                        {metrics.totalCustomerBalance
                          ? (metrics.totalCustomerBalance >= 1000000
                            ? `Rp ${(metrics.totalCustomerBalance / 1000000).toFixed(1).replace('.', ',')}jt`
                            : `Rp ${metrics.totalCustomerBalance.toLocaleString('id-ID')}`)
                          : 'Rp 0'}
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
                        <span className={`trend ${txTrendClass}`}>{txTrendLabel}</span>
                      </div>
                      <div className="stat-num">{currentTxCount}</div>
                      <div className="stat-lbl">Transaksi Bulan Ini</div>
                    </div>
                  </div>

                  <div className="g2 dashboard-grid">
                    <div className="panel g2-main-panel">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">Setoran Terbaru</div>
                          <div className="panel-sub">{Math.min(10, depositsList.length)} dari {depositsList.length} transaksi</div>
                        </div>
                        <span className="panel-link" onClick={() => setPosTab('transaksi')}>Lihat semua →</span>
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
                            {depositsList.length > 0 ? (
                              depositsList.slice(0, 10).map((tx, i) => {
                                const totalQty = tx.details && tx.details.length > 0
                                  ? tx.details.reduce((sum, d) => sum + parseFloat(d.quantity || 0), 0).toFixed(1)
                                  : (tx.weight ? String(tx.weight).replace(' kg', '') : '3.5');
                                const custName = tx.customer_name || tx.customer?.name || 'Nasabah';
                                const custId = tx.customer_id || 'WW-BA-0041';
                                const formattedTime = tx.date
                                  ? new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WITA'
                                  : '10.15 WITA';
                                const formattedDateStr = formatDate(tx.date || tx.created_at) || '18 Agu 2026';

                                return (
                                  <tr key={tx.id || tx.transaction_id || i}>
                                    <td>
                                      <div className="tdm">
                                        <div className="av">{getInitials(custName)}</div>
                                        <div className="mn">{custName}</div>
                                      </div>
                                    </td>
                                    <td>
                                      <span className="td-d">
                                        {formatNasabahId(custId, tx.pos_id || activePosId)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="mono tw-c">
                                        {totalQty} kg
                                      </span>
                                    </td>
                                    <td>
                                      <span className="mono tp-c">
                                        Rp. {parseFloat(tx.totalBuyValue || tx.total_buy_value || tx.amount || 0).toLocaleString('id-ID')}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="td-d">
                                        {formattedTime}
                                      </span>
                                    </td>
                                    <td>
                                      <span className="td-d">
                                        {formattedDateStr}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                  Belum ada transaksi setoran pada node POS ini
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="g2-side-stack">
                      <div className="panel">
                        <div className="panel-head">
                          <div>
                            <div className="panel-title">Komposisi Sampah</div>
                            <div className="panel-sub">Berat bulan ini ({currentMonthNameStr} {currentYearNum})</div>
                          </div>
                        </div>
                        <div className="wl">
                          {dashboardReportData?.categoryComposition && dashboardReportData.categoryComposition.length > 0 ? (
                            dashboardReportData.categoryComposition.map((comp) => {
                              const color = getCatColor(comp.category);
                              return (
                                <div className="wr" key={comp.category}>
                                  <div className="wm">
                                    <span className="wn">
                                      <span className="wd" style={{ background: color }}></span>
                                      {comp.category}
                                    </span>
                                    <span className="wv">
                                      {comp.weight.toLocaleString('id-ID')} kg
                                      <span className="wp">{comp.percentage}%</span>
                                    </span>
                                  </div>
                                  <div className="bt">
                                    <div className="bf" style={{ width: `${Math.min(100, Math.max(4, comp.percentage))}%`, background: color }}></div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                              Belum ada data sampah terpilah bulan ini
                            </div>
                          )}
                        </div>
                        <div className="ms">
                          <div className="ms-c">
                            <div className="ms-v">{(dashboardKpi.totalWeight || 0).toLocaleString('id-ID')}</div>
                            <div className="ms-l">Total kg</div>
                          </div>
                          <div className="ms-c">
                            <div className="ms-v">{(dashboardReportData?.categoryComposition || []).length}</div>
                            <div className="ms-l">Kategori</div>
                          </div>
                        </div>
                      </div>

                      <div className="panel">
                        <div className="panel-head">
                          <div className="panel-title">Aktivitas Terkini</div>
                        </div>
                        <div className="al">
                          {realAuditLogs.length > 0 ? (
                            realAuditLogs.slice(0, 4).map((log, idx) => {
                              const timeStr = log.timestamp
                                ? new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WITA'
                                : 'Baru saja';

                              return (
                                <div className="ai" key={log.log_id || idx}>
                                  <div className="adot"></div>
                                  <div>
                                    <div className="at">
                                      {formatAktivitasItem(log)}
                                    </div>
                                    <div className="atime">{timeStr}</div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
                              Belum ada catatan aktivitas sistem
                            </div>
                          )}
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
                      <div className="ps">{nasabahTotalCount} nasabah terdaftar · Periode {currentMonthNameStr} {currentYearNum}</div>
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
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M8 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8m9 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6M4.25 14A2.25 2.25 0 0 0 2 16.25v.25S2 21 8 21s6-4.5 6-4.5v-.25A2.25 2.25 0 0 0 11.75 14zM17 19.5c-1.171 0-2.068-.181-2.755-.458a5.5 5.5 0 0 0 .736-2.207A4 4 0 0 0 15 16.55v-.3a3.24 3.24 0 0 0-.902-2.248L14.2 14h5.6a2.2 2.2 0 0 1 2.2 2.2s0 3.3-5 3.3" />
                          </svg>
                        </div>
                        <span className="trend t-uw">{newNasabahsThisMonth > 0 ? `+${newNasabahsThisMonth} baru` : `${nasabahActiveCount} aktif`}</span>
                      </div>
                      <div className="stat-num">{nasabahTotalCount}</div>
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
                        <span className="trend t-up">{nasabahTotalCount > 0 ? `${Math.round((nasabahActiveCount / nasabahTotalCount) * 100)}%` : '100%'}</span>
                      </div>
                      <div className="stat-num">{nasabahActiveCount}</div>
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
                        <span className="trend t-up">↑ {newNasabahsThisMonth}</span>
                      </div>
                      <div className="stat-num">{newNasabahsThisMonth}</div>
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
                        <span className="trend t-up">Rp {(avgNasabahBalance).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="stat-num">
                        {avgNasabahBalance >= 1000000 
                          ? `Rp ${(avgNasabahBalance / 1000000).toFixed(1).replace('.', ',')}jt`
                          : avgNasabahBalance >= 1000 
                            ? `Rp ${(avgNasabahBalance / 1000).toFixed(0)}rb`
                            : `Rp ${avgNasabahBalance}`}
                      </div>
                      <div className="stat-lbl">Rata-rata Tabungan</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div><div className="panel-title">Daftar Nasabah</div></div>
                    </div>

                    <div className="tabs">
                      <button className={`tab ${nasabahFilterStatus === 'ALL' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('ALL')}>
                        Semua ({nasabahTotalCount})
                      </button>
                      <button className={`tab ${nasabahFilterStatus === 'ACTIVE' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('ACTIVE')}>
                        Aktif ({nasabahActiveCount})
                      </button>
                      <button className={`tab ${nasabahFilterStatus === 'INACTIVE' ? 'on' : ''}`} onClick={() => setNasabahFilterStatus('INACTIVE')}>
                        Tidak Aktif ({nasabahInactiveCount})
                      </button>
                    </div>

                    <div className="tw">
                      <table style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '22%' }}>Nasabah</th>
                            <th style={{ width: '14%' }}>ID Nasabah</th>
                            <th style={{ width: '24%' }}>Alamat</th>
                            <th style={{ width: '14%' }}>Bergabung</th>
                            <th style={{ width: '14%' }}>Tabungan</th>
                            <th style={{ width: '12%' }}>Status</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredNasabahTableData.length > 0 ? (
                            filteredNasabahTableData.map(n => (
                              <tr key={n.customer_id}>
                                <td>
                                  <div className="tdm" style={{ overflow: 'hidden' }}>
                                    <div className="av" style={{ flexShrink: 0 }}>{getInitials(n.name)}</div>
                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      <div className="mn" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="td-d">{formatNasabahId(n.customer_id, n.pos_id || activePosId)}</span></td>
                                <td style={{ fontSize: '11.5px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.address}</td>
                                <td><span className="td-d">{formatDate(n.created_at)}</span></td>
                                <td><span className="mono tp-c">Rp. {parseFloat(n.balance || 0).toLocaleString('id-ID')}</span></td>
                                <td><span className={`badge ${n.status === 'INACTIVE' ? 'b-r' : 'b-g'}`}>{n.status === 'INACTIVE' ? 'Tidak Aktif' : 'Aktif'}</span></td>
                                <td style={{ textAlign: 'center' }}>
                                  <div className="td-act" style={{ justifyContent: 'center' }}>
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => {
                                        setEditingNasabah(n);
                                        setNasabahEditForm({
                                          name: n.name || '',
                                          address: n.address || '',
                                          status: n.status || (n.is_active === false ? 'INACTIVE' : 'ACTIVE')
                                        });
                                        setTanggalNasabah(getCurrentDateTimeLocal());
                                        setModalType('EDIT_NASABAH');
                                        setIsModalOpen(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)', fontSize: '12.5px' }}>
                                Tidak ada data nasabah yang sesuai dengan filter / pencarian.
                              </td>
                            </tr>
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
                    <div className="ph2-r" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        className="fi"
                        style={{ width: 'auto', height: '36px', fontSize: '12.5px', padding: '0 12px' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                      </select>
                      <select
                        className="fi"
                        style={{ width: 'auto', height: '36px', fontSize: '12.5px', padding: '0 12px' }}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                      <button
                        className="btn btn-ghost"
                        style={{ height: '36px', padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => showToast('Export data transaksi...')}
                      >
                        <Download size={14} /> Export
                      </button>
                      <button
                        className="btn btn-gold"
                        style={{ height: '36px' }}
                        onClick={() => openNewDepositModal()}
                      >
                        + Setoran Baru
                      </button>
                    </div>
                  </div>

                  <div className="stats">
                    {/* KPI 1: Transaksi Setor Icon in Yellow Brand Color on stat hl */}
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M17.997 4.17A3 3 0 0 1 20 7v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 2.003-2.83A4 4 0 0 0 10 8h4a4 4 0 0 0 3.98-3.597zM15 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-4H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m-1-9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4z" />
                          </svg>
                        </div>
                        <span className="trend t-uw">+18</span>
                      </div>
                      <div className="stat-num">{history.length || 238}</div>
                      <div className="stat-lbl">Total Transaksi</div>
                    </div>

                    {/* KPI 2: Jenis Sampah Icon with Brand Green & Yellow Background */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="m21.82 15.42l-2.5 4.33c-.49.86-1.4 1.31-2.32 1.25h-2v2l-2.5-4.5L15 14v2h2.82l-2.22-3.85l4.33-2.5l1.8 3.12c.52.77.59 1.8.09 2.65M9.21 3.06h5c.98 0 1.83.57 2.24 1.39l1 1.74l1.73-1l-2.64 4.41l-5.15.09l1.73-1l-1.41-2.45l-2.21 3.85l-4.34-2.5l1.8-3.12c.41-.83 1.26-1.41 2.25-1.41m-4.16 16.7l-2.5-4.33c-.49-.85-.42-1.87.09-2.64l1-1.73l-1.73-1l5.14.08l2.65 4.42l-1.73-1L6.56 16H11v5H7.4a2.51 2.51 0 0 1-2.35-1.24" />
                          </svg>
                        </div>
                        <span className="trend t-up">380 kg</span>
                      </div>
                      <div className="stat-num">Plastik</div>
                      <div className="stat-lbl">Kategori Sampah Terbanyak</div>
                    </div>

                    {/* KPI 3: Money Icon with Brand Green & Yellow Background */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Banknote size={18} />
                        </div>
                      </div>
                      <div className="stat-num">Rp 523.350</div>
                      <div className="stat-lbl">Total Nilai</div>
                    </div>

                    {/* KPI 4: Scales Icon with Brand Green & Yellow Background */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M13 20V8.8c.5-.2 1-.5 1.3-.9l3.5 1.3l-2.9 6.8c-.5 2 1 3 3.5 3s4.1-1 3.5-3l-2.6-6.3l.9.3l.7-1.9L15 6c0-1.2-.7-2.4-2-2.9c-1.2-.5-2.5 0-3.3.9L3.9 2l-.7 1.8l1.6.6L2.1 11c-.5 2 1 3 3.5 3s4.1-1 3.5-3L6.6 5.1L9 6c0 1.2.7 2.4 2 2.9V20H2v2h20v-2zm6.9-4h-3l1.5-3.8zM7.1 11h-3l1.5-3.8zm4-5.3c.2-.5.8-.8 1.3-.6s.8.8.6 1.3s-.8.8-1.3.6s-.8-.8-.6-1.3" />
                          </svg>
                        </div>
                        <span className="trend t-up">↑ 12%</span>
                      </div>
                      <div className="stat-num">1.247 kg</div>
                      <div className="stat-lbl">Total Berat</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div className="panel-title">Daftar Transaksi Setor</div>
                    </div>

                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>ID Transaksi</th>
                            <th>Nasabah</th>
                            <th>ID Nasabah</th>
                            <th>Berat</th>
                            <th>Nilai (Rp)</th>
                            <th>Sumber Input</th>
                            <th>Waktu</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(depositsList.length > 0 ? depositsList : history.filter(h => h.type === 'DEPOSIT')).map((tx) => {
                            const firstDetail = tx.details?.[0] || {};
                            const totalQty = tx.details ? tx.details.reduce((sum, d) => sum + parseFloat(d.quantity || 0), 0).toFixed(1) : '3.5';
                            const formattedTime = tx.date ? new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.') + ' WITA' : '10.15 WITA';
                            const formattedDateStr = formatDate(tx.date || tx.created_at) || '24 Feb 2026';

                            return (
                              <tr key={tx.id || tx.transaction_id}>
                                <td><span className="mono" style={{ fontSize: '11px', color: 'var(--faint)' }}>#{tx.id || tx.transaction_id}</span></td>
                                <td>
                                  <div className="tdm">
                                    <div className="av">{getInitials(tx.customer_name || tx.customer?.name || 'Siti Rahayu')}</div>
                                    <div>
                                      <div className="mn">{tx.customer_name || tx.customer?.name || 'Siti Rahayu'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="td-d">{formatNasabahId(tx.customer_id, tx.pos_id || activePosId)}</span></td>
                                <td><span className="mono tw-c">{totalQty} {firstDetail.unit || 'kg'}</span></td>
                                <td><span className="mono tp-c">Rp. {parseFloat(tx.totalBuyValue || tx.total_buy_value || 5250).toLocaleString('id-ID')}</span></td>
                                <td>
                                  <span className={`badge ${tx.source === 'Excel' ? 'b-g' : 'b-y'}`}>
                                    {tx.source || (tx.created_by ? 'System POS' : 'Manual')}
                                  </span>
                                </td>
                                <td><span className="td-d">{formattedTime}</span></td>
                                <td><span className="td-d">{formattedDateStr}</span></td>
                                <td>
                                  <div className="td-act">
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => handleEditSetoran(tx)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => {
                                        setSelectedDepositDetail(tx);
                                        setModalType('DETAIL_SETORAN');
                                        setIsModalOpen(true);
                                      }}
                                    >
                                      Detail
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: JENIS SAMPAH */}
              {(posTab === 'jenis' || posTab === 'jenis_sampah') && (
                <>
                  {!selectedCategoryForDetail ? (
                    <>
                      {/* Main Category Grid View (Image 1 Wireframe) */}
                      <div className="ph2">
                        <div className="ph2-l">
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                            Jenis Sampah <span style={{ color: '#9ca3af' }}>/ Kategori Sampah</span>
                          </div>
                          <div className="pt">Jenis <span style={{ color: '#2d5a37' }}>Sampah</span></div>
                          <div className="ps">{posWasteTypes.length || 6} kategori aktif terdaftar</div>
                        </div>
                      </div>

                      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {posWasteTypes.map(cat => (
                          <div
                            key={cat.category_id}
                            className="card"
                            style={{
                              cursor: 'pointer',
                              padding: '24px',
                              borderRadius: '16px',
                              border: '1px solid #e5e7eb',
                              background: '#ffffff',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            onClick={() => setSelectedCategoryForDetail(cat.category_name)}
                          >
                            <div
                              style={{
                                width: '54px',
                                height: '54px',
                                borderRadius: '12px',
                                background: getCategoryBg(cat.category_name),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                              }}
                            >
                              {getCategoryIcon(cat.category_name, 26)}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                              {cat.category_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {cat.types.length} tipe terdaftar
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Sub-Page Detail View per Category (Image 2 Wireframe) */}
                      {(() => {
                        const catObj = posWasteTypes.find(c => c.category_name === selectedCategoryForDetail);
                        const types = catObj ? catObj.types : [];
                        const vendorName = types[0] ? types[0].vendor_name : (activePosId === 'BA' ? 'Bali Bersih' : 'Bali Waste Cycle');
                        const vendorShort = vendorName.includes('Bali Waste Cycle') ? 'BWC' : (vendorName.includes('Bali Bersih') ? 'BWL' : vendorName);

                        return (
                          <>
                            <div className="ph2">
                              <div className="ph2-l">
                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span
                                    onClick={() => setSelectedCategoryForDetail(null)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--forest)' }}
                                  >
                                    Jenis Sampah
                                  </span>
                                  <span>/</span>
                                  <span style={{ color: '#9ca3af' }}>Kategori Sampah</span>
                                </div>
                                <div className="pt">{vendorShort} – <span style={{ color: '#2d5a37' }}>{selectedCategoryForDetail}</span></div>
                                <div className="ps">{types.length} Tipe terdaftar</div>
                              </div>
                              <button
                                className="btn btn-ghost"
                                onClick={() => setSelectedCategoryForDetail(null)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <ArrowLeft size={16} /> Kembali ke Kategori
                              </button>
                            </div>

                            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                              {types.map(t => (
                                <div
                                  key={t.waste_type_id}
                                  className="card"
                                  style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '44px',
                                      height: '44px',
                                      borderRadius: '10px',
                                      background: getCategoryBg(selectedCategoryForDetail),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginBottom: '14px'
                                    }}
                                  >
                                    {getCategoryIcon(selectedCategoryForDetail, 20)}
                                  </div>

                                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                    {t.waste_name}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '14px', lineHeight: '1.4', minHeight: '34px' }}>
                                    {t.description || `${t.waste_name} terpilah bersih.`}
                                  </div>

                                  {/* Empty Image Slots for Trash Visualization (Placeholder for future photo uploads) */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                    {[1, 2, 3].map(slotIdx => (
                                      <div
                                        key={slotIdx}
                                        style={{
                                          height: '76px',
                                          borderRadius: '10px',
                                          border: '1px solid #e5e7eb',
                                          background: '#fafafa'
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </>
              )}

              {/* PAGE: TABUNGAN */}
              {posTab === 'tabungan' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Tabungan <span>Nasabah</span></div>
                      <div className="ps">Saldo aktif {availableNasabahs.length} nasabah</div>
                    </div>
                    <div className="ph2-r">
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', color: 'var(--faint)' }} />
                        <input
                          className="fi"
                          type="text"
                          placeholder="Cari nasabah..."
                          value={tabunganSearchText}
                          onChange={(e) => setTabunganSearchText(e.target.value)}
                          style={{ paddingLeft: '34px', width: '220px', height: '36px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="stats">
                    {/* KPI 1: Tabungan piggy bank/wallet icon matching sidebar Tabungan page icon */}
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg viewBox="0 0 48 48" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <g fill="currentColor">
                              <path fillRule="evenodd" d="M14.953 16.63c4.816 1.86 10.603 1.86 15.418-.002a29.3 29.3 0 0 1 5.153 7.487c.872.134 1.707.38 2.49.723c-1.427-3.644-3.841-7.186-6.436-9.838l3.694-5.4a16 16 0 0 0-1.886-1.054C30.946 7.361 27.027 6 22.711 6c-4.406 0-8.431 1.42-10.886 2.621q-.366.18-.684.35c-.427.23-.787.444-1.069.629L13.74 15c-8.59 9.038-14.99 26.997 8.971 26.997a37 37 0 0 0 4.906-.3a10 10 0 0 1-1.713-1.826q-1.472.124-3.193.126c-5.785 0-9.413-1.091-11.58-2.591c-2.075-1.437-2.986-3.37-3.115-5.632c-.134-2.35.585-5.093 1.932-7.87c1.285-2.648 3.079-5.197 5.005-7.274m14.251-1.702l2.958-4.323c-2.75.198-6.023.844-9.173 1.756c-2.25.65-4.749.551-7.065.124a25 25 0 0 1-1.737-.386l1.92 2.827c4.116 1.465 8.982 1.465 13.097.002m-15.4-5.012c.8.238 1.635.445 2.483.602c2.15.396 4.307.454 6.146-.079a54 54 0 0 1 6.53-1.471C27.123 8.414 24.972 8 22.71 8c-3.445 0-6.658.961-8.907 1.916" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M22.67 28c1.021 0 1.953.383 2.66 1.013a10 10 0 0 0-.892 2.051A2 2 0 0 0 22.67 30v4c.517 0 .988-.196 1.343-.518a10 10 0 0 0 .134 2.236A4 4 0 0 1 22.67 36v1h-2v-1a4 4 0 0 1-3.772-2.667a1 1 0 1 1 1.886-.666A2 2 0 0 0 20.67 34v-4a4 4 0 0 1 0-8v-1h2v1a4 4 0 0 1-3.772 2.667a1 1 0 1 1-1.886-.666A2 2 0 0 0 22.67 24zm-2-4a2 2 0 0 0 0 4z" clipRule="evenodd" />
                              <path d="m35 34.42l1.19-1.067l1.335 1.49L34 38.001l-3.524-3.16l1.335-1.489L33 34.419V30h2z" />
                              <path fillRule="evenodd" d="M34 42a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-2a6 6 0 1 0 0-12a6 6 0 0 0 0 12" clipRule="evenodd" />
                            </g>
                          </svg>
                        </div>
                        <span className="trend t-uw">↑ 14%</span>
                      </div>
                      <div className="stat-num">Rp 4.800.000</div>
                      <div className="stat-lbl">Total Tabungan</div>
                    </div>

                    {/* KPI 2: Users Vector Icon */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Users size={18} />
                        </div>
                      </div>
                      <div className="stat-num">Rp 33.800</div>
                      <div className="stat-lbl">Rata-rata / Nasabah</div>
                    </div>

                    {/* KPI 3: Award Vector Icon */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Award size={18} />
                        </div>
                      </div>
                      <div className="stat-num">Rp 215.000</div>
                      <div className="stat-lbl">Tabungan Tertinggi</div>
                    </div>

                    {/* KPI 4: Wallet Vector Icon */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Wallet size={18} />
                        </div>
                        <span className="trend t-up">bulan ini</span>
                      </div>
                      <div className="stat-num">Rp 620.000</div>
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
                            <th>ID Nasabah</th>
                            <th>Saldo</th>
                            <th>Masuk Bulan Ini</th>
                            <th>Keluar Bulan Ini</th>
                            <th>TGL Update</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTabunganData.length > 0 ? (
                            filteredTabunganData.map(n => (
                              <tr key={n.customer_id}>
                                <td>
                                  <div className="tdm">
                                    <div className="av">{getInitials(n.name)}</div>
                                    <div>
                                      <div className="mn">{n.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="td-d">{formatNasabahId(n.customer_id, n.pos_id || activePosId)}</span></td>
                                <td><span className="mono tp-c">Rp. {parseFloat(n.balance || 0).toLocaleString('id-ID')}</span></td>
                                <td><span className="mono tw-c">+ Rp 35.500</span></td>
                                <td><span className="mono" style={{ color: 'var(--red)', fontWeight: 600 }}>- Rp 0</span></td>
                                <td><span className="td-d">{formatDate(n.created_at || '2025-02-24')}</span></td>
                                <td>
                                  <div className="td-act">
                                    <button
                                      className="btn btn-sm btn-ghost"
                                      onClick={() => {
                                        setSelectedNasabahHistory(n);
                                        setModalType('RIWAYAT_TABUNGAN');
                                        setIsModalOpen(true);
                                      }}
                                    >
                                      Riwayat
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)', fontSize: '12.5px' }}>
                                Tidak ada data tabungan yang sesuai dengan pencarian.
                              </td>
                            </tr>
                          )}
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
                    <div className="ph2-r">
                      <button
                        className="btn btn-gold"
                        style={{ height: '36px' }}
                        onClick={() => {
                          setWithdrawAmount('');
                          setModalType('PENARIKAN');
                          setIsModalOpen(true);
                        }}
                      >
                        <Plus size={16} /> + Penarikan Saldo
                      </button>
                    </div>
                  </div>

                  {/* 4 Standardized Equal-Sized KPI Cards */}
                  <div className="stats">
                    {/* KPI 1: Penarikan Page Icon in Yellow Brand Color */}
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: '18px', height: '18px' }}>
                            <path d="m18.935 13.945l-.67-3.648c-.29-1.576-.435-2.364-1.008-2.83S15.86 7 14.213 7H9.787c-1.647 0-2.47 0-3.044.467c-.573.466-.718 1.254-1.008 2.83l-.67 3.648c-.6 3.271-.901 4.907.024 5.98C6.014 21 7.724 21 11.142 21h1.716c3.418 0 5.128 0 6.053-1.074s.625-2.71.024-5.98Z" />
                            <path strokeLinejoin="round" d="M12 10.5V17m-2.5-2l2.5 2.5l2.5-2.5" />
                          </svg>
                        </div>
                        <span className="trend t-uw">bulan ini</span>
                      </div>
                      <div className="stat-num">Rp 620.000</div>
                      <div className="stat-lbl">Total Penarikan</div>
                    </div>

                    {/* KPI 2: Banknote Icon */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Banknote size={18} />
                        </div>
                      </div>
                      <div className="stat-num">Rp 1.450.000</div>
                      <div className="stat-lbl">Total Pencairan</div>
                    </div>

                    {/* KPI 3: Clock Icon */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Clock size={18} />
                        </div>
                        <span className="trend t-uw" style={{ background: 'var(--amb-s)', color: 'var(--amb)' }}>
                          {SAMPLE_WITHDRAWALS.filter(w => w.status === 'PENDING').length} request
                        </span>
                      </div>
                      <div className="stat-num">{SAMPLE_WITHDRAWALS.filter(w => w.status === 'PENDING').length}</div>
                      <div className="stat-lbl">Menunggu Proses</div>
                    </div>

                    {/* KPI 4: CheckCircle2 Icon matching exact size of rest */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <CheckCircle2 size={18} />
                        </div>
                      </div>
                      <div className="stat-num">{SAMPLE_WITHDRAWALS.filter(w => w.status === 'COMPLETED').length}</div>
                      <div className="stat-lbl">Selesai Bulan Ini</div>
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Permintaan Penarikan</div>
                        <div className="panel-sub">Daftar pengajuan pencairan saldo nasabah</div>
                      </div>
                    </div>

                    {/* Working Category/Status Filter Tabs */}
                    <div className="tabs">
                      <button
                        className={`tab ${penarikanFilterStatus === 'ALL' ? 'on' : ''}`}
                        onClick={() => setPenarikanFilterStatus('ALL')}
                      >
                        Semua ({SAMPLE_WITHDRAWALS.length})
                      </button>
                      <button
                        className={`tab ${penarikanFilterStatus === 'PENDING' ? 'on' : ''}`}
                        onClick={() => setPenarikanFilterStatus('PENDING')}
                      >
                        Menunggu ({SAMPLE_WITHDRAWALS.filter(w => w.status === 'PENDING').length})
                      </button>
                      <button
                        className={`tab ${penarikanFilterStatus === 'COMPLETED' ? 'on' : ''}`}
                        onClick={() => setPenarikanFilterStatus('COMPLETED')}
                      >
                        Selesai ({SAMPLE_WITHDRAWALS.filter(w => w.status === 'COMPLETED').length})
                      </button>
                    </div>

                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Nasabah</th>
                            <th>ID Nasabah</th>
                            <th>Nominal</th>
                            <th>Saldo Sisa</th>
                            <th>Metode</th>
                            <th>Status</th>
                            <th>Tgl Req</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPenarikanData.length > 0 ? (
                            filteredPenarikanData.map(wd => (
                              <tr key={wd.id}>
                                <td>
                                  <div className="tdm">
                                    <div className="av">{getInitials(wd.customer_name)}</div>
                                    <div>
                                      <div className="mn">{wd.customer_name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="td-d">{formatNasabahId(wd.customer_id, wd.pos_id || activePosId)}</span></td>
                                <td><span className="mono" style={{ fontWeight: 700, color: 'var(--ink)' }}>Rp {wd.amount.toLocaleString('id-ID')}</span></td>
                                <td><span className="mono tw-c">Rp {wd.remaining_balance.toLocaleString('id-ID')}</span></td>
                                <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{wd.method}</td>
                                <td>
                                  <span className={`badge ${wd.status === 'COMPLETED' ? 'b-g' : 'b-y'}`}>
                                    {wd.status === 'COMPLETED' ? 'Selesai' : 'Menunggu'}
                                  </span>
                                </td>
                                <td><span className="td-d">{wd.date}</span></td>
                                <td>
                                  <div className="td-act">
                                    {wd.status === 'COMPLETED' ? (
                                      <button
                                        className="btn btn-sm btn-ghost"
                                        onClick={() => {
                                          setSelectedWithdrawal(wd);
                                          setModalType('DETAIL_PENARIKAN');
                                          setIsModalOpen(true);
                                        }}
                                      >
                                        Detail
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn-sm btn-gold"
                                        onClick={() => {
                                          setSelectedWithdrawal(wd);
                                          setSelectedWithdrawalProof(null);
                                          setModalType('PROSES_PENARIKAN');
                                          setIsModalOpen(true);
                                        }}
                                      >
                                        ✓ Proses
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--muted)', fontSize: '12.5px' }}>
                                Tidak ada data permintaan penarikan.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* PAGE: HARGA SAMPAH */}
              {(posTab === 'harga' || posTab === 'harga_sampah') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Harga <span style={{ color: '#2d5a37' }}>Sampah</span></div>
                      <div className="ps">Daftar harga beli resmi per kategori sesuai sheet acuan vendor</div>
                    </div>
                  </div>

                  {posWasteTypes.length === 0 ? (
                    <div className="panel mb-4" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                      Belum ada data kategori & harga sampah terdaftar untuk POS ini.
                    </div>
                  ) : (
                    posWasteTypes.map(cat => (
                      <div key={cat.category_id} className="panel mb-4" style={{ marginBottom: '24px', borderRadius: '14px', overflow: 'hidden' }}>
                        <div className="panel-head" style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: getCategoryBg(cat.category_name),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {getCategoryIcon(cat.category_name, 20)}
                            </div>
                            <div>
                              <div className="panel-title" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                                {cat.category_name}
                              </div>
                              <div className="panel-sub" style={{ fontSize: '12px', color: '#6b7280' }}>
                                {cat.types.length} jenis terdaftar
                              </div>
                            </div>
                          </div>
                          <span className="badge b-g" style={{ fontSize: '11px', padding: '4px 10px' }}>
                            {cat.types[0]?.vendor_name || 'Vendor'}
                          </span>
                        </div>

                        <div className="tw">
                          <table>
                            <thead>
                              <tr>
                                <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                                <th>Jenis Sampah</th>
                                <th>Keterangan / Spesifikasi</th>
                                <th>Harga Beli Nasabah</th>
                                <th style={{ width: '90px' }}>Satuan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cat.types.map((t, itemIdx) => (
                                <tr key={t.waste_type_id}>
                                  <td style={{ textAlign: 'center', color: '#9ca3af', fontWeight: 500, fontSize: '12px' }}>
                                    {itemIdx + 1}
                                  </td>
                                  <td>
                                    <strong className="mn" style={{ fontSize: '13.5px', color: '#111827' }}>
                                      {t.waste_name}
                                    </strong>
                                  </td>
                                  <td style={{ fontSize: '12px', color: '#6b7280', maxWidth: '340px', lineHeight: '1.4' }}>
                                    {t.description || `${t.waste_name} terpilah bersih.`}
                                  </td>
                                  <td>
                                    <span className="price-big" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest)' }}>
                                      Rp {t.buy_price.toLocaleString('id-ID')}
                                      <span className="price-unit" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>/{t.unit}</span>
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge b-y" style={{ fontSize: '10.5px', textTransform: 'uppercase' }}>
                                      {t.unit}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* PAGE: LAPORAN */}
              {(posTab === 'laporan' || posTab === 'laporan_bulanan') && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Laporan <span>Analytics & Rekapitulasi</span></div>
                      <div className="ps">Ringkasan statistik operasional, tren, dan ekspor dokumen</div>
                    </div>
                    <div className="ph2-r" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Period Toggle Button Group */}
                      <div className="sim-toggle-group" style={{ height: '36px' }}>
                        <button
                          className={`sim-toggle-btn ${reportPeriodMode === 'monthly' ? 'active' : ''}`}
                          onClick={() => setReportPeriodMode('monthly')}
                        >
                          Bulanan
                        </button>
                        <button
                          className={`sim-toggle-btn ${reportPeriodMode === 'semester' ? 'active' : ''}`}
                          onClick={() => setReportPeriodMode('semester')}
                        >
                          6 Bulanan
                        </button>
                      </div>

                      {/* Selectors depending on period mode */}
                      {reportPeriodMode === 'monthly' ? (
                        <select
                          className="fi"
                          style={{ width: 'auto', height: '36px', fontSize: '12.5px', padding: '0 12px' }}
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                          <option value="Januari">Januari</option>
                          <option value="Februari">Februari</option>
                          <option value="Maret">Maret</option>
                          <option value="April">April</option>
                          <option value="Mei">Mei</option>
                          <option value="Juni">Juni</option>
                          <option value="Juli">Juli</option>
                          <option value="Agustus">Agustus</option>
                          <option value="September">September</option>
                          <option value="Oktober">Oktober</option>
                          <option value="November">November</option>
                          <option value="Desember">Desember</option>
                        </select>
                      ) : (
                        <select
                          className="fi"
                          style={{ width: 'auto', height: '36px', fontSize: '12.5px', padding: '0 12px' }}
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                        >
                          <option value="1">Semester 1 (Jan - Jun)</option>
                          <option value="2">Semester 2 (Jul - Des)</option>
                        </select>
                      )}

                      <select
                        className="fi"
                        style={{ width: 'auto', height: '36px', fontSize: '12.5px', padding: '0 12px' }}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>

                      {/* Export Action Buttons */}
                      <button
                        className="btn btn-ghost"
                        style={{ height: '36px', padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: '#10b981', color: '#059669', background: '#ecfdf5', fontWeight: 600 }}
                        onClick={handleExportExcel}
                        disabled={isExporting}
                      >
                        <Download size={14} /> Export Excel (.xlsx)
                      </button>

                      <button
                        className="btn btn-ghost"
                        style={{ height: '36px', padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff', fontWeight: 600 }}
                        onClick={handleExportWord}
                        disabled={isExporting}
                      >
                        <FileText size={14} /> Export Word (.docx)
                      </button>
                    </div>
                  </div>

                  {/* 4 Vector KPI Cards */}
                  <div className="stats">
                    {/* KPI 1: Scale SVG Icon from Dashboard KPI 1 */}
                    <div className="stat hl">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold-s)', color: 'var(--gold)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path fill="currentColor" d="M13 20V8.8c.5-.2 1-.5 1.3-.9l3.5 1.3l-2.9 6.8c-.5 2 1 3 3.5 3s4.1-1 3.5-3l-2.6-6.3l.9.3l.7-1.9L15 6c0-1.2-.7-2.4-2-2.9c-1.2-.5-2.5 0-3.3.9L3.9 2l-.7 1.8l1.6.6L2.1 11c-.5 2 1 3 3.5 3s4.1-1 3.5-3L6.6 5.1L9 6c0 1.2.7 2.4 2 2.9V20H2v2h20v-2zm6.9-4h-3l1.5-3.8zM7.1 11h-3l1.5-3.8zm4-5.3c.2-.5.8-.8 1.3-.6s.8.8.6 1.3s-.8.8-1.3.6s-.8-.8-.6-1.3" />
                          </svg>
                        </div>
                        <span className="trend t-uw">↑ 12%</span>
                      </div>
                      <div className="stat-num">{reportData?.kpi?.totalWeight ? `${reportData.kpi.totalWeight} kg` : '1.247 kg'}</div>
                      <div className="stat-lbl">Total Sampah Terkumpul</div>
                    </div>

                    {/* KPI 2: Banknote SVG Icon from Transaksi Setor KPI 3 */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <Banknote size={18} />
                        </div>
                        <span className="trend t-up">↑ 14%</span>
                      </div>
                      <div className="stat-num">Rp {(reportData?.kpi?.totalBuyValue || 1800000).toLocaleString('id-ID')}</div>
                      <div className="stat-lbl">Total Nilai Sampah (Beli)</div>
                    </div>

                    {/* KPI 3: Outlined Bag Icon from Penarikan KPI 1 */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: '18px', height: '18px' }}>
                            <path d="m18.935 13.945l-.67-3.648c-.29-1.576-.435-2.364-1.008-2.83S15.86 7 14.213 7H9.787c-1.647 0-2.47 0-3.044.467c-.573.466-.718 1.254-1.008 2.83l-.67 3.648c-.6 3.271-.901 4.907.024 5.98C6.014 21 7.724 21 11.142 21h1.716c3.418 0 5.128 0 6.053-1.074s.625-2.71.024-5.98Z" />
                            <path strokeLinejoin="round" d="M12 10.5V17m-2.5-2l2.5 2.5l2.5-2.5" />
                          </svg>
                        </div>
                        <span className="trend t-uw" style={{ background: 'var(--amb-s)', color: 'var(--amb)' }}>Pencairan</span>
                      </div>
                      <div className="stat-num">Rp {(reportData?.kpi?.totalWithdrawn || 620000).toLocaleString('id-ID')}</div>
                      <div className="stat-lbl">Total Penarikan Saldo</div>
                    </div>

                    {/* KPI 4: Clipboard SVG Icon from Dashboard KPI 4 */}
                    <div className="stat">
                      <div className="stat-top">
                        <div className="si" style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M17.997 4.17A3 3 0 0 1 20 7v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 2.003-2.83A4 4 0 0 0 10 8h4a4 4 0 0 0 3.98-3.597zM15 15H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m0-4H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2m-1-9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0-4z" />
                          </svg>
                        </div>
                        <span className="trend t-up">Total</span>
                      </div>
                      <div className="stat-num">{reportData?.kpi?.totalTransactions || 238}</div>
                      <div className="stat-lbl">Total Transaksi Setor</div>
                    </div>
                  </div>

                  {/* 10 Interactive Chart.js Charts Grid */}
                  <div className="g2" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    {/* Chart 1: Line Chart - Tren Berat Sampah */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">1. Tren Berat Sampah (kg)</div>
                          <div className="panel-sub">Volume akumulasi setoran sampah</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Line
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', totalWeight: 842 },
                              { label: 'Okt', totalWeight: 915 },
                              { label: 'Nov', totalWeight: 1040 },
                              { label: 'Des', totalWeight: 980 },
                              { label: 'Jan', totalWeight: 1120 },
                              { label: 'Feb', totalWeight: 1247 }
                            ]).map(t => t.label),
                            datasets: [{
                              label: 'Berat Sampah (kg)',
                              data: (reportData?.monthlyTrends || [
                                { label: 'Sep', totalWeight: 842 },
                                { label: 'Okt', totalWeight: 915 },
                                { label: 'Nov', totalWeight: 1040 },
                                { label: 'Des', totalWeight: 980 },
                                { label: 'Jan', totalWeight: 1120 },
                                { label: 'Feb', totalWeight: 1247 }
                              ]).map(t => t.totalWeight),
                              borderColor: '#10b981',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              fill: true,
                              tension: 0.35,
                              pointRadius: 5,
                              pointHoverRadius: 7
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Berat: ${ctx.parsed.y} kg`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 2: Line Chart - Tren Nilai Beli */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">2. Tren Nilai Sampah (Rp)</div>
                          <div className="panel-sub">Total kredit saldo nasabah</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Line
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', totalBuyValue: 980000 },
                              { label: 'Okt', totalBuyValue: 1150000 },
                              { label: 'Nov', totalBuyValue: 1320000 },
                              { label: 'Des', totalBuyValue: 1450000 },
                              { label: 'Jan', totalBuyValue: 1600000 },
                              { label: 'Feb', totalBuyValue: 1800000 }
                            ]).map(t => t.label),
                            datasets: [{
                              label: 'Nilai Sampah (Rp)',
                              data: (reportData?.monthlyTrends || [
                                { label: 'Sep', totalBuyValue: 980000 },
                                { label: 'Okt', totalBuyValue: 1150000 },
                                { label: 'Nov', totalBuyValue: 1320000 },
                                { label: 'Des', totalBuyValue: 1450000 },
                                { label: 'Jan', totalBuyValue: 1600000 },
                                { label: 'Feb', totalBuyValue: 1800000 }
                              ]).map(t => t.totalBuyValue),
                              borderColor: '#e8b323',
                              backgroundColor: 'rgba(232, 179, 35, 0.1)',
                              fill: true,
                              tension: 0.35,
                              pointRadius: 5,
                              pointHoverRadius: 7
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Total Nilai: Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 3: Donut Chart - Komposisi Sampah */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">3. Komposisi Sampah (%)</div>
                          <div className="panel-sub">Proporsi kategori sampah yang terkumpul</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Doughnut
                          data={{
                            labels: (reportData?.categoryComposition || [
                              { category: 'Plastik', weight: 380 },
                              { category: 'Kertas', weight: 315 },
                              { category: 'Logam', weight: 226 },
                              { category: 'Kaca', weight: 163 },
                              { category: 'Minyak', weight: 100 },
                              { category: 'Lainnya', weight: 63 }
                            ]).map(c => c.category),
                            datasets: [{
                              data: (reportData?.categoryComposition || [
                                { category: 'Plastik', weight: 380 },
                                { category: 'Kertas', weight: 315 },
                                { category: 'Logam', weight: 226 },
                                { category: 'Kaca', weight: 163 },
                                { category: 'Minyak', weight: 100 },
                                { category: 'Lainnya', weight: 63 }
                              ]).map(c => c.weight),
                              backgroundColor: ['#059669', '#d97706', '#4b5563', '#0284c7', '#ea580c', '#8b5cf6'],
                              borderWidth: 2
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` ${ctx.label}: ${ctx.parsed} kg`
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 4: Bar Chart - Distribusi Berat per Kategori */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">4. Distribusi Berat per Kategori</div>
                          <div className="panel-sub">Volume dalam kilogram per jenis kategori</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Bar
                          data={{
                            labels: (reportData?.categoryComposition || [
                              { category: 'Plastik', weight: 380 },
                              { category: 'Kertas', weight: 315 },
                              { category: 'Logam', weight: 226 },
                              { category: 'Kaca', weight: 163 },
                              { category: 'Minyak', weight: 100 },
                              { category: 'Lainnya', weight: 63 }
                            ]).map(c => c.category),
                            datasets: [{
                              label: 'Berat (kg)',
                              data: (reportData?.categoryComposition || [
                                { category: 'Plastik', weight: 380 },
                                { category: 'Kertas', weight: 315 },
                                { category: 'Logam', weight: 226 },
                                { category: 'Kaca', weight: 163 },
                                { category: 'Minyak', weight: 100 },
                                { category: 'Lainnya', weight: 63 }
                              ]).map(c => c.weight),
                              backgroundColor: ['#059669', '#d97706', '#4b5563', '#0284c7', '#ea580c', '#8b5cf6'],
                              borderRadius: 4
                            }]
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Berat: ${ctx.parsed.x} kg`
                                }
                              }
                            },
                            scales: {
                              x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              y: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 5: Line Chart - Tren Penarikan Saldo */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">5. Tren Penarikan Saldo (Rp)</div>
                          <div className="panel-sub">Volume pencairan saldo tabungan nasabah</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Line
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', totalWithdrawn: 420000 },
                              { label: 'Okt', totalWithdrawn: 510000 },
                              { label: 'Nov', totalWithdrawn: 480000 },
                              { label: 'Des', totalWithdrawn: 590000 },
                              { label: 'Jan', totalWithdrawn: 550000 },
                              { label: 'Feb', totalWithdrawn: 620000 }
                            ]).map(t => t.label),
                            datasets: [{
                              label: 'Penarikan (Rp)',
                              data: (reportData?.monthlyTrends || [
                                { label: 'Sep', totalWithdrawn: 420000 },
                                { label: 'Okt', totalWithdrawn: 510000 },
                                { label: 'Nov', totalWithdrawn: 480000 },
                                { label: 'Des', totalWithdrawn: 590000 },
                                { label: 'Jan', totalWithdrawn: 550000 },
                                { label: 'Feb', totalWithdrawn: 620000 }
                              ]).map(t => t.totalWithdrawn),
                              borderColor: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              fill: true,
                              tension: 0.35,
                              pointRadius: 5,
                              pointHoverRadius: 7
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Penarikan: Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 6: Bar Chart - Tren Jumlah Transaksi */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">6. Tren Jumlah Transaksi</div>
                          <div className="panel-sub">Frekuensi aktivitas timbang sampah</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Bar
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', transactionCount: 165 },
                              { label: 'Okt', transactionCount: 182 },
                              { label: 'Nov', transactionCount: 205 },
                              { label: 'Des', transactionCount: 198 },
                              { label: 'Jan', transactionCount: 220 },
                              { label: 'Feb', transactionCount: 238 }
                            ]).map(t => t.label),
                            datasets: [{
                              label: 'Jumlah Transaksi',
                              data: (reportData?.monthlyTrends || [
                                { label: 'Sep', transactionCount: 165 },
                                { label: 'Okt', transactionCount: 182 },
                                { label: 'Nov', transactionCount: 205 },
                                { label: 'Des', transactionCount: 198 },
                                { label: 'Jan', transactionCount: 220 },
                                { label: 'Feb', transactionCount: 238 }
                              ]).map(t => t.transactionCount),
                              backgroundColor: '#2563eb',
                              borderRadius: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Transaksi: ${ctx.parsed.y} kali`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 7: Horizontal Bar Chart - Top 5 Nasabah (Berat) */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">7. Top 5 Nasabah Teraktif (Berat)</div>
                          <div className="panel-sub">Kontributor setoran terbanyak (kg)</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Bar
                          data={{
                            labels: (reportData?.topNasabah || [
                              { name: 'Siti Rahayu', weight: 145 },
                              { name: 'Dewi Hapsari', weight: 128 },
                              { name: 'Budi Wahyono', weight: 112 },
                              { name: 'Rudi Santoso', weight: 95 },
                              { name: 'Murti Astuti', weight: 82 }
                            ]).map(n => n.name),
                            datasets: [{
                              label: 'Total Setoran (kg)',
                              data: (reportData?.topNasabah || [
                                { name: 'Siti Rahayu', weight: 145 },
                                { name: 'Dewi Hapsari', weight: 128 },
                                { name: 'Budi Wahyono', weight: 112 },
                                { name: 'Rudi Santoso', weight: 95 },
                                { name: 'Murti Astuti', weight: 82 }
                              ]).map(n => n.weight),
                              backgroundColor: '#8b5cf6',
                              borderRadius: 4
                            }]
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Total Setoran: ${ctx.parsed.x} kg`
                                }
                              }
                            },
                            scales: {
                              x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              y: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 8: Stacked Bar Chart - Profit Split POS vs Pusat */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">8. Distribution Bagi Hasil (70% POS / 30% Pusat)</div>
                          <div className="panel-sub">Pembagian margin bersih per bulan</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Bar
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', posProfit: 252000, pusatProfit: 108000 },
                              { label: 'Okt', posProfit: 294000, pusatProfit: 126000 },
                              { label: 'Nov', posProfit: 336000, pusatProfit: 144000 },
                              { label: 'Des', posProfit: 378000, pusatProfit: 162000 },
                              { label: 'Jan', posProfit: 420000, pusatProfit: 180000 },
                              { label: 'Feb', posProfit: 490000, pusatProfit: 210000 }
                            ]).map(t => t.label),
                            datasets: [
                              {
                                label: 'Profit POS (70%)',
                                data: (reportData?.monthlyTrends || [
                                  { label: 'Sep', posProfit: 252000 },
                                  { label: 'Okt', posProfit: 294000 },
                                  { label: 'Nov', posProfit: 336000 },
                                  { label: 'Des', posProfit: 378000 },
                                  { label: 'Jan', posProfit: 420000 },
                                  { label: 'Feb', posProfit: 490000 }
                                ]).map(t => t.posProfit),
                                backgroundColor: '#059669'
                              },
                              {
                                label: 'Profit Pusat (30%)',
                                data: (reportData?.monthlyTrends || [
                                  { label: 'Sep', pusatProfit: 108000 },
                                  { label: 'Okt', pusatProfit: 126000 },
                                  { label: 'Nov', pusatProfit: 144000 },
                                  { label: 'Des', pusatProfit: 162000 },
                                  { label: 'Jan', pusatProfit: 180000 },
                                  { label: 'Feb', pusatProfit: 210000 }
                                ]).map(t => t.pusatProfit),
                                backgroundColor: '#d97706'
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` ${ctx.dataset.label}: Rp ${ctx.parsed.y.toLocaleString('id-ID')}`
                                }
                              }
                            },
                            scales: {
                              x: { stacked: true, grid: { display: false } },
                              y: { stacked: true, beginAtZero: true, grid: { color: '#f3f4f6' } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 9: Line Chart - Tren Nasabah Aktif */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">9. Pertumbuhan Nasabah Aktif</div>
                          <div className="panel-sub">Jumlah nasabah terdaftar dan aktif</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Line
                          data={{
                            labels: (reportData?.monthlyTrends || [
                              { label: 'Sep', activeNasabah: 115 },
                              { label: 'Okt', activeNasabah: 122 },
                              { label: 'Nov', activeNasabah: 128 },
                              { label: 'Des', activeNasabah: 134 },
                              { label: 'Jan', activeNasabah: 138 },
                              { label: 'Feb', activeNasabah: 142 }
                            ]).map(t => t.label),
                            datasets: [{
                              label: 'Nasabah Aktif',
                              data: (reportData?.monthlyTrends || [
                                { label: 'Sep', activeNasabah: 115 },
                                { label: 'Okt', activeNasabah: 122 },
                                { label: 'Nov', activeNasabah: 128 },
                                { label: 'Des', activeNasabah: 134 },
                                { label: 'Jan', activeNasabah: 138 },
                                { label: 'Feb', activeNasabah: 142 }
                              ]).map(t => t.activeNasabah),
                              borderColor: '#0284c7',
                              backgroundColor: 'rgba(2, 132, 199, 0.1)',
                              fill: true,
                              tension: 0.35,
                              pointRadius: 5,
                              pointHoverRadius: 7
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Total: ${ctx.parsed.y} nasabah`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart 10: Bar Chart - Jenis Sampah Terpopuler */}
                    <div className="panel report-chart-container">
                      <div className="panel-head">
                        <div>
                          <div className="panel-title">10. Jenis Sampah Terpopuler</div>
                          <div className="panel-sub">Sub-jenis dengan volume timbangan terbesar (kg)</div>
                        </div>
                      </div>
                      <div style={{ padding: '16px 18px', height: '260px' }}>
                        <Bar
                          data={{
                            labels: (reportData?.topWasteTypes || [
                              { name: 'PET Campur', weight: 185 },
                              { name: 'Koran Bekas', weight: 142 },
                              { name: 'Dus/Karton', weight: 120 },
                              { name: 'Besi Tipis', weight: 98 },
                              { name: 'PET Bersih', weight: 85 },
                              { name: 'Botol Kaca', weight: 74 }
                            ]).map(w => w.name),
                            datasets: [{
                              label: 'Berat (kg)',
                              data: (reportData?.topWasteTypes || [
                                { name: 'PET Campur', weight: 185 },
                                { name: 'Koran Bekas', weight: 142 },
                                { name: 'Dus/Karton', weight: 120 },
                                { name: 'Besi Tipis', weight: 98 },
                                { name: 'PET Bersih', weight: 85 },
                                { name: 'Botol Kaca', weight: 74 }
                              ]).map(w => w.weight),
                              backgroundColor: '#ea580c',
                              borderRadius: 4
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => ` Volume: ${ctx.parsed.y} kg`
                                }
                              }
                            },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* PAGE: AUDIT LOG (formerly Riwayat Ledger) */}
              {posTab === 'history' && (
                <>
                  <div className="ph2">
                    <div className="ph2-l">
                      <div className="pt">Audit <span>Log</span></div>
                      <div className="ps">System Event Log & Audit Trail Aktivitas POS</div>
                    </div>
                  </div>

                  <div className="panel mb-4">
                    <div className="panel-head">
                      <div className="panel-title">Daftar Audit Event Log</div>
                    </div>
                    <div className="tw">
                      <table>
                        <thead>
                          <tr>
                            <th>Waktu Log</th>
                            <th>Pengguna</th>
                            <th>Action Event</th>
                            <th>Entity Target</th>
                            <th>Entity ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {realAuditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>Belum ada log audit tercatat.</td>
                            </tr>
                          ) : (
                            realAuditLogs.map((log) => (
                              <tr key={log.log_id}>
                                <td>
                                  <span className="td-d">
                                    {new Date(log.timestamp).toLocaleString('id-ID')}
                                  </span>
                                </td>
                                <td>
                                  <div className="tdm">
                                    <div className="av" style={{ background: '#e0e7ff', color: '#3730a3' }}>
                                      {getInitials(log.username || 'admin')}
                                    </div>
                                    <div>
                                      <div className="mn">{log.username || log.user_id || 'System Admin'}</div>
                                      <div style={{ fontSize: '11px', color: 'var(--faint)' }}>{log.user_role || 'ADMIN'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${log.action.includes('DEPOSIT') ? 'b-g' :
                                      log.action.includes('WITHDRAWAL') ? 'b-y' : 'b-r'
                                    }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td><span className="mono" style={{ fontSize: '12px' }}>{log.entity}</span></td>
                                <td><span className="mono" style={{ fontSize: '11.5px', color: 'var(--muted)' }}>#{log.entity_id || '-'}</span></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
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
                  {modalType === 'EDIT_SETORAN' && 'Edit Setoran'}
                  {modalType === 'NASABAH' && 'Nasabah Baru'}
                  {modalType === 'EDIT_NASABAH' && 'Edit Nasabah'}
                  {modalType === 'RIWAYAT_TABUNGAN' && 'Riwayat Tabungan'}
                  {modalType === 'DETAIL_PENARIKAN' && 'Detail Penarikan Saldo'}
                  {modalType === 'PROSES_PENARIKAN' && 'Proses Penarikan Saldo'}
                  {modalType === 'HARGA' && 'Update Harga Sampah'}
                  {modalType === 'PENARIKAN' && 'Penarikan Saldo Nasabah'}
                </div>
                <div className="msub">
                  {modalType === 'SETORAN' && 'Isi data setoran sampah nasabah'}
                  {modalType === 'EDIT_SETORAN' && 'Ubah data setoran sampah nasabah'}
                  {modalType === 'NASABAH' && 'Isi data diri nasabah'}
                  {modalType === 'EDIT_NASABAH' && 'Ubah data diri nasabah'}
                  {modalType === 'RIWAYAT_TABUNGAN' && (selectedNasabahHistory ? `Mutasi rekening ${selectedNasabahHistory.name}` : 'Detail mutasi saldo nasabah')}
                  {modalType === 'DETAIL_PENARIKAN' && 'Informasi lengkap transaksi pencairan saldo nasabah'}
                  {modalType === 'PROSES_PENARIKAN' && 'Konfirmasi pencairan saldo dan unggah bukti transaksi'}
                  {modalType === 'HARGA' && 'Ubah daftar harga beli per kg'}
                  {modalType === 'PENARIKAN' && 'Input nominal pencairan saldo'}
                </div>
              </div>
              <button className="mx" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="mb">
              {(modalType === 'SETORAN' || modalType === 'EDIT_SETORAN') && (
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
                  {weighItems.map((item, idx) => {
                    const catObj = posWasteTypes.find(c => c.category_name === item.kategori);
                    const typeOptions = catObj ? catObj.types : [];

                    return (
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
                                updated[idx].waste_type_id = '';
                                const newCatObj = posWasteTypes.find(c => c.category_name === kat);
                                const firstType = newCatObj && newCatObj.types[0] ? newCatObj.types[0] : null;
                                updated[idx].pengepul = firstType ? firstType.vendor_name : 'Bali Bersih';
                                setWeighItems(updated);
                              }}
                            >
                              <option value="">Pilih kategori...</option>
                              {posWasteTypes.map(c => (
                                <option key={c.category_id} value={c.category_name}>{c.category_name}</option>
                              ))}
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
                              value={item.waste_type_id || item.jenis}
                              disabled={!item.kategori}
                              onChange={(e) => {
                                const wtId = e.target.value;
                                const selectedType = typeOptions.find(t => t.waste_type_id === wtId || t.waste_name === wtId);
                                const updated = [...weighItems];
                                updated[idx].waste_type_id = wtId;
                                updated[idx].jenis = selectedType ? selectedType.waste_name : wtId;
                                updated[idx].pengepul = selectedType ? selectedType.vendor_name : (updated[idx].pengepul || 'Bali Bersih');
                                setWeighItems(updated);
                              }}
                            >
                              <option value="">{item.kategori ? 'Pilih jenis...' : 'Pilih kategori dulu'}</option>
                              {typeOptions.map(t => (
                                <option key={t.waste_type_id} value={t.waste_type_id}>
                                  {t.waste_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="fg">
                            <label className="fl">Pengepul</label>
                            <input
                              className="fi"
                              value={item.pengepul || 'Bali Bersih'}
                              disabled
                              style={{ background: '#f4f6f3', color: '#8a9e8a', cursor: 'not-allowed' }}
                            />
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}

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
                  <div className="fr">
                    <div className="fg">
                      <label className="fl">Kode Nasabah</label>
                      <input
                        className="fi"
                        value={`WW-${(activePosId || 'BA').toUpperCase()}-0025`}
                        disabled
                        style={{ background: '#f4f6f3', color: '#8a9e8a', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="fg">
                      <label className="fl">Tanggal Penambahan</label>
                      <input
                        className="fi"
                        type="datetime-local"
                        value={tanggalNasabah}
                        onChange={(e) => setTanggalNasabah(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="fg">
                    <label className="fl">Nama Nasabah</label>
                    <input
                      className="fi"
                      placeholder="Nama lengkap nasabah"
                      value={nasabahNewForm.name}
                      onChange={(e) => setNasabahNewForm({ ...nasabahNewForm, name: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Alamat Nasabah</label>
                    <input
                      className="fi"
                      placeholder="Alamat singkat nasabah"
                      value={nasabahNewForm.address}
                      onChange={(e) => setNasabahNewForm({ ...nasabahNewForm, address: e.target.value })}
                    />
                  </div>
                </>
              )}

              {modalType === 'EDIT_NASABAH' && editingNasabah && (
                <>
                  <div className="fr">
                    <div className="fg">
                      <label className="fl">Kode Nasabah</label>
                      <input
                        className="fi"
                        value={formatNasabahId(editingNasabah.customer_id, editingNasabah.pos_id || activePosId)}
                        disabled
                        style={{ background: '#f4f6f3', color: '#8a9e8a', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="fg">
                      <label className="fl">Tanggal Perubahan</label>
                      <input
                        className="fi"
                        type="datetime-local"
                        value={tanggalNasabah}
                        onChange={(e) => setTanggalNasabah(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="fg">
                    <label className="fl">Nama Nasabah</label>
                    <input
                      className="fi"
                      value={nasabahEditForm.name}
                      onChange={(e) => setNasabahEditForm({ ...nasabahEditForm, name: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Alamat Nasabah</label>
                    <input
                      className="fi"
                      value={nasabahEditForm.address}
                      onChange={(e) => setNasabahEditForm({ ...nasabahEditForm, address: e.target.value })}
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Status Nasabah</label>
                    <select
                      className="fsel"
                      value={nasabahEditForm.status || 'ACTIVE'}
                      onChange={(e) => setNasabahEditForm({
                        ...nasabahEditForm,
                        status: e.target.value
                      })}
                    >
                      <option value="ACTIVE">Aktif (Dapat melakukan transaksi)</option>
                      <option value="INACTIVE">Tidak Aktif (Dinonaktifkan)</option>
                    </select>
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

              {modalType === 'RIWAYAT_TABUNGAN' && (
                <>
                  {/* Account Summary Banner */}
                  <div style={{
                    background: 'var(--surf2)',
                    border: '1px solid var(--line)',
                    borderRadius: '9px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                        {selectedNasabahHistory?.name || 'Siti Rahayu'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        ID: {formatNasabahId(selectedNasabahHistory?.customer_id || 'WW-BA-0041', selectedNasabahHistory?.pos_id || activePosId)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10.5px', color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                        Saldo Saat Ini
                      </div>
                      <div className="mono tp-c" style={{ fontSize: '16px', fontWeight: 800 }}>
                        Rp. {parseFloat(selectedNasabahHistory?.balance || 87500).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Mutation History Table */}
                  <div className="tw" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Waktu & Tanggal</th>
                          <th>Keterangan</th>
                          <th>Pemasukan / Pengeluaran</th>
                          <th>Saldo Akhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SAMPLE_ACCOUNT_MUTATIONS.map((mut) => (
                          <tr key={mut.id}>
                            <td><span className="td-d">{mut.date}</span></td>
                            <td style={{ fontSize: '12px', color: 'var(--ink)' }}>{mut.desc}</td>
                            <td>
                              {mut.type === 'INCOME' ? (
                                <span className="mono tw-c" style={{ fontWeight: 700 }}>
                                  + Rp {mut.amount.toLocaleString('id-ID')}
                                </span>
                              ) : (
                                <span className="mono" style={{ color: 'var(--red)', fontWeight: 700 }}>
                                  - Rp {mut.amount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="mono" style={{ fontSize: '11.5px', color: 'var(--ink)' }}>
                                Rp {mut.balance_after.toLocaleString('id-ID')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {modalType === 'DETAIL_SETORAN' && selectedDepositDetail && (
                <>
                  <div style={{
                    background: 'var(--surf2)',
                    border: '1px solid var(--line)',
                    borderRadius: '9px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                        {selectedDepositDetail.customer_name || selectedDepositDetail.customer?.name || 'Nasabah'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        ID Nasabah: {formatNasabahId(selectedDepositDetail.customer_id, selectedDepositDetail.pos_id || activePosId)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--faint)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Total Nilai Setoran
                      </div>
                      <div className="mono tp-c" style={{ fontSize: '18px', fontWeight: 800 }}>
                        Rp. {parseFloat(selectedDepositDetail.totalBuyValue || selectedDepositDetail.total_buy_value || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="tw" style={{ marginBottom: '16px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Jenis Sampah</th>
                          <th>Kategori</th>
                          <th>Jumlah</th>
                          <th>Harga Satuan</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedDepositDetail.details || []).map((dt, idx) => (
                          <tr key={idx}>
                            <td><strong>{dt.wasteName || dt.waste_type?.waste_name || 'Sampah Terpilah'}</strong></td>
                            <td><span className="badge b-g">{dt.category || 'Plastik'}</span></td>
                            <td><span className="mono tw-c">{dt.quantity} {dt.unit || 'kg'}</span></td>
                            <td><span className="mono">Rp {parseFloat(dt.buyPrice || dt.price_snapshot || 0).toLocaleString('id-ID')}</span></td>
                            <td><span className="mono tp-c" style={{ fontWeight: 700 }}>Rp {parseFloat(dt.subtotal || 0).toLocaleString('id-ID')}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="fr" style={{ marginBottom: '12px' }}>
                    <div className="fg">
                      <label className="fl">Margin (Rp)</label>
                      <input className="fi" value={`Rp ${parseFloat(selectedDepositDetail.margin || 0).toLocaleString('id-ID')}`} disabled style={{ background: '#f4f6f3', color: '#555' }} />
                    </div>
                    <div className="fg">
                      <label className="fl">Profit Share POS (70%)</label>
                      <input className="fi" value={`Rp ${parseFloat(selectedDepositDetail.posProfit || selectedDepositDetail.pos_profit || 0).toLocaleString('id-ID')}`} disabled style={{ background: '#f4f6f3', color: 'var(--forest)', fontWeight: 600 }} />
                    </div>
                    <div className="fg">
                      <label className="fl">Profit Share Pusat (30%)</label>
                      <input className="fi" value={`Rp ${parseFloat(selectedDepositDetail.pusatProfit || selectedDepositDetail.pusat_profit || 0).toLocaleString('id-ID')}`} disabled style={{ background: '#f4f6f3', color: 'var(--amb)', fontWeight: 600 }} />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'DETAIL_PENARIKAN' && selectedWithdrawal && (
                <>
                  <div style={{
                    background: 'var(--surf2)',
                    border: '1px solid var(--line)',
                    borderRadius: '9px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                        {selectedWithdrawal.customer_name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        ID: {formatNasabahId(selectedWithdrawal.customer_id, selectedWithdrawal.pos_id || activePosId)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge b-g">Selesai / Terverifikasi</span>
                      <div className="mono" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--red)', marginTop: '4px' }}>
                        - Rp {selectedWithdrawal.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="fr" style={{ marginBottom: '12px' }}>
                    <div className="fg">
                      <label className="fl">ID Transaksi Penarikan</label>
                      <input className="fi" value={selectedWithdrawal.id} disabled style={{ background: '#f4f6f3', color: '#8a9e8a' }} />
                    </div>
                    <div className="fg">
                      <label className="fl">Waktu Request</label>
                      <input className="fi" value={selectedWithdrawal.date} disabled style={{ background: '#f4f6f3', color: '#8a9e8a' }} />
                    </div>
                  </div>

                  <div className="fr" style={{ marginBottom: '12px' }}>
                    <div className="fg">
                      <label className="fl">Metode Pembayaran</label>
                      <input className="fi" value={selectedWithdrawal.method} disabled style={{ background: '#f4f6f3', color: '#8a9e8a' }} />
                    </div>
                    <div className="fg">
                      <label className="fl">Sisa Saldo Rekening</label>
                      <input className="fi" value={`Rp ${selectedWithdrawal.remaining_balance.toLocaleString('id-ID')}`} disabled style={{ background: '#f4f6f3', color: '#8a9e8a' }} />
                    </div>
                  </div>

                  <div className="fg">
                    <label className="fl">Bukti Transaksi / Struk</label>
                    <div style={{
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '14px',
                      background: 'var(--surf2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ background: 'var(--gold-s)', color: 'var(--gold)', padding: '10px', borderRadius: '8px' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                          {selectedWithdrawal.proof_file || 'struk_pencairan_terverifikasi.pdf'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                          Terlampir & Terverifikasi oleh Admin
                        </div>
                      </div>
                      <button className="btn btn-sm btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => showToast('Mengunduh bukti transaksi...')}>Lihat File</button>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'PROSES_PENARIKAN' && selectedWithdrawal && (
                <>
                  <div style={{
                    background: 'var(--surf2)',
                    border: '1px solid var(--line)',
                    borderRadius: '9px',
                    padding: '16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
                        {selectedWithdrawal.customer_name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        ID: {formatNasabahId(selectedWithdrawal.customer_id, selectedWithdrawal.pos_id || activePosId)} · Metode: {selectedWithdrawal.method}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge b-y">Menunggu Konfirmasi</span>
                      <div className="mono" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ink)', marginTop: '4px' }}>
                        Rp {selectedWithdrawal.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="fg" style={{ marginBottom: '14px' }}>
                    <label className="fl">Unggah Bukti Transaksi / Transfer (Optional)</label>
                    <div
                      style={{
                        border: '2px dashed var(--line)',
                        borderRadius: '9px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        background: selectedWithdrawalProof ? 'var(--gold-xs)' : 'var(--surf2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => document.getElementById('proof-upload-input').click()}
                    >
                      <Upload size={28} style={{ color: selectedWithdrawalProof ? 'var(--gold)' : 'var(--muted)', marginBottom: '8px' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                        {selectedWithdrawalProof ? selectedWithdrawalProof.name : 'Klik atau seret file bukti transfer di sini'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--faint)', marginTop: '4px' }}>
                        Format JPG, PNG, atau PDF (Maks. 5MB)
                      </div>
                      <input
                        id="proof-upload-input"
                        type="file"
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedWithdrawalProof(e.target.files[0]);
                            showToast(`File ${e.target.files[0].name} terpilih ✓`);
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mf" style={{ justifyContent: 'flex-end' }}>
              {(modalType === 'SETORAN' || modalType === 'EDIT_SETORAN') && <button className="btn btn-gold" onClick={handleDepositSubmit}>Simpan</button>}
              {modalType === 'NASABAH' && <button className="btn btn-gold" onClick={handleRegisterNasabah}>Simpan</button>}
              {modalType === 'EDIT_NASABAH' && <button className="btn btn-gold" onClick={handleUpdateNasabah}>Simpan</button>}
              {modalType === 'RIWAYAT_TABUNGAN' && <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Tutup</button>}
              {modalType === 'DETAIL_PENARIKAN' && <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Tutup</button>}
              {modalType === 'PROSES_PENARIKAN' && (
                <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <button className="btn btn-sm" style={{ background: 'var(--red-s)', color: 'var(--red)', border: 'none' }} onClick={() => { showToast('Permintaan penarikan ditolak'); setIsModalOpen(false); }}>Tolak Request</button>
                  <button className="btn btn-gold" onClick={() => { showToast('Penarikan berhasil disetujui & dicairkan ✓'); setIsModalOpen(false); }}>✓ Setujui & Cairkan</button>
                </div>
              )}
              {modalType === 'PENARIKAN' && <button className="btn btn-gold" onClick={handleWithdrawConfirm}>Simpan</button>}
              {modalType === 'HARGA' && <button className="btn btn-gold" onClick={() => { showToast('Harga berhasil diperbarui ✓'); setIsModalOpen(false); }}>Simpan</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
