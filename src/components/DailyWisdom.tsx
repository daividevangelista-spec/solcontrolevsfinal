import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Leaf, Zap, Heart, Star, Sparkles, BookOpen } from 'lucide-react';

const wisdomData = [
  {
    text: "O sol não brilha para si mesmo, mas para o mundo inteiro. Siga seu exemplo e transmita sua energia.",
    author: "Motivacional",
    icon: SunIcon,
    color: "text-warning"
  },
  {
    text: "Pois eu bem sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano.",
    author: "Jeremias 29:11",
    icon: BibleIcon,
    color: "text-primary"
  },
  {
    text: "A natureza não faz nada apressadamente, e tudo nela é perfeito. A energia solar é o equilíbrio que buscamos.",
    author: "Ambiental",
    icon: LeafIcon,
    color: "text-success"
  },
  {
    text: "Tudo posso naquele que me fortalece. A vitória é fruto da persistência e da fé.",
    author: "Filipenses 4:13",
    icon: BibleIcon,
    color: "text-primary"
  },
  {
    text: "Preservar o planeta hoje é garantir o brilho do amanhã para as próximas gerações.",
    author: "Sustentabilidade",
    icon: ZapIcon,
    color: "text-warning"
  },
  {
    text: "O Senhor é o meu pastor; de nada terei falta. Ele me faz repousar em pastos verdejantes.",
    author: "Salmos 23",
    icon: BibleIcon,
    color: "text-primary"
  },
  {
    text: "Sua força vem de dentro, mas sua energia agora vem do sol. Brilhe com consciência.",
    author: "SolControle",
    icon: SparklesIcon,
    color: "text-warning"
  },
  {
    text: "A coragem não é a ausência do medo, mas o triunfo sobre ele. Avance com determinação!",
    author: "Força & Luta",
    icon: StarIcon,
    color: "text-info"
  }
];

function SunIcon(props: any) { return <Zap {...props} />; }
function BibleIcon(props: any) { return <BookOpen {...props} />; }
function LeafIcon(props: any) { return <Leaf {...props} />; }
function ZapIcon(props: any) { return <Zap {...props} />; }
function SparklesIcon(props: any) { return <Sparkles {...props} />; }
function StarIcon(props: any) { return <Star {...props} />; }

export function DailyWisdom({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    const day = new Date().getDate();
    const seed = day + hour;
    setIndex(seed % wisdomData.length);

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % wisdomData.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const current = wisdomData[index];
  const Icon = current.icon;

  if (variant === 'compact') {
    return (
      <div className="relative overflow-hidden p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-3"
          >
            <div className={`p-2 rounded-lg bg-white/80 shadow-sm shrink-0 ${current.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold leading-tight text-foreground/80 italic">
                "{current.text}"
              </p>
              <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground opacity-50">
                — {current.author}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-none bg-white/40 backdrop-blur-xl shadow-xl shadow-black/5 ring-1 ring-white/20 h-full min-h-[160px]">
      <CardContent className="p-6 h-full flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 scale-150">
          <Quote className="w-24 h-24" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/50 border border-white/50 shadow-sm ${current.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                Momento SolControle — {current.author}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-display font-bold leading-tight text-foreground/90 italic">
                "{current.text}"
              </p>
            </div>
            
            <div className="flex gap-1">
              {wisdomData.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-primary' : 'w-1 bg-muted-foreground/20'}`} 
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
