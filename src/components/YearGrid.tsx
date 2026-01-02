import { motion } from 'framer-motion';
import { DayStatus } from '@/types/journal';
import { getMonthName, parseDate } from '@/lib/dateUtils';
import { useMemo } from 'react';

interface YearGridProps {
  days: DayStatus[];
  onDayClick: (date: string) => void;
}

export function YearGrid({ days, onDayClick }: YearGridProps) {
  // Group days by month with proper padding for alignment
  const monthGroups = useMemo(() => {
    const groups: { month: string; days: (DayStatus | null)[] }[] = [];
    let currentMonth = '';
    let currentDays: DayStatus[] = [];

    // Helper to push a group
    const pushGroup = (month: string, dayStatuses: DayStatus[]) => {
      if (dayStatuses.length === 0) return;

      // Calculate start padding
      const firstDayDate = parseDate(dayStatuses[0].date);
      const startDayIndex = firstDayDate.getDay(); // 0 = Sunday, 1 = Monday...

      // Create array with nulls for padding
      const paddedDays: (DayStatus | null)[] = Array(startDayIndex).fill(null).concat(dayStatuses);
      groups.push({ month, days: paddedDays });
    };

    days.forEach((day, index) => {
      const date = parseDate(day.date);
      const monthName = getMonthName(date.getMonth());

      if (monthName !== currentMonth) {
        if (currentDays.length > 0) {
          pushGroup(currentMonth, currentDays);
        }
        currentMonth = monthName;
        currentDays = [day];
      } else {
        currentDays.push(day);
      }

      // Push last group
      if (index === days.length - 1) {
        pushGroup(currentMonth, currentDays);
      }
    });

    return groups;
  }, [days]);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {monthGroups.map((group, groupIndex) => (
        <motion.div
          key={group.month}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.05 }}
          className="bg-card/40 backdrop-blur-md p-5 rounded-3xl border border-white/10 hover:border-white/20 transition-colors shadow-sm"
        >
          <h3 className="font-display text-2xl font-medium text-foreground mb-4 pl-1 flex items-center justify-between">
            <span>{group.month}</span>
            <span className="text-xs font-sans text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
              {group.days.filter(d => d && d.hasEntry).length} moments
            </span>
          </h3>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Weekday Headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-center text-muted-foreground/50 font-medium mb-1">
                {d}
              </div>
            ))}

            {group.days.map((day, dayIndex) => (
              day ? (
                <YearDot
                  key={day.date}
                  day={day}
                  onClick={() => onDayClick(day.date)}
                  delay={groupIndex * 0.03 + dayIndex * 0.008}
                />
              ) : (
                <div key={`empty-${dayIndex}`} />
              )
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface YearDotProps {
  day: DayStatus;
  onClick: () => void;
  delay: number;
}

// Deterministic emoji picker based on date string
const EMOJIS = ['💻', '⚡', '🚀', '🔮', '✨', '🪐', '👾', '🌈', '🌊', '🔥', '🐞', '🕸️', '🍎', '🐧', '🐳', '🦕', '🎹', '🎨', '📚', '💡'];

function getEmojiForDate(dateStr: string) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % EMOJIS.length;
  return EMOJIS[index];
}

function YearDot({ day, onClick, delay }: YearDotProps) {
  const dateObj = parseDate(day.date);
  const dayNumber = dateObj.getDate();
  const emoji = getEmojiForDate(day.date);

  // Past means: hasEntry (written) OR (not future AND not today)
  // Actually usually "past" just means !isFuture && !isToday.
  // But let's check strict "past" day logic.
  // day.isFuture is true for tomorrow+.
  // day.isToday is true for today.
  // So strict past is !day.isFuture && !day.isToday.
  const isPast = !day.isFuture && !day.isToday;

  const getStatusStyles = () => {
    if (day.isFuture) {
      return 'bg-muted/20 text-muted-foreground cursor-not-allowed hover:bg-muted/30';
    }
    if (day.isToday) {
      return 'bg-primary text-primary-foreground font-bold ring-2 ring-primary/40 ring-offset-2 ring-offset-background scale-110';
    }
    if (day.hasEntry) {
      // Entry exists in past
      return 'bg-journal-dot-filled text-white shadow-[0_0_12px_hsl(35_85%_58%_/_0.3)] cursor-pointer';
    }
    // Past no entry
    return 'bg-journal-dot-empty text-muted-foreground cursor-pointer hover:bg-muted';
  };

  return (
    <motion.button
      type="button"
      onClick={() => !day.isFuture && onClick()}
      disabled={day.isFuture}
      className={`
        aspect-square rounded-full transition-all duration-300
        flex items-center justify-center text-xs
        ${day.isToday ? 'w-8 h-8 -m-0.5 z-10' : 'w-full'} 
        ${isPast ? 'bg-transparent shadow-none' : getStatusStyles()}
      `}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={!day.isFuture ? { scale: 1.2, zIndex: 10 } : undefined}
      whileTap={!day.isFuture ? { scale: 0.9 } : undefined}
      aria-label={`Day ${day.dayIndex}: ${day.date}`}
    >
      {isPast ? (
        <span className="text-lg leading-none filter grayscale hover:grayscale-0 transition-all duration-300" role="img" aria-label="emoji">
          {emoji}
        </span>
      ) : (
        <span>{dayNumber}</span>
      )}
    </motion.button>
  );
}
