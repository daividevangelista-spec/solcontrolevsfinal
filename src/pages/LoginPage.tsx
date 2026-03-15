import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun } from 'lucide-react';
import { toast } from 'sonner';
import { SolarBackground } from '@/components/SolarBackground';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { signIn, signUp, resetPassword, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'client') navigate('/dashboard', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        toast.success('Conta criada! Verifique seu email.');
      }
    } catch (err: any) {
      let message = err.message || 'Erro ao autenticar';
      
      // Friendly translations for common Supabase rate limits/security errors
      if (message.includes('email rate limit exceeded')) {
        message = 'Limite de e-mails atingido. Tente novamente em 1 hora ou fale com o suporte.';
      } else if (message.includes('security purposes')) {
        const seconds = message.match(/\d+/);
        message = `Por segurança, aguarde ${seconds || 60} segundos antes de tentar novamente.`;
      } else if (message.includes('Invalid login credentials')) {
        message = 'E-mail ou senha incorretos.';
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section with Advanced Glow */}
        <div className="text-center mb-8 relative">
          <motion.div 
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(245,158,11,0.2)",
                "0 0 50px rgba(245,158,11,0.5)",
                "0 0 20px rgba(245,158,11,0.2)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] solar-gradient mb-6 shadow-2xl relative overflow-hidden"
          >
            <Sun className="w-10 h-10 text-white fill-white/20 animate-spin-slow" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
          </motion.div>
          
          <h1 className="text-5xl font-display font-black text-foreground tracking-tighter mb-2">
            Sol<span className="solar-gradient-text">Controle</span>
          </h1>
          <p className="text-muted-foreground/80 font-bold uppercase tracking-[0.3em] text-[10px]">
            Energy Intelligence Platform
          </p>
        </div>

        <Card className="glass-card border-white/20 dark:border-white/5 shadow-2xl overflow-hidden solar-border-glow">
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="font-display text-2xl font-black tracking-tight text-foreground">
              {isLogin ? 'Bem-vindo de Volta' : 'Inicie sua Jornada'}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/70">
              {isLogin ? 'Gerencie sua energia com inteligência' : 'Cadastre-se para otimizar sua economia solar'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-wider ml-1 opacity-70">Nome Completo</Label>
                    <div className="relative group">
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Vera Lucia Regis"
                        className="h-12 bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl pl-4"
                        required={!isLogin}
                      />
                      <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider ml-1 opacity-70">E-mail</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@solcontrole.com"
                    className="h-12 bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl pl-4"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" title="" className="text-[11px] font-black uppercase tracking-wider opacity-70">Senha</Label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline transition-all"
                      onClick={async () => {
                        if (!email) {
                          toast.error('Informe seu email primeiro');
                          return;
                        }
                        const { error } = await resetPassword(email);
                        if (error) toast.error(error.message);
                        else toast.success('Link de recuperação enviado!');
                      }}
                    >
                      Esqueceu?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-background/50 border-border/40 focus:border-primary/50 transition-all rounded-xl pl-4"
                    required
                    minLength={6}
                  />
                  <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full saas-button premium-gradient text-white font-black uppercase tracking-widest h-12 rounded-xl text-xs shadow-xl shadow-primary/20 hover:-translate-y-0.5" 
                disabled={loading}
              >
                {loading ? 'Processando...' : isLogin ? 'Acessar Plataforma' : 'Finalizar Cadastro'}
              </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-border/20">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-all flex items-center justify-center w-full gap-2"
              >
                {isLogin ? (
                  <>Novo por aqui? <span className="text-primary hover:scale-105 transition-transform">Criar Conta Premium</span></>
                ) : (
                  <>Já possui acesso? <span className="text-primary hover:scale-105 transition-transform">Fazer Login</span></>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em]"
        >
          SolControle OS • V16 Platinum Edition
        </motion.p>
      </motion.div>
    </div>
  );
}
