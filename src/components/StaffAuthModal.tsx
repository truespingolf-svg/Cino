import React, { useState } from 'react';
import { Shield, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isMaster: boolean) => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { setUser, user } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let sessionId = localStorage.getItem('cinevo_session_id');
    if (!sessionId) {
      sessionId = 'sess-' + Math.random().toString(36).substring(2);
      localStorage.setItem('cinevo_session_id', sessionId);
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, sessionId })
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, isStaff: true, isMaster: data.isMaster });
        onSuccess(data.isMaster);
        onClose();
        setPin('');
      } else {
        setError(true);
        setPin('');
      }
    } catch (err) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Staff Access Portal</h2>
          <p className="text-xs text-zinc-400">Enter your administrative staff access code to unlock management.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-[1em] bg-zinc-950 border border-zinc-800 rounded-2xl py-4 text-white focus:outline-none focus:border-red-600"
            />
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">Incorrect access code.</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition"
          >
            Authenticate Staff
          </button>
        </form>
      </div>
    </div>
  );
};
