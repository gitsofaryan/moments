import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { aiService } from '@/services/ai';
import { getTodayString } from '@/lib/dateUtils';

interface AIThoughtCardProps {
  recentEntries?: any[];
}

export function AIThoughtCard({ recentEntries = [] }: AIThoughtCardProps) {
  const [thought, setThought] = useState('Your journey begins today.');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadThought() {
      // Wait for Puter to be available
      if (!window.puter) {
        setThought('Your journey begins today.');
        setIsLoading(false);
        return;
      }

      try {
        const today = getTodayString();
        const generatedThought = await aiService.ensureTodayThought(today, recentEntries);
        setThought(generatedThought);
      } catch (error) {
        console.error('Failed to load AI thought:', error);
        setThought('Your journey continues...');
      } finally {
        setIsLoading(false);
      }
    }

    loadThought();
  }, [recentEntries]);

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

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-primary/15">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Today's reflection
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-muted/50 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-muted/50 rounded animate-pulse" />
          </div>
        ) : (
          <p className="font-display text-xl leading-relaxed text-foreground">
            "{thought}"
          </p>
        )}
      </div>
    </motion.div>
  );
}
