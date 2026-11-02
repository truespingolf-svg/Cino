import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isMaster: boolean) => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const { setUser } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) return;

    let sessionId = 'sess-' + Math.random().toString(36).substring(2);
    try {
      sessionStorage.setItem('cinevo_session_id', sessionId);
    } catch {
      // ignore storage access restriction
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin, sessionId })
      });
      const data = await res.json();
      if (data.success) {
        setUser(prev => ({
          ...prev,
          name: 'Staff',
          isStaff: true,
          isMaster: data.isMaster
        }));
        onSuccess(data.isMaster);
        onClose();
        setPin('');
        return;
      }
    } catch {
      // Network/server fallback
    }

    // Direct fallback verification: 2514 for master, 2513 for standard staff
    if (cleanPin === '2514') {
      setUser(prev => ({
        ...prev,
        name: 'Staff',
        isStaff: true,
        isMaster: true
      }));
      onSuccess(true);
      onClose();
      setPin('');
      return;
    }

    if (cleanPin === '2513') {
      setUser(prev => ({
        ...prev,
        name: 'Staff',
        isStaff: true,
        isMaster: false
      }));
      onSuccess(false);
      onClose();
      setPin('');
      return;
    }

    setError(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
          aria-label="Close"
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
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={10}
              autoFocus
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Enter Code"
              className="w-full text-center text-2xl font-mono tracking-widest bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-12 text-white focus:outline-none focus:border-red-600"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-2"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">Incorrect access code. Please try again.</p>}
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
