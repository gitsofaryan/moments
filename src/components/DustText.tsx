import { motion } from 'framer-motion';

interface DustTextProps {
    text: string;
    className?: string;
}

export function DustText({ text, className = "" }: DustTextProps) {
    // Split text into words first to handle spacing correctly, then chars? 
    // Or just chars. Splitting into words and then chars is safer for layout.

    const characters = text.split("");

    return (
        <span className={`inline-block whitespace-pre-wrap ${className}`}>
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{
                        opacity: 0,
                        filter: "blur(8px)",
                        y: 10,
                        scale: 1.2
                    }}
                    animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0,
                        scale: 1
                    }}
                    transition={{
                        duration: 0.4,
                        delay: i * 0.015, // Cascading delay
                        type: "spring",
                        damping: 12,
                        stiffness: 200
                    }}
                    className="inline-block"
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
}
