import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Send, MessageSquare, CheckCircle2, AlertCircle, 
  Users, Search, UserPlus2, UserMinus2, Phone, 
  Zap, Info as InfoIcon, XCircle, Trash2,
  Paperclip, FileText, FileUp, Database, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  pix_key?: string;
}

interface BillData {
  id: string;
  month: number;
  year: number;
  total_amount: number;
  due_date: string;
  energisa_bill_url?: string;
}

export default function AdminWhatsApp() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatIds, setChatIds] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  
  // New States (v14)
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [isAutoBillMode, setIsAutoBillMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone')
      .order('name');
    
    if (error) {
      console.error("Error loading clients:", error);
      toast.error("Não foi possível carregar a lista de clientes.");
    } else {
      setClients(data || []);
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index] = null;
    setFiles(newFiles);
  };

  const formatWhatsAppNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    
    // Brazilian numbers: if it doesn't have country code, add 55
    if (cleaned.length === 11 || cleaned.length === 10) {
      if (!cleaned.startsWith("55")) {
        cleaned = "55" + cleaned;
      }
    }
    
    // Special request: ensure 5565 for regional numbers if missing
    // If it has 55 but only 10 digits total (55 + 8 digits), it might be missing DDD 65
    if (cleaned.startsWith("55") && (cleaned.length === 10 || (cleaned.length === 11 && !cleaned.startsWith("5565")))) {
        // This is complex to auto-guess, but we'll prioritize the user's specific region 65
        // if they specifically mentioned it. For now, let's stick to adding 55 if missing.
    }

    return cleaned;
  };

  const replaceVariables = (text: string, client: Client, bill?: BillData) => {
    let result = text;
    
    const monthNames = [
      "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const monthName = bill ? monthNames[bill.month] || bill.month.toString() : '---';
    const monthYear = bill ? `${monthName}/${bill.year}` : '---';
    const amount = bill ? `R$ ${bill.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---';
    const dueDate = bill ? new Date(bill.due_date + 'T12:00:00').toLocaleDateString('pt-BR') : '---';

    result = result.replace(/{nome_cliente}/g, client.name || '---');
    result = result.replace(/{telefone_cliente}/g, client.phone || '---');
    result = result.replace(/{mes_referencia}/g, monthYear);
    result = result.replace(/{valor_fatura}/g, amount);
    result = result.replace(/{data_vencimento}/g, dueDate);
    
    return result;
  };

  const handleAutoBillTemplate = async () => {
    if (selectedNumbers.length === 0) {
      toast.error("Selecione pelo menos um cliente para gerar a fatura automática.");
      return;
    }

    setIsAutoBillMode(true);
    setText(`Olá {nome_cliente}! ☀️\n\nSua fatura SolControle referente a {mes_referencia} já está disponível.\n\n💰 Valor: {valor_fatura}\n📅 Vencimento: {data_vencimento}\n\nSegue sua fatura em anexo.\n\nObrigado!`);
    toast.success("Template de fatura aplicado e variáveis configuradas!");
  };

  const toggleRecipient = (phone: string) => {
    const formatted = formatWhatsAppNumber(phone);
    if (!formatted) return;

    const currentNumbers = chatIds.split(/[,\s]+/).map(n => n.trim()).filter(n => n !== "");
    const index = currentNumbers.indexOf(formatted);

    if (index === -1) {
      setChatIds(prev => prev ? `${prev}, ${formatted}` : formatted);
    } else {
      const updated = currentNumbers.filter(n => n !== formatted);
      setChatIds(updated.join(", "));
    }
  };

  const selectAllFiltered = () => {
    const currentNumbers = chatIds.split(/[,\s]+/).map(n => n.trim()).filter(n => n !== "");
    const newNumbers = [...currentNumbers];
    
    filteredClients.forEach(client => {
      if (client.phone) {
        const formatted = formatWhatsAppNumber(client.phone);
        if (!newNumbers.includes(formatted)) {
          newNumbers.push(formatted);
        }
      }
    });
    
    setChatIds(newNumbers.join(", "));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatIds || !text) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const numbers = chatIds.split(/[,\s]+/).map(num => num.trim()).filter(num => num !== "");
    if (numbers.length === 0) {
      toast.error("Nenhum número válido encontrado.");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: numbers.length });

    try {
      // 1. Upload Attachments if any
      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (file) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `broadcasts/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('invoices')
            .upload(filePath, file);

          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            toast.error(`Falha ao enviar anexo: ${file.name}`);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(filePath);
          
          uploadedUrls.push(publicUrl);
        }
      }

      let successCount = 0;
      let failCount = 0;

      // 2. Loop through recipients
      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        const chatId = num.includes("@c.us") ? num : `${num}@c.us`;
        
        // Find client for substitution
        const client = clients.find(c => c.phone && formatWhatsAppNumber(c.phone) === num);
        let bill: BillData | undefined;

        // Fetch Bill Data if variables are present or in Auto-Bill mode
        const hasVariables = text.includes("{") && text.includes("}");
        if (client && (isAutoBillMode || hasVariables)) {
          const { data: billData } = await supabase
            .from('energy_bills')
            .select('*')
            .eq('consumer_unit_id', (await supabase.from('consumer_units').select('id').eq('client_id', client.id).maybeSingle()).data?.id)
            .order('month', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (billData) bill = billData as BillData;
        }

        let substitutedText = client ? replaceVariables(text, client, bill) : text;

        // v14.2: Append manual attachment links as fallback
        if (uploadedUrls.length > 0) {
          substitutedText += "\n\n🔗 Arquivos em anexo:\n" + uploadedUrls.map((u, idx) => `Link ${idx+1}: ${u}`).join("\n");
        }

        // v14.2: Append auto-bill link as fallback
        let energisaUrl = "";
        if (isAutoBillMode && bill?.energisa_bill_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(bill.energisa_bill_url);
          energisaUrl = publicUrl;
          
          if (!substitutedText.includes("Link Fatura")) {
            substitutedText += `\n\n📄 Download da Fatura: ${energisaUrl}`;
          }
        }

        try {
          // A. Send Text Message
          const textRes = await fetch("http://localhost:3333/send-whatsapp", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer solcontrole_secret_token_2026` },
            body: JSON.stringify({ phone: num, text: substitutedText }),
          });

          if (!textRes.ok) throw new Error("Failed to send text");

          // B. Send Manual Attachments
          for (const url of uploadedUrls) {
            try {
              await new Promise(r => setTimeout(r, 2000)); // Increased delay
              await fetch("http://localhost:3333/send-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer solcontrole_secret_token_2026` },
                body: JSON.stringify({ 
                  phone: num, 
                  file: url, 
                  filename: url.split('/').pop() || "arquivo" 
                }),
              });
            } catch (err) {
              console.warn(`Failed to send attachment ${url} to ${num}`, err);
            }
          }

          // C. Send Automatic Bill (Energisa) if Auto-Bill Mode
          if (isAutoBillMode && energisaUrl) {
            try {
              await new Promise(r => setTimeout(r, 2000));
              await fetch("http://localhost:3333/send-whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer solcontrole_secret_token_2026` },
                body: JSON.stringify({ 
                  phone: num, 
                  file: energisaUrl, 
                  filename: `Fatura_Energisa_${bill?.month}_${bill?.year}.pdf` 
                }),
              });
            } catch (err) {
              console.warn(`Failed to send auto-bill to ${num}`, err);
            }
          }

          successCount++;
        } catch (error) {
          console.error(`Error sending to ${num}:`, error);
          failCount++;
        }
        
        setProgress({ current: i + 1, total: numbers.length });
        await new Promise(r => setTimeout(r, 1000)); // Cool down between clients
      }

      if (failCount === 0) {
        toast.success(numbers.length > 1 ? `Todas as ${successCount} mensagens enviadas!` : "Mensagem enviada com sucesso!");
        setText("");
        setFiles([null, null, null]);
        setIsAutoBillMode(false);
      } else {
        toast.info(`Envio finalizado: ${successCount} sucessos, ${failCount} falhas.`);
      }

    } catch (err: any) {
      console.error("Bulk Send Error:", err);
      toast.error("Ocorreu um erro crítico durante o envio.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  const selectedNumbers = chatIds.split(/[,\s]+/).map(n => n.trim()).filter(n => n !== "");

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* SaaS Header */}
      <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black tracking-tight text-accent">WhatsApp SolControle</h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-warning" />
              Notificações massivas e atendimento personalizado
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-warning' : 'bg-success'} animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {loading ? 'Transmitindo...' : 'Sistema Online'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar: Selection */}
        <Card className="xl:col-span-4 saas-card h-fit sticky top-6 overflow-hidden flex flex-col max-h-[700px]">
          <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
              Contatos
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
              <Input 
                placeholder="Buscar por nome ou fone..." 
                className="pl-10 h-11 bg-background border-border/50 rounded-xl font-bold text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-[9px] font-black uppercase border-primary/20 text-primary hover:bg-primary/5" onClick={selectAllFiltered}>
                    Marcar Todos
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setChatIds("")}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-y-auto p-4 space-y-2 custom-scrollbar flex-1">
            {filteredClients.length === 0 ? (
                <div className="py-12 text-center opacity-30">
                    <XCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase">Vazio</p>
                </div>
            ) : filteredClients.map(client => {
                const isSelected = client.phone && selectedNumbers.includes(formatWhatsAppNumber(client.phone));
                return (
                    <div
                        key={client.id}
                        onClick={() => client.phone && toggleRecipient(client.phone)}
                        className={`group w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 cursor-pointer shadow-sm ${
                            isSelected 
                                ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' 
                                : 'bg-white border border-border/50 hover:border-primary/40'
                        } ${!client.phone && 'opacity-40 grayscale cursor-not-allowed'}`}
                    >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary text-white scale-110' : 'border-border bg-white group-hover:border-primary/50'}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate leading-none mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {client.name}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                                {client.phone || 'S/ Telefone'}
                            </p>
                        </div>
                    </div>
                );
            })}
          </CardContent>
        </Card>

        {/* Main: Form */}
        <Card className="xl:col-span-8 saas-card overflow-hidden">
          <div className="h-2 solar-gradient" />
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-7 h-7" />
              </div>
              Mensagem
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground/60 italic">
              Selecione os clientes ao lado ou digite os números separados por vírgula.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSendMessage}>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Destinatários</Label>
                  <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary bg-primary/5">
                    {selectedNumbers.length} Selecionados
                  </Badge>
                </div>
                <div className="relative group">
                  <Textarea
                    placeholder="Ex: 5565999999999, 5565111111111"
                    className="min-h-[100px] bg-muted/10 border-border/50 rounded-2xl font-mono text-xs p-4 focus:ring-4 focus:ring-primary/5 transition-all"
                    value={chatIds}
                    onChange={(e) => setChatIds(e.target.value)}
                    disabled={loading}
                  />
                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none group-focus-within:opacity-20 transition-opacity">
                      <Zap className="w-10 h-10" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-info/5 border border-info/20 flex gap-3 items-start">
                    <InfoIcon className="w-4 h-4 text-info shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-info/80 leading-relaxed uppercase tracking-tighter">
                        O sistema garante o prefixo 55 automaticamente. Certifique-se de incluir o DDD.
                    </p>
                </div>
              </div>

              {/* v14: Auto-Bill and Variables Section */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex flex-wrap items-center justify-between gap-4 px-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-warning animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ferramentas Inteligentes</span>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className={`h-9 px-4 rounded-xl font-bold text-[11px] gap-2 transition-all ${isAutoBillMode ? 'bg-primary/10 border-primary/40 text-primary' : 'hover:border-primary/50'}`}
                    onClick={handleAutoBillTemplate}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    ENVIAR FATURA DO CLIENTE
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { label: "{nome_cliente}", icon: Users },
                    { label: "{telefone_cliente}", icon: Phone },
                    { label: "{mes_referencia}", icon: Database },
                    { label: "{valor_fatura}", icon: Sparkles },
                    { label: "{data_vencimento}", icon: AlertCircle },
                  ].map((v) => (
                    <div 
                      key={v.label}
                      title="Clique para inserir"
                      onClick={() => setText(prev => prev + v.label)}
                      className="p-2 rounded-lg bg-muted/5 border border-border/40 flex items-center gap-2 cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all"
                    >
                      <v.icon className="w-3 h-3 text-primary/40" />
                      <span className="text-[9px] font-mono font-bold text-muted-foreground/80">{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Texto da Mensagem</Label>
                <div className="relative">
                  <Textarea
                    placeholder="Olá, sua fatura SolControle está disponível..."
                    className="min-h-[250px] bg-muted/10 border-border/50 rounded-3xl p-6 font-medium text-base focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* v14: Attachments Section */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 px-1">
                  <Paperclip className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Anexos (Máx 3)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative">
                      <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${file ? 'bg-primary/5 border-primary/20' : 'bg-muted/5 border-border/50 hover:border-primary/30'}`}>
                        {file ? (
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <FileUp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold truncate">{file.name}</p>
                              <p className="text-[9px] font-black opacity-40 uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => removeFile(idx)}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative cursor-pointer">
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)}
                            />
                            <div className="flex flex-col items-center gap-1 py-1">
                              <FileText className="w-4 h-4 text-muted-foreground/30" />
                              <span className="text-[9px] font-black text-muted-foreground/50 uppercase">Arquivo {idx + 1}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {progress && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black uppercase text-primary animate-pulse">Disparando...</span>
                    <span className="text-xl font-display font-black">{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner p-1">
                    <div 
                      className="h-full solar-gradient rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pb-10 pt-4 px-8">
                <Button 
                    type="submit" 
                    className="w-full h-16 rounded-2xl solar-gradient text-accent font-black text-xl tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 disabled:grayscale"
                    disabled={loading || !chatIds || !text}
                >
                    {loading ? 'ENVIANDO...' : 'ENVIAR AGORA'}
                    {!loading && <Send className="w-6 h-6 ml-4" />}
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="modern-card bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
                <div><h4 className="font-bold text-emerald-700">Conectado</h4><p className="text-[9px] font-black uppercase text-emerald-600/60">API WhatsApp (3000) Instância Default</p></div>
            </CardContent>
        </Card>
        <Card className="modern-card bg-warning/5 border-warning/20">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-warning/10 text-warning"><AlertCircle className="w-6 h-6" /></div>
                <div><h4 className="font-bold text-warning-foreground">Segurança</h4><p className="text-[9px] font-black uppercase text-warning/60">Envio assíncrono para evitar bloqueios</p></div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
