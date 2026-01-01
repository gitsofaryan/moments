import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DustText } from './DustText';
import { aiService } from '@/services/ai';
import { getTodayString } from '@/lib/dateUtils';
import { useJournal } from '@/hooks/useJournal';
import { JournalEntry } from '@/types/journal';

export function AIThoughtCard() {
  const [thought, setThought] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { entries } = useJournal();

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      const recentEntries = (Object.values(entries) as JournalEntry[])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5); // Take last 5 for context

      try {
        const insight = await aiService.ensureTodayThought(getTodayString(), recentEntries);
        // Artificial delay for effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        setThought(insight);
      } catch (error) {
        console.error('Failed to load AI thought:', error);
        setThought('Your journey continues...'); // Fallback message
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();

    // Listen for updates
    const handleUpdate = (e: CustomEvent<{ date: string; thought: string }>) => {
      if (e.detail.date === getTodayString()) {
        setThought(e.detail.thought);
      }
    };

    window.addEventListener('ai-thought-updated', handleUpdate as EventListener);

    return () => {
      window.removeEventListener('ai-thought-updated', handleUpdate as EventListener);
    };
  }, [entries]);

  return (
    <motion.div
      className="thought-card relative overflow-hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Enhanced gradient overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(38 92% 62% / 0.12), hsl(285 65% 58% / 0.08))',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider sm:hidden">
            Perspective
          </span>
        </div>

        {isLoading ? (
          <div className="h-5 w-3/4 bg-muted/50 rounded animate-pulse" />
        ) : (
          <p className="font-display text-base leading-snug text-foreground/90">
            <DustText text={`"${thought}"`} key={thought} />
          </p>
        )}
      </div>
    </motion.div>
  );
}
