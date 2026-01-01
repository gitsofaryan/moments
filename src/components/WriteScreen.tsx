import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayHeader } from './DayHeader';
import { TitleInput } from './TitleInput';
import { JournalEditor } from './JournalEditor';
import { JournalEntry } from '@/types/journal';
import { isEntryLocked } from '@/lib/dateUtils';

interface WriteScreenProps {
  date: string;
  dayIndex: number;
  entry: JournalEntry | null;
  onSave: (date: string, title: string, content: string) => void;
}

export function WriteScreen({
  date,
  dayIndex,
  entry,
  onSave,
}: WriteScreenProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.contentHtml || '');
  const isLocked = entry ? isEntryLocked(entry.createdAt) : false;

  // Update local state when entry changes
  useEffect(() => {
    setTitle(entry?.title || '');
    setContent(entry?.contentHtml || '');
  }, [entry]);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (!isLocked) {
        onSave(date, newTitle, content);
      }
    },
    [date, content, isLocked, onSave]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      if (!isLocked) {
        onSave(date, title, newContent);
      }
    },
    [date, title, isLocked, onSave]
  );

  return (
    <motion.div
      className="min-h-screen pb-28 safe-top"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-10 sm:pt-12">
        <DayHeader
          date={date}
          dayIndex={dayIndex}
          isLocked={isLocked}
          createdAt={entry?.createdAt}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <TitleInput
              value={title}
              onChange={handleTitleChange}
              isLocked={isLocked}
              placeholder="Today's title..."
            />

            <JournalEditor
              content={content}
              onChange={handleContentChange}
              isLocked={isLocked}
              placeholder="What happened today?"
            />

            {/* Auto-save indicator */}
            {!isLocked && (title || content) && (
              <motion.p
                className="text-xs text-muted-foreground text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1.5 }}
              >
                Saved
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
