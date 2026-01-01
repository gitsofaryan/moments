import { motion } from 'framer-motion';
import { Calendar, PenLine, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from '@/types/journal';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  onNavigate?: (direction: 'prev' | 'next') => void;
  showDayNav?: boolean;
}

export function Navigation({ 
  currentView, 
  onViewChange,
  canGoBack = false,
  canGoForward = false,
  onNavigate,
  showDayNav = false
}: NavigationProps) {
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50 safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        {/* Day navigation (when on entry view) */}
        {showDayNav && onNavigate && (
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              onClick={() => onNavigate('prev')}
              disabled={!canGoBack}
              className={`
                p-2 rounded-full transition-all duration-200
                ${canGoBack 
                  ? 'text-foreground hover:bg-muted' 
                  : 'text-muted-foreground/30 cursor-not-allowed'
                }
              `}
              whileTap={canGoBack ? { scale: 0.9 } : undefined}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => onNavigate('next')}
              disabled={!canGoForward}
              className={`
                p-2 rounded-full transition-all duration-200
                ${canGoForward 
                  ? 'text-foreground hover:bg-muted' 
                  : 'text-muted-foreground/30 cursor-not-allowed'
                }
              `}
              whileTap={canGoForward ? { scale: 0.9 } : undefined}
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {/* Spacer when not showing day nav */}
        {!showDayNav && <div />}

        {/* Main view toggles */}
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full">
          <NavButton
            icon={PenLine}
            isActive={currentView === 'today' || currentView === 'entry'}
            onClick={() => onViewChange('today')}
            label="Write"
          />
          <NavButton
            icon={Calendar}
            isActive={currentView === 'year'}
            onClick={() => onViewChange('year')}
            label="Year"
          />
        </div>

        {/* Spacer for symmetry */}
        {showDayNav ? <div className="w-20" /> : <div />}
      </div>
    </motion.nav>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

function NavButton({ icon: Icon, isActive, onClick, label }: NavButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
        ${isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}
