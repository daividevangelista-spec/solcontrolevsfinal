import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";

interface RefinedStatProps {
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  color?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
}

export function RefinedStat({ 
  label, 
  value, 
  unit = "", 
  icon: Icon, 
  color = "text-primary", 
  prefix = "", 
  decimals = 0,
  delay = 0 
}: RefinedStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <Card className="saas-card p-6 overflow-hidden relative group border-border/40">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
          <Icon className="w-24 h-24 rotate-12" />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-muted/50 ${color} group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">{label}</span>
        </div>

        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg font-bold text-foreground/40">{prefix}</span>}
          <div className="text-3xl font-display font-black tracking-tight text-foreground">
            <CountUp 
              end={value} 
              duration={2.5} 
              separator="." 
              decimal="," 
              decimals={decimals} 
              useEasing={true}
            />
          </div>
          {unit && <span className="text-sm font-bold text-muted-foreground ml-1">{unit}</span>}
        </div>
        
        <div className="mt-4 h-1 w-0 bg-primary group-hover:w-full transition-all duration-700 rounded-full" />
      </Card>
    </motion.div>
  );
}
