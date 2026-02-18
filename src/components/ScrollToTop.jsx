import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronUp } from 'react-icons/hi2';

const ScrollToTop = memo(function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-primary shadow-lg shadow-primary/30 text-white flex items-center justify-center hover:bg-primary-dark transition-colors active:scale-90"
          aria-label="Scroll to top"
        >
          <HiChevronUp className="text-xl" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

export default ScrollToTop;
