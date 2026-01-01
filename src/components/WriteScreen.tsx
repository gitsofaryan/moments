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

  // Calculate character count (approximate, stripping HTML)
  const charCount = content.replace(/<[^>]*>/g, '').length;

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

  // Format date for meta line (e.g., "23 December 2025")
  const formatDateMeta = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <motion.div
      className="min-h-screen pb-28 safe-top bg-background" // Ensure bg color
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Ambient glow - slightly reduced opacity for cleaner read */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-12 sm:pt-16">
        {/* Removed sticky DayHeader. Now part of document flow. */}

        <AnimatePresence mode="wait">
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4" // Tighter spacing for title/meta
          >
            <TitleInput
              value={title}
              onChange={handleTitleChange}
              isLocked={isLocked}
              placeholder="Title..."
            />

            {/* Metadata Line: Date | Char Count */}
            <div className="text-sm text-muted-foreground/60 font-body flex items-center gap-3 border-l-2 border-primary/20 pl-3 ml-1 mb-8">
              <span>{formatDateMeta(date)}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{charCount} characters</span>
            </div>

            <JournalEditor
              content={content}
              onChange={handleContentChange}
              isLocked={isLocked}
              placeholder="Start writing..."
            />

            {/* Auto-save indicator */}
            {!isLocked && (title || content) && (
              <motion.p
                className="fixed bottom-4 right-4 text-xs text-muted-foreground/40 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
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
