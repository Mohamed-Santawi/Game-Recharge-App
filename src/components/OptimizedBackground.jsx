import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OptimizedBackground = ({ isMobile }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate a quick load
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Main Background - Using gradient instead of image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      />

      {/* Dark Overlay with slight blue tint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(6, 10, 14, 0.7) 3.3%, rgba(41, 97, 255, 0.1) 48.96%, rgba(6, 10, 14, 0.7) 94.61%)",
          willChange: "opacity",
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
        }}
      />
    </>
  );
};

export default OptimizedBackground;
