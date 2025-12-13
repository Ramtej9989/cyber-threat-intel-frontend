'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

// Types
interface NetworkLog {
  _id: string;
  timestamp: string;
  src_ip: string;
  dest_ip: string;
  src_port: number;
  dest_port: number;
  protocol: string;
  action: string;
  bytes_sent: number;
  bytes_received: number;
  label?: string;
}

interface NetworkLogFilters {
  src_ip: string;
  dest_ip: string;
  protocol: string;
  action: string;
  label: string;
  startDate: string;
  endDate: string;
}

export default function NetworkLogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<NetworkLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<NetworkLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [filters, setFilters] = useState<NetworkLogFilters>({
    src_ip: '',
    dest_ip: '',
    protocol: '',
    action: '',
    label: '',
    startDate: '',
    endDate: ''
  });
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    connections: 0,
    allowed: 0,
    denied: 0,
    dataSent: 0,
    dataReceived: 0
  });
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh if live mode is on
    let intervalId: NodeJS.Timeout | null = null;
    if (isLive) {
      intervalId = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [page, timeRange, isLive]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert time range to start date
      let startDate = '';
      const endDate = new Date().toISOString();
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          break;
        case '6h':
          startDate = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
          break;
        case '24h':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        api_key: API_KEY,
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString(),
        startDate,
        endDate
      });

      // Add filters if they exist
      if (filters.src_ip) queryParams.append('src_ip', filters.src_ip);
      if (filters.dest_ip) queryParams.append('dest_ip', filters.dest_ip);
      if (filters.protocol) queryParams.append('protocol', filters.protocol);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.label) queryParams.append('label', filters.label);

      const response = await fetch(`${API_URL}/api/logs/network?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch network logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setFilteredLogs(data.logs || []);
      setTotalLogs(data.total || 0);

      // Calculate summary stats
      const logsData = data.logs || [];
      const stats = {
        connections: logsData.length,
        allowed: logsData.filter((log: NetworkLog) => log.action === 'ALLOW').length,
        denied: logsData.filter((log: NetworkLog) => log.action === 'DENY').length,
        dataSent: logsData.reduce((sum: number, log: NetworkLog) => sum + (log.bytes_sent || 0), 0),
        dataReceived: logsData.reduce((sum: number, log: NetworkLog) => sum + (log.bytes_received || 0), 0)
      };
      setSummaryStats(stats);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching network logs:', err);
      setError(`Failed to load network logs: ${err.message}`);
      
      // Set demo data
      const demoLogs = generateDemoNetworkLogs();
      setLogs(demoLogs);
      setFilteredLogs(demoLogs);
      setTotalLogs(demoLogs.length);

      // Calculate summary stats for demo data
      const stats = {
        connections: demoLogs.length,
        allowed: demoLogs.filter(log => log.action === 'ALLOW').length,
        denied: demoLogs.filter(log => log.action === 'DENY').length,
        dataSent: demoLogs.reduce((sum, log) => sum + (log.bytes_sent || 0), 0),
        dataReceived: demoLogs.reduce((sum, log) => sum + (log.bytes_received || 0), 0)
      };
      setSummaryStats(stats);
      
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page
    fetchLogs();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      src_ip: '',
      dest_ip: '',
      protocol: '',
      action: '',
      label: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
    fetchLogs();
  };

  // View log details
  const viewLogDetails = (log: NetworkLog) => {
    setSelectedLog(log);
    setShowDetailPanel(true);
  };

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Get class names for action
  const getActionClass = (action: string) => {
    return action === 'ALLOW' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  };

  // Get class names for label
  const getLabelClass = (label?: string) => {
    if (label === 'attack') return 'bg-red-500/20 text-red-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  // Generate chart data for network traffic analysis
  const chartData = useMemo(() => {
    const timestamps = Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - 23 + i);
      return date.getHours() + ':00';
    });

    // Generate demo data if needed
    const connectionData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 50));

    return {
      labels: timestamps,
      datasets: [
        {
          label: 'Connections',
          data: connectionData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.4,
          fill: true,
        }
      ]
    };
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(30, 41, 59, 0.5)',
          display: false,
        },
        ticks: { color: '#64748b' }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(30, 41, 59, 0.5)',
        },
        ticks: { color: '#64748b' }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
  };

  // Loading state
  if (isLoading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading network logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Network Logs
            </h1>
            <p className="text-gray-500 text-sm mt-1">Monitor network traffic and connections</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                isLive 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-[#151c2c] border-[#1e293b] text-gray-400'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isLive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </span>
              <span className="text-xs font-medium">{isLive ? 'Live' : 'Paused'}</span>
            </button>

            {/* Time Range Selector */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              {['1h', '6h', '24h', '7d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    timeRange === range
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Advanced Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-xs font-medium hidden sm:inline">Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#151c2c] rounded-lg border border-[#1e293b]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-[#1e293b] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'} transition-all`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-[#1e293b] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'} transition-all`}
                title="Card View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLogs}
              className="p-2 bg-[#151c2c] hover:bg-[#1e293b] rounded-lg border border-[#1e293b] text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Connection Error</h3>
              <p className="mt-1 text-xs text-red-300/70">{error}</p>
              <p className="mt-2 text-xs text-gray-500">Showing demo data for preview.</p>
            </div>
            <button 
              onClick={fetchLogs}
              className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {/* Connections */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Connections</span>
          </div>
          <p className="text-2xl font-bold text-white">{summaryStats.connections}</p>
        </div>

        {/* Allowed */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Allowed</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{summaryStats.allowed}</p>
        </div>

        {/* Denied */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Denied</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{summaryStats.denied}</p>
        </div>

        {/* Data Sent */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Data Sent</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatBytes(summaryStats.dataSent)}</p>
        </div>

        {/* Data Received */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">Data Received</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatBytes(summaryStats.dataReceived)}</p>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-medium text-white">Advanced Filters</h3>
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-xs bg-[#0a0e17] hover:bg-[#1e293b] text-gray-400 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Source IP */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Source IP</label>
              <input
                type="text"
                value={filters.src_ip}
                onChange={(e) => setFilters({...filters, src_ip: e.target.value})}
                placeholder="e.g., 192.168.1.1"
                className="w-full px-3 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Destination IP */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Destination IP</label>
              <input
                type="text"
                value={filters.dest_ip}
                onChange={(e) => setFilters({...filters, dest_ip: e.target.value})}
                placeholder="e.g., 10.0.0.1"
                className="w-full px-3 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Protocol */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Protocol</label>
              <select
                value={filters.protocol}
                onChange={(e) => setFilters({...filters, protocol: e.target.value})}
                className="w-full px-3 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                className="w-full px-3 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Actions</option>
                <option value="ALLOW">Allow</option>
                <option value="DENY">Deny</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <select
                value={filters.label}
                onChange={(e) => setFilters({...filters, label: e.target.value})}
                className="w-full px-3 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Labels</option>
                <option value="normal">Normal</option>
                <option value="attack">Attack</option>
              </select>
            </div>
          </div>
          <button
            onClick={applyFilters}
            className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Network Traffic Analysis Chart */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 mb-6">
        <h3 className="text-sm font-medium text-white mb-4">Network Traffic Analysis</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Main Content - Logs List */}
      <div className="flex gap-6">
        {/* Logs Table/Cards */}
        <div className={`flex-1 transition-all duration-300 ${showDetailPanel ? 'lg:w-2/3' : 'w-full'}`}>
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="col-span-3">Time</div>
                <div className="col-span-3">Source</div>
                <div className="col-span-3">Destination</div>
                <div className="col-span-1">Protocol</div>
                <div className="col-span-1">Action</div>
                <div className="col-span-1">Label</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#1e293b]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className="px-4 py-4 hover:bg-[#1e293b]/50 transition-all duration-200 cursor-pointer"
                    onClick={() => viewLogDetails(log)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Time */}
                      <div className="col-span-3">
                        <p className="text-sm text-white">{formatRelativeTime(log.timestamp)}</p>
                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>

                      {/* Source */}
                      <div className="col-span-3">
                        <p className="text-sm text-white font-mono">{log.src_ip}</p>
                        <p className="text-xs text-gray-500">Port: {log.src_port}</p>
                      </div>

                      {/* Destination */}
                      <div className="col-span-3">
                        <p className="text-sm text-white font-mono">{log.dest_ip}</p>
                        <p className="text-xs text-gray-500">Port: {log.dest_port}</p>
                      </div>

                      {/* Protocol */}
                      <div className="col-span-1">
                        <span className="text-sm text-blue-400 font-mono">{log.protocol}</span>
                      </div>

                      {/* Action */}
                      <div className="col-span-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </div>

                      {/* Label */}
                      <div className="col-span-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getLabelClass(log.label)}`}>
                          {log.label || 'normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-300">No logs found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or time range</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{Math.min((page - 1) * pageSize + 1, totalLogs)}</span> to{' '}
                <span className="font-medium text-white">{Math.min(page * pageSize, totalLogs)}</span> of{' '}
                <span className="font-medium text-white">{totalLogs}</span> logs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(totalLogs / pageSize)) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                        page === i + 1
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-[#1e293b] text-gray-400 hover:bg-[#334155] hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(totalLogs / pageSize), p + 1))}
                  disabled={page >= Math.ceil(totalLogs / pageSize)}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {showDetailPanel && selectedLog && (
          <div className="hidden lg:block w-1/3 bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden sticky top-4 max-h-[calc(100vh-120px)]">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Log Details</h3>
              <button 
                onClick={() => setShowDetailPanel(false)}
                className="p-1 hover:bg-[#1e293b] rounded text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Timestamp */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                <p className="text-sm text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(selectedLog.timestamp)}</p>
              </div>

              {/* Connection Details */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Connection Details</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Source IP</p>
                      <p className="text-sm text-white font-mono">{selectedLog.src_ip}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Source Port</p>
                      <p className="text-sm text-white font-mono">{selectedLog.src_port}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Destination IP</p>
                      <p className="text-sm text-white font-mono">{selectedLog.dest_ip}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Destination Port</p>
                      <p className="text-sm text-white font-mono">{selectedLog.dest_port}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Protocol</p>
                      <p className="text-sm text-blue-400 font-mono">{selectedLog.protocol}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Action</p>
                      <p className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${getActionClass(selectedLog.action)}`}>
                        {selectedLog.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Transfer */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Data Transfer</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      <p className="text-xs text-gray-500">Data Sent</p>
                    </div>
                    <p className="text-sm text-white">{formatBytes(selectedLog.bytes_sent)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      <p className="text-xs text-gray-500">Data Received</p>
                    </div>
                    <p className="text-sm text-white">{formatBytes(selectedLog.bytes_received)}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Total Data Transferred</p>
                  <p className="text-sm text-white">{formatBytes(selectedLog.bytes_sent + selectedLog.bytes_received)}</p>
                </div>
              </div>

              {/* Label */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Traffic Label</h4>
                <p className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${getLabelClass(selectedLog.label)}`}>
                  {selectedLog.label || 'normal'}
                </p>
              </div>

              {/* Related Info */}
              <div className="bg-[#0a0e17] rounded-lg p-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Related Information</h4>
                <div className="flex flex-col space-y-2">
                  <button className="flex items-center justify-between w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs">
                    <span>View Threat Intelligence for {selectedLog.src_ip}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="flex items-center justify-between w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs">
                    <span>View All Traffic from {selectedLog.src_ip}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="flex items-center justify-between w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-xs">
                    <span>View All Traffic to {selectedLog.dest_ip}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                  Export Log
                </button>
                <button className="p-2.5 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate demo network logs for testing
function generateDemoNetworkLogs(): NetworkLog[] {
  const logs: NetworkLog[] = [];
  
  // Common IPs
  const srcIps = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '203.0.113.142', '203.0.113.245'];
  const destIps = ['10.0.0.1', '10.0.0.2', '10.0.0.3', '203.0.113.142', '172.16.0.1'];
  
  // Protocols
  const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS'];
  
  // Common ports
  const commonPorts = [80, 443, 22, 53, 3389, 8080, 8443, 21, 25, 3306];
  
  // Generate logs
  for (let i = 0; i < 50; i++) {
    const srcIp = srcIps[Math.floor(Math.random() * srcIps.length)];
    const destIp = destIps[Math.floor(Math.random() * destIps.length)];
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const srcPort = Math.floor(Math.random() * 60000) + 1024;
    const destPort = commonPorts[Math.floor(Math.random() * commonPorts.length)];
    const action = Math.random() > 0.3 ? 'ALLOW' : 'DENY';
    const bytesSent = Math.floor(Math.random() * 1024 * 1024); // Up to 1MB
    const bytesReceived = Math.floor(Math.random() * 1024 * 1024); // Up to 1MB
    
    // Timestamp between now and 24 hours ago
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString();
    
    // Label some traffic as attacks
    let label: string | undefined;
    if (srcIp.startsWith('203.0.113') && Math.random() > 0.5) {
      label = action === 'DENY' ? 'normal' : 'attack';
    }
    
    logs.push({
      _id: `log-${i + 1}`,
      timestamp,
      src_ip: srcIp,
      dest_ip: destIp,
      src_port: srcPort,
      dest_port: destPort,
      protocol,
      action,
      bytes_sent: bytesSent,
      bytes_received: bytesReceived,
      label
    });
  }
  
  return logs;
}
