// src/components/Shared/SplashScreen.jsx
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";
import { useEffect, useState } from "react";

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1800); // fade out after 1.8s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
            initial={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -500, // 👈 moves upward (bottom-to-top disappear)
              transition: { duration: 1, ease: "easeInOut" },
            }}
          >
            <motion.img
              src={logo}
              alt="ShopGenius"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { duration: 0.8 } }}
              exit={{ opacity: 0, y: -50, transition: { duration: 1 } }}
              className="w-40 h-40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashScreen;
