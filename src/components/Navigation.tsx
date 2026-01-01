import { motion } from 'framer-motion';
import { Home, PenLine, Calendar } from 'lucide-react';

export type Route = 'home' | 'write' | 'calendar';

interface NavigationProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export function Navigation({ currentRoute, onNavigate }: NavigationProps) {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/30" />

      <div className="relative max-w-lg mx-auto px-6 py-4">
        <div className="flex items-center justify-around">
          <NavButton
            icon={Home}
            label="Home"
            isActive={currentRoute === 'home'}
            onClick={() => onNavigate('home')}
          />
          <NavButton
            icon={PenLine}
            label="Write"
            isActive={currentRoute === 'write'}
            onClick={() => onNavigate('write')}
            isPrimary
          />
          <NavButton
            icon={Calendar}
            label="Calendar"
            isActive={currentRoute === 'calendar'}
            onClick={() => onNavigate('calendar')}
          />
        </div>
      </div>
    </motion.nav>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isPrimary?: boolean;
}

function NavButton({ icon: Icon, label, isActive, onClick, isPrimary }: NavButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200
        ${isActive
          ? isPrimary
            ? 'text-primary'
            : 'text-foreground'
          : 'text-muted-foreground'
        }
      `}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
    >
      <motion.div
        className={`
          p-2 rounded-xl transition-all duration-200
          ${isActive && isPrimary
            ? 'bg-primary/15'
            : isActive
              ? 'bg-muted'
              : ''
          }
        `}
        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  );
}
