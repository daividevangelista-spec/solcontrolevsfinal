import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreePine, CloudRain, Lightbulb, Car, Leaf, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface EnvironmentalImpactProps {
  totalKwh: number;
  variant?: 'default' | 'compact';
}

export function EnvironmentalImpact({ totalKwh, variant = 'default' }: EnvironmentalImpactProps) {
  // Conservative conversion estimates
  const co2Saved = totalKwh * 0.505; // kg (Approx avg for Brazil grid)
  const treesPlanted = Math.floor(totalKwh / 38); // 1 tree for approx 38kWh
  const lampsOperated = Math.floor(totalKwh * 10.5); // 10.5 lamps for 1 hour per kWh
  const kmDriven = Math.floor(totalKwh * 6.2); // ~6.2km per kWh in a generic EV

  const impacts = [
    { label: "CO₂ Salvo", value: `${co2Saved.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`, icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Árvores", value: treesPlanted.toLocaleString('pt-BR'), icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Lâmpadas/h", value: lampsOperated.toLocaleString('pt-BR'), icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "KM Rodados", value: `${kmDriven.toLocaleString('pt-BR')} km`, icon: Car, color: "text-primary", bg: "bg-primary/10" },
  ];

  if (variant === 'compact') {
    return (
      <Card className="saas-card overflow-hidden h-full border-t-4 border-t-emerald-500 shadow-xl shadow-emerald-500/5">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/10">
                <Leaf className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Sustentabilidade</span>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase px-2 shadow-sm">Eco-Friendly</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {impacts.map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col gap-2.5 p-4 rounded-3xl bg-muted/20 border border-border/40 hover:border-primary/30 transition-all hover:bg-muted/30 group"
              >
                <div className={`w-9 h-9 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-tight text-muted-foreground/60 leading-none mb-1.5">{item.label}</p>
                  <p className="text-sm font-black text-foreground leading-none">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground font-medium italic leading-tight flex items-center gap-2">
              <Sun className="w-4 h-4 text-warning" />
              Impacto por <strong>{totalKwh.toLocaleString('pt-BR')} kWh</strong> gerados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="saas-card overflow-hidden border-l-8 border-l-emerald-500">
      <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 py-6 px-8">
        <CardTitle className="text-2xl font-display font-black flex items-center gap-3 text-emerald-700">
          <TreePine className="w-8 h-8 text-emerald-500" />
          Impacto Ambiental Direto
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impacts.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-5 group p-5 rounded-[2rem] hover:bg-muted/30 transition-all border border-transparent hover:border-border/40"
              >
                <div className={`p-5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-sm shadow-black/5`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">{item.label}</p>
                  <p className="text-3xl font-black text-foreground tracking-tight">{item.value}</p>
                </div>
                <div className="w-1.5 h-12 bg-muted/40 rounded-full group-hover:bg-primary transition-colors duration-500" />
              </motion.div>
            ))}
        </div>
        
        <div className="pt-8 border-t border-border/40 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-bold italic leading-relaxed text-center sm:text-left">
            Estimativas baseadas em sua geração total acumulada na plataforma SolControle.
          </p>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10">
             <Leaf className="w-4 h-4 text-emerald-500" /> {totalKwh.toLocaleString('pt-BR')} kWh Monitorados
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
