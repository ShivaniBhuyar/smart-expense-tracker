import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Edit2, AlertCircle, Search, Filter, ArrowDownRight, Tag } from 'lucide-react';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
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
    merchant: '',
    paymentMethod: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/categories')
      ]);
      setExpenses(expRes.data.data || []);
      const expenseCats = (catRes.data.data || []).filter(c => c.type === 'EXPENSE');
      setCategories(expenseCats);
      if (expenseCats.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: expenseCats[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expense records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exp = null) => {
    if (exp) {
      setEditingExpense(exp);
      setFormData({
        title: exp.title,
        amount: exp.amount,
        date: exp.date,
        categoryId: exp.category?.id || '',
        description: exp.description || '',
        merchant: exp.merchant || '',
        paymentMethod: exp.paymentMethod || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: categories[0]?.id || '',
        description: '',
        merchant: '',
        paymentMethod: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please create or select an expense category first.');
      return;
    }
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: formData.date,
        categoryId: parseInt(formData.categoryId, 10),
        description: formData.description,
        merchant: formData.merchant,
        paymentMethod: formData.paymentMethod
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        toast.success('Expense updated successfully. 👍');
      } else {
        await api.post('/expenses', payload);
        toast.success('New expense recorded successfully. 💸');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving expense entry.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await api.delete(`/expenses/${id}`);
        toast.success('Expense record deleted.');
        loadData();
      } catch (err) {
        toast.error('Error deleting expense entry.');
      }
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            exp.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || String(exp.category?.id) === String(selectedCategory);
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Log, audit, and analyze outgoing capital flows</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/categories')}>
            <Tag size={16} />
            <span>Categories</span>
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Add Expense</span>
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
            placeholder="Search title or merchant..."
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
      ) : filteredExpenses.length > 0 ? (
        <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Expense Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td data-label="Expense Title" style={{ fontWeight: 700 }}>
                      <div>
                        <div>{exp.title}</div>
                        {exp.merchant && <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>{exp.merchant}</div>}
                      </div>
                    </td>
                    <td data-label="Category"><span className="badge badge-danger">{exp.category?.name || 'Expense'}</span></td>
                    <td data-label="Date" style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                    <td data-label="Payment Method" style={{ color: 'var(--text-secondary)' }}>{exp.paymentMethod || '-'}</td>
                    <td data-label="Amount" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--danger)' }}>
                      -${exp.amount?.toFixed(2)}
                    </td>
                    <td data-label="Actions" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleOpenModal(exp)} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(exp.id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
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
          icon={ArrowDownRight}
          title="No expenses found"
          description={searchQuery ? "No expense matches your criteria." : "Commence logs by recording your initial expense entry."}
          actionLabel={searchQuery ? null : "Add First Expense"}
          onAction={searchQuery ? null : () => handleOpenModal()}
        />
      )}

      {/* Add / Edit Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? 'Edit Expense' : 'Record Expense'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Expense Title *</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. AWS Cloud Subscription" />
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
                <span>No expense categories found. <button type="button" onClick={() => { setIsModalOpen(false); navigate('/categories'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Create one</button></span>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <input type="text" className="form-control" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} placeholder="Credit Card, Wire, etc." />
            </div>
            <div className="form-group">
              <label className="form-label">Merchant / Vendor</label>
              <input type="text" className="form-control" value={formData.merchant} onChange={e => setFormData({ ...formData, merchant: e.target.value })} placeholder="e.g. Stripe, GitHub" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>
              {editingExpense ? 'Update' : 'Save'} Expense
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
