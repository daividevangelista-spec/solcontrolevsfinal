import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, PlayCircle, Zap, ArrowRight, Smartphone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SolarBackground } from '@/components/SolarBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBrand } from '@/components/AnimatedBrand';

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
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleZipBlur = async () => {
    const cleanZip = zip.replace(/\D/g, '');
    if (cleanZip.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro);
        setNeighborhood(data.bairro);
        setCity(data.localidade);
        setState(data.uf);
        toast.success('Endereço localizado!');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
      } else {
        const metadata = {
          name,
          phone,
          address: {
            zip,
            street,
            number,
            neighborhood,
            city,
            state
          },
          full_address: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${zip}`
        };
        const { error } = await signUp(email, password, metadata);
        if (error) throw error;
        toast.success('Conta criada! Verifique seu email.');
      }
    } catch (err: any) {
      let message = err.message || 'Erro ao autenticar';
      if (message.includes('email rate limit exceeded')) {
        message = 'Limite de e-mails atingido. Tente novamente em 1 hora.';
      } else if (message.includes('security purposes')) {
        message = 'Por segurança, aguarde um pouco antes de tentar novamente.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'E-mail ou senha incorretos.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      <SolarBackground />
      
      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="hidden lg:block lg:flex-1" />

        {/* ===== Left/Center: Login Column ===== */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="w-full max-w-md flex-shrink-0"
        >
          {/* Logo Section Linked to Home */}
          <Link to="/" className="text-center mb-10 relative flex flex-col items-center group active:scale-95 transition-transform cursor-pointer">
            <motion.div 
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(245,158,11,0.2)",
                  "0 0 50px rgba(245,158,11,0.5)",
                  "0 0 20px rgba(245,158,11,0.2)"
                ],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] solar-gradient mb-6 shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
            >
              <Sun className="w-12 h-12 text-white fill-white/20 animate-spin-slow" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
            </motion.div>
            
            <AnimatedBrand size="lg" className="mb-2" as="span" />
            <p className="text-muted-foreground/80 font-bold uppercase tracking-[0.4em] text-[10px]">
              Energy Intelligence Platform
            </p>
          </Link>

          <Card className="glass-card border-white/20 dark:border-white/5 shadow-2xl overflow-hidden solar-border-glow">
            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className="font-display text-2xl font-black tracking-tight text-foreground">
                {isLogin ? 'Bem-vindo de Volta' : 'Inicie sua Jornada'}
              </CardTitle>
              <CardDescription className="font-medium text-muted-foreground/70">
                {isLogin ? 'Gerencie sua energia com inteligência' : 'Cadastre-se para otimizar sua economia solar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Dados de Contato</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Nome Completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="bg-white/5 border-white/10 h-11"
                          />
                          <Input
                            placeholder="WhatsApp"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required={!isLogin}
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Endereço de Faturamento</Label>
                        <Input
                          placeholder="CEP"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          onBlur={handleZipBlur}
                          required={!isLogin}
                          className="bg-white/5 border-white/10 h-11"
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            placeholder="Logradouro"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="col-span-2 bg-white/5 border-white/10 h-11"
                          />
                          <Input
                            placeholder="Nº"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            className="bg-white/5 border-white/10 h-11"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Bairro"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="bg-white/5 border-white/10 h-11"
                          />
                          <Input
                            placeholder="Cidade/UF"
                            value={`${city}${city && state ? '/' : ''}${state}`}
                            readOnly
                            className="bg-white/5 border-white/10 h-11 opacity-70"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className={!isLogin ? "text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1" : ""}>Acesso</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 h-11"
                  />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 h-11"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full solar-gradient text-white h-12 font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border-none"
                >
                  {loading ? 'Processando...' : isLogin ? 'Entrar no Sistema' : 'Criar Minha Conta'}
                </Button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-white/5">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
                >
                  {isLogin ? (
                    <>Novo por aqui? <span className="text-primary">Criar Conta Premium</span></>
                  ) : (
                    <>Já possui acesso? <span className="text-primary">Fazer Login</span></>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ===== Right: Demo Access Card ===== */}
        <div className="lg:flex-1 w-full max-w-md flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link to="/demo" className="block group">
              <div className="relative overflow-hidden rounded-[2rem] border-2 border-dashed border-primary/40 bg-primary/5 backdrop-blur-xl p-6 hover:border-primary/80 hover:bg-primary/10 transition-all duration-500 shadow-xl shadow-primary/10 hover:shadow-primary/30 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-3xl -mr-20 -mt-20 group-hover:bg-primary/30 transition-all" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 blur-2xl -ml-12 -mb-12" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-primary/30 border border-primary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/40 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <PlayCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Área do Cliente</span>
                      <span className="px-2 py-0.5 bg-primary/40 border border-white/20 rounded-full text-[8px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-white" /> Demo Grátis
                      </span>
                    </div>
                    <h3 className="text-base font-display font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">Testar sem Cadastro</h3>
                    <p className="text-[11px] text-white/90 font-bold mt-0.5 leading-tight">Acesse o painel completo com dados simulados. Login automático!</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-2 transition-all flex-shrink-0" />
                </div>

                <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-4 relative z-10">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Email</p>
                      <p className="text-[10px] font-mono font-bold text-amber-200">demo@solcontrole.com</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Senha</p>
                      <p className="text-[10px] font-mono font-bold text-amber-200">123456</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">✓ Auto Login</span>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-6 text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em]"
          >
            SolControle OS • V16 Platinum Edition
          </motion.p>
        </div>
      </div>
    </div>
  );
}
