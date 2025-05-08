import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ninjaImage from "../assets/ninja.webp";

// Base64 LQIP placeholder (very low quality, blurred version of the ninja image)
const PLACEHOLDER =
  "data:image/webp;base64,UklGRkYBAABXRUJQVlA4WAoAAAAgAAAAMQAAMQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo6QEBAQDpGRktISEtZWVlZWVlZWVlZWVn/2wBDAR0XFx0aHR4dHR5ZPi0+WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCAAxADEDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAECAwQG/8QAGhABAQEBAQEBAAAAAAAAAAAAAAECEQMSE//EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAWEQEBAQAAAAAAAAAAAAAAAAAAARH/2gAMAwEAAhEDEQA/APZQAAAAAAAAABz+vp89+XRXPvPzr6gxQAAAAAAAAAHN7+c1m/Tv3Oc3nqDFAAAAAAB//9k=";

const OptimizedBackground = ({ isMobile }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    // Preload the actual image
    const img = new Image();
    img.src = ninjaImage;
    img.onload = () => {
      setImageLoaded(true);
      // Keep placeholder visible briefly for smooth transition
      setTimeout(() => {
        setShowPlaceholder(false);
      }, 300);
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
              backgroundPosition: "center",
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
          backgroundImage: `url(${ninjaImage})`,
          backgroundSize: isMobile ? "cover" : "100% 100%",
          backgroundPosition: "center",
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

      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0"
        style={{
          background:
            "linear-gradient(159.42deg, rgba(6, 10, 14, 0.7) 3.3%, rgba(59, 69, 80, 0.7) 48.96%, rgba(25, 37, 49, 0.7) 94.61%)",
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
