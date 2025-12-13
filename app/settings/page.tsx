'use client';
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  "use client";
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'CyberShield',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    retentionPeriod: 90,
    autoRefreshInterval: 5,
  });

  const [alertSettings, setAlertSettings] = useState({
    enableEmailNotifications: true,
    enableSlackNotifications: false,
    slackWebhookUrl: '',
    criticalAlertThreshold: 9,
    highAlertThreshold: 7,
    mediumAlertThreshold: 4,
    autoCloseResolved: true,
    resolvedRetentionDays: 30,
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    threatFeeds: {
      alienvault: true,
      virustotal: false,
      threatfox: true,
    },
    apiKeys: {
      virustotal: '',
      threatfox: '',
    },
    refreshInterval: 60,
  });

  const handleSaveSettings = async (settingType: string) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`${settingType} settings updated successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(`Failed to update settings: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Platform Settings
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your security platform settings</p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-400">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'general'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'alerts'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
            }`}
          >
            Alerts & Notifications
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'integrations'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
            }`}
          >
            Integrations
          </button>
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
              }`}
            >
              User Management
            </button>
          )}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, platformName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>

                {/* Data Retention */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={generalSettings.retentionPeriod}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                {/* Auto Refresh */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Auto Refresh Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={generalSettings.autoRefreshInterval}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoRefreshInterval: parseInt(e.target.value) }))}
                    min="1"
                    max="60"
                    className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('General')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Settings */}
        {activeTab === 'alerts' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Alert & Notification Settings</h2>
            
            <div className="space-y-6">
              {/* Notification Channels */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">Email Notifications</h4>
                        <p className="text-xs text-gray-500">Send alerts to configured email addresses</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.enableEmailNotifications}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  {/* Slack Notifications */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">Slack Notifications</h4>
                          <p className="text-xs text-gray-500">Send alerts to Slack channels</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={alertSettings.enableSlackNotifications}
                          onChange={(e) => setAlertSettings(prev => ({ ...prev, enableSlackNotifications: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                      </label>
                    </div>

                    {alertSettings.enableSlackNotifications && (
                      <div className="pl-14">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Slack Webhook URL
                        </label>
                        <input
                          type="text"
                          value={alertSettings.slackWebhookUrl}
                          onChange={(e) => setAlertSettings(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert Thresholds */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Alert Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Critical Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Critical Alert Threshold
                    </label>
                    <input
                      type="number"
                      value={alertSettings.criticalAlertThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, criticalAlertThreshold: parseFloat(e.target.value) }))}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Risk score ≥ this value</p>
                  </div>

                  {/* High Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      High Alert Threshold
                    </label>
                    <input
                      type="number"
                      value={alertSettings.highAlertThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, highAlertThreshold: parseFloat(e.target.value) }))}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Risk score ≥ this value</p>
                  </div>

                  {/* Medium Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Medium Alert Threshold
                    </label>
                    <input
                      type="number"
                      value={alertSettings.mediumAlertThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, mediumAlertThreshold: parseFloat(e.target.value) }))}
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Risk score ≥ this value</p>
                  </div>
                </div>
              </div>

              {/* Alert Management */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Alert Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                    <div>
                      <h4 className="text-sm font-medium text-white">Auto-close Resolved Alerts</h4>
                      <p className="text-xs text-gray-500">Automatically close alerts after resolution</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alertSettings.autoCloseResolved}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, autoCloseResolved: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {alertSettings.autoCloseResolved && (
                    <div className="pl-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Resolved Alert Retention (days)
                      </label>
                      <input
                        type="number"
                        value={alertSettings.resolvedRetentionDays}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, resolvedRetentionDays: parseInt(e.target.value) }))}
                        min="1"
                        max="365"
                        className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      />
                      <p className="mt-1 text-xs text-gray-500">Keep resolved alerts for this many days</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('Alert')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Integration Settings</h2>
            
            <div className="space-y-6">
              {/* Threat Intelligence Feeds */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-4">Threat Intelligence Feeds</h3>
                <div className="space-y-4">
                  {/* AlienVault OTX */}
                  <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">AlienVault OTX</h4>
                        <p className="text-xs text-gray-500">Open Threat Exchange integration</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={integrationSettings.threatFeeds.alienvault}
                        onChange={(e) => setIntegrationSettings(prev => ({
                          ...prev,
                          threatFeeds: {
                            ...prev.threatFeeds,
                            alienvault: e.target.checked
                          }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  {/* VirusTotal */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">VirusTotal</h4>
                          <p className="text-xs text-gray-500">Malware analysis integration</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.threatFeeds.virustotal}
                          onChange={(e) => setIntegrationSettings(prev => ({
                            ...prev,
                            threatFeeds: {
                              ...prev.threatFeeds,
                              virustotal: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    {integrationSettings.threatFeeds.virustotal && (
                      <div className="pl-14">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={integrationSettings.apiKeys.virustotal}
                          onChange={(e) => setIntegrationSettings(prev => ({
                            ...prev,
                            apiKeys: {
                              ...prev.apiKeys,
                              virustotal: e.target.value
                            }
                          }))}
                          placeholder="Enter your VirusTotal API key"
                          className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* ThreatFox */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-[#1e293b]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">ThreatFox</h4>
                          <p className="text-xs text-gray-500">IOC database integration</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={integrationSettings.threatFeeds.threatfox}
                          onChange={(e) => setIntegrationSettings(prev => ({
                            ...prev,
                            threatFeeds: {
                              ...prev.threatFeeds,
                              threatfox: e.target.checked
                            }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    {integrationSettings.threatFeeds.threatfox && (
                      <div className="pl-14">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          value={integrationSettings.apiKeys.threatfox}
                          onChange={(e) => setIntegrationSettings(prev => ({
                            ...prev,
                            apiKeys: {
                              ...prev.apiKeys,
                              threatfox: e.target.value
                            }
                          }))}
                          placeholder="Enter your ThreatFox API key"
                          className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Feed Refresh Settings */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feed Refresh Interval (minutes)
                </label>
                <input
                  type="number"
                  value={integrationSettings.refreshInterval}
                  onChange={(e) => setIntegrationSettings(prev => ({
                    ...prev,
                    refreshInterval: parseInt(e.target.value)
                  }))}
                  min="15"
                  max="1440"
                  className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 15 minutes, maximum 24 hours</p>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSaveSettings('Integration')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

