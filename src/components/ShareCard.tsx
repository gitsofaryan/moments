import { forwardRef } from 'react';
import { JournalEntry } from '@/types/journal';
import { formatDate } from '@/lib/dateUtils';
import { DustText } from './DustText';

interface ShareCardProps {
    entry: JournalEntry;
    aiObservation: string;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ entry, aiObservation }, ref) => {
    return (
        <div
            ref={ref}
            className="bg-[#09090b] text-foreground p-8 rounded-none w-[390px] min-h-[700px] flex flex-col relative overflow-hidden"
            style={{
                fontFamily: '"Outfit", sans-serif', // Ensure font matches
            }}
        >
            {/* Background Glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(ellipse at center, hsl(35 85% 58% / 0.15), transparent 70%)',
                }}
            />

            {/* Date & Header */}
            <div className="mb-8 relative z-10 border-b border-primary/10 pb-6">
                {/* Removed "Journey Captured" tag per user request */}
                <h1 className="font-display text-3xl font-bold text-[#f2f2f2] leading-tight">
                    {new Date(entry.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h1>
                {entry.title && <p className="text-xl text-muted-foreground mt-2 font-display italic">"{entry.title}"</p>}
            </div>

            {/* Content Body */}
            <div
                className="flex-1 relative z-10 prose prose-invert max-w-none text-lg leading-relaxed text-[#e0e0e0]/90 font-serif"
                dangerouslySetInnerHTML={{ __html: entry.contentHtml }}
            />

            {/* Footer: AI Observation */}
            <div className="mt-12 pt-6 border-t border-primary/10 relative z-10">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                        <p className="text-sm text-primary/80 font-medium mb-1 uppercase tracking-wider">Moments AI</p>
                        <p className="text-base text-muted-foreground font-display italic">
                            "{aiObservation}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Watermark in corner */}
            <div className="absolute bottom-4 right-6 opacity-30">
                <p className="font-display font-bold text-xl tracking-tighter text-white">Moments</p>
            </div>
        </div>
    );
});

ShareCard.displayName = "ShareCard";
