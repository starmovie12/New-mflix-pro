import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function BackToTop({ scrollRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollRef?.current || document.documentElement;
    const handler = () => setVisible(el.scrollTop > 400);
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [scrollRef]);

  const scrollTop = () => {
    (scrollRef?.current || document.documentElement).scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollTop}
          className="fixed bottom-24 right-4 z-40 p-3 rounded-full bg-mflix-red shadow-lg hover:bg-red-600 transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;
