import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

const SmoothLazy = <P extends {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  className?: string
): React.FC<P> => {
  const Comp = lazy(importFunc);

  const LazyIcon: React.FC<P> = (props) => (
    <Suspense
      fallback={
        <div className={`w-5 h-5 bg-gray-300 rounded-full ${className}`} />
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={className}
      >
        <Comp {...props} className={className} />
      </motion.div>
    </Suspense>
  );

  return LazyIcon;
};

export default SmoothLazy;
