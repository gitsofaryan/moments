import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiService } from '@/services/ai';
import { toast } from 'sonner';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  isLocked?: boolean;
  placeholder?: string;
  content?: string; // Content needed for AI generation
}

export function TitleInput({
  value,
  onChange,
  isLocked = false,
  placeholder = "Today's title...",
  content = ""
}: TitleInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500);
  };

  const handleGenerateTitle = async () => {
    if (!content || content.length < 10) {
      toast.info("Write a bit more content first!");
      return;
    }

    setIsGenerating(true);
    try {
      const title = await aiService.generateTitle(content);
      if (title) {
        handleChange(title);
        toast.success("Title generated!");
      } else {
        toast.error("Could not generate title.");
      }
    } catch {
      toast.error("AI error.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="relative group"
    >
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isLocked}
        placeholder={placeholder}
        className={`
          w-full bg-transparent border-none outline-none
          font-display text-4xl sm:text-5xl font-bold tracking-tight
          text-foreground placeholder:text-muted-foreground/30
          transition-opacity duration-300 pr-0
          ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      />
    </motion.div>
  );
}
