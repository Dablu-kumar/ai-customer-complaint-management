import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import Footer from '../components/Footer';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Adjust icon size by 15% (original: 20px, updated: 23px)
  const iconSize = 23;

  const cards = [
    { 
      title: 'Total Complaints', 
      value: stats.total_complaints, 
      icon: <FileText size={iconSize} color="var(--accent-cyan)" />,
      desc: 'All QMS logged cases',
      border: '1px solid rgba(6, 182, 212, 0.2)'
    },
    { 
      title: 'Open Investigations', 
      value: stats.open_complaints, 
      icon: <Clock size={iconSize} color="var(--status-ui)" />,
      desc: 'Active files requiring QA action',
      border: '1px solid rgba(251, 191, 36, 0.2)'
    },
    { 
      title: 'Closed Complaints', 
      value: stats.closed_complaints, 
      icon: <CheckCircle size={iconSize} color="var(--risk-low)" />,
      desc: 'Resolved & CAPA verified',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    },
    { 
      title: 'High Risk Alerts', 
      value: stats.risk_distribution.high, 
      icon: <AlertOctagon size={iconSize} color="var(--risk-high)" />,
      desc: 'Immediate pharmacovigilance triage',
      border: '1px solid rgba(244, 63, 94, 0.2)'
    }
  ];

  if (loading && stats.total_complaints === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid var(--accent-cyan)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading quality statistics...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Calculate parameters for Pie Chart (concentric circle indicators or segment arcs)
  const totalRisk = stats.risk_distribution.high + stats.risk_distribution.medium + stats.risk_distribution.low || 1;
  const highPct = (stats.risk_distribution.high / totalRisk) * 100;
  const medPct = (stats.risk_distribution.medium / totalRisk) * 100;
  const lowPct = (stats.risk_distribution.low / totalRisk) * 100;

  // Circle circumferences for segmented ring (r=40, c=2*pi*r = 251.2)
  const c = 251.2;
  const highOffset = c - (highPct / 100) * c;
  const medOffset = c - (medPct / 100) * c;
  const lowOffset = c - (lowPct / 100) * c;

  // Find max complaints in monthly trend to scale Bar/Line charts
  const maxTrendVal = Math.max(...stats.monthly_trends.map(t => t.count), 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {cards.map((card, idx) => (
          <div key={idx} className="glass-panel" style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: card.border
          }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.title}</span>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 4px 0', fontFamily: 'var(--font-display)' }}>
                {card.value}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.desc}</span>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)'
            }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* SVG Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* SVG Pie/Donut Chart for Risk Distribution */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '340px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Activity size={18} color="var(--accent-cyan)" />
            Risk Distribution Profile
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexGrow: 1 }}>
            
            {/* SVG Segmented Ring */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                
                {/* Low Risk Segment (Green) */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--risk-low)" strokeWidth="8" 
                  strokeDasharray="238.7" strokeDashoffset={238.7 - (lowPct / 100) * 238.7}
                  transform="rotate(-90 50 50)" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                
                {/* Medium Risk Segment (Orange) */}
                <circle cx="50" cy="50" r="34" fill="transparent" stroke="var(--risk-medium)" strokeWidth="6" 
                  strokeDasharray="213.6" strokeDashoffset={213.6 - (medPct / 100) * 213.6}
                  transform="rotate(-90 50 50)" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                  
                {/* High Risk Segment (Red) */}
                <circle cx="50" cy="50" r="30" fill="transparent" stroke="var(--risk-high)" strokeWidth="6" 
                  strokeDasharray="188.4" strokeDashoffset={188.4 - (highPct / 100) * 188.4}
                  transform="rotate(-90 50 50)" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              {/* Inner Stats */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalRisk}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audited</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--risk-high)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>High: <strong>{stats.risk_distribution.high}</strong> ({Math.round(highPct)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--risk-medium)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Medium: <strong>{stats.risk_distribution.medium}</strong> ({Math.round(medPct)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--risk-low)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Low: <strong>{stats.risk_distribution.low}</strong> ({Math.round(lowPct)}%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* SVG Bar Chart for Monthly Complaints */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '340px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="var(--accent-purple)" />
            Monthly Complaints Intake
          </h3>
          <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 10px 30px 10px' }}>
            
            {/* SVG Grid Background */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: 0 }} />
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: 0 }} />
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: 0 }} />
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: 0 }} />
            </div>

            {/* Render Bars */}
            {stats.monthly_trends.map((item, idx) => {
              const heightPct = (item.count / maxTrendVal) * 80; // max height is 80%
              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  width: `${100 / stats.monthly_trends.length}%`,
                  zIndex: 2
                }}>
                  {/* Tooltip Count */}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {item.count}
                  </span>
                  {/* Bar fill */}
                  <div style={{
                    height: `${heightPct || 4}px`, // default min height 4px
                    width: '28px',
                    background: 'linear-gradient(to top, var(--accent-purple), var(--accent-cyan))',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.8s ease-out',
                    boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2)'
                  }} />
                  {/* Month Label */}
                  <span style={{
                    position: 'absolute',
                    bottom: '5px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}

          </div>
        </div>

        {/* SVG Line Chart for Trend */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '340px' }}>
          <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <TrendingUp size={18} color="var(--accent-blue)" />
            Complaint Trend Analysis
          </h3>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            
            {/* Draw SVG Line */}
            <svg width="100%" height="100%" viewBox="0 0 300 150" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.02)" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.02)" />
              <line x1="0" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.02)" />
              
              {/* Build Path Points */}
              {(() => {
                const points = stats.monthly_trends.map((item, idx) => {
                  const x = (idx / (stats.monthly_trends.length - 1)) * 300;
                  // y scale (150 is bottom, 10 is top)
                  const y = 130 - (item.count / maxTrendVal) * 100;
                  return { x, y, count: item.count, label: item.month.split(' ')[0] };
                });

                const pathData = points.reduce((acc, p, idx) => {
                  return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
                }, '');

                return (
                  <>
                    {/* Shadow Area under the line */}
                    {points.length > 0 && (
                      <path d={`${pathData} L ${points[points.length-1].x} 130 L ${points[0].x} 130 Z`}
                        fill="url(#grad)" opacity="0.15" />
                    )}

                    {/* Main Line */}
                    <path d={pathData} fill="none" stroke="var(--accent-cyan)" strokeWidth="3"
                      style={{ filter: 'drop-shadow(0 4px 6px rgba(6, 182, 212, 0.3))' }} />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-cyan)" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>

                    {/* Data Dots & Text Labels */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-primary)" stroke="var(--accent-cyan)" strokeWidth="2" />
                        <text x={p.x} y={p.y - 10} fontSize="7" fill="var(--text-primary)" textAnchor="middle" fontWeight="bold">
                          {p.count}
                        </text>
                        <text x={p.x} y="145" fontSize="7" fill="var(--text-muted)" textAnchor="middle">
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={iconSize} color="var(--accent-cyan)" />
            Recently Logged Complaints
          </h3>
          <Link to="/complaints" style={{
            color: 'var(--accent-cyan)',
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}>
            View All Registry
            <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recent_complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No complaints registered. Go to <strong>AI Copilot</strong> or <strong>Log Complaint</strong> to add one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Product Name</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Batch Number</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Severity</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Risk Level</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_complaints.map((c) => (
                  <tr key={c.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                    <td style={{ padding: '16px' }}>
                      <Link to={`/complaints`} style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}>
                        #{c.id}
                      </Link>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{c.product_name || 'N/A'}</td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.9rem' }}>{c.batch_number || 'N/A'}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge badge-risk-${c.severity.toLowerCase() === 'critical' ? 'high' : (c.severity.toLowerCase() === 'major' ? 'medium' : 'low')}`}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge badge-risk-${c.risk_level.toLowerCase()}`}>
                        {c.risk_level}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge badge-status-${c.status.toLowerCase().replace(' ', '')}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
