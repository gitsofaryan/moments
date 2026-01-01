import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  isLocked?: boolean;
  placeholder?: string;
}

export function TitleInput({ 
  value, 
  onChange, 
  isLocked = false,
  placeholder = "Today's title..."
}: TitleInputProps) {
  const [localValue, setLocalValue] = useState(value);
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
          font-display text-2xl sm:text-3xl font-medium
          text-foreground placeholder:text-muted-foreground/50
          transition-opacity duration-300
          ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      />
    </motion.div>
  );
}
