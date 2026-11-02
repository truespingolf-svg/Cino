import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MasterSecurityManager: React.FC = () => {
  const [newCode, setNewCode] = useState('');
  const [success, setSuccess] = useState('');
  const { setUser, user } = useAuth();

  const handleChangCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    const res = await fetch('/api/settings/change-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newCode })
    });
    if (res.ok) {
      setSuccess('Staff access code updated successfully! All previous staff sessions have been invalidated and logged out.');
      setNewCode('');
      // Log out current user as well since code changed
      setUser({ id: 'guest', name: 'Guest Viewer', avatar: user.avatar, isStaff: false, isMaster: false });
    }
  };

  const handleRevokeAll = async () => {
    if (confirm('Are you sure you want to revoke all active staff sessions?')) {
      await fetch('/api/settings/revoke-staff', { method: 'POST' });
      setUser({ id: 'guest', name: 'Guest Viewer', avatar: user.avatar, isStaff: false, isMaster: false });
      alert('All staff sessions revoked successfully.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Staff & Security Master Control</h2>
        <p className="text-zinc-400 text-sm mt-1">Master-only controls (unlocked with code 2514) to change staff access codes and manage security sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleChangCode} className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-red-600/20 text-red-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Change Staff Access Code</h3>
              <p className="text-xs text-zinc-400">Updating the code will instantly log out everyone currently logged into staff mode.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">New Staff Access PIN</label>
            <input
              type="text"
              required
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              placeholder="Enter new PIN"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-600 font-mono tracking-widest text-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
          >
            Update Code & Invalidate Sessions
          </button>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 flex-none" />
              <span>{success}</span>
            </div>
          )}
        </form>

        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Revoke All Staff Access</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Instantly terminate all active staff sessions across the platform. Every staff user will need to re-authenticate with the valid PIN.
            </p>
          </div>

          <button
            onClick={handleRevokeAll}
            className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-red-600/20 hover:border-red-500 border border-zinc-700 text-red-400 font-bold text-xs uppercase tracking-wider transition"
          >
            Revoke All Active Sessions
          </button>
        </div>
      </div>
    </div>
  );
};
