import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayHeader } from './DayHeader';
import { TitleInput } from './TitleInput';
import { JournalEditor } from './JournalEditor';
import { JournalEntry } from '@/types/journal';
import { getTodayString, isEntryLocked } from '@/lib/dateUtils';

interface TodayScreenProps {
  date: string;
  dayIndex: number;
  entry: JournalEntry | null;
  onSave: (date: string, title: string, content: string) => void;
  isToday?: boolean;
}

export function TodayScreen({ 
  date, 
  dayIndex, 
  entry, 
  onSave,
  isToday = true
}: TodayScreenProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.contentHtml || '');
  const isLocked = entry ? isEntryLocked(entry.createdAt) : false;

  // Update local state when entry changes
  useEffect(() => {
    setTitle(entry?.title || '');
    setContent(entry?.contentHtml || '');
  }, [entry]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    if (!isLocked) {
      onSave(date, newTitle, content);
    }
  }, [date, content, isLocked, onSave]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (!isLocked) {
      onSave(date, title, newContent);
    }
  }, [date, title, isLocked, onSave]);

  return (
    <motion.div 
      className="min-h-screen pb-24 safe-top"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-8 sm:pt-12">
        <DayHeader 
          date={date}
          dayIndex={dayIndex}
          isLocked={isLocked}
          createdAt={entry?.createdAt}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={date}
            initial={{ opacity: 0, x: isToday ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <TitleInput 
              value={title}
              onChange={handleTitleChange}
              isLocked={isLocked}
              placeholder={isToday ? "Today's title..." : "Title..."}
            />

            <JournalEditor 
              content={content}
              onChange={handleContentChange}
              isLocked={isLocked}
              placeholder={isToday ? "What happened today?" : "What happened this day?"}
            />

            {/* Auto-save indicator */}
            {!isLocked && (title || content) && (
              <motion.p 
                className="text-xs text-muted-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Auto-saving...
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
