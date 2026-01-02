import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas'; // Import library
import { toast } from 'sonner';

import { TitleInput } from './TitleInput';
import { JournalEditor } from './JournalEditor';
import { ShareCard } from './ShareCard'; // Import component
import { JournalEntry } from '@/types/journal';
import { isEntryLocked } from '@/lib/dateUtils';
import { aiService } from '@/services/ai'; // Import AI

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

  // Share State
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareData, setShareData] = useState<{ entry: JournalEntry; observation: string } | null>(null);

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

  const handleShare = async () => {
    if (!entry || (!entry.title && !entry.contentHtml)) {
      toast.error("Write something first!");
      return;
    }

    setIsSharing(true);
    toast.info("Generating shareable moment...");

    try {
      // 1. Generate Observation
      const observation = await aiService.generateShareObservation(entry.contentHtml);

      // 2. Set data to render hidden card
      setShareData({ entry, observation });

      // Wait for render (short delay)
      await new Promise(resolve => setTimeout(resolve, 500));

      if (shareCardRef.current) {
        // 3. Capture
        const canvas = await html2canvas(shareCardRef.current, {
          scale: 2, // High res
          backgroundColor: '#09090b',
          useCORS: true,
        });

        // 4. Convert to Blob/URL
        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const file = new File([blob], 'moments-share.png', { type: 'image/png' });
          let shared = false;

          // 5. Try Native Share (Mobile / Supported Browsers)
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'My Journey Moment',
                text: 'Captured on Moments App'
              });
              toast.success("Shared successfully!");
              shared = true;
            } catch (err) {
              console.warn("Share cancelled or failed", err);
              // User might have cancelled, but if it failed technically, run fallback?
              // Usually cancellation shouldn't trigger download, but failure should.
              // We'll proceed to fallback if it wasn't a user cancellation (hard to detect reliably cross-browser, but we'll assume manual backup is good).
            }
          }

          if (!shared) {
            // 6. Desktop Fallback: Copy to Clipboard + Download
            try {
              // Try copying to clipboard (great for pasting into WhatsApp Web/Discord)
              const clipboardItem = new ClipboardItem({ 'image/png': blob });
              await navigator.clipboard.write([clipboardItem]);
              toast.success("I've copied the image to your clipboard!");
            } catch (e) {
              // Clipboard might fail if not focused or permission denied
              console.warn("Clipboard failed", e);
            }

            // Always offer download on desktop as reliable backup
            downloadImage(canvas.toDataURL());
            if (!navigator.clipboard) {
              toast.success("Image saved to your device!");
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate share image.");
    } finally {
      setIsSharing(false);
      setShareData(null); // Cleanup
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `moment-${date}.png`;
    link.href = dataUrl;
    link.click();
  };

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
      {/* Header Actions */}
      <div className="absolute top-4 right-5 z-20">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Share Moment"
        >
          {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Hidden Render Area for ShareCard */}
      <div className="fixed top-0 left-0 overflow-hidden pointer-events-none opacity-0" style={{ zIndex: -1 }}>
        {shareData && (
          <ShareCard
            ref={shareCardRef}
            entry={shareData.entry}
            aiObservation={shareData.observation}
          />
        )}
      </div>

      {/* Ambient glow - slightly reduced opacity for cleaner read */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.12), transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto px-5 pt-12 sm:pt-16">
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
              content={content}
            />

            {/* Metadata (Char count, time) */}
            <div className="text-xs text-muted-foreground/60 font-body flex items-center gap-3 border-l-2 border-primary/20 pl-3 ml-1 mb-6">
              <span>{formatDateMeta(date)}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{charCount} characters</span>
              {entry && entry.updatedAt && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>
                    Updated {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              )}
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
