import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Sun, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom hook for the typewriter effect
function useTypewriter(phrases: string[], typingSpeed = 50, erasingSpeed = 30, delay = 2000) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentPhrase = phrases[loopNum % phrases.length];

    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentPhrase.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setLoopNum(loopNum + 1);
        }
      }, erasingSpeed);
    } else {
      timer = setTimeout(() => {
        setText(currentPhrase.substring(0, text.length + 1));
        if (text.length === currentPhrase.length) {
          timer = setTimeout(() => setIsDeleting(true), delay);
        }
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed, erasingSpeed, delay]);

  return text;
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phrases = [
    "Controle de estoque simplificado.",
    "Prontuários seguros e organizados.",
    "Gestão inteligente da sua clínica.",
    "Mais tempo para seus pacientes."
  ];

  const typewrittenText = useTypewriter(phrases);

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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Lado Esquerdo - Decorativo (Oculto em telas menores) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-center items-center p-12 overflow-hidden">
        {/* Background Decor Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-solar/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-8">
            <Sun className="w-16 h-16 text-brand-solar mb-6 opacity-80" />
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
              Bem-vindo ao<br />
              <span className="text-brand-primary">Consultório de Sol</span>
            </h2>
          </div>
          
          <div className="h-20">
            <p className="text-xl lg:text-2xl text-slate-300 font-light flex items-center">
              {typewrittenText}
              <span className="inline-block w-1 h-8 bg-brand-primary ml-1 animate-pulse" />
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-12">
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
            Ambiente Seguro • Encriptação 256-bit
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative bg-white lg:bg-slate-50">
        {/* Decor for mobile only */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-3xl animate-pulse lg:hidden" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-solar/10 rounded-full blur-3xl animate-pulse lg:hidden" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] shadow-none lg:shadow-2xl lg:shadow-slate-200/60 p-8 sm:p-12 relative z-10 lg:border border-slate-100"
        >
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 bg-brand-solar rounded-3xl flex items-center justify-center shadow-lg shadow-brand-solar/20 mb-6">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">
              Consultório <span className="text-brand-primary uppercase text-sm block tracking-[0.2em] mt-1">De Sol</span>
            </h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-black text-slate-900">Acesse sua conta</h2>
            <p className="text-slate-500 text-sm mt-2">Insira suas credenciais para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Endereço de E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  required
                  type="email"
                  placeholder="Digite seu e-mail"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-slate-700 shadow-sm hover:border-slate-300"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  required
                  type="password"
                  placeholder="Sua senha secreta"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-slate-700 shadow-sm hover:border-slate-300"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full mt-2 py-4 bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
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
            Esqueceu sua senha?{' '}
            <a 
              href="https://wa.me/5579998130038" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-primary font-bold cursor-pointer hover:underline"
            >
              Contate o administrador
            </a>
          </p>
        </motion.div>

        <footer className="absolute bottom-6 text-slate-300 text-[10px] uppercase font-bold tracking-[0.3em] lg:hidden">
          Ambiente Seguro • Encriptação 256-bit
        </footer>
      </div>
    </div>
  );
}

export default Login;
