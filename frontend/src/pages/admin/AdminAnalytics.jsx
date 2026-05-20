import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ZAxis
} from 'recharts';
import {
  getBookingAnalytics, getTrendingServicesAnalytics, getTrendingSoonAnalytics,
  getCancellationsAnalytics, getProviderAlertsAnalytics, getSeasonalDemandAnalytics,
  getTrafficIntelligenceAnalytics, getProviderPerformanceAnalytics, getUserBehaviorAnalytics,
  generateDashboardInsight
} from '../../services/api';
import './AdminAnalytics.css';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('weekly'); // daily, weekly, monthly

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        resBookings, resTrending, resTrendingSoon, resCancellations, resProviderAlerts,
        resSeasonal, resTraffic, resProviders, resUsers
      ] = await Promise.all([
        getBookingAnalytics({ range: timeRange }),
        getTrendingServicesAnalytics(),
        getTrendingSoonAnalytics(),
        getCancellationsAnalytics(),
        getProviderAlertsAnalytics({ threshold: 3 }),
        getSeasonalDemandAnalytics(),
        getTrafficIntelligenceAnalytics(),
        getProviderPerformanceAnalytics(),
        getUserBehaviorAnalytics()
      ]);

      const allData = {
        bookings: resBookings.data,
        trending: resTrending.data,
        trendingSoon: resTrendingSoon.data,
        cancellations: resCancellations.data,
        providerAlerts: resProviderAlerts.data,
        seasonal: resSeasonal.data,
        traffic: resTraffic.data,
        providers: resProviders.data,
        users: resUsers.data
      };

      setData(allData);
      fetchAIInsight(allData);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsight = async (metricsPayload) => {
    setInsightLoading(true);
    try {
      // Create a simplified payload to save tokens
      const payload = {
        kpis: metricsPayload.bookings.kpis,
        topTrending: metricsPayload.trending.topBooked.slice(0,3),
        cancellationReasons: metricsPayload.cancellations.reasons,
        lowProviders: metricsPayload.providerAlerts,
        trafficConversion: metricsPayload.traffic.slice(0,3),
        funnel: metricsPayload.users.funnel
      };
      const res = await generateDashboardInsight(payload);
      setInsight(res.data);
    } catch (err) {
      console.error('AI Insight failed', err);
    } finally {
      setInsightLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [timeRange]);

  if (loading || !data) {
    return <div className="spinner-wrap"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-analytics-container">
      <div className="admin-page-header">
        <div>
          <h1>Platform Analytics & AI Intelligence</h1>
          <p>Comprehensive 10-section metrics dashboard powered by OpenAI</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['daily', 'weekly', 'monthly'].map(r => (
            <button key={r} className={`btn ${timeRange === r ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTimeRange(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI MONITORING PANEL (Persistent Top/Sidebar) ── */}
      <div className="ai-monitoring-panel">
        <div className="ai-header">
          <h3>🧠 OpenAI Platform Monitoring</h3>
          <button className="btn btn-sm btn-outline" onClick={() => fetchAIInsight(data)} disabled={insightLoading}>
            {insightLoading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
        
        {insightLoading ? (
          <p className="ai-loading-text">OpenAI is analyzing your metrics...</p>
        ) : insight ? (
          <div className="ai-insights-grid">
            <div className="ai-card health-card">
              <h4>Health Score</h4>
              <div className="health-score" style={{ color: insight.platformHealthScore > 75 ? '#10b981' : insight.platformHealthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                {insight.platformHealthScore}/100
              </div>
              <p className="ai-summary">{insight.weekSummary}</p>
            </div>
            
            <div className="ai-card alert-card">
              <h4>⚠️ Critical Alerts</h4>
              <ul>{insight.criticalAlerts?.length ? insight.criticalAlerts.map((a, i) => <li key={i}>{a}</li>) : <li>No critical alerts.</li>}</ul>
            </div>

            <div className="ai-card opp-card">
              <h4>🚀 Top Opportunities</h4>
              <ul>{insight.topOpportunities?.length ? insight.topOpportunities.map((a, i) => <li key={i}>{a}</li>) : <li>Gathering data...</li>}</ul>
            </div>

            <div className="ai-card prov-card">
              <h4>👥 Provider Alerts</h4>
              <ul>{insight.providerAlerts?.length ? insight.providerAlerts.map((a, i) => <li key={i}>{a}</li>) : <li>All providers healthy.</li>}</ul>
            </div>
          </div>
        ) : (
          <p className="ai-error-text">Failed to load AI insights. Check OpenAI API key.</p>
        )}
      </div>

      {/* ── 1. Revenue & Bookings ── */}
      <section className="analytics-section">
        <h2>1. Revenue & Bookings Overview</h2>
        <div className="kpi-row">
          <div className="kpi-card"><span>Total Bookings</span><strong>{data.bookings.kpis.totalBookings}</strong></div>
          <div className="kpi-card"><span>Total Revenue</span><strong>Rs. {data.bookings.kpis.totalRevenue.toLocaleString()}</strong></div>
          <div className="kpi-card"><span>Avg Booking Value</span><strong>Rs. {data.bookings.kpis.avgBookingValue.toLocaleString()}</strong></div>
        </div>
        
        <div className="charts-row">
          <div className="chart-box">
            <h4>Bookings Trend ({timeRange})</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.bookings.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="totalBookings" stroke="#3b82f6" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h4>Revenue per Category</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.bookings.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── 2. Trending Services ── */}
      <section className="analytics-section">
        <h2>2. Trending Services</h2>
        <div className="charts-row">
          <div className="chart-box">
            <h4>Top 10 Booked Services</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.trending.topBooked} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={120} style={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalBookings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h4>Top 10 Viewed Profiles</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.trending.topViewed} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={120} style={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="views" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── 3. Services About to Trend ── */}
      <section className="analytics-section">
        <h2>3. Services About to Trend (High Views, Low Bookings)</h2>
        <table className="admin-table">
          <thead><tr><th>Service</th><th>Category</th><th>Views</th><th>Bookings</th><th>Trend Status</th></tr></thead>
          <tbody>
            {data.trendingSoon.map(s => (
              <tr key={s._id}>
                <td>{s.title}</td><td>{s.category}</td>
                <td><strong>{s.views}</strong></td><td>{s.totalBookings}</td>
                <td><span className="badge badge-warning">Rising 📈</span></td>
              </tr>
            ))}
            {!data.trendingSoon.length && <tr><td colSpan={5} style={{textAlign:'center'}}>No upcoming trends detected.</td></tr>}
          </tbody>
        </table>
      </section>

      {/* ── 4. Cancellations & Complaints ── */}
      <section className="analytics-section">
        <h2>4. Cancellations & Complaints Analysis</h2>
        <div className="charts-row">
          <div className="chart-box">
            <h4>Cancellation Reasons</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.cancellations.reasons} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                  {data.cancellations.reasons.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-box">
            <h4>Top Providers by Cancellations</h4>
            <table className="admin-table">
              <thead><tr><th>Provider</th><th>Cancelled Bookings</th><th>Status</th></tr></thead>
              <tbody>
                {data.cancellations.topOffenders.map(p => (
                  <tr key={p._id}>
                    <td>{p._id}</td><td><strong>{p.cancelCount}</strong></td>
                    <td><span className="badge badge-danger">Review Needed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. Provider Availability Alerts ── */}
      <section className="analytics-section">
        <h2>5. Provider Availability Alerts (Stock Levels)</h2>
        <table className="admin-table">
          <thead><tr><th>Category</th><th>Active Providers</th><th>Status</th></tr></thead>
          <tbody>
            {data.providerAlerts.map(c => (
              <tr key={c.category}>
                <td>{c.category}</td>
                <td style={{ fontWeight: 'bold', color: c.providerCount === 0 ? '#ef4444' : c.providerCount <= 2 ? '#f97316' : '#eab308' }}>
                  {c.providerCount}
                </td>
                <td>
                  {c.providerCount === 0 ? <span className="badge badge-danger">Out of Stock</span> :
                   c.providerCount <= 2 ? <span className="badge badge-warning">Critical Low</span> :
                   <span className="badge badge-outline">Low</span>}
                </td>
              </tr>
            ))}
            {!data.providerAlerts.length && <tr><td colSpan={3} style={{textAlign:'center'}}>All categories have healthy provider counts.</td></tr>}
          </tbody>
        </table>
      </section>

      {/* ── 6. Seasonal Demand ── */}
      <section className="analytics-section">
        <h2>6. Seasonal Service Demand</h2>
        <div className="chart-box" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" allowDuplicatedCategory={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.seasonal.map((s, idx) => (
                <Line key={s._id} dataKey="count" data={s.monthlyData} name={s._id} type="monotone" stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 8. Traffic Intelligence (Skipped 7 as it is AI text based) ── */}
      <section className="analytics-section">
        <h2>8. Traffic vs Conversion Rate</h2>
        <div className="chart-box" style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="views" name="Views" />
              <YAxis type="number" dataKey="conversionRate" name="Conv Rate %" unit="%" />
              <ZAxis type="category" dataKey="title" name="Service" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Services" data={data.traffic} fill="#ec4899">
                {data.traffic.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 9. Provider Performance ── */}
      <section className="analytics-section">
        <h2>9. Provider Performance Monitor</h2>
        <table className="admin-table">
          <thead><tr><th>Provider Name</th><th>Services Listed</th><th>Completed Bookings</th><th>Avg Rating</th></tr></thead>
          <tbody>
            {data.providers.map(p => (
              <tr key={p._id}>
                <td>{p._id}</td><td>{p.serviceCount}</td>
                <td><strong>{p.totalBookings}</strong></td>
                <td>⭐ {p.avgRating ? p.avgRating.toFixed(1) : '0.0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── 10. User Behavior Funnel ── */}
      <section className="analytics-section">
        <h2>10. User Behavior & Retention Funnel</h2>
        <div className="funnel-container">
          <div className="funnel-step">
            <div className="funnel-circle">{data.users.funnel.totalUsers}</div>
            <p>Total Registered Users</p>
          </div>
          <div className="funnel-arrow">➔</div>
          <div className="funnel-step">
            <div className="funnel-circle">{data.users.funnel.usersWithWishlist}</div>
            <p>Added to Wishlist/Cart</p>
          </div>
          <div className="funnel-arrow">➔</div>
          <div className="funnel-step">
            <div className="funnel-circle">{data.users.funnel.usersWithBookings}</div>
            <p>Completed a Booking</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 15, color: '#ef4444', fontWeight: 'bold' }}>
          Drop-off Rate (Wishlist → Booking): {data.users.funnel.dropoffWishlistToBooking}%
        </p>
      </section>

    </div>
  );
}
