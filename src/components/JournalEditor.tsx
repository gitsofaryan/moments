import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { useEffect, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LockIcon, Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, ImageIcon, Wand2, List, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '@/services/ai';
import { toast } from 'sonner';

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
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'journal-image'
        }
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty'
      }),
      Underline,
      BubbleMenuExtension.configure({
        pluginKey: 'bubbleMenu',
      }),
      FloatingMenuExtension.configure({
        pluginKey: 'floatingMenu',
      }),
    ],
    content,
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none prosemirror-content'
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

  const handleAiImprove = async () => {
    if (!editor || isAiLoading) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    if (!text.trim()) return;

    setIsAiLoading(true);
    toast.info("AI is polishing your thoughts...");

    try {
      const improved = await aiService.transformText(text, "Improve clarity, flow, and fix grammar while keeping the tone personal.");

      if (improved) {
        editor.chain().focus().insertContent(improved).run();
        toast.success("Polished!");
      }
    } catch (err) {
      toast.error("Could not polish text.");
    } finally {
      setIsAiLoading(false);
    }
  };

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
          <span className="font-medium">Day Captured</span>
        </motion.div>
      )}

      <div className="relative min-h-[500px] flex flex-col">

        {/* Contextual Bubble Menu */}
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-secondary border border-border/50 rounded-full shadow-lg">
            <button
              onClick={handleAiImprove}
              disabled={isAiLoading}
              className={`p-2 rounded-full transition-colors flex items-center gap-1 ${isAiLoading ? 'bg-primary/20 text-primary' : 'text-purple-400 hover:bg-purple-500/10'}`}
              title="Ask AI to improve"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </BubbleMenu>
        )}

        {/* Floating "Slash" Menu */}
        {editor && (
          <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 p-1 bg-secondary border border-border/50 rounded-full shadow-lg">
            <button
              onClick={async () => {
                const prompt = window.prompt("What should I write about?");
                if (!prompt) return;

                setIsAiLoading(true);
                toast.info("AI is writing...");
                try {
                  const result = await aiService.transformText("", `Write a short journal paragraph about: ${prompt}`);
                  if (result) {
                    editor.chain().focus().insertContent(result).run();
                    toast.success("Written!");
                  }
                } catch {
                  toast.error("Failed to write.");
                } finally {
                  setIsAiLoading(false);
                }
              }}
              className="p-2 rounded-full text-purple-400 hover:bg-purple-500/10 transition-colors"
              title="Ask AI to write"
            >
              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-full transition-colors ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </FloatingMenu>
        )}

        {/* Editor Area */}
        <EditorContent
          editor={editor}
          className="flex-1 px-4 py-4 min-h-[400px] text-foreground leading-relaxed text-xl font-display focus:outline-none"
        />
      </div>
    </motion.div>
  );
}
