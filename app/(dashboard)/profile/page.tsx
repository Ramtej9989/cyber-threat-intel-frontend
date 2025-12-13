'use client';

import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  "use client";
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {session?.user?.name?.charAt(0) || 'A'}
          </span>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Info */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={session?.user?.name || ''}
                readOnly
                className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                readOnly
                className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={session?.user?.role || ''}
                readOnly
                className="w-full px-4 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all">
              Change Password
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-gray-300 text-sm font-medium rounded-lg transition-all">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

