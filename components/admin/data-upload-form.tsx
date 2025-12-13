'use client';

import { useState } from 'react';
import {Button} from '@/components/ui/button';
import axios from 'axios';
import { API_URL, API_KEY } from '@/lib/api-config';


interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const initialUploadState: UploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  success: false
};

export default function DataUploadForm() {
  // State for file uploads
  const [assets, setAssets] = useState<File | null>(null);
  const [threatIntel, setThreatIntel] = useState<File | null>(null);
  const [authLogs, setAuthLogs] = useState<File | null>(null);
  const [networkLogs, setNetworkLogs] = useState<File | null>(null);

  // State for upload progress
  const [assetsState, setAssetsState] = useState<UploadState>({...initialUploadState});
  const [threatIntelState, setThreatIntelState] = useState<UploadState>({...initialUploadState});
  const [authLogsState, setAuthLogsState] = useState<UploadState>({...initialUploadState});
  const [networkLogsState, setNetworkLogsState] = useState<UploadState>({...initialUploadState});
  
  // Summary of uploads
  const [uploadSummary, setUploadSummary] = useState<{[key: string]: number}>({});
  
  // Running detection state
  const [detectionState, setDetectionState] = useState({
    isRunning: false,
    completed: false,
    error: null as string | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const uploadFile = async (
  file: File | null,
  endpoint: string, 
  stateSetter: React.Dispatch<React.SetStateAction<UploadState>>
): Promise<number | null> => {
  if (!file) {
    stateSetter({...initialUploadState, error: 'No file selected'});
    return null;
  }

  stateSetter({...initialUploadState, isUploading: true});

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_URL}/api/ingestion/upload/${endpoint}?api_key=${API_KEY}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            stateSetter(prev => ({...prev, progress: percentCompleted}));
          }
        }
      }
    );

    stateSetter({...initialUploadState, success: true});
    return response.data.count || 0;
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || 'Upload failed';
    stateSetter({...initialUploadState, error: errorMsg});
    return null;
  }
};

 const runDetection = async () => {
  setDetectionState({ isRunning: true, completed: false, error: null });
  
  try {
    await axios.post(
      `${API_URL}/api/detection/run?api_key=${API_KEY}`
    );
    
    setDetectionState({ isRunning: false, completed: true, error: null });
  } catch (error: any) {
    setDetectionState({
      isRunning: false,
      completed: false,
      error: error.response?.data?.detail || 'Failed to run detection'
    });
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset summary
    setUploadSummary({});

    // Upload files in parallel
    const results = await Promise.all([
      uploadFile(assets, 'assets', setAssetsState),
      uploadFile(threatIntel, 'threat_intel', setThreatIntelState),
      uploadFile(authLogs, 'auth_logs', setAuthLogsState),
      uploadFile(networkLogs, 'network_logs', setNetworkLogsState)
    ]);

    // Summarize results
    const summary: {[key: string]: number} = {};
    if (results[0] !== null) summary.assets = results[0];
    if (results[1] !== null) summary.threatIntel = results[1];
    if (results[2] !== null) summary.authLogs = results[2];
    if (results[3] !== null) summary.networkLogs = results[3];

    setUploadSummary(summary);
  };

  const renderUploadStatus = (state: UploadState) => {
    if (state.isUploading) {
      return (
        <div className="ml-2">
          <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>
      );
    }

    if (state.success) {
      return <span className="ml-2 text-sm text-green-600">✓ Uploaded</span>;
    }

    if (state.error) {
      return <span className="ml-2 text-sm text-red-500">{state.error}</span>;
    }

    return null;
  };

  const anyUploading = assetsState.isUploading || threatIntelState.isUploading || 
    authLogsState.isUploading || networkLogsState.isUploading;

  const allSuccessful = assetsState.success && threatIntelState.success && 
    authLogsState.success && networkLogsState.success;
    
  return (
    <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Asset Inventory CSV
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, setAssets)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e293b] file:text-gray-300 hover:file:bg-[#334155] file:transition-all file:cursor-pointer cursor-pointer"
            />
            {renderUploadStatus(assetsState)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload CSV containing host information and criticality ratings
          </p>
        </div>

        {/* Threat Intel Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Threat Intelligence CSV
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, setThreatIntel)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e293b] file:text-gray-300 hover:file:bg-[#334155] file:transition-all file:cursor-pointer cursor-pointer"
            />
            {renderUploadStatus(threatIntelState)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload threat intelligence indicators (IPs, domains, hashes)
          </p>
        </div>

        {/* Auth Logs Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Authentication Logs CSV
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, setAuthLogs)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e293b] file:text-gray-300 hover:file:bg-[#334155] file:transition-all file:cursor-pointer cursor-pointer"
            />
            {renderUploadStatus(authLogsState)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload authentication events with login attempts
          </p>
        </div>

        {/* Network Logs Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Network Logs CSV
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e, setNetworkLogs)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e293b] file:text-gray-300 hover:file:bg-[#334155] file:transition-all file:cursor-pointer cursor-pointer"
            />
            {renderUploadStatus(networkLogsState)}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Upload network traffic logs showing connections
          </p>
        </div>

        {/* Upload Summary */}
        {Object.keys(uploadSummary).length > 0 && (
          <div className="p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Upload Summary</h3>
            <div className="space-y-1">
              {Object.entries(uploadSummary).map(([key, count]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-400">{key}:</span>
                  <span className="text-gray-300">{count} records</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {[assetsState, threatIntelState, authLogsState, networkLogsState].some(state => state.error) && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="space-y-1">
                {[
                  { state: assetsState, name: 'Assets' },
                  { state: threatIntelState, name: 'Threat Intel' },
                  { state: authLogsState, name: 'Auth Logs' },
                  { state: networkLogsState, name: 'Network Logs' }
                ].map(({ state, name }) => (
                  state.error && (
                    <p key={name} className="text-sm text-red-400">
                      {name}: {state.error}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={anyUploading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              anyUploading
                ? 'bg-[#1e293b] text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {anyUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Upload Files</span>
              </>
            )}
          </button>

          {allSuccessful && (
            <button
              type="button"
              onClick={runDetection}
              disabled={detectionState.isRunning}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                detectionState.isRunning
                  ? 'bg-[#1e293b] text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25'
              }`}
            >
              {detectionState.isRunning ? (
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
                  <span>Run Detection</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Detection Status */}
        {detectionState.completed && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-400">Detection completed successfully!</p>
            </div>
          </div>
        )}

        {detectionState.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-400">{detectionState.error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

