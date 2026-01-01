import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

// Static thoughts for MVP - will be replaced with AI-generated ones
const SAMPLE_THOUGHTS = [
  "You described more feelings than actions yesterday.",
  "Your days seem quieter than your thoughts lately.",
  "You often write late. That might matter.",
  "There's a rhythm to how you begin your entries.",
  "Some days leave more traces than others.",
  "Your words carry weight today.",
  "The space between days tells its own story.",
  "You've been noticing small things more often.",
];

export function AIThoughtCard() {
  const [thought, setThought] = useState('');

  useEffect(() => {
    // For MVP, select a random thought based on the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const thoughtIndex = dayOfYear % SAMPLE_THOUGHTS.length;
    setThought(SAMPLE_THOUGHTS[thoughtIndex]);
  }, []);

  return (
    <motion.div
      className="thought-card relative overflow-hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, hsl(35 85% 58% / 0.1), hsl(280 60% 55% / 0.05))',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Today's reflection
          </span>
        </div>

        <p className="font-display text-xl leading-relaxed text-foreground">
          "{thought}"
        </p>
      </div>
    </motion.div>
  );
}
