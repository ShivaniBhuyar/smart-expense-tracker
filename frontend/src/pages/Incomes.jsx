import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Edit2, AlertCircle, Search, Filter, ArrowUpRight, Tag } from 'lucide-react';

export default function Incomes() {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: '',
    source: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, catRes] = await Promise.all([
        api.get('/incomes'),
        api.get('/categories')
      ]);
      setIncomes(incRes.data.data || []);
      const incomeCats = (catRes.data.data || []).filter(c => c.type === 'INCOME');
      setCategories(incomeCats);
      if (incomeCats.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: incomeCats[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load income entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (inc = null) => {
    if (inc) {
      setEditingIncome(inc);
      setFormData({
        title: inc.title,
        amount: inc.amount,
        date: inc.date,
        categoryId: inc.category?.id || '',
        description: inc.description || '',
        source: inc.source || ''
      });
    } else {
      setEditingIncome(null);
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: categories[0]?.id || '',
        description: '',
        source: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please create or select an income category first.');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: formData.date,
        categoryId: parseInt(formData.categoryId, 10),
        description: formData.description,
        source: formData.source
      };

      if (editingIncome) {
        await api.put(`/incomes/${editingIncome.id}`, payload);
        toast.success('Income entry updated successfully. 👍');
      } else {
        await api.post('/incomes', payload);
        toast.success('New income recorded successfully. 💰');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving income record.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await api.delete(`/incomes/${id}`);
        toast.success('Income entry deleted.');
        loadData();
      } catch (err) {
        toast.error('Error deleting income record.');
      }
    }
  };

  const filteredIncomes = useMemo(() => {
    return incomes.filter(inc => {
      const matchesSearch = inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            inc.source?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || String(inc.category?.id) === String(selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [incomes, searchQuery, selectedCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Incomes</h1>
          <p className="page-subtitle">Log and audit all credits and incoming revenue flows</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/categories')}>
            <Tag size={16} />
            <span>Categories</span>
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="filter-bar" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input 
            type="text" 
            className="form-control search-input"
            placeholder="Search title or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mobile-full-width">
          <Filter size={15} color="var(--text-muted)" />
          <select 
            className="form-control" 
            style={{ minWidth: '180px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : filteredIncomes.length > 0 ? (
        <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Income Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Source</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map(inc => (
                  <tr key={inc.id}>
                    <td data-label="Income Title" style={{ fontWeight: 700 }}>
                      {inc.title}
                    </td>
                    <td data-label="Category"><span className="badge badge-success">{inc.category?.name || 'Income'}</span></td>
                    <td data-label="Date" style={{ color: 'var(--text-secondary)' }}>{inc.date}</td>
                    <td data-label="Source" style={{ color: 'var(--text-secondary)' }}>{inc.source || '-'}</td>
                    <td data-label="Amount" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)' }}>
                      +${inc.amount?.toFixed(2)}
                    </td>
                    <td data-label="Actions" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleOpenModal(inc)} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(inc.id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
          icon={ArrowUpRight}
          title="No income recorded"
          description={searchQuery ? "No income matches your criteria." : "Commence logs by recording your initial income entry."}
          actionLabel={searchQuery ? null : "Add First Income"}
          onAction={searchQuery ? null : () => handleOpenModal()}
        />
      )}

      {/* Add / Edit Income Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIncome ? 'Edit Income' : 'Record Income'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Income Title *</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Freelance Consulting" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Amount ($) *</label>
              <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            {categories.length > 0 ? (
              <select className="form-control" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} />
                <span>No income categories found. <button type="button" onClick={() => { setIsModalOpen(false); navigate('/categories'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Create one</button></span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Source / Channel</label>
            <input type="text" className="form-control" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} placeholder="e.g. Acme Corp, Gumroad" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>
              {editingIncome ? 'Update' : 'Save'} Income
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
