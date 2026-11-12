import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

export interface FaqEntry {
  q: string;
  a: string;
}

export const FaqAccordion: React.FC<{ items: FaqEntry[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  const reduce = useReducedMotion();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        const buttonId = `${base}-q${idx}`;
        const panelId = `${base}-a${idx}`;
        return (
          <ScrollReveal key={idx} direction="up" delay={idx * 0.05}>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-[#171717] flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors min-h-[56px] focus-visible:outline-offset-[-3px]"
                >
                  <span className="text-base">{item.q}</span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#C8202F]' : ''
                    }`}
                  />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: reduce ? 0 : 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
};

export default FaqAccordion;