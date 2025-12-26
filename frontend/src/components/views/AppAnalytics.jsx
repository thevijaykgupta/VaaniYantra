import { useState, useEffect } from 'react';
import './Views.css';

function AppAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    sessionsToday: 0,
    totalAudioProcessed: '0h 0m',
    avgLatency: '0ms',
    languagesUsed: [],
    weeklyStats: []
  });

  // Mock analytics data
  useEffect(() => {
    // Simulate loading analytics data
    const mockData = {
      sessionsToday: 24,
      totalAudioProcessed: '12h 45m',
      avgLatency: '210ms',
      languagesUsed: ['English', 'Hindi', 'Tamil', 'Kannada', 'Telugu', 'Bengali'],
      totalSessions: 156,
      activeSubjects: ['DSP', 'Data Structures', 'Analog Communication', 'Machine Learning'],
      weeklyStats: [
        { day: 'Mon', sessions: 18 },
        { day: 'Tue', sessions: 22 },
        { day: 'Wed', sessions: 25 },
        { day: 'Thu', sessions: 19 },
        { day: 'Fri', sessions: 28 },
        { day: 'Sat', sessions: 12 },
        { day: 'Sun', sessions: 8 }
      ]
    };

    setTimeout(() => setAnalyticsData(mockData), 500);
  }, []);

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <h2 className="analytics-title">App Analytics</h2>
        <p className="analytics-subtitle">Monitor system usage and performance</p>
      </div>

      <div className="analytics-grid">
        {/* Stat Cards */}
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.sessionsToday}</div>
            <div className="stat-label">Sessions Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.totalAudioProcessed}</div>
            <div className="stat-label">Audio Processed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.avgLatency}</div>
            <div className="stat-label">Avg Latency</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-number">{analyticsData.languagesUsed.length}</div>
            <div className="stat-label">Languages Used</div>
          </div>
        </div>
      </div>

      {/* Languages Used */}
      <div className="analytics-section">
        <h3 className="section-title">Languages Used</h3>
        <div className="language-tags">
          {analyticsData.languagesUsed.map(lang => (
            <span key={lang} className="language-tag">{lang}</span>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="analytics-section">
        <h3 className="section-title">Weekly Activity</h3>
        <div className="activity-chart">
          {analyticsData.weeklyStats.map(stat => (
            <div key={stat.day} className="chart-bar">
              <div
                className="bar-fill"
                style={{ height: `${(stat.sessions / 20) * 100}%` }}
              ></div>
              <div className="bar-label">{stat.day}</div>
              <div className="bar-value">{stat.sessions}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="analytics-section">
        <h3 className="section-title">System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>ASR Engine (Whisper)</span>
          </div>
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>Translation Engine (MarianMT)</span>
          </div>
          <div className="status-item">
            <span className="status-dot offline"></span>
            <span>Backup ASR (Vosk)</span>
          </div>
          <div className="status-item">
            <span className="status-dot online"></span>
            <span>WebSocket Server</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppAnalytics;
