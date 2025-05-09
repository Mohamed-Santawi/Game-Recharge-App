import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Base64 LQIP placeholder (very low quality, blurred version of the stitch image)
const PLACEHOLDER = "data:image/webp;base64,UklGRkYBAABXRUJQVlA4WAoAAAAgAAAAMQAAMQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo6QEBAQDpGRktISEtZWVlZWVlZWVlZWVn/2wBDAR0XFx0aHR4dHR5ZPi0+WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCAAxADEDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAECAwQG/8QAGhABAQEBAQEBAAAAAAAAAAAAAAECEQMSE//EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/APZQAAAAAAAAABz+vp89+XRXPvPzr6gxQAAAAAAAAAHN7+c1m/Tv3Oc3nqDFAAAAAAB//9k=";

const OptimizedBackground = ({ isMobile }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    // Preload the actual image
    const img = new Image();
    img.src = "/stitch-background.webp"; // We'll add this image to the public folder
    img.onload = () => {
      setImageLoaded(true);
      // Keep placeholder visible briefly for smooth transition
      setTimeout(() => {
        setShowPlaceholder(false);
      }, 300);
    };

    // Add image to browser cache with high priority
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = "/stitch-background.webp";
    link.fetchPriority = "high";
    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return (
    <>
      {/* Placeholder Background */}
      <AnimatePresence>
        {showPlaceholder && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${PLACEHOLDER})`,
              backgroundSize: isMobile ? "cover" : "100% 100%",
              backgroundPosition: isMobile ? "center" : "center bottom",
              backgroundRepeat: "no-repeat",
              backgroundColor: "#0a0a0a",
              filter: "blur(20px)",
              transform: "scale(1.1)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: "url('/stitch-background.webp')",
          backgroundSize: isMobile ? "cover" : "100% 100%",
          backgroundPosition: isMobile ? "center" : "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#0a0a0a",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: "cover",
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      />

      {/* Dark Overlay - Adjusted for Stitch theme */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(0, 12, 24, 0.7) 3.3%, rgba(41, 97, 255, 0.4) 48.96%, rgba(0, 12, 24, 0.7) 94.61%)",
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
