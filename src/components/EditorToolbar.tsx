import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  ImageIcon 
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
  onAddImage: () => void;
}

export function EditorToolbar({ editor, onAddImage }: EditorToolbarProps) {
  const tools = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      label: 'Bold'
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      label: 'Italic'
    },
    {
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      label: 'Underline'
    },
    {
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      label: 'Heading 1'
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      label: 'Heading 2'
    },
    {
      icon: ImageIcon,
      action: onAddImage,
      isActive: false,
      label: 'Add Image'
    }
  ];

  return (
    <motion.div 
      className="flex items-center gap-1 px-4 py-3 border-t border-border/30 bg-muted/30 safe-bottom"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <motion.button
            key={tool.label}
            type="button"
            onClick={tool.action}
            className={`
              p-2.5 rounded-lg transition-all duration-200 touch-manipulation
              ${tool.isActive 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            aria-label={tool.label}
          >
            <Icon className="w-5 h-5" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}
