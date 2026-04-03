'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function checkKey() {
      try {
        const res = await fetch('/api/settings/api-key');
        const data = await res.json();
        setHasKey(data.hasKey);
        if (!data.hasKey) setShowForm(true);
      } catch {
        setShowForm(true);
      }
    }
    checkKey();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save API key');
        return;
      }

      setSuccess('API key saved and validated successfully');
      setApiKey('');
      setHasKey(true);
      setShowForm(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">
            Anthropic API Key
          </h2>

          {hasKey && !showForm && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>API key is configured</span>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Update Key
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm text-gray-300 mb-2"
                >
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Your API key is encrypted and stored securely. Get your key at{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              {success && (
                <p className="text-emerald-400 text-sm">{success}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? 'Validating...' : 'Save API Key'}
                </button>
                {hasKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setApiKey('');
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {hasKey === null && !showForm && (
            <p className="text-gray-500 text-sm">Checking API key status...</p>
          )}
        </div>
      </div>
    </div>
  );
}
