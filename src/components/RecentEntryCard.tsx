import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { JournalEntry } from '@/types/journal';
import { formatDisplayDate, isEntryLocked } from '@/lib/dateUtils';

interface RecentEntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
}

// Theme definitions using inline styles to guarantee rendering
const CARD_THEMES = [
  { background: 'linear-gradient(135deg, #FFD1DC 0%, #FF9AA2 100%)', color: '#5c2b2f' }, // Pink
  { background: 'linear-gradient(135deg, #FFDAC1 0%, #FFB7B2 100%)', color: '#5c4033' }, // Peach
  { background: 'linear-gradient(135deg, #E2F0CB 0%, #B5EAD7 100%)', color: '#2c4c3b' }, // Mint
  { background: 'linear-gradient(135deg, #C7CEEA 0%, #A2D2FF 100%)', color: '#2d3a5e' }, // Periwinkle
  { background: 'linear-gradient(135deg, #FFF5BA 0%, #FFE4E1 100%)', color: '#5c542b' }, // Lemon
];

export function RecentEntryCard({ entry, onClick, className = "" }: RecentEntryCardProps & { className?: string }) {
  const isLocked = isEntryLocked(entry.createdAt);
  const displayDate = formatDisplayDate(entry.date);

  // Deterministic theme based on date
  const themeIndex = entry.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CARD_THEMES.length;
  const themeStyle = CARD_THEMES[themeIndex];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 w-full p-5 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 ${className}`}
      style={themeStyle}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="flex justify-between items-start w-full mb-3">
        <span className="text-xl font-display font-bold opacity-90">
          {displayDate.split(' ')[0]}
          <span className="block text-xs font-sans font-semibold uppercase tracking-wider mt-1 opacity-70">
            {displayDate.split(' ').slice(1).join(' ')}
          </span>
        </span>
        {isLocked && (
          <Lock className="w-4 h-4 opacity-40 mix-blend-multiply" />
        )}
      </div>

      <div className="w-full text-left">
        {entry.title ? (
          <h4 className="text-base font-semibold leading-snug line-clamp-4 opacity-90">
            {entry.title}
          </h4>
        ) : (
          <h4 className="text-sm italic opacity-60">
            Untitled
          </h4>
        )}
      </div>
    </motion.button>
  );
}
