import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  Plus, Trash2, Edit2, Tag, Search, Filter, Coffee, Car, ShoppingBag, 
  Home, Phone, Film, Gift, Briefcase, HelpCircle, TrendingUp
} from 'lucide-react';

// Dynamic Category Icon mapping for category grid
const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('food') || name.includes('eat') || name.includes('dining') || name.includes('grocery') || name.includes('cafe')) return Coffee;
  if (name.includes('transport') || name.includes('cab') || name.includes('fuel') || name.includes('car') || name.includes('travel')) return Car;
  if (name.includes('shopping') || name.includes('clothe') || name.includes('store')) return ShoppingBag;
  if (name.includes('bill') || name.includes('rent') || name.includes('utility') || name.includes('house')) return Home;
  if (name.includes('phone') || name.includes('internet') || name.includes('mobile')) return Phone;
  if (name.includes('entertainment') || name.includes('movie') || name.includes('netflix') || name.includes('show')) return Film;
  if (name.includes('gift') || name.includes('donation')) return Gift;
  if (name.includes('salary') || name.includes('work') || name.includes('wage')) return Briefcase;
  return HelpCircle;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const toast = useToast();

  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', description: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, type: cat.type, description: cat.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', type: 'EXPENSE', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, type: formData.type, description: formData.description };
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Category updated successfully. 👍');
      } else {
        await api.post('/categories', payload);
        toast.success('New category created successfully. 🎉');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All related transactions will lose their categorization.')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted.');
        loadCategories();
      } catch (err) {
        toast.error('Error deleting category.');
      }
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'ALL' || cat.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [categories, searchQuery, typeFilter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Configure custom categories to map and monitor cash flows</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>New Category</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div className="search-input-wrapper">
          <Search size={16} className="search-input-icon" />
          <input 
            type="text" 
            className="form-control search-input"
            placeholder="Search category name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="mobile-full-width">
          <Filter size={15} color="var(--text-muted)" />
          <select 
            className="form-control" 
            style={{ minWidth: '160px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {filteredCategories.map(cat => {
            const Icon = getCategoryIcon(cat.name);
            const isIncome = cat.type === 'INCOME';
            
            return (
              <motion.div 
                key={cat.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderTop: `4px solid ${isIncome ? 'var(--success)' : 'var(--primary)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: isIncome ? 'var(--success-light)' : 'var(--primary-light)',
                      color: isIncome ? 'var(--success)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)'}`
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
                      <span className={`badge ${isIncome ? 'badge-success' : 'badge-primary'}`} style={{ marginTop: '4px', fontSize: '0.65rem', padding: '3px 8px' }}>
                        {cat.type}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleOpenModal(cat)} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>

                {cat.description ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {cat.description}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No description provided.
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={Tag}
          title="No categories found"
          description={searchQuery ? "Try amending your search term." : "Start categorizing cash entries by defining custom categories."}
          actionLabel={searchQuery ? null : "Create Category"}
          onAction={searchQuery ? null : () => handleOpenModal()}
        />
      )}

      {/* Add / Edit Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Subscriptions, Travel" />
          </div>
          <div className="form-group">
            <label className="form-label">Flow Type *</label>
            <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
              <option value="EXPENSE">Expense (Debit)</option>
              <option value="INCOME">Income (Credit)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" className="form-control" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Monthly recurring service bills" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingCategory ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
