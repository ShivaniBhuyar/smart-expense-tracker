import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Edit2, PiggyBank, CheckCircle2, TrendingUp, Sparkles, Calendar } from 'lucide-react';

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0.00',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/savings-goals');
      setGoals(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load savings goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        description: goal.description || ''
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '0.00',
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDepositModal = (goal) => {
    setDepositGoal(goal);
    setDepositAmount('');
    setIsDepositModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
        targetDate: formData.targetDate,
        description: formData.description
      };

      if (editingGoal) {
        await api.put(`/savings-goals/${editingGoal.id}`, payload);
        toast.success('Savings goal updated successfully. 👍');
      } else {
        await api.post('/savings-goals', payload);
        toast.success('New savings goal created! 🏆');
      }
      setIsModalOpen(false);
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving goal.');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/savings-goals/${depositGoal.id}/deposit`, { amount: parseFloat(depositAmount) });
      setIsDepositModalOpen(false);
      
      const newAmt = depositGoal.currentAmount + parseFloat(depositAmount);
      if (newAmt >= depositGoal.targetAmount) {
        toast.success(`Goal achieved! You've fully funded ${depositGoal.title}! 🥳🎉`);
      } else {
        toast.success(`Successfully deposited $${parseFloat(depositAmount).toFixed(2)} to ${depositGoal.title}! 💰`);
      }
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing deposit.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        await api.delete(`/savings-goals/${id}`);
        toast.success('Savings goal deleted.');
        loadGoals();
      } catch (err) {
        toast.error('Error deleting goal.');
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
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Configure milestones, monitor inputs, and fund targets</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="grid-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid-2">
          {goals.map(goal => {
            const pct = Math.min(goal.percentageAchieved || 0, 100);
            const isCompleted = goal.status === 'COMPLETED' || pct >= 100;
            
            // SVG circular progress parameters
            const radius = 32;
            const strokeWidth = 6;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;

            return (
              <motion.div 
                key={goal.id} 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="card"
                style={{
                  border: isCompleted ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
                  boxShadow: isCompleted ? '0 10px 30px rgba(16, 185, 129, 0.08)' : 'var(--shadow-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '60px',
                    height: '60px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                  {/* Left Column: Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.625rem', padding: '3px 8px' }}>
                        {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{goal.title}</h3>
                      {goal.description && (
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.3 }}>
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                      <Calendar size={13} />
                      <span>TARGET: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isCompleted ? 'var(--success)' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        ${goal.currentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: '6px' }}>
                        of ${goal.targetAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: SVG Circular Progress Widget */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'relative', width: '76px', height: '76px' }}>
                      <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                          cx="38"
                          cy="38"
                          r={radius}
                          stroke="var(--bg-darker)"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                        />
                        <motion.circle
                          cx="38"
                          cy="38"
                          r={radius}
                          stroke={isCompleted ? "var(--success)" : "var(--primary)"}
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: isCompleted ? 'var(--success)' : 'var(--text-primary)'
                      }}>
                        {pct.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '20px', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '16px' 
                }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {isCompleted ? 'Goal Fully Funded! 🎉' : `$${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining`}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!isCompleted && (
                      <button onClick={() => handleOpenDepositModal(goal)} className="btn btn-primary btn-sm" style={{ padding: '6px 12px' }}>
                        <TrendingUp size={13} />
                        <span>Deposit</span>
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(goal)} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(goal.id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={PiggyBank}
          title="No active milestones"
          description="Establish future targets to monitor progress on emergencies, items, or investment funds."
          actionLabel="New Goal"
          onAction={() => handleOpenModal()}
        />
      )}

      {/* Add / Edit Goal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGoal ? 'Edit Savings Goal' : 'Configure Milestone'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g. Travel Fund, Reserve Fund" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Target Value ($) *</label>
              <input type="number" step="0.01" className="form-control" value={formData.targetAmount} onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} required placeholder="1000.00" />
            </div>
            {!editingGoal && (
              <div className="form-group">
                <label className="form-label">Initial Seed ($)</label>
                <input type="number" step="0.01" className="form-control" value={formData.currentAmount} onChange={e => setFormData({ ...formData, currentAmount: e.target.value })} placeholder="0.00" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Target Date *</label>
            <input type="date" className="form-control" value={formData.targetDate} onChange={e => setFormData({ ...formData, targetDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Notes or purpose of this target" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingGoal ? 'Update' : 'Create'} Goal</button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title={`Deposit to ${depositGoal?.title}`}>
        <form onSubmit={handleDepositSubmit}>
          <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '12px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              <span>Progress Allocation:</span>
              <span>${depositGoal?.currentAmount?.toFixed(2)} / ${depositGoal?.targetAmount?.toFixed(2)}</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${Math.min(depositGoal?.percentageAchieved || 0, 100)}%`, backgroundColor: 'var(--primary)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Value ($) *</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-control" 
              value={depositAmount} 
              onChange={e => setDepositAmount(e.target.value)} 
              required 
              placeholder="e.g. 250.00" 
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsDepositModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <TrendingUp size={15} />
              <span>Submit Deposit</span>
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
