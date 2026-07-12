import React, { useState } from 'react';
import { Truck, ShieldAlert, Key, Mail, ChevronRight } from 'lucide-react';
import { INITIAL_USERS } from '../initialData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login({ onLogin, users }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const userList = users && users.length > 0 ? users : INITIAL_USERS;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const user = userList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials. Account locked after 5 failed attempts.');
    }
  };

  const fillCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="flex h-screen w-full bg-primary relative overflow-hidden font-sans text-primary">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-electric/10 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-royal/10 blur-[100px]"></div>
      </div>

      <div className="flex w-full z-10 flex-col lg:flex-row">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 border-r border-border/50 bg-secondary/30 backdrop-blur-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric to-neon flex items-center justify-center shadow-lg shadow-electric/20">
              <Truck size={28} className="text-void" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold tracking-tight">TransitOps</h1>
              <p className="text-sm text-secondary font-medium">Smart Transport Platform</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
            className="max-w-md"
          >
            <h2 className="text-2xl font-heading font-semibold mb-6 leading-tight">
              One unified platform to command your entire fleet operations.
            </h2>
            <div className="space-y-4 text-sm text-secondary">
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-electric"></div> Fleet Manager (All Access)</div>
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-neon"></div> Dispatcher (Trips & Routing)</div>
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-royal"></div> Safety Officer (Drivers & Compliance)</div>
              <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Financial Analyst (Expenses & Reports)</div>
            </div>
          </motion.div>

          <div className="text-xs text-muted font-medium">
            TransitOps &copy; 2026 • strict RBAC Enabled
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            className="w-full max-w-md glass-card p-10 relative z-10"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-heading font-bold mb-2">Welcome back</h2>
              <p className="text-secondary text-sm">Enter your credentials to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider" htmlFor="email">Email address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-electric" />
                  <input
                    type="email"
                    id="email"
                    className="w-full pl-11 pr-4 py-3 bg-primary/50 border border-border rounded-xl text-sm outline-none transition-all focus:border-electric focus:ring-1 focus:ring-electric placeholder-muted/70 backdrop-blur-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. manager@transitops.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-secondary uppercase tracking-wider" htmlFor="password">Password</label>
                <div className="relative group">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-electric" />
                  <input
                    type="password"
                    id="password"
                    className="w-full pl-11 pr-4 py-3 bg-primary/50 border border-border rounded-xl text-sm outline-none transition-all focus:border-electric focus:ring-1 focus:ring-electric placeholder-muted/70 backdrop-blur-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded border border-border group-hover:border-electric transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute opacity-0 cursor-pointer h-0 w-0 peer"
                    />
                    <div className="w-2 h-2 rounded-sm bg-electric opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-secondary group-hover:text-primary transition-colors">Remember me</span>
                </label>
                <a href="#forgot" className="text-electric hover:text-cyan-glow hover:underline underline-offset-4 transition-colors font-medium">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="w-full btn-primary py-3.5 mt-4 text-sm tracking-wide shadow-sm">
                Sign In to TransitOps
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }} 
                  animate={{ opacity: 1, y: 0, height: 'auto' }} 
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex gap-3 text-sm items-start overflow-hidden"
                >
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Demo Login */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
            className="w-full max-w-md mt-10"
          >
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 text-center">Quick Demo Accounts (Click to Autofill)</p>
            <div className="grid grid-cols-2 gap-3">
              {userList.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  className="flex flex-col items-start p-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-border/80 transition-all text-left group"
                  onClick={() => fillCredentials(u)}
                >
                  <span className="text-xs font-semibold text-primary group-hover:text-electric transition-colors">{u.role}</span>
                  <span className="text-[10px] text-muted truncate w-full">{u.email}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
