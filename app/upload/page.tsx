'use client';
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { API_URL, API_KEY } from '../../lib/api-config';

export default function UploadPage() {
  "use client";
  const { data: session } = useSession();
  const router = useRouter();
  const [uploadsCompleted, setUploadsCompleted] = useState({
    assets: false,
    threat_intel: false,
    auth_logs: false,
    network_logs: false
  });
  const [runningDetection, setRunningDetection] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [detectionSuccess, setDetectionSuccess] = useState<string | null>(null);

  // Redirect non-admin users
  if (session?.user?.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  const handleUploadSuccess = (type: 'assets' | 'threat_intel' | 'auth_logs' | 'network_logs') => {
    setUploadsCompleted(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleRunDetection = async () => {
    setRunningDetection(true);
    setDetectionError(null);
    setDetectionSuccess(null);

    try {
      const response = await fetch(`${API_URL}/api/detection/run?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({ hours_back: 24 })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Detection failed with status: ${response.status}`);
      }

      const data = await response.json();
      setDetectionSuccess(`Detection completed successfully! Generated ${data.total_alerts || 0} alerts`);
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error('Detection error:', err);
      setDetectionError(err.message || 'Failed to run detection');
    } finally {
      setRunningDetection(false);
    }
  };

  const allUploadsCompleted = Object.values(uploadsCompleted).every(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Upload Security Data
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Import and analyze security data files</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Upload Forms */}
        {[
          {
            title: 'Asset Inventory',
            description: 'Upload your asset inventory CSV file containing host information and criticality ratings',
            type: 'assets',
            icon: (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            )
          },
          {
            title: 'Threat Intelligence',
            description: 'Upload threat intelligence indicators in CSV format (IPs, domains, hashes)',
            type: 'threat_intel',
            icon: (
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )
          },
          {
            title: 'Authentication Logs',
            description: 'Upload authentication events CSV with login attempts and successes/failures',
            type: 'auth_logs',
            icon: (
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )
          },
          {
            title: 'Network Logs',
            description: 'Upload network traffic logs CSV showing connections between systems',
            type: 'network_logs',
            icon: (
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            )
          }
        ].map(({ title, description, type, icon }) => (
          <div key={type} className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#0a0e17] border border-[#1e293b] flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              {uploadsCompleted[type as keyof typeof uploadsCompleted] && (
                <div className="ml-auto">
                  <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Uploaded
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  // Handle file upload
                  handleUploadSuccess(type as keyof typeof uploadsCompleted);
                }}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e293b] file:text-gray-300 hover:file:bg-[#334155] file:transition-all file:cursor-pointer cursor-pointer"
              />
            </div>
          </div>
        ))}

        {/* Run Detection Section */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#0a0e17] border border-[#1e293b] flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Run Detection Rules</h2>
              <p className="text-sm text-gray-500">Process uploaded data and identify security threats</p>
            </div>
          </div>

          {detectionError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-400">{detectionError}</p>
              </div>
            </div>
          )}

          {detectionSuccess && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-green-400">{detectionSuccess}</p>
                  <p className="text-sm text-green-400/70 mt-1">Redirecting to dashboard...</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleRunDetection}
            disabled={!allUploadsCompleted || runningDetection}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              !allUploadsCompleted
                ? 'bg-[#1e293b] text-gray-500 cursor-not-allowed'
                : runningDetection
                ? 'bg-cyan-500/20 text-cyan-400 cursor-wait'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            }`}
          >
            {runningDetection ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running Detection...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Run Detection Rules</span>
              </>
            )}
          </button>
          {!allUploadsCompleted && (
            <p className="mt-2 text-xs text-amber-400/80 text-center">
              Please upload all required data files before running detection
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
