import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export interface AnimatedAccordionProps {
  title: string;
  description: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AnimatedAccordion = React.memo<AnimatedAccordionProps>(({
  title,
  description,
  icon,
  isExpanded,
  onToggle,
  children,
  className
}) => {
  return (
    <motion.div
      className={cn('border rounded-lg overflow-hidden', className)}
      initial={false}
      animate={{ 
        backgroundColor: isExpanded ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0)',
        borderColor: isExpanded ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)'
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <motion.button
        className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-xl"
              animate={{ rotate: isExpanded ? 0 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <ChevronDownIcon className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.3, ease: 'easeInOut' },
              opacity: { duration: 0.2, ease: 'easeInOut' }
            }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
