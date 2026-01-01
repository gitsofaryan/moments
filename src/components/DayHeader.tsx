import { motion } from 'framer-motion';
import { formatDisplayDate, getTimeUntilLock, formatTimeRemaining } from '@/lib/dateUtils';
import { useState, useEffect } from 'react';
import { Clock, Lock } from 'lucide-react';

interface DayHeaderProps {
  date: string;
  dayIndex: number;
  totalDays?: number;
  isLocked: boolean;
  createdAt?: number;
}

export function DayHeader({
  date,
  dayIndex,
  totalDays = 365,
  isLocked,
  createdAt
}: DayHeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (isLocked || !createdAt) {
      setTimeRemaining('');
      return;
    }

    const updateTime = () => {
      const remaining = getTimeUntilLock(createdAt);
      setTimeRemaining(formatTimeRemaining(remaining));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [createdAt, isLocked]);

  return (
    <motion.header
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.p
        className="text-sm font-medium text-primary mb-1 tracking-wide uppercase text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Day {dayIndex} of {totalDays}
      </motion.p>

      <motion.h1
        className="font-display text-4xl sm:text-5xl font-semibold text-foreground tracking-tight text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {formatDisplayDate(date)}
      </motion.h1>

      {(timeRemaining || isLocked) && (
        <motion.div
          className="mt-3 flex items-center gap-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-journal-locked" />
              <span className="text-journal-locked">This day is sealed</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{timeRemaining}</span>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}
