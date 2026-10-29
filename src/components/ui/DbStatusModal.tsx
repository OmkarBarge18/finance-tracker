'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, X, Server, Key } from 'lucide-react';
import { springPress } from '@/lib/animations';

interface DbStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (connected: boolean) => void;
}

export default function DbStatusModal({ isOpen, onClose, onStatusChange }: DbStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{
    connected: boolean;
    message: string;
    database?: string;
    version?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'finance_tracker',
  });

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db-status');
      const data = await res.json();
      setStatus(data);
      if (onStatusChange) onStatusChange(data.connected);
    } catch {
      setStatus({
        connected: false,
        message: 'Could not reach server status endpoint',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    try {
      const res = await fetch('/api/db-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          connected: true,
          message: data.message,
          database: data.database,
          version: data.version,
        });
        if (onStatusChange) onStatusChange(true);
      } else {
        setStatus({
          connected: false,
          message: data.message || 'Connection failed',
        });
      }
    } catch (err) {
      setStatus({
        connected: false,
        message: (err as Error).message || 'Connection error',
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f172a] rounded-xl p-6 shadow-2xl border border-[#1f2937] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2937]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">PostgreSQL Configuration</h3>
              <p className="text-xs text-slate-400">Direct connection pooling & automatic schema sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="mt-4 p-3.5 rounded-lg border border-[#1f2937] bg-[#0b0f17]">
          {loading ? (
            <div className="flex items-center space-x-2.5 text-slate-300">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-xs">Checking PostgreSQL status...</span>
            </div>
          ) : status?.connected ? (
            <div className="flex items-start space-x-2.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">Connected to PostgreSQL</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Database: <span className="font-mono text-slate-200">{status.database || 'finance_tracker'}</span> | 
                  Version: <span className="font-mono text-slate-200">{status.version || '18'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2.5 text-amber-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-300">PostgreSQL Authentication Required</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {status?.message || 'Enter your local PostgreSQL password below to link live database tables.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleConnect} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Host</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 5432 })}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Database</label>
              <input
                type="text"
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter postgres password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full surface-input px-3 py-2 rounded-lg text-xs pl-8"
              />
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1f2937]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={testing}
              onClick={(e) => springPress(e.currentTarget)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5" />
                  <span>Connect & Migrate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
