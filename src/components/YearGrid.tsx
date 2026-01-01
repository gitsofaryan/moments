import { motion } from 'framer-motion';
import { DayStatus } from '@/types/journal';
import { getMonthName, parseDate } from '@/lib/dateUtils';
import { useMemo } from 'react';

interface YearGridProps {
  days: DayStatus[];
  onDayClick: (date: string) => void;
}

export function YearGrid({ days, onDayClick }: YearGridProps) {
  // Group days by month
  const monthGroups = useMemo(() => {
    const groups: { month: string; days: DayStatus[] }[] = [];
    let currentMonth = '';
    let currentGroup: DayStatus[] = [];

    days.forEach((day) => {
      const date = parseDate(day.date);
      const monthName = getMonthName(date.getMonth());

      if (monthName !== currentMonth) {
        if (currentGroup.length > 0) {
          groups.push({ month: currentMonth, days: currentGroup });
        }
        currentMonth = monthName;
        currentGroup = [day];
      } else {
        currentGroup.push(day);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ month: currentMonth, days: currentGroup });
    }

    return groups;
  }, [days]);

  return (
    <motion.div
      className="space-y-8"
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
          className="bg-card/30 p-6 rounded-3xl border border-white/5"
        >
          <h3 className="font-display text-lg text-muted-foreground mb-4 pl-1">
            {group.month}
          </h3>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {group.days.map((day, dayIndex) => (
              <YearDot
                key={day.date}
                day={day}
                onClick={() => onDayClick(day.date)}
                delay={groupIndex * 0.03 + dayIndex * 0.008}
              />
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

function YearDot({ day, onClick, delay }: YearDotProps) {
  const getStatusStyles = () => {
    if (day.isFuture) {
      return 'bg-muted/20 cursor-not-allowed';
    }
    if (day.isToday) {
      return 'bg-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background';
    }
    if (day.hasEntry) {
      return 'bg-journal-dot-filled shadow-[0_0_12px_hsl(35_85%_58%_/_0.3)] cursor-pointer';
    }
    return 'bg-journal-dot-empty cursor-pointer hover:bg-muted';
  };

  return (
    <motion.button
      type="button"
      onClick={() => !day.isFuture && onClick()}
      disabled={day.isFuture}
      className={`
        aspect-square rounded-full transition-all duration-300
        ${getStatusStyles()}
      `}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      whileHover={!day.isFuture ? { scale: 1.4 } : undefined}
      whileTap={!day.isFuture ? { scale: 0.8 } : undefined}
      aria-label={`Day ${day.dayIndex}: ${day.date}`}
    />
  );
}
