import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, UserPlus, ShieldPlus, UserMinus, Search, Check, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'client';
  created_at?: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface Profile {
  user_id: string;
  name: string;
  email: string;
}

export default function AdminUsers() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<'admin' | 'moderator'>('admin');

  const load = async () => {
    setLoading(true);
    // Join with profiles to show names in the list
    const { data, error } = await supabase
      .from('user_roles')
      .select('*, profiles:profiles(name, email)');
    
    if (error) {
      console.error('Error loading roles:', error);
      toast.error('Erro ao carregar administradores/moderadores.');
    } else {
      setRoles(data as any || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Real-time search for profiles
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 3) {
        setSearching(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .or(`name.ilike.%${search}%,email.ilike.%${search}%`)
          .limit(5);
        
        if (!error && data) {
          setSearchResults(data as Profile[]);
        }
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handlePromote = async () => {
    if (!selectedUser) return;
    
    try {
      // Check if user already has a role entry
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', selectedUser.user_id)
        .maybeSingle();
      
      let error;
      if (existing) {
        const res = await supabase
          .from('user_roles')
          .update({ role: roleToAssign as any })
          .eq('user_id', selectedUser.user_id);
        error = res.error;
      } else {
        const res = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.user_id, role: roleToAssign as any });
        error = res.error;
      }

      if (error) throw error;
      
      toast.success(`${selectedUser.name} agora é ${roleToAssign === 'admin' ? 'Administrador' : 'Moderador'}!`);
      setOpen(false);
      setSearch('');
      setSelectedUser(null);
      load();
    } catch (err: any) {
      toast.error('Erro ao promover: ' + err.message);
    }
  };

  const handleDemote = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover os privilégios de ${name}? Ele voltará a ser um cliente comum.`)) return;
    
    const { error } = await supabase.from('user_roles').update({ role: 'client' }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Privilégios removidos.');
      load();
    }
  };

  const staff = roles.filter(r => r.role === 'admin' || r.role === 'moderator');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-warning" />
            Gestão de Equipe
          </h1>
          <p className="text-muted-foreground">Administradores e Moderadores do sistema</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="solar-gradient text-accent">
              <UserPlus className="w-4 h-4 mr-2" /> Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar à Equipe</DialogTitle>
              <DialogDescription>
                Pesquise por um usuário cadastrado pelo nome ou e-mail.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Search Field */}
              <div className="space-y-2">
                <Label>Buscar Usuário</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nome ou e-mail..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-10"
                  />
                </div>
                
                {/* Search Results */}
                {search.length >= 3 && (
                  <div className="border rounded-md mt-2 divide-y bg-card overflow-hidden">
                    {searching ? (
                      <p className="p-3 text-xs text-center text-muted-foreground">Buscando...</p>
                    ) : searchResults.length === 0 ? (
                      <p className="p-3 text-xs text-center text-muted-foreground">Nenhum usuário encontrado.</p>
                    ) : (
                      searchResults.map(u => (
                        <button
                          key={u.user_id}
                          onClick={() => { setSelectedUser(u); setSearch(''); setSearchResults([]); }}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted transition-colors text-sm"
                        >
                          <div>
                            <p className="font-bold">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          {selectedUser?.user_id === u.user_id && <Check className="w-4 h-4 text-success" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selection Feedback */}
              {selectedUser && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Trocar</Button>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Nível de Acesso</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={roleToAssign === 'admin' ? 'default' : 'outline'}
                    onClick={() => setRoleToAssign('admin')}
                    className={roleToAssign === 'admin' ? 'solar-gradient border-none' : ''}
                  >
                    Administrador
                  </Button>
                  <Button 
                    variant={roleToAssign === 'moderator' ? 'default' : 'outline'}
                    onClick={() => setRoleToAssign('moderator')}
                    className={roleToAssign === 'moderator' ? 'bg-info hover:bg-info/90 border-none' : ''}
                  >
                    Moderador
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {roleToAssign === 'admin' 
                    ? 'Acesso total: pode criar, editar e excluir qualquer registro.' 
                    : 'Acesso restrito: não pode editar ou excluir dados criados por administradores.'}
                </p>
              </div>

              <Button 
                onClick={handlePromote} 
                className="w-full solar-gradient text-accent font-bold" 
                disabled={!selectedUser}
              >
                <ShieldPlus className="w-4 h-4 mr-2" /> Confirmar Promoção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Membros da Equipe ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : staff.length === 0 ? (
              <p className="text-muted-foreground">Nenhum membro da equipe encontrado.</p>
            ) : (
              staff.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.role === 'admin' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{member.profiles?.name || 'Sem Nome'}</span>
                      <span className="text-xs text-muted-foreground">{member.profiles?.email || 'N/A'}</span>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className={`text-[9px] uppercase font-black ${
                          member.role === 'admin' 
                          ? 'border-warning/50 text-warning bg-warning/5' 
                          : 'border-info/50 text-info bg-info/5'
                        }`}>
                          {member.role === 'admin' ? 'Administrador' : 'Moderador'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDemote(member.id, member.profiles?.name || 'membro')}>
                    <UserMinus className="w-4 h-4 mr-2" /> Remover
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-info/20 bg-info/5">
        <CardContent className="p-4 flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-info">Níveis de Hierarquia</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Administradores</strong> têm controle total. 
              <strong>Moderadores</strong> podem gerenciar o sistema no dia a dia, mas possuem restrições de segurança que impedem a alteração de dados master criados por administradores superiores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
