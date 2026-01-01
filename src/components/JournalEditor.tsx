import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { EditorToolbar } from './EditorToolbar';
import { LockIcon } from 'lucide-react';

interface JournalEditorProps {
  content: string;
  placeholder?: string;
  isLocked?: boolean;
  onChange?: (html: string) => void;
  className?: string;
}

export function JournalEditor({ 
  content, 
  placeholder = "What happened today?",
  isLocked = false,
  onChange,
  className = ''
}: JournalEditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'journal-image'
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content,
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        onChange?.(editor.getHTML());
      }, 500);
    }
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isLocked);
    }
  }, [isLocked, editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className={`min-h-[200px] bg-card rounded-lg p-4 ${className}`}>
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-3" />
      </div>
    );
  }

  return (
    <motion.div 
      className={`relative ${className} ${isLocked ? 'entry-locked' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isLocked && (
        <motion.div 
          className="absolute -top-3 right-0 flex items-center gap-1.5 text-journal-locked text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LockIcon className="w-3 h-3" />
          <span className="font-medium">This day is sealed</span>
        </motion.div>
      )}
      
      <div className="bg-card/50 rounded-xl border border-border/30 overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="px-4 py-5 sm:px-6 min-h-[250px] text-foreground leading-relaxed"
        />
        
        {!isLocked && (
          <EditorToolbar editor={editor} onAddImage={addImage} />
        )}
      </div>
    </motion.div>
  );
}
