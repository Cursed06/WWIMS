"use client";

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Scale, CreditCard, RefreshCw, Plus, 
  Trash2, Search, ArrowRight, ShieldAlert, Award, FileText, CheckCircle, Upload
} from 'lucide-react';

const API_BASE = "http://localhost:5001/api";

export default function Home() {
  // Simulation Role States
  const [activeRole, setActiveRole] = useState('ADMIN_PUSAT'); // ADMIN_PUSAT or ADMIN_POS
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
  const [posTab, setPosTab] = useState('dashboard'); // dashboard, nasabah, penimbangan, penarikan, history
  
  // Search & Filter
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Forms state
  const [newPosForm, setNewPosForm] = useState({ pos_id: '', pos_name: '', address: '' });
  const [newNasabahForm, setNewNasabahForm] = useState({ name: '', address: '', phone: '' });
  
  // Price Update State
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceForm, setPriceForm] = useState({ buy_price: '', sell_price: '' });
  
  // Penimbangan Deposit Form State
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [weighItems, setWeighItems] = useState([{ waste_type_id: '', quantity: '' }]);
  const [weighSummary, setWeighSummary] = useState(null);
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState(1); // 1 = input, 2 = double-check verification card
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState('');
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');

  // Global Error & Success alerts
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

  const handleCreatePOS = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/pos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosForm)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert(`POS '${data.pos_name}' registered successfully!`);
        setNewPosForm({ pos_id: '', pos_name: '', address: '' });
        fetchPOS();
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleRegisterNasabah = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/nasabah`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newNasabahForm, pos_id: activePosId })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert(`Nasabah '${data.name}' registered with ID: ${data.customer_id}!`);
        setNewNasabahForm({ name: '', address: '', phone: '' });
        refreshData();
        setPosTab('dashboard');
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleEditPrice = (price) => {
    setEditingPrice(price);
    setPriceForm({
      buy_price: parseFloat(price.buy_price),
      sell_price: parseFloat(price.sell_price)
    });
  };

  const handleUpdatePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: selectedVendorId,
          waste_type_id: editingPrice.waste_type_id,
          buy_price: priceForm.buy_price,
          sell_price: priceForm.sell_price
        })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('Price mapping updated successfully!');
        setEditingPrice(null);
        fetchVendorPrices(selectedVendorId);
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  // --- MANUAL WEIGHING DEPOSIT WORKFLOW ---

  const getActivePOSDryVendor = () => {
    const currentPOS = posList.find(p => p.pos_id === activePosId);
    if (!currentPOS || !currentPOS.pos_vendors) return null;
    const dryVendor = currentPOS.pos_vendors.find(pv => pv.vendor_id !== 'V-MO');
    return dryVendor ? dryVendor.vendor : null;
  };

  const handleWeighItemChange = (index, field, value) => {
    const newItems = [...weighItems];
    newItems[index][field] = value;
    setWeighItems(newItems);
  };

  const addWeighItem = () => {
    setWeighItems([...weighItems, { waste_type_id: '', quantity: '' }]);
  };

  const removeWeighItem = (index) => {
    const newItems = weighItems.filter((_, i) => i !== index);
    setWeighItems(newItems.length > 0 ? newItems : [{ waste_type_id: '', quantity: '' }]);
  };

  const calculateWeighPreview = async () => {
    const dryVendor = getActivePOSDryVendor();
    if (!dryVendor) {
      showAlert('No dry-waste vendor assigned to this POS! Please configure this in Pusat Admin.', 'danger');
      return;
    }

    try {
      let previewTotalBuy = 0;
      let previewTotalSell = 0;
      const parsedItems = [];

      for (const item of weighItems) {
        if (!item.waste_type_id || !item.quantity) continue;
        const qty = parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) continue;

        // Fetch price rate for active vendor or V-MO for Jelantah
        const activeVendorId = item.waste_type_id === 'JE-01' ? 'V-MO' : dryVendor.vendor_id;
        
        // Find price snapshot in cached prices or category list
        const res = await fetch(`${API_BASE}/prices/vendor/${activeVendorId}`);
        const prices = await res.json();
        const priceObj = prices.find(p => p.waste_type_id === item.waste_type_id);

        if (!priceObj) {
          throw new Error(`Pricing not configured for item ${item.waste_type_id} under vendor ${activeVendorId}`);
        }

        const buyPrice = parseFloat(priceObj.buy_price);
        const sellPrice = parseFloat(priceObj.sell_price);

        previewTotalBuy += qty * buyPrice;
        previewTotalSell += qty * sellPrice;

        parsedItems.push({
          waste_type_id: item.waste_type_id,
          name: priceObj.waste_type.waste_name,
          quantity: qty,
          unit: priceObj.waste_type.unit,
          buy_price: buyPrice,
          sell_price: sellPrice,
          subtotal: qty * buyPrice
        });
      }

      if (parsedItems.length === 0) {
        showAlert('Please enter valid waste items and quantities', 'warning');
        return;
      }

      const margin = previewTotalSell - previewTotalBuy;
      setWeighSummary({
        items: parsedItems,
        total_buy_value: previewTotalBuy,
        total_sell_value: previewTotalSell,
        margin,
        pos_profit: margin * 0.70,
        pusat_profit: margin * 0.30,
        nasabah_credit: previewTotalBuy
      });
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  const handleWeighSubmit = async () => {
    const dryVendor = getActivePOSDryVendor();
    if (!dryVendor || !selectedNasabah || !weighSummary) return;

    try {
      const res = await fetch(`${API_BASE}/transactions/weigh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedNasabah.customer_id,
          pos_id: activePosId,
          vendor_id: dryVendor.vendor_id,
          items: weighSummary.items.map(i => ({
            waste_type_id: i.waste_type_id,
            quantity: i.quantity
          })),
          created_by: `admin-pos-${activePosId.toLowerCase()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        showAlert(`Deposit successful! Rp ${weighSummary.nasabah_credit.toLocaleString()} credited to customer balance.`);
        setWeighItems([{ waste_type_id: '', quantity: '' }]);
        setWeighSummary(null);
        setSelectedNasabah(null);
        refreshData();
        setPosTab('dashboard');
      } else {
        showAlert(data.error, 'danger');
      }
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  };

  // --- WITHDRAWAL WORKFLOW ---

  const handleWithdrawCheck = (e) => {
    e.preventDefault();
    setWithdrawErrorMsg('');
    setWithdrawSuccessMsg('');

    if (!selectedNasabah) {
      setWithdrawErrorMsg('Please search and select a customer first');
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawErrorMsg('Please enter a valid positive withdrawal amount');
      return;
    }

    const balance = parseFloat(selectedNasabah.balance);
    if (balance < amt) {
      setWithdrawErrorMsg(`Insufficient balance. Current balance is Rp ${balance.toLocaleString()}`);
      return;
    }

    // Procced to Double-Check Verification (FR-06)
    setWithdrawStep(2);
  };

  const handleWithdrawConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedNasabah.customer_id,
          pos_id: activePosId,
          amount: parseFloat(withdrawAmount),
          proof_image_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample_receipt.png', // Simulated proof URL
          created_by: `admin-pos-${activePosId.toLowerCase()}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWithdrawSuccessMsg(`Withdrawal of Rp ${parseFloat(withdrawAmount).toLocaleString()} processed successfully!`);
        setWithdrawStep(1);
        setWithdrawAmount('');
        setSelectedNasabah(null);
        refreshData();
        setTimeout(() => setPosTab('dashboard'), 2000);
      } else {
        setWithdrawErrorMsg(data.error);
        setWithdrawStep(1);
      }
    } catch (err) {
      setWithdrawErrorMsg(err.message);
      setWithdrawStep(1);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 1).toUpperCase();
    return (words[0].substring(0, 1) + words[1].substring(0, 1)).toUpperCase();
  };

  return (
    <div className="app-container">
      {/* Simulation Header Toggle Panel */}
      <header className="simulation-header">
        <div className="sim-brand">
          <Scale size={24} />
          <span>WWIMS Simulation</span>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>v1.0.0</span>
        </div>
        
        <div className="sim-controls">
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
              POS Local Admin
            </button>
          </div>

          {activeRole === 'ADMIN_POS' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>POS Node:</span>
              <select 
                className="sim-select" 
                value={activePosId}
                onChange={(e) => setActivePosId(e.target.value)}
              >
                {posList.map(pos => (
                  <option key={pos.pos_id} value={pos.pos_id}>
                    {pos.pos_name} ({pos.pos_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={refreshData}>
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Global Alert */}
      {alertMsg.text && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          background: alertMsg.type === 'danger' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {alertMsg.type === 'danger' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{alertMsg.text}</span>
        </div>
      )}

      {/* RENDER VIEW ACCORDING TO SIMULATED ROLE */}
      <main className="dashboard-content">
        
        {activeRole === 'ADMIN_PUSAT' ? (
          /* ========================================================
             ADMIN PUSAT OPERATIONAL INTERFACE
             ======================================================== */
          <div>
            <div className="page-title-area">
              <h1 className="page-title">Pusat Administrative Dashboard</h1>
              <p className="page-subtitle">Strategic monitoring, master pricing matrices, global transaction logs, and POS node mappings.</p>
            </div>

            {/* Metrics cards grid */}
            <div className="metrics-grid">
              <div className="glass-card metric-card">
                <span className="metric-label">Operational POS Count</span>
                <span className="metric-value">{posList.length} Nodes</span>
                <span className="metric-footer">Fully configurable</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">Total Organization Balances</span>
                <span className="metric-value">Rp {metrics.totalCustomerBalance?.toLocaleString() || 0}</span>
                <span className="metric-footer">Total liquid customer deposits</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">Accumulated Revenue Splitting</span>
                <span className="metric-value" style={{ color: 'var(--primary)' }}>
                  Rp {metrics.totalPusatProfit?.toLocaleString() || 0}
                </span>
                <span className="metric-footer">Pusat share: 30% of total margins</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">POS Shared Profit</span>
                <span className="metric-value" style={{ color: 'var(--secondary)' }}>
                  Rp {metrics.totalPosProfit?.toLocaleString() || 0}
                </span>
                <span className="metric-footer">Local POS share: 70% margins</span>
              </div>
            </div>

            {/* Tabs bar */}
            <div className="sim-toggle-group" style={{ marginBottom: '28px', maxWidth: '500px' }}>
              <button className={`sim-toggle-btn ${pusatTab === 'dashboard' ? 'active' : ''}`} onClick={() => setPusatTab('dashboard')}>
                Overview
              </button>
              <button className={`sim-toggle-btn ${pusatTab === 'pos' ? 'active' : ''}`} onClick={() => setPusatTab('pos')}>
                POS & Vendors Mapping
              </button>
              <button className={`sim-toggle-btn ${pusatTab === 'pricing' ? 'active' : ''}`} onClick={() => setPusatTab('pricing')}>
                Master Price Manager
              </button>
              <button className={`sim-toggle-btn ${pusatTab === 'logs' ? 'active' : ''}`} onClick={() => setPusatTab('logs')}>
                Audit Trail
              </button>
            </div>

            {/* TAB: DASHBOARD VIEW */}
            {pusatTab === 'dashboard' && (
              <div className="layout-split">
                <div className="glass-card">
                  <h3 style={{ marginBottom: '18px' }}>Recent Audit Activities</h3>
                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Operator</th>
                          <th>Action Code</th>
                          <th>Target Entity</th>
                          <th>Record ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.slice(0, 8).map(log => (
                          <tr key={log.log_id}>
                            <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                            <td><span className="badge badge-info">{log.user_id}</span></td>
                            <td><strong style={{ color: '#ffffff' }}>{log.action}</strong></td>
                            <td>{log.entity}</td>
                            <td><code>{log.entity_id}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 style={{ marginBottom: '18px' }}>Dry Waste Vendors</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {vendors.map(v => (
                      <div key={v.vendor_id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <div>
                          <strong>{v.vendor_name}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {v.vendor_id}</div>
                        </div>
                        <span style={{ fontSize: '0.85rem' }}>{v.contact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: POS & VENDORS MAP */}
            {pusatTab === 'pos' && (
              <div className="layout-split">
                <div className="glass-card">
                  <h3 style={{ marginBottom: '18px' }}>Configure Local POS Nodes</h3>
                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>POS Code</th>
                          <th>POS Location Name</th>
                          <th>Address</th>
                          <th>Assigned Waste Collector (Dry)</th>
                          <th>Assigned Jelantah Collector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posList.map(pos => {
                          const dryVendor = pos.pos_vendors.find(pv => pv.vendor_id !== 'V-MO');
                          const hasJelantah = pos.pos_vendors.find(pv => pv.vendor_id === 'V-MO');
                          return (
                            <tr key={pos.pos_id}>
                              <td><code>{pos.pos_id}</code></td>
                              <td><strong>{pos.pos_name}</strong></td>
                              <td>{pos.address}</td>
                              <td>
                                {dryVendor ? (
                                  <span className="badge badge-success">{dryVendor.vendor.vendor_name}</span>
                                ) : (
                                  <span className="badge badge-warning">Unbound</span>
                                )}
                              </td>
                              <td>
                                {hasJelantah ? (
                                  <span className="badge badge-info">Metro Oil (Universal)</span>
                                ) : (
                                  <span className="badge badge-warning">Unbound</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card">
                  <h3 style={{ marginBottom: '18px' }}>Register New POS</h3>
                  <form onSubmit={handleCreatePOS}>
                    <div className="form-group">
                      <label className="form-label">2-Letter Code (e.g. DL, BA)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        maxLength={2} 
                        style={{ textTransform: 'uppercase' }}
                        value={newPosForm.pos_id}
                        onChange={(e) => setNewPosForm({ ...newPosForm, pos_id: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">POS Location Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={newPosForm.pos_name}
                        onChange={(e) => setNewPosForm({ ...newPosForm, pos_name: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Address details</label>
                      <textarea 
                        className="form-control" 
                        style={{ minHeight: '60px' }}
                        value={newPosForm.address}
                        onChange={(e) => setNewPosForm({ ...newPosForm, address: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      <Plus size={16} /> Save Node
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: PRICING MANAGER */}
            {pusatTab === 'pricing' && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Dynamic Pricing Ledger Matrix</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Active Vendor:</span>
                    <select 
                      className="sim-select"
                      value={selectedVendorId}
                      onChange={(e) => setSelectedVendorId(e.target.value)}
                    >
                      {vendors.map(v => (
                        <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="layout-split">
                  <div className="table-wrapper">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Type ID</th>
                          <th>Waste Type Item Name</th>
                          <th>Customer Buy Price (per unit)</th>
                          <th>Central Sell Price (per unit)</th>
                          <th>Operation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVendorPrices.map(price => (
                          <tr key={price.price_id}>
                            <td><span className="badge badge-info">{price.waste_type.category.category_name}</span></td>
                            <td><code>{price.waste_type_id}</code></td>
                            <td><strong>{price.waste_type.waste_name}</strong></td>
                            <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                              Rp {parseFloat(price.buy_price).toLocaleString()} / {price.waste_type.unit}
                            </td>
                            <td style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
                              Rp {parseFloat(price.sell_price).toLocaleString()} / {price.waste_type.unit}
                            </td>
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleEditPrice(price)}>
                                Update Rate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    {editingPrice ? (
                      <div className="glass-card" style={{ border: '1px solid var(--primary)' }}>
                        <h4 style={{ marginBottom: '14px', color: 'var(--primary)' }}>Adjust Rate Matrix</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                          Updating rate for <strong>{editingPrice.waste_type.waste_name}</strong> ({editingPrice.waste_type_id}) under vendor <strong>{selectedVendorId}</strong>.
                        </p>
                        <form onSubmit={handleUpdatePriceSubmit}>
                          <div className="form-group">
                            <label className="form-label">Customer Buying Price (Rp)</label>
                            <input 
                              type="number" 
                              className="form-control"
                              value={priceForm.buy_price}
                              onChange={(e) => setPriceForm({ ...priceForm, buy_price: e.target.value })}
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Central Selling Price (Rp)</label>
                            <input 
                              type="number" 
                              className="form-control"
                              value={priceForm.sell_price}
                              onChange={(e) => setPriceForm({ ...priceForm, sell_price: e.target.value })}
                              required 
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingPrice(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Award size={36} style={{ marginBottom: '12px' }} />
                        <p>Select a waste type on the left table to update buying and selling price rates dynamically.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AUDIT LOGS */}
            {pusatTab === 'logs' && (
              <div className="glass-card">
                <h3>Global Administrative Audit Trail Feed</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem' }}>
                  Realtime append-only security logs containing operator keys, transaction IDs, and target schema changes.
                </p>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Log Transaction ID</th>
                        <th>Security Timestamp</th>
                        <th>Simulated Operator User Key</th>
                        <th>Action Log Type</th>
                        <th>Target Model Name</th>
                        <th>Target Model Record ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.log_id}>
                          <td><code>#{log.log_id}</code></td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td><span className="badge badge-info">{log.user_id}</span></td>
                          <td><strong style={{ color: '#ffffff' }}>{log.action}</strong></td>
                          <td>{log.entity}</td>
                          <td><code>{log.entity_id}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ========================================================
             ADMIN POS LOCAL OPERATIONAL INTERFACE
             ======================================================== */
          <div>
            <div className="page-title-area">
              <h1 className="page-title">POS Local Agent Console</h1>
              <p className="page-subtitle">
                Operational console for POS <strong>{posList.find(p => p.pos_id === activePosId)?.pos_name || activePosId}</strong>. Register customers, calculate weigh deposits, process balance withdrawals.
              </p>
            </div>

            {/* Metrics cards grid */}
            <div className="metrics-grid">
              <div className="glass-card metric-card">
                <span className="metric-label">Local Nasabah Registered</span>
                <span className="metric-value">{metrics.customerCount || 0} Members</span>
                <span className="metric-footer">Auto-increments at POS level</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">Total Customer Holdings (Liability)</span>
                <span className="metric-value">Rp {metrics.totalCustomerBalance?.toLocaleString() || 0}</span>
                <span className="metric-footer">Liquid liability at POS ledger</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">Accrued POS Margin Share (70%)</span>
                <span className="metric-value" style={{ color: 'var(--primary)' }}>
                  Rp {metrics.totalPosProfit?.toLocaleString() || 0}
                </span>
                <span className="metric-footer">Credited to local POS reserve</span>
              </div>
              <div className="glass-card metric-card">
                <span className="metric-label">Withdrawals Settled</span>
                <span className="metric-value" style={{ color: 'var(--accent)' }}>
                  Rp {metrics.totalWithdrawn?.toLocaleString() || 0}
                </span>
                <span className="metric-footer">Backed by uploaded transfer proofs</span>
              </div>
            </div>

            {/* Local POS tabs */}
            <div className="sim-toggle-group" style={{ marginBottom: '28px', maxWidth: '600px' }}>
              <button className={`sim-toggle-btn ${posTab === 'dashboard' ? 'active' : ''}`} onClick={() => setPosTab('dashboard')}>
                Overview & Search
              </button>
              <button className={`sim-toggle-btn ${posTab === 'nasabah' ? 'active' : ''}`} onClick={() => setPosTab('nasabah')}>
                Register Nasabah
              </button>
              <button className={`sim-toggle-btn ${posTab === 'penimbangan' ? 'active' : ''}`} onClick={() => setPosTab('penimbangan')}>
                Input Penimbangan
              </button>
              <button className={`sim-toggle-btn ${posTab === 'penarikan' ? 'active' : ''}`} onClick={() => setPosTab('penarikan')}>
                Layanan Penarikan
              </button>
              <button className={`sim-toggle-btn ${posTab === 'history' ? 'active' : ''}`} onClick={() => setPosTab('history')}>
                POS Ledger History
              </button>
            </div>

            {/* TAB: LOCAL DASHBOARD (NASABAH LIST & SEARCH) */}
            {posTab === 'dashboard' && (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Nasabah Account Index ({nasabahs.length})</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '350px' }}>
                    <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Search customer name or ID..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      onKeyUp={fetchNasabahList}
                    />
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Avatar</th>
                        <th>Nasabah ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Ledger Balance (Rp)</th>
                        <th>Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nasabahs.map(n => (
                        <tr key={n.customer_id}>
                          <td>
                            <div className="avatar-initials">{getInitials(n.name)}</div>
                          </td>
                          <td><code>{n.customer_id}</code></td>
                          <td><strong>{n.name}</strong></td>
                          <td>{n.address}</td>
                          <td>{n.phone || '-'}</td>
                          <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            Rp {parseFloat(n.balance).toLocaleString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setSelectedNasabah(n);
                                  setPosTab('penimbangan');
                                }}
                              >
                                Weigh Deposit
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setSelectedNasabah(n);
                                  setPosTab('penarikan');
                                }}
                              >
                                Withdraw
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: REGISTER NASABAH */}
            {posTab === 'nasabah' && (
              <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ marginBottom: '18px' }}>Register New Nasabah (Customer ID Auto-Generation)</h3>
                <form onSubmit={handleRegisterNasabah}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newNasabahForm.name}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Details</label>
                    <textarea 
                      className="form-control"
                      value={newNasabahForm.address}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, address: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newNasabahForm.phone}
                      onChange={(e) => setNewNasabahForm({ ...newNasabahForm, phone: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Plus size={16} /> Register Member
                  </button>
                </form>
              </div>
            )}

            {/* TAB: INPUT PENIMBANGAN (DEPOSIT) */}
            {posTab === 'penimbangan' && (
              <div className="glass-card">
                <h3>Manual Weighing Penimbangan Entry Form</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Calculate local deposits. Dry waste items route to the POS's bound vendor; Jelantah item automatically maps to Metro Oil.
                </p>

                <div className="layout-split">
                  <div>
                    {/* Customer Selection Indicator */}
                    <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '24px' }}>
                      <label className="form-label">Target Customer Profile</label>
                      {selectedNasabah ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{selectedNasabah.name}</strong> <code>{selectedNasabah.customer_id}</code>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Balance: Rp {parseFloat(selectedNasabah.balance).toLocaleString()}</div>
                          </div>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedNasabah(null)}>Change</button>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                          No customer selected. Go to <a href="#" style={{ color: 'var(--secondary)' }} onClick={() => setPosTab('dashboard')}>Overview & Search</a> tab to choose one.
                        </div>
                      )}
                    </div>

                    {/* Weigh Item Add List */}
                    {selectedNasabah && (
                      <div>
                        <h4 style={{ marginBottom: '14px' }}>Item List</h4>
                        {weighItems.map((item, index) => (
                          <div key={index} style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ flex: 2 }}>
                              <select 
                                className="sim-select"
                                style={{ width: '100%', padding: '10px' }}
                                value={item.waste_type_id}
                                onChange={(e) => handleWeighItemChange(index, 'waste_type_id', e.target.value)}
                              >
                                <option value="">-- Choose Item type --</option>
                                {categories.map(cat => (
                                  <optgroup key={cat.category_id} label={cat.category_name}>
                                    {cat.types.map(t => (
                                      <option key={t.waste_type_id} value={t.waste_type_id}>
                                        {t.waste_name} ({t.unit})
                                      </option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <input 
                                type="number" 
                                step="0.01" 
                                className="form-control" 
                                placeholder="Qty / Weight"
                                value={item.quantity}
                                onChange={(e) => handleWeighItemChange(index, 'quantity', e.target.value)}
                              />
                            </div>
                            <button className="btn btn-danger" style={{ padding: '10px' }} onClick={() => removeWeighItem(index)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button className="btn btn-secondary" onClick={addWeighItem}>
                            <Plus size={16} /> Add Row
                          </button>
                          <button className="btn btn-primary" onClick={calculateWeighPreview}>
                            Calculate Split
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {weighSummary ? (
                      <div className="glass-card" style={{ border: '1px solid var(--primary)', background: 'rgba(16, 185, 129, 0.03)' }}>
                        <h4 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Weigh Transaction Preview</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.85rem' }}>
                          {weighSummary.items.map((i, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{i.name} ({i.quantity} {i.unit})</span>
                              <strong>Rp {i.subtotal.toLocaleString()}</strong>
                            </div>
                          ))}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Nasabah Credited:</span>
                            <strong style={{ color: 'var(--primary)' }}>Rp {weighSummary.nasabah_credit.toLocaleString()}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Central Sell Price Total:</span>
                            <span>Rp {weighSummary.total_sell_value.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                            <span>Gross Margin:</span>
                            <strong>Rp {weighSummary.margin.toLocaleString()}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>POS Profit Share (70%):</span>
                            <span>Rp {weighSummary.pos_profit.toLocaleString()}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span>Pusat Profit Share (30%):</span>
                            <span>Rp {weighSummary.pusat_profit.toLocaleString()}</span>
                          </div>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleWeighSubmit}>
                          Confirm & Post Deposit
                        </button>
                      </div>
                    ) : (
                      <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <Scale size={36} style={{ marginBottom: '12px' }} />
                        <p>Fill out the customer and items list and click "Calculate Split" to preview margins, shared profits, and customer credit values.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PENARIKAN SALDO (WITHDRAWAL) */}
            {posTab === 'penarikan' && (
              <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3>Layanan Penarikan Saldo (Withdrawal Ledger)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Process cash or bank transfer withdrawals. Double-Check verification cards ensure absolute financial accountability.
                </p>

                {withdrawErrorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
                    {withdrawErrorMsg}
                  </div>
                )}

                {withdrawSuccessMsg && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--primary)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.85rem' }}>
                    {withdrawSuccessMsg}
                  </div>
                )}

                {/* Step 1: Input amount */}
                {withdrawStep === 1 ? (
                  <form onSubmit={handleWithdrawCheck}>
                    <div className="form-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', marginBottom: '20px' }}>
                      <label className="form-label">Target Customer</label>
                      {selectedNasabah ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{selectedNasabah.name}</strong> <code>{selectedNasabah.customer_id}</code>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Balance: Rp {parseFloat(selectedNasabah.balance).toLocaleString()}</div>
                          </div>
                          <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedNasabah(null)}>Change</button>
                        </div>
                      ) : (
                        <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                          No customer selected. Go to <a href="#" style={{ color: 'var(--secondary)' }} onClick={() => setPosTab('dashboard')}>Overview & Search</a> tab to choose one.
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Withdrawal Amount (Rp)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Upload Proof Image (Receipt/Signature)</label>
                      <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                        <Upload size={24} style={{ margin: '0 auto 8px', color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Digital Receipt / Bank Transfer Screenshot placeholder uploaded automatically</span>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!selectedNasabah}>
                      Verify Balance & Proceed
                    </button>
                  </form>
                ) : (
                  /* Step 2: Double Check Verification Card (FR-06) */
                  <div className="glass-card" style={{ border: '2px solid var(--accent)', background: 'rgba(245, 158, 11, 0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '16px' }}>
                      <ShieldAlert size={20} />
                      <h4 style={{ color: 'var(--accent)' }}>FR-06 Double Check Verification Card</h4>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                      Please confirm the identity of the customer matches the details below before releasing financial reserves.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                      <div>
                        <span className="metric-label" style={{ fontSize: '0.7rem' }}>Customer Unique ID:</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{selectedNasabah.customer_id}</div>
                      </div>
                      <div>
                        <span className="metric-label" style={{ fontSize: '0.7rem' }}>Registered Full Name:</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedNasabah.name}</div>
                      </div>
                      <div>
                        <span className="metric-label" style={{ fontSize: '0.7rem' }}>POS Station Location:</span>
                        <div>{posList.find(p => p.pos_id === activePosId)?.pos_name}</div>
                      </div>
                      <div>
                        <span className="metric-label" style={{ fontSize: '0.7rem' }}>Home Address:</span>
                        <div>{selectedNasabah.address}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                        <div>
                          <span className="metric-label" style={{ fontSize: '0.7rem' }}>Requested Amount:</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>Rp {parseFloat(withdrawAmount).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="metric-label" style={{ fontSize: '0.7rem' }}>Remaining Balance:</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            Rp {(parseFloat(selectedNasabah.balance) - parseFloat(withdrawAmount)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary" style={{ flex: 1, background: 'var(--accent)' }} onClick={handleWithdrawConfirm}>
                        Verify & Commit Penarikan
                      </button>
                      <button className="btn btn-secondary" onClick={() => setWithdrawStep(1)}>
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LOCAL TRANSACTION HISTORY */}
            {posTab === 'history' && (
              <div className="glass-card">
                <h3>POS Transaction & Ledger Records</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Detailed historical ledger logs for weighing deposits and settled withdrawals at this POS.
                </p>
                <div className="table-wrapper">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Nasabah ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value Amount</th>
                        <th>Profit Split (POS / Pusat)</th>
                        <th>Proof details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(item => (
                        <tr key={item.id}>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td><code>{item.customer_id}</code></td>
                          <td><strong>{item.customer_name}</strong></td>
                          <td>
                            <span className={`badge ${item.type === 'DEPOSIT' ? 'badge-success' : 'badge-warning'}`}>
                              {item.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 'bold', color: item.type === 'DEPOSIT' ? 'var(--primary)' : 'var(--danger)' }}>
                            {item.type === 'DEPOSIT' ? '+' : '-'} Rp {item.amount.toLocaleString()}
                          </td>
                          <td>
                            {item.type === 'DEPOSIT' ? (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Rp {item.pos_profit.toLocaleString()} / Rp {item.pusat_profit.toLocaleString()}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>
                          <td>
                            {item.type === 'WITHDRAWAL' ? (
                              <a href={item.proof_image_url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', textDecoration: 'underline', fontSize: '0.8rem' }}>
                                View Receipt
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.8rem' }}>
                                {item.details?.map(d => `${d.name} (${d.quantity} ${d.unit})`).join(', ')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
