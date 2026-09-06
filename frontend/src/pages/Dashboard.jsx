import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { 
  DollarSign, ArrowDownRight, ArrowUpRight, Target, TrendingUp, PieChart as PieChartIcon, 
  ArrowRight, RefreshCw, Calendar, ShoppingBag, Car, Home, Phone, Gift, Coffee, Film, HelpCircle, Briefcase
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

// Dynamic Category Icon mapping for premium layout
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

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, trendRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/monthly-trends')
      ]);
      setSummary(sumRes.data.data);
      setTrends(trendRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard financial overview.');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  // Dynamic MoM growth calculation from real data
  let incomeMoM = 0;
  let expenseMoM = 0;
  if (trends && trends.length >= 2) {
    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    if (previous.totalIncome > 0) {
      incomeMoM = ((latest.totalIncome - previous.totalIncome) / previous.totalIncome) * 100;
    }
    if (previous.totalExpense > 0) {
      expenseMoM = ((latest.totalExpense - previous.totalExpense) / previous.totalExpense) * 100;
    }
  }

  const categoryPieData = summary?.categoryExpenseBreakdown 
    ? Object.entries(summary.categoryExpenseBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      {/* Top Header Greeting */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getGreeting()}, {user?.fullName || 'User'} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
            <Calendar size={14} />
            <span>{getCurrentDate()}</span>
          </div>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="btn btn-secondary btn-sm"
          disabled={loading}
          style={{ padding: '8px 14px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Sync Desk</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '14px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', marginBottom: '24px', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Balance Hero + Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) 2fr', gap: '28px', marginBottom: '32px' }} className="grid-2">
        {loading ? (
          <div className="skeleton" style={{ height: '220px', borderRadius: 'var(--border-radius-xl)' }} />
        ) : (
          /* Premium Balance Hero Card */
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="balance-hero"
          >
            <div className="balance-hero-grid" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              NET LIQUID BALANCE
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', margin: '6px 0 18px' }}>
              ${summary?.netBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', marginTop: 'auto' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>SAVINGS POT</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc', marginTop: '2px' }}>
                  ${summary?.totalSavingsGoalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>SAVINGS RATE</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  {summary?.totalIncome > 0 
                    ? `${((summary.totalSavingsGoalAmount / summary.totalIncome) * 100).toFixed(1)}%`
                    : '0.0%'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2 Primary Action Stats side by side */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
          {loading ? (
            <>
              <div className="skeleton" style={{ height: '98px' }} />
              <div className="skeleton" style={{ height: '98px' }} />
            </>
          ) : (
            <>
              <StatCard 
                title="Consolidated Income" 
                value={summary?.totalIncome ?? 0} 
                icon={ArrowUpRight} 
                color="var(--success)" 
                trendValue={incomeMoM}
              />
              <StatCard 
                title="Consolidated Expense" 
                value={summary?.totalExpense ?? 0} 
                icon={ArrowDownRight} 
                color="var(--danger)" 
                trendValue={expenseMoM}
              />
            </>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid-2">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            {/* Income vs Expense Area Chart */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ padding: 8, borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>6-Month Income vs Expense Trend</h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Historical comparison of inputs vs outputs</p>
                </div>
              </div>
              
              <div style={{ width: '100%', height: 280 }}>
                {trends.length > 0 ? (
                  <ResponsiveContainer>
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--success)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} fontWeight={600} tickLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} fontWeight={600} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-card)', 
                          borderColor: 'var(--border-color-light)', 
                          borderRadius: '12px', 
                          color: 'var(--text-primary)',
                          boxShadow: 'var(--shadow-lg)',
                          fontFamily: 'var(--font-family)',
                          fontSize: '0.8rem'
                        }} 
                        itemStyle={{ fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="totalIncome" name="Income" stroke="var(--success)" strokeWidth={2.5} fillOpacity={1} fill="url(#incGrad)" />
                      <Area type="monotone" dataKey="totalExpense" name="Expense" stroke="var(--danger)" strokeWidth={2.5} fillOpacity={1} fill="url(#expGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No monthly trend data recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Donut Chart with Responsive Center Label */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ padding: 8, borderRadius: '10px', background: 'var(--info-light)', color: 'var(--info)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                  <PieChartIcon size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Expense Category Breakdown</h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Allocated funds distributed by category</p>
                </div>
              </div>

              <div style={{ position: 'relative', width: '100%', height: 280 }}>
                {categoryPieData.length > 0 ? (
                  <>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie 
                          data={categoryPieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={65} 
                          outerRadius={95} 
                          paddingAngle={3} 
                          dataKey="value"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--bg-card)', 
                            borderColor: 'var(--border-color-light)', 
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-family)',
                            fontSize: '0.8rem'
                          }} 
                          formatter={(val) => `$${Number(val).toFixed(2)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Centered label layer inside Donut */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL SPENT</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                        ${summary?.totalExpense?.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                    No expense breakdown data available yet.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Feed */}
      <div className="grid-2">
        {loading ? (
          <>
            <TableSkeleton rows={4} cols={4} />
            <TableSkeleton rows={4} cols={4} />
          </>
        ) : (
          <>
            {/* Recent Expenses Feed */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Debits</h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Latest expenses registered</p>
                </div>
                <Link to="/expenses" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summary?.recentExpenses?.length > 0 ? (
                  summary.recentExpenses.map((exp) => {
                    const CategoryIcon = getCategoryIcon(exp.category?.name);
                    return (
                      <motion.div 
                        key={exp.id}
                        whileHover={{ x: 2, background: 'var(--bg-card-hover)' }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-sm)',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--danger-light)',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(244, 63, 94, 0.15)'
                          }}>
                            <CategoryIcon size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{exp.title}</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{exp.category?.name || 'General'}</span>
                              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                              <span>{exp.date}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--danger)' }}>
                          -${exp.amount?.toFixed(2)}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No recent expenses recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Incomes Feed */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Credits</h3>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Latest income flows registered</p>
                </div>
                <Link to="/incomes" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {summary?.recentIncomes?.length > 0 ? (
                  summary.recentIncomes.map((inc) => {
                    const CategoryIcon = getCategoryIcon(inc.category?.name);
                    return (
                      <motion.div 
                        key={inc.id}
                        whileHover={{ x: 2, background: 'var(--bg-card-hover)' }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-sm)',
                          transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--success-light)',
                            color: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(16, 185, 129, 0.15)'
                          }}>
                            <CategoryIcon size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{inc.title}</div>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{inc.category?.name || 'Income'}</span>
                              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                              <span>{inc.date}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--success)' }}>
                          +${inc.amount?.toFixed(2)}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No recent incomes recorded.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
