'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ThreatIntel {
  id: string;
  type: 'IP' | 'DOMAIN' | 'HASH' | 'URL';
  indicator: string;
  threat_type: string;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  first_seen: string;
  last_seen: string;
  source: string;
  tags: string[];
}

export default function ThreatIntelPage() {
  "use client";
  const { data: session } = useSession();
  const [indicators, setIndicators] = useState<ThreatIntel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState({
    totalIndicators: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    ipCount: 0,
    domainCount: 0,
    hashCount: 0,
    urlCount: 0,
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch threat intel data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const demoData = generateDemoThreatIntel();
        setIndicators(demoData);
        calculateStats(demoData);
      } catch (err: any) {
        console.error('Error fetching threat intel:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (data: ThreatIntel[]) => {
    setStats({
      totalIndicators: data.length,
      criticalCount: data.filter(i => i.severity === 'CRITICAL').length,
      highCount: data.filter(i => i.severity === 'HIGH').length,
      mediumCount: data.filter(i => i.severity === 'MEDIUM').length,
      lowCount: data.filter(i => i.severity === 'LOW').length,
      ipCount: data.filter(i => i.type === 'IP').length,
      domainCount: data.filter(i => i.type === 'DOMAIN').length,
      hashCount: data.filter(i => i.type === 'HASH').length,
      urlCount: data.filter(i => i.type === 'URL').length,
    });
  };

  // Chart data
  const severityDistributionData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [stats.criticalCount, stats.highCount, stats.mediumCount, stats.lowCount],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: '#0a0e17',
      borderWidth: 3,
    }]
  };

  const indicatorTypeData = {
    labels: ['IPs', 'Domains', 'Hashes', 'URLs'],
    datasets: [{
      data: [stats.ipCount, stats.domainCount, stats.hashCount, stats.urlCount],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
      ],
      borderColor: '#0a0e17',
      borderWidth: 3,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 15 }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    cutout: '65%',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading threat intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Threat Intelligence
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor and analyze security threats</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isLive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-[#151c2c] border-[#1e293b] text-gray-400'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-xs font-medium">{isLive ? 'Live' : 'Paused'}</span>
          </button>

          {/* Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#151c2c] rounded-lg border border-[#1e293b]">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-400 font-mono">{currentTime.toLocaleTimeString()}</span>
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs font-medium">Export</span>
          </button>

          {/* Add Indicator */}
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-purple-500/25">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Indicator</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Error</h3>
              <p className="mt-1 text-xs text-red-300/70">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Total Indicators */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalIndicators}</p>
          <p className="text-xs text-gray-500 mt-1">Total Indicators</p>
        </div>

        {/* Critical */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 rounded-full">
              {Math.round((stats.criticalCount / stats.totalIndicators) * 100)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.criticalCount}</p>
          <p className="text-xs text-gray-500 mt-1">Critical</p>
        </div>

        {/* High */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-400 rounded-full">
              {Math.round((stats.highCount / stats.totalIndicators) * 100)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.highCount}</p>
          <p className="text-xs text-gray-500 mt-1">High</p>
        </div>

        {/* IPs */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.ipCount}</p>
          <p className="text-xs text-gray-500 mt-1">IP Addresses</p>
        </div>

        {/* Domains */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.domainCount}</p>
          <p className="text-xs text-gray-500 mt-1">Domains</p>
        </div>

        {/* Hashes */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 hover:border-pink-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{stats.hashCount}</p>
          <p className="text-xs text-gray-500 mt-1">File Hashes</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Severity Distribution */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Severity Distribution</h3>
              <p className="text-xs text-gray-500 mt-0.5">Indicators by severity level</p>
            </div>
          </div>
          <div className="h-64">
            <Doughnut data={severityDistributionData} options={doughnutOptions} />
          </div>
        </div>

        {/* Indicator Types */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-[#334155] transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Indicator Types</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution by type</p>
            </div>
          </div>
          <div className="h-64">
            <Doughnut data={indicatorTypeData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
            {['ALL', 'IP', 'DOMAIN', 'HASH', 'URL'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedType === type
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
            <button className="p-1.5 rounded-md bg-[#1e293b] text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#1e293b] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Threat Indicators</h3>
          <span className="text-sm text-gray-400">
            {indicators.length} indicators
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1419]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Indicator</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Threat Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">First Seen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {indicators.map((indicator) => (
                <tr key={indicator.id} className="hover:bg-[#1e293b]/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      indicator.type === 'IP' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      indicator.type === 'DOMAIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      indicator.type === 'HASH' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                      'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {indicator.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white font-mono">{indicator.indicator}</span>
                  </td>
                  <td className="px-6 py-4">
                                        <span className="text-sm text-gray-300">{indicator.threat_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      indicator.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      indicator.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      indicator.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {indicator.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            indicator.confidence >= 80 ? 'bg-green-500' :
                            indicator.confidence >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${indicator.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{indicator.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">{new Date(indicator.first_seen).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-400">{indicator.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1.5 hover:bg-[#1e293b] rounded-lg text-gray-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {indicators.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1e293b] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300">No indicators found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate demo threat intel data
function generateDemoThreatIntel(): ThreatIntel[] {
  const demoData: ThreatIntel[] = [];
  const types: ('IP' | 'DOMAIN' | 'HASH' | 'URL')[] = ['IP', 'DOMAIN', 'HASH', 'URL'];
  const severities: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const sources = ['AlienVault OTX', 'VirusTotal', 'ThreatFox', 'Internal'];

  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const indicator = type === 'IP' ? `203.0.113.${Math.floor(Math.random() * 255)}` :
                     type === 'DOMAIN' ? `malicious${i}.example.com` :
                     type === 'HASH' ? Array(64).fill(0).map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('') :
                     `https://malicious${i}.example.com/path`;

    demoData.push({
      id: `indicator-${i}`,
      type,
      indicator,
      threat_type: ['Malware C2', 'Phishing', 'Ransomware', 'Botnet'][Math.floor(Math.random() * 4)],
      confidence: Math.floor(Math.random() * 40) + 60,
      severity: severities[Math.floor(Math.random() * severities.length)],
      first_seen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_seen: new Date().toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)],
      tags: ['malware', 'threat-actor', 'campaign'].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1)
    });
  }

  return demoData;
}


