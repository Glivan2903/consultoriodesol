import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Sun, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-solar/10 rounded-full blur-3xl animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-12 relative z-10 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-brand-solar rounded-3xl flex items-center justify-center shadow-lg shadow-brand-solar/20 mb-6">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Consultório <span className="text-brand-primary uppercase text-sm block tracking-[0.2em] mt-1">De Sol Inventory</span></h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
              <input 
                required
                type="email"
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-slate-600"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
              <input 
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-slate-600"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}

          <button 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-xs">
          Esqueceu sua senha? <span className="text-brand-primary font-bold cursor-pointer hover:underline">Contate o administrador</span>
        </p>
      </motion.div>

      <footer className="mt-12 text-slate-300 text-[10px] uppercase font-bold tracking-[0.3em]">
        Ambiente Seguro • Encriptação 256-bit
      </footer>
    </div>
  );
}

export default Login;
