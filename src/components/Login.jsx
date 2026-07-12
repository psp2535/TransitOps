import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { INITIAL_USERS } from '../initialData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ onLogin, users, setUsers, lockedEmails = [], setLockedEmails }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Dispatcher');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Lockout failed attempts map (email -> count)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('failedAttemptsMap') || '{}');
    } catch {
      return {};
    }
  });

  const [isForgotPassword, setIsForgotPassword] = useState(window.location.hash === '#forgot');
  const [isResetPasswordForm, setIsResetPasswordForm] = useState(window.location.hash.startsWith('#reset-password'));
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const userList = users && users.length > 0 ? users : INITIAL_USERS;

  const currentEmailLower = email.trim().toLowerCase();
  const isCurrentEmailLocked = lockedEmails.includes(currentEmailLower);

  const getEmailFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/email=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  };

  useEffect(() => {
    const handleHashChange = () => {
      setIsForgotPassword(window.location.hash === '#forgot');
      setIsResetPasswordForm(window.location.hash.startsWith('#reset-password'));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const targetEmail = email.trim().toLowerCase();

    if (lockedEmails.includes(targetEmail)) {
      setError('This account is locked due to too many failed attempts. Please contact support or reset your password.');
      return;
    }

    const user = userList.find(
      (u) => u.email.toLowerCase() === targetEmail && 
             u.password === password &&
             u.role.toLowerCase() === selectedRole.toLowerCase()
    );

    if (user) {
      // Success: Reset failed attempts for this email
      const updatedMap = { ...failedAttempts };
      delete updatedMap[targetEmail];
      setFailedAttempts(updatedMap);
      localStorage.setItem('failedAttemptsMap', JSON.stringify(updatedMap));

      onLogin(user);
    } else {
      // Failed attempt
      const emailAttempts = (failedAttempts[targetEmail] || 0) + 1;
      const updatedMap = { ...failedAttempts, [targetEmail]: emailAttempts };
      setFailedAttempts(updatedMap);
      localStorage.setItem('failedAttemptsMap', JSON.stringify(updatedMap));

      if (emailAttempts >= 5) {
        if (!lockedEmails.includes(targetEmail)) {
          setLockedEmails([...lockedEmails, targetEmail]);
        }
        setError('Invalid credentials. Account locked after 5 failed attempts.');
      } else {
        setError(`Invalid credentials. ${5 - emailAttempts} attempts remaining before lock.`);
      }
    }
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const emailToReset = getEmailFromHash().toLowerCase();
    if (!emailToReset) {
      setError('Invalid or expired reset link.');
      return;
    }

    if (!userList.some(u => u.email.toLowerCase() === emailToReset)) {
      setError('No registered user found with this email.');
      return;
    }

    const updatedUsers = userList.map(u => {
      if (u.email.toLowerCase() === emailToReset) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    if (setUsers) {
      setUsers(updatedUsers);
    }

    // Unlock locked state
    if (lockedEmails.includes(emailToReset)) {
      setLockedEmails(lockedEmails.filter(mail => mail !== emailToReset));
    }

    // Clear failed attempts count
    const updatedMap = { ...failedAttempts };
    delete updatedMap[emailToReset];
    setFailedAttempts(updatedMap);
    localStorage.setItem('failedAttemptsMap', JSON.stringify(updatedMap));

    setResetSuccess(true);
  };

  const fillCredentials = (user) => {
    const targetEmail = user.email.toLowerCase();
    if (lockedEmails.includes(targetEmail)) {
      setError('This account is locked due to too many failed attempts.');
      return;
    }
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(user.role);
    setError('');
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white text-slate-900">
      {/* Left Side: Branding (Dark slate panel matching mockup) */}
      <div className="hidden lg:flex w-2/5 flex-col justify-between p-12 bg-[#1b222f] text-white border-r border-slate-800 min-h-screen">
        <div className="flex flex-col gap-3">
          {/* Orange Grid SVG Logo */}
          <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10">
            <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">TransitOps</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">Smart Transport Operations Platform</p>
          </div>
        </div>

        <div className="max-w-md my-auto py-8">
          <h2 className="text-xl font-semibold mb-6">One login, four roles:</h2>
          <ul className="space-y-4 text-base font-medium">
            <li className="flex items-center gap-3 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-white">Fleet Manager</span>
            </li>
            <li className="flex items-center gap-3 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-white">Dispatcher</span>
            </li>
            <li className="flex items-center gap-3 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-white">Safety Officer</span>
            </li>
            <li className="flex items-center gap-3 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="text-white">Financial Analyst</span>
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
          TRANSITOPS &copy; 2026 • RBAC ENABLED
        </div>
      </div>

      {/* Right Side: Login Form (White panel matching mockup) */}
      <div className="flex-1 flex flex-col justify-center py-8 px-6 lg:px-16 xl:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          
          {isResetPasswordForm ? (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Choose New Password</h2>
                <p className="text-slate-500 text-sm mt-1">Set a new password for account: <strong>{getEmailFromHash()}</strong></p>
              </div>

              {resetSuccess ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                    <p className="font-semibold">Password Reset Successful!</p>
                    <p className="mt-1 text-xs text-green-700">
                      Your password has been updated in the database. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.hash = '';
                      setResetSuccess(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex gap-2 items-center">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="new-password">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-400"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="confirm-password">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-400"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm mt-2">
                    Update Password
                  </button>

                  <div className="text-center pt-2">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = '';
                      }}
                      className="text-orange-500 hover:text-orange-600 hover:underline underline-offset-4 text-sm font-semibold transition-colors"
                    >
                      Back to Login
                    </a>
                  </div>
                </form>
              )}
            </div>
          ) : isForgotPassword ? (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
                <p className="text-slate-500 text-sm mt-1">Enter your email to receive a password reset link</p>
              </div>

              {resetSent ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm">
                    <p className="font-semibold">Reset Link Sent!</p>
                    <p className="mt-1 text-xs text-orange-700">
                      A recovery link has been sent to <strong>{resetEmail}</strong>. Please check your inbox.
                    </p>
                    <div className="mt-3 pt-3 border-t border-orange-200/50 text-[11px] text-orange-600">
                      <strong>Demo Simulator:</strong> Since there is no active SMTP mail server running locally, you can click the link below to simulate opening the recovery email:
                      <a 
                        href={`#reset-password?email=${encodeURIComponent(resetEmail)}`}
                        className="block mt-1 font-bold text-orange-700 underline hover:text-orange-800"
                      >
                        Reset Password for {resetEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.hash = '';
                      setResetSent(false);
                      setResetEmail('');
                    }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setResetSent(true); }} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="reset-email">Email address</label>
                    <input
                      type="email"
                      id="reset-email"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-400"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. manager@transitops.com"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-[#eab308] hover:bg-[#ca8a04] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                    Send Reset Instructions
                  </button>

                  <div className="text-center">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = '';
                      }}
                      className="text-orange-500 hover:text-orange-600 hover:underline underline-offset-4 text-sm font-semibold transition-colors"
                    >
                      Back to Login
                    </a>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
                <p className="text-slate-500 text-sm mt-1">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-400 text-slate-900"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@transitops.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-slate-400 text-slate-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="role">Role (RBAC)</label>
                  <div className="relative">
                    <select
                      id="role"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-900 appearance-none cursor-pointer"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Safety Officer">Safety Officer</option>
                      <option value="Financial Analyst">Financial Analyst</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-slate-600 font-medium">Remember me</span>
                  </label>
                  <a href="#forgot" className="text-orange-500 hover:text-orange-600 hover:underline underline-offset-4 font-semibold">
                    Forgot password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  disabled={isCurrentEmailLocked}
                  className={`w-full py-3 text-white rounded-lg text-sm font-bold transition-colors shadow-sm mt-2 ${
                    isCurrentEmailLocked ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#eab308] hover:bg-[#ca8a04]'
                  }`}
                >
                  {isCurrentEmailLocked ? 'Account Locked' : 'Sign In'}
                </button>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 flex gap-2 text-xs items-start"
                  >
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Error state</p>
                      <p className="mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scoped access list below the form, matching mockup */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <p className="font-bold text-slate-700">Access is scoped by role after login:</p>
                <ul className="space-y-1 font-medium list-disc list-inside">
                  <li>Fleet Manager &rarr; Fleet, Maintenance</li>
                  <li>Dispatcher &rarr; Dashboard, Trips</li>
                  <li>Safety Officer &rarr; Drivers, Compliance</li>
                  <li>Financial Analyst &rarr; Fuel & Expenses, Analytics</li>
                </ul>
              </div>

              {/* Quick Demo Login at bottom */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Quick Demo (Autofill)</p>
                <div className="grid grid-cols-2 gap-2">
                  {userList.map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
                      onClick={() => fillCredentials(u)}
                    >
                      <div className="text-[10px] font-bold text-slate-800">{u.role}</div>
                      <div className="text-[8px] text-slate-500 truncate">{u.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
