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
      toast.error(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <SolarBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo Section with Glow */}
        <div className="text-center mb-10 relative">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl solar-gradient mb-6 shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)]"
          >
            <Sun className="w-10 h-10 text-accent group-hover:rotate-45 transition-transform duration-500" />
          </motion.div>
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">
            Sol<span className="solar-gradient-text">Controle</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Controle inteligente da sua energia solar.</p>
        </div>

        <Card className="glass-card border-white/20 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 solar-gradient opacity-70" />
          
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="font-display text-2xl font-bold tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Faça parte da mudança'}
            </CardTitle>
            <CardDescription className="font-medium">
              {isLogin ? 'Acesse sua conta para monitorar sua geração' : 'Registre-se para começar a economizar'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="name" className="text-sm font-semibold ml-1">Nome Completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="h-11 bg-white/50 border-white/50 focus:border-primary/50 transition-all"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold ml-1">Email Profissional</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@dominio.com"
                  className="h-11 bg-white/50 border-white/50 focus:border-primary/50 transition-all font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" title="" className="text-sm font-semibold">Senha</Label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
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
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-white/50 border-white/50 focus:border-primary/50 transition-all"
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full solar-gradient text-accent font-bold h-12 text-base shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                disabled={loading}
              >
                {loading ? 'Processando...' : isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
              </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-full gap-1"
              >
                {isLogin ? (
                  <>Ainda não tem conta? <span className="text-primary underline">Cadastre-se</span></>
                ) : (
                  <>Já possui acesso? <span className="text-primary underline">Entrar agora</span></>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-50">
          © 2026 SolControle System
        </p>
      </motion.div>
    </div>
  );
}
