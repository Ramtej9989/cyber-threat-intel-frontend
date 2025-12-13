'use client';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Get help with CyberShield platform</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-blue-500/30 transition-all">
            <h2 className="text-lg font-semibold text-white mb-4">Documentation</h2>
            <p className="text-sm text-gray-400 mb-4">
              Browse our comprehensive documentation to learn more about CyberShield features
            </p>
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <span>View Documentation</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6 hover:border-purple-500/30 transition-all">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Support</h2>
            <p className="text-sm text-gray-400 mb-4">
              Get in touch with our support team for technical assistance
            </p>
            <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
              <span>Contact Support</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-[#151c2c]/80 backdrop-blur-xl border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {/* Add FAQ items here */}
          </div>
        </div>
      </div>
    </div>
  );
}
