import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Edit2, PieChart, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    categoryId: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budRes, catRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/categories')
      ]);
      setBudgets(budRes.data.data || []);
      const expenseCats = (catRes.data.data || []).filter(c => c.type === 'EXPENSE');
      setCategories(expenseCats);
      if (expenseCats.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: expenseCats[0].id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load budget thresholds.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bud = null) => {
    if (bud) {
      setEditingBudget(bud);
      setFormData({
        amount: bud.amount,
        startDate: bud.startDate,
        endDate: bud.endDate,
        categoryId: bud.category?.id || ''
      });
    } else {
      setEditingBudget(null);
      setFormData({
        amount: '',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        categoryId: categories[0]?.id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please create an expense category first.');
      return;
    }
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        startDate: formData.startDate,
        endDate: formData.endDate,
        categoryId: parseInt(formData.categoryId, 10)
      };

      if (editingBudget) {
        await api.put(`/budgets/${editingBudget.id}`, payload);
        toast.success('Budget threshold updated successfully. 👍');
      } else {
        await api.post('/budgets', payload);
        toast.success('New budget threshold created. 🎯');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget limit?')) {
      try {
        await api.delete(`/budgets/${id}`);
        toast.success('Budget limit deleted.');
        loadData();
      } catch (err) {
        toast.error('Error deleting budget.');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Establish category caps and monitor usage alerts</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Create Budget</span>
        </button>
      </div>

      {loading ? (
        <div className="grid-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid-2">
          {budgets.map(bud => {
            const pct = Math.min(bud.percentageUsed || 0, 100);
            const isExceeded = bud.exceeded;
            const isWarning = pct >= 85 && !isExceeded;
            const isNearLimit = pct >= 65 && pct < 85 && !isExceeded;
            
            let statusText = 'SAFE';
            let statusColor = 'var(--success)';
            let badgeClass = 'badge-success';
            
            if (isExceeded) {
              statusText = 'EXCEEDED';
              statusColor = 'var(--danger)';
              badgeClass = 'badge-danger';
            } else if (isWarning) {
              statusText = 'NEAR LIMIT';
              statusColor = 'var(--warning)';
              badgeClass = 'badge-warning';
            } else if (isNearLimit) {
              statusText = 'WARNING';
              statusColor = 'var(--info)';
              badgeClass = 'badge-info';
            }

            return (
              <motion.div 
                key={bud.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="card"
                style={{
                  borderLeft: `4px solid ${statusColor}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{bud.category?.name}</span>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ACTIVE: {new Date(bud.startDate).toLocaleDateString()} - {new Date(bud.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${badgeClass}`} style={{ fontSize: '0.675rem', padding: '3px 8px' }}>{statusText}</span>
                    <button onClick={() => handleOpenModal(bud)} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(bud.id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: statusColor, letterSpacing: '-0.02em' }}>
                    ${bud.spentAmount?.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    of ${bud.amount?.toFixed(2)} limit
                  </span>
                </div>

                <div className="progress-bar-bg" style={{ marginBottom: '14px', height: '10px', background: 'var(--bg-darker)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="progress-bar-fill" 
                    style={{ backgroundColor: statusColor }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center', fontWeight: 700 }}>
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    color: isExceeded ? 'var(--danger)' : 'var(--text-secondary)'
                  }}>
                    {isExceeded ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                    {isExceeded ? 'Limit breached' : `$${bud.remainingAmount?.toFixed(2)} remaining`}
                  </span>
                  <span style={{ color: statusColor }}>
                    {bud.percentageUsed?.toFixed(1)}% Used
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={PieChart}
          title="No budgets configured"
          description="Create spending thresholds on categories to monitor and warn against overspending."
          actionLabel="Create Budget"
          onAction={() => handleOpenModal()}
        />
      )}

      {/* Add / Edit Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? 'Edit Budget' : 'Configure Budget'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            {categories.length > 0 ? (
              <select className="form-control" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.875rem' }}>
                <AlertCircle size={16} />
                <span>No expense categories found. Create one first.</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Limit Amount ($) *</label>
            <input type="number" step="0.01" className="form-control" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required placeholder="500.00" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-control" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input type="date" className="form-control" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={categories.length === 0}>
              {editingBudget ? 'Update' : 'Create'} Budget
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
