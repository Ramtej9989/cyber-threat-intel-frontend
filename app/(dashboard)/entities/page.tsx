'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Doughnut, Radar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
);

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'API_KEY_7F9X_K2P8_QM2L_Z8R1X';

// Entity types and risk factors
const ENTITY_TYPES = ['ALL', 'USER', 'HOST', 'IP'];
const RISK_FACTORS = {
  CRITICAL_ASSET: 'Critical Asset',
  ATTACK_TARGET: 'Attack Target',
  ALERT_ASSOCIATION: 'Alert Association',
  KNOWN_THREAT_ACTOR: 'Known Threat Actor',
  DETECTED_ATTACK: 'Detected Attack',
  SUSPICIOUS_AUTH: 'Suspicious Authentication',
  FAILED_LOGIN: 'Failed Login',
  BLOCKED_CONNECTIONS: 'Blocked Connections',
  AUTHENTICATION_FAILURES: 'Authentication Failures'
};

export default function EntitiesPage() {
  const { data: session } = useSession();
  const [entities, setEntities] = useState<any[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalEntities, setTotalEntities] = useState(0);
  const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
  const [riskRangeFilter, setRiskRangeFilter] = useState<[number, number]>([0, 10]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const pageSize = 10;

  useEffect(() => {
    fetchEntities();
  }, [page, entityTypeFilter]);

  // Apply client-side filters (search and risk range)
  useEffect(() => {
    let result = [...entities];
    
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(entity => 
        entity.entity_id.toLowerCase().includes(search) || 
        entity.risk_factors.some((f: any) => f.details.toLowerCase().includes(search))
      );
    }
    
    if (riskRangeFilter[0] > 0 || riskRangeFilter[1] < 10) {
      result = result.filter(entity => 
        entity.risk_score >= riskRangeFilter[0] && 
        entity.risk_score <= riskRangeFilter[1]
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'risk_score') {
        return sortOrder === 'desc' ? b.risk_score - a.risk_score : a.risk_score - b.risk_score;
      } else {
        // Sort by entity_id
        return sortOrder === 'desc' 
          ? b.entity_id.localeCompare(a.entity_id) 
          : a.entity_id.localeCompare(b.entity_id);
      }
    });
    
    setFilteredEntities(result);
  }, [entities, searchQuery, riskRangeFilter, sortBy, sortOrder]);

  const fetchEntities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        api_key: API_KEY,
        skip: ((page - 1) * pageSize).toString(),
        limit: pageSize.toString(),
      });
      
      // Add filters if they exist
      if (entityTypeFilter && entityTypeFilter !== 'ALL') {
        queryParams.append('entity_type', entityTypeFilter);
      }

      const response = await fetch(
        `${API_URL}/api/entities?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entities: ${response.status}`);
      }
      
      const data = await response.json();
      setEntities(data.scores || []);
      setTotalEntities(data.total || 0);
      setIsLoading(false);
      
      // If there are entities and none selected yet, select the first one
      if ((data.scores || []).length > 0 && !selectedEntity) {
        fetchEntityDetail(data.scores[0]);
      }
    } catch (err: any) {
      console.error('Error fetching entities:', err);
      setError(`Failed to load entity risk scores: ${err.message}`);
      setIsLoading(false);
      
      // For demo/testing, display placeholder data if API fails
      const placeholderData = generatePlaceholderEntities();
      setEntities(placeholderData);
      setFilteredEntities(placeholderData);
      setTotalEntities(placeholderData.length);
      
      if (placeholderData.length > 0 && !selectedEntity) {
        setSelectedEntity({
          ...placeholderData[0],
          additional_data: {
            auth_logs: generatePlaceholderAuthLogs(placeholderData[0].entity_id, 5),
            network_logs: generatePlaceholderNetworkLogs(placeholderData[0].entity_type === 'IP' ? placeholderData[0].entity_id : null, 5),
            asset: placeholderData[0].entity_type === 'HOST' ? {
              host: placeholderData[0].entity_id,
              ip_address: '10.0.0.1',
              owner: 'IT Department',
              criticality: 5
            } : null,
            threat_intel: placeholderData[0].entity_type === 'IP' && placeholderData[0].risk_score > 8 ? {
              indicator: placeholderData[0].entity_id,
              threat_level: 10,
              source: 'ThreatFeed',
              first_seen: '2025-11-01T00:00:00.000Z',
              last_seen: '2025-12-07T00:00:00.000Z'
            } : null
          }
        });
      }
    }
  };
  
  const fetchEntityDetail = async (entity: any) => {
    try {
      const response = await fetch(
        `${API_URL}/api/entities/${entity.entity_type.toLowerCase()}/${encodeURIComponent(entity.entity_id)}?api_key=${API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entity detail: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedEntity(data);
      setShowDetailPanel(true);
    } catch (err: any) {
      console.error('Error fetching entity detail:', err);
      
      // For demo purposes, create some fake additional data
      setSelectedEntity({
        ...entity,
        additional_data: {
          auth_logs: entity.entity_type === 'USER' ? generatePlaceholderAuthLogs(entity.entity_id, 5) : [],
          network_logs: entity.entity_type === 'IP' ? generatePlaceholderNetworkLogs(entity.entity_id, 5) : [],
          asset: entity.entity_type === 'HOST' ? {
            host: entity.entity_id,
            ip_address: '10.0.0.1',
            owner: 'IT Department',
            criticality: entity.entity_id === 'srv-1' ? 5 : 3
          } : null,
          threat_intel: entity.entity_type === 'IP' && entity.risk_score > 8 ? {
            indicator: entity.entity_id,
            threat_level: 10,
            source: 'ThreatFeed',
            first_seen: '2025-11-01T00:00:00.000Z',
            last_seen: '2025-12-07T00:00:00.000Z'
          } : null
        }
      });
      setShowDetailPanel(true);
    }
  };

  const handleEntitySelect = (entity: any) => {
    fetchEntityDetail(entity);
  };
  
  const handleRecalculateRisk = async () => {
    setIsRecalculating(true);
    
    try {
      const response = await fetch(
        `${API_URL}/api/entities/recalculate?api_key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({ force: true })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to recalculate risk scores: ${response.status}`);
      }
      
      // Wait for recalculation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch updated entities
      await fetchEntities();
      
    } catch (err: any) {
      console.error('Error recalculating risk scores:', err);
      setError(`Failed to recalculate risk scores: ${err.message}`);
    } finally {
      setIsRecalculating(false);
    }
  };

  // Get color class based on risk score
  const getRiskScoreColor = (score: number) => {
    if (score >= 9) return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-gradient-to-r from-red-500 to-red-400' };
    if (score >= 7) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', bar: 'bg-gradient-to-r from-orange-500 to-orange-400' };
    if (score >= 5) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', bar: 'bg-gradient-to-r from-yellow-500 to-yellow-400' };
    return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bar: 'bg-gradient-to-r from-green-500 to-green-400' };
  };

  // Get color for entity type
  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'HOST': 
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
      case 'IP': 
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'USER': 
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      default: 
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  // Entity distribution chart data
  const entityDistribution = useMemo(() => {
    const typeCounts = entities.reduce((acc: Record<string, number>, entity) => {
      acc[entity.entity_type] = (acc[entity.entity_type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(typeCounts),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // Green for HOST
            'rgba(139, 92, 246, 0.8)',  // Purple for IP
            'rgba(59, 130, 246, 0.8)',  // Blue for USER
          ],
          borderColor: '#0a0e17',
          borderWidth: 2,
          hoverOffset: 15
        }
      ]
    };
  }, [entities]);

  // Risk score chart data for selected entity
  const riskFactorChart = useMemo(() => {
    if (!selectedEntity || !selectedEntity.risk_factors) return null;

    return {
      labels: selectedEntity.risk_factors.map((factor: any) => RISK_FACTORS[factor.factor as keyof typeof RISK_FACTORS] || factor.factor),
      datasets: [
        {
          label: 'Risk Factor Score',
          data: selectedEntity.risk_factors.map((factor: any) => factor.score),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        }
      ]
    };
  }, [selectedEntity]);

  // Risk trend simulation data
  const riskTrendData = useMemo(() => {
    if (!selectedEntity) return null;

    // Simulate historical risk trend
    const today = new Date();
    const labels = Array.from({length: 7}, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6-i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Generate some realistic-looking trend data
    const baseScore = selectedEntity.risk_score;
    const fluctuation = 1.2; // How much the score fluctuates
    
    // Create a trend that generally goes up for high-risk entities
    const scoreChanges = baseScore > 8 
      ? [-(Math.random() * fluctuation), -(Math.random() * fluctuation * 0.5), Math.random() * fluctuation * 0.3, Math.random() * fluctuation * 0.5, Math.random() * fluctuation * 0.7, Math.random() * fluctuation]
      : [Math.random() * fluctuation * 0.5, -(Math.random() * fluctuation * 0.7), Math.random() * fluctuation * 0.3, -(Math.random() * fluctuation * 0.2), Math.random() * fluctuation * 0.4, -(Math.random() * fluctuation * 0.3)];
    
    let currentScore = Math.max(1, Math.min(10, baseScore - scoreChanges.reduce((a, b) => a + b, 0)));
    const data = scoreChanges.map(change => {
      currentScore = Math.max(1, Math.min(10, currentScore + change));
      return currentScore;
    });
    data.push(baseScore); // End with current score

    return {
      labels,
      datasets: [
        {
          label: 'Risk Score',
          data,
          borderColor: baseScore > 8 ? '#ef4444' : baseScore > 6 ? '#f59e0b' : '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: baseScore > 8 ? '#ef4444' : baseScore > 6 ? '#f59e0b' : '#3b82f6',
          pointBorderColor: '#0a0e17',
          pointBorderWidth: 2,
        }
      ]
    };
  }, [selectedEntity]);

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    cutout: '70%',
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(30, 41, 59, 0.5)'
        },
        grid: {
          color: 'rgba(30, 41, 59, 0.5)'
        },
        pointLabels: {
          color: '#94a3b8',
          font: { size: 10 }
        },
        ticks: {
          color: '#64748b',
          backdropColor: 'transparent',
          font: { size: 8 }
        },
        suggestedMin: 0,
        suggestedMax: 5,
      }
    },
    plugins: {
      legend: {
        display: false,
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

  const lineOptions = {
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
        ticks: { color: '#64748b' },
        min: 0,
        max: 10,
      }
    },
    plugins: {
      legend: {
        display: false,
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
  if (isLoading && entities.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-gray-400 text-sm">Loading entity risk data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Entity Risk Analysis
          </h1>
          <p className="text-gray-500 text-sm mt-1">Analyze and manage risk across users, hosts, and IPs</p>
        </div>
        
        <div className="flex items-center gap-2">
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleRecalculateRisk}
              disabled={isRecalculating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecalculating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Recalculating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Recalculate Risk Scores</span>
                </>
              )}
            </button>
          )}
          
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
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-[#1e293b] text-white' : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'} transition-all`}
              title="Card View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
              onClick={fetchEntities}
              className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Filters Section */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h3 className="text-sm font-medium text-white">Entity Filters</h3>
          {(searchQuery || entityTypeFilter !== 'ALL' || riskRangeFilter[0] > 0 || riskRangeFilter[1] < 10) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setEntityTypeFilter('ALL');
                setRiskRangeFilter([0, 10]);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Search Entities</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID or risk factor..."
                className="w-full pl-9 pr-4 py-2 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Entity Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Entity Type</label>
            <div className="flex items-center gap-1 p-1 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
              {ENTITY_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setEntityTypeFilter(type)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    entityTypeFilter === type
                      ? type === 'USER' ? 'bg-blue-500/20 text-blue-400' :
                        type === 'HOST' ? 'bg-green-500/20 text-green-400' :
                        type === 'IP' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Risk Range */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Risk Score Range: {riskRangeFilter[0]} - {riskRangeFilter[1]}</label>
            <div className="px-2">
              <div className="relative pt-1">
                <div className="flex h-1 mb-4 overflow-hidden text-xs bg-[#0a0e17] rounded-full">
                  <div className="flex flex-col justify-center bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-full"></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={riskRangeFilter[0]}
                  onChange={(e) => setRiskRangeFilter([parseFloat(e.target.value), riskRangeFilter[1]])}
                  className="absolute top-0 left-0 w-full h-1 bg-transparent appearance-none focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={riskRangeFilter[1]}
                  onChange={(e) => setRiskRangeFilter([riskRangeFilter[0], parseFloat(e.target.value)])}
                  className="absolute top-0 left-0 w-full h-1 bg-transparent appearance-none focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-green-400">Low Risk</span>
                <span className="text-xs text-yellow-400">Medium Risk</span>
                <span className="text-xs text-red-400">High Risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Entity List */}
        <div className={`lg:col-span-${showDetailPanel ? '1' : '3'} transition-all duration-300`}>
          {/* Entity Distribution Chart */}
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-white mb-3">Entity Distribution</h3>
            <div className="h-60">
              <Doughnut data={entityDistribution} options={doughnutOptions} />
            </div>
          </div>
          
          {/* Entity Table */}
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">High-Risk Entities</h3>
              <span className="text-xs text-gray-500">{filteredEntities.length} of {totalEntities} entities</span>
            </div>
            
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Entity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => {
                        setSortBy('risk_score');
                        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                      }}>
                        <div className="flex items-center gap-1">
                          <span>Risk Score</span>
                          <svg className={`w-3 h-3 transition-transform ${sortBy === 'risk_score' && sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Top Risk Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {filteredEntities.length > 0 ? (
                      filteredEntities.map((entity) => {
                        const riskColors = getRiskScoreColor(entity.risk_score);
                        const entityColors = getEntityTypeColor(entity.entity_type);
                        const isSelected = selectedEntity?._id === entity._id;
                        
                        return (
                          <tr 
                            key={entity._id} 
                            onClick={() => handleEntitySelect(entity)} 
                            className={`cursor-pointer hover:bg-[#1e293b]/50 transition-all duration-200 ${
                              isSelected ? 'bg-[#1e293b]/70 border-l-2 border-blue-500' : ''
                            }`}
                          >
                            <td className="px-4 py-4">
                              <span className="font-medium text-white">{entity.entity_id}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${entityColors.bg} ${entityColors.text}`}>
                                {entity.entity_type}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${riskColors.bar}`}
                                    style={{ width: `${entity.risk_score * 10}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-bold ${riskColors.text}`}>
                                  {entity.risk_score.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className="text-sm text-gray-400 truncate">
                                {entity.risk_factors?.[0]?.details || "No risk factors"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center">
                          <svg className="mx-auto h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-400">No entities found matching your filters</p>
                          <button 
                            onClick={() => {
                              setSearchQuery('');
                              setEntityTypeFilter('ALL');
                              setRiskRangeFilter([0, 10]);
                            }}
                            className="mt-2 px-4 py-1.5 bg-[#0a0e17] hover:bg-[#1e293b] text-xs text-blue-400 rounded-lg transition-colors"
                          >
                            Clear Filters
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid View
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((entity) => {
                    const riskColors = getRiskScoreColor(entity.risk_score);
                    const entityColors = getEntityTypeColor(entity.entity_type);
                    const isSelected = selectedEntity?._id === entity._id;
                    
                    return (
                      <div 
                        key={entity._id}
                        onClick={() => handleEntitySelect(entity)}
                        className={`bg-[#0a0e17] border rounded-xl p-4 cursor-pointer hover:border-blue-500/30 transition-all duration-300 ${
                          isSelected ? 'border-blue-500' : 'border-[#1e293b]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${entityColors.bg} ${entityColors.text}`}>
                            {entity.entity_type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${riskColors.bg} ${riskColors.text}`}>
                            {entity.risk_score.toFixed(1)}
                          </span>
                        </div>
                        
                        <p className="text-lg font-medium text-white mb-2">{entity.entity_id}</p>
                        
                        <div className="w-full h-2 bg-[#151c2c] rounded-full overflow-hidden mb-4">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${riskColors.bar}`}
                            style={{ width: `${entity.risk_score * 10}%` }}
                          ></div>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          {entity.risk_factors?.slice(0, 2).map((factor: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></div>
                              <p className="text-xs text-gray-400 flex-1 line-clamp-1">{factor.details}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center p-8">
                    <svg className="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-400">No entities found matching your filters</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setEntityTypeFilter('ALL');
                        setRiskRangeFilter([0, 10]);
                      }}
                      className="mt-2 px-4 py-1.5 bg-[#0a0e17] hover:bg-[#1e293b] text-xs text-blue-400 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalEntities)} of {totalEntities} entities
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={page * pageSize >= totalEntities}
                  className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Entity Details */}
        {showDetailPanel && selectedEntity && (
          <div className="lg:col-span-2 space-y-6">
            {/* Entity Details Header */}
            <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* Entity Icon */}
                  <div className={`w-14 h-14 rounded-xl ${getEntityTypeColor(selectedEntity.entity_type).bg} flex items-center justify-center`}>
                    {selectedEntity.entity_type === 'USER' && (
                      <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    )}
                    {selectedEntity.entity_type === 'HOST' && (
                      <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
                      </svg>
                    )}
                    {selectedEntity.entity_type === 'IP' && (
                      <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Entity Name */}
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {selectedEntity.entity_id}
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getEntityTypeColor(selectedEntity.entity_type).bg} ${getEntityTypeColor(selectedEntity.entity_type).text}`}>
                        {selectedEntity.entity_type}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-400">
                      Last updated: {new Date(selectedEntity.last_updated).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Risk Score */}
                <div className="flex items-center bg-[#0a0e17] rounded-xl p-2.5 gap-3 border border-[#1e293b]">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-16 w-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={selectedEntity.risk_score >= 9 ? '#ef4444' : selectedEntity.risk_score >= 7 ? '#f97316' : selectedEntity.risk_score >= 5 ? '#f59e0b' : '#10b981'}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${selectedEntity.risk_score * 17.5} 175`}
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className={`text-2xl font-bold ${getRiskScoreColor(selectedEntity.risk_score).text}`}>
                          {selectedEntity.risk_score.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">Risk Score</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-red-500 ${selectedEntity.risk_score >= 8.5 ? 'ring-2 ring-red-500/30' : ''}`}></div>
                      <span className="text-xs text-gray-400">Critical (8.5-10)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-orange-500 ${selectedEntity.risk_score >= 7 && selectedEntity.risk_score < 8.5 ? 'ring-2 ring-orange-500/30' : ''}`}></div>
                      <span className="text-xs text-gray-400">High (7-8.4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-yellow-500 ${selectedEntity.risk_score >= 5 && selectedEntity.risk_score < 7 ? 'ring-2 ring-yellow-500/30' : ''}`}></div>
                      <span className="text-xs text-gray-400">Medium (5-6.9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-green-500 ${selectedEntity.risk_score < 5 ? 'ring-2 ring-green-500/30' : ''}`}></div>
                      <span className="text-xs text-gray-400">Low (0-4.9)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Risk Trend Chart */}
              <div className="h-48">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Risk Score Trend (7 Days)</h3>
                {riskTrendData && <Line data={riskTrendData} options={lineOptions} />}
              </div>
            </div>
            
            {/* Risk Factors Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Risk Factors List */}
              <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
                  <h3 className="text-sm font-medium text-white">Risk Factors</h3>
                </div>
                <div className="p-4 divide-y divide-[#1e293b]">
                  {selectedEntity.risk_factors?.map((factor: any, idx: number) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-300">
                          {RISK_FACTORS[factor.factor as keyof typeof RISK_FACTORS] || factor.factor}
                        </span>
                        <span className="text-sm font-bold text-white">{factor.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0a0e17] rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${(factor.score / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{factor.details}</p>
                    </div>
                  ))}
                  
                  {(!selectedEntity.risk_factors || selectedEntity.risk_factors.length === 0) && (
                    <div className="py-6 text-center text-gray-500">
                      <p>No risk factors found for this entity</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Risk Factors Radar Chart */}
              <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
                  <h3 className="text-sm font-medium text-white">Risk Factor Analysis</h3>
                </div>
                <div className="p-4 h-64">
                  {riskFactorChart ? (
                    <Radar data={riskFactorChart} options={radarOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Insufficient data for analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Additional Entity Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Related Logs */}
              <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419] flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Related Logs</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  {/* Auth Logs */}
                  {selectedEntity.additional_data?.auth_logs?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Authentication Logs</h4>
                      <div className="space-y-2">
                        {selectedEntity.additional_data.auth_logs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-gray-300">{log.username}@{log.dest_host}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">From {log.src_ip}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {log.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Network Logs */}
                  {selectedEntity.additional_data?.network_logs?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Network Logs</h4>
                      <div className="space-y-2">
                        {selectedEntity.additional_data.network_logs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[#0a0e17] rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${log.action === 'ALLOW' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm text-gray-300">{log.src_ip} → {log.dest_ip}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{log.protocol} • Port {log.dest_port}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${log.action === 'ALLOW' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {log.action}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!selectedEntity.additional_data?.auth_logs?.length && !selectedEntity.additional_data?.network_logs?.length) && (
                    <div className="py-6 text-center text-gray-500">
                      <p>No related logs found for this entity</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Entity Info */}
              <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e293b] bg-[#0f1419]">
                  <h3 className="text-sm font-medium text-white">Entity Information</h3>
                </div>
                <div className="p-4">
                  {/* Host Info */}
                  {selectedEntity.entity_type === 'HOST' && selectedEntity.additional_data?.asset && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Asset Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">IP Address</p>
                            <p className="text-sm text-white font-mono">{selectedEntity.additional_data.asset.ip_address}</p>
                          </div>
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Owner</p>
                            <p className="text-sm text-white">{selectedEntity.additional_data.asset.owner}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Criticality</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 bg-[#0a0e17] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500"
                              style={{ width: `${(selectedEntity.additional_data.asset.criticality / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-white">{selectedEntity.additional_data.asset.criticality}/5</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* IP Threat Intel */}
                  {selectedEntity.entity_type === 'IP' && selectedEntity.additional_data?.threat_intel && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">Threat Intelligence</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Threat Level</p>
                            <div className="flex items-center gap-2">
                              <div className="w-full h-2 bg-[#151c2c] rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                                  style={{ width: `${(selectedEntity.additional_data.threat_intel.threat_level / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold text-white">{selectedEntity.additional_data.threat_intel.threat_level}/10</span>
                            </div>
                          </div>
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Source</p>
                            <p className="text-sm text-white">{selectedEntity.additional_data.threat_intel.source}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0a0e17] p-3 rounded-lg">
                          <p className="text-xs text-gray-500">First Seen</p>
                          <p className="text-sm text-white">{new Date(selectedEntity.additional_data.threat_intel.first_seen).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-[#0a0e17] p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Last Seen</p>
                          <p className="text-sm text-white">{new Date(selectedEntity.additional_data.threat_intel.last_seen).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* User Info */}
                  {selectedEntity.entity_type === 'USER' && (
                    <div>
                      <div className="space-y-4">
                        <div className="bg-[#0a0e17] p-4 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Login Activity (Last 30 Days)</p>
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16">
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="#3b82f6"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={`${120} 175`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-blue-400">12</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-400">8 Successful logins</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-400">4 Failed attempts</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Last Login</p>
                            <p className="text-sm text-white">Dec 8, 2025 14:23</p>
                          </div>
                          <div className="bg-[#0a0e17] p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Role</p>
                            <p className="text-sm text-white">User</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4">
              <div>
                <h3 className="text-sm font-medium text-white">Remediation Actions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Take action to mitigate risk</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm">
                  Investigate
                </button>
                <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm">
                  Block Entity
                </button>
                <button className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors text-sm">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate placeholder entity data for testing
function generatePlaceholderEntities() {
  return [
    {
      _id: 'entity-1',
      entity_id: 'srv-1',
      entity_type: 'HOST',
      risk_score: 9.2,
      risk_factors: [
        {
          factor: 'CRITICAL_ASSET',
          score: 2.5,
          details: 'Critical asset with criticality rating 5/5'
        },
        {
          factor: 'ATTACK_TARGET',
          score: 3.8,
          details: 'Target of multiple attack traffic events'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 2.9,
          details: 'Associated with 4 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-2',
      entity_id: '203.0.113.142',
      entity_type: 'IP',
      risk_score: 9.0,
      risk_factors: [
        {
          factor: 'KNOWN_THREAT_ACTOR',
          score: 5.0,
          details: 'Known malicious IP with threat level 10/10'
        },
        {
          factor: 'DETECTED_ATTACK',
          score: 3.0,
          details: 'Source of multiple attack events'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-3',
      entity_id: 'charlie',
      entity_type: 'USER',
      risk_score: 8.5,
      risk_factors: [
        {
          factor: 'SUSPICIOUS_AUTH',
          score: 4.0,
          details: 'High login failure rate (12 of 15 failed)'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 3.5,
          details: 'Associated with 5 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-4',
      entity_id: 'srv-3',
      entity_type: 'HOST',
      risk_score: 8.3,
      risk_factors: [
        {
          factor: 'CRITICAL_ASSET',
          score: 2.0,
          details: 'Important asset with criticality rating 4/5'
        },
        {
          factor: 'ATTACK_TARGET',
          score: 3.5,
          details: 'Target of attack traffic'
        },
        {
          factor: 'ALERT_ASSOCIATION',
          score: 2.8,
          details: 'Associated with 3 security alerts'
        }
      ],
      last_updated: new Date().toISOString()
    },
    {
      _id: 'entity-5',
      entity_id: '203.0.113.245',
      entity_type: 'IP',
      risk_score: 8.0,
      risk_factors: [
        {
          factor: 'KNOWN_THREAT_ACTOR',
          score: 5.0,
          details: 'Known malicious IP with threat level 10/10'
        },
        {
          factor: 'DETECTED_ATTACK',
          score: 2.0,
          details: 'Source of attack events'
        }
      ],
      last_updated: new Date().toISOString()
    }
  ];
}

// Helper function to generate placeholder auth logs for testing
function generatePlaceholderAuthLogs(username: string, count: number) {
  const logs = [];
  const statuses = ['SUCCESS', 'FAILURE'];
  const hosts = ['srv-1', 'srv-2', 'srv-3'];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      _id: `auth-log-${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      username: username,
      src_ip: Math.random() > 0.5 ? '203.0.113.142' : '192.168.1.100',
      dest_host: hosts[Math.floor(Math.random() * hosts.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      auth_method: 'PASSWORD'
    });
  }
  
  return logs;
}

// Helper function to generate placeholder network logs for testing
function generatePlaceholderNetworkLogs(ip: string | null, count: number) {
  const logs = [];
  const protocols = ['TCP', 'UDP'];
  const ports = [22, 80, 443, 3389];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      _id: `net-log-${i}`,
      timestamp: new Date(Date.now() - i * 7200000).toISOString(),
      src_ip: ip || '192.168.1.100',
      dest_ip: ip ? '10.0.0.1' : ip,
      src_port: Math.floor(Math.random() * 60000) + 1024,
      dest_port: ports[Math.floor(Math.random() * ports.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      action: Math.random() > 0.6 ? 'ALLOW' : 'DENY',
      bytes_sent: Math.floor(Math.random() * 10000),
      bytes_received: Math.floor(Math.random() * 10000)
    });
  }
  
  return logs;
}
