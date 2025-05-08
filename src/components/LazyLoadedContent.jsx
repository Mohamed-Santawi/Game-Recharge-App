import { motion } from "framer-motion";

const LazyLoadedContent = ({ handleWalletClick, isMobile }) => {
  // Disable animations on mobile
  const getInitialState = (defaultState) => (isMobile ? false : defaultState);
  const getTransition = (defaultTransition) =>
    isMobile ? { duration: 0 } : defaultTransition;

  return (
    <>
      <motion.p
        initial={getInitialState({ opacity: 0, y: -20 })}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.6, delay: 0.3 })}
        className="text-2xl md:text-3xl text-gray-300 mb-2 font-light"
      >
        Your Gaming Journey Starts Here
      </motion.p>
      <motion.p
        initial={getInitialState({ opacity: 0, y: -20 })}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.6, delay: 0.4 })}
        className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
      >
        Experience the future of gaming with instant recharges, exclusive
        rewards, and premium support. Join our community of gamers and unlock
        endless possibilities.
      </motion.p>

      <motion.div
        initial={getInitialState({ opacity: 0, y: 20 })}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.6, delay: 0.5 })}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
      >
        <motion.div
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            className="text-4xl mb-6 text-primary transition-transform duration-300"
          >
            🎮
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Instant Recharge
          </h3>
          <p className="text-gray-400">
            Get your game credits instantly with our lightning-fast system
          </p>
        </motion.div>
        <motion.div
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            className="text-4xl mb-6 text-primary transition-transform duration-300"
          >
            💎
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Premium Support
          </h3>
          <p className="text-gray-400">
            24/7 dedicated support for all your gaming needs
          </p>
        </motion.div>
        <motion.div
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            className="text-4xl mb-6 text-primary transition-transform duration-300"
          >
            🎁
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Exclusive Rewards
          </h3>
          <p className="text-gray-400">
            Special bonuses and rewards for our loyal gamers
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={getInitialState({ opacity: 0, y: 20 })}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.6, delay: 0.6 })}
        className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center text-gray-300"
        >
          <span className="text-2xl mr-2">⭐</span>
          <span>Trusted by 100K+ Gamers</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center text-gray-300"
        >
          <span className="text-2xl mr-2">⚡</span>
          <span>Instant Delivery</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center text-gray-300"
        >
          <span className="text-2xl mr-2">🔒</span>
          <span>Secure Transactions</span>
        </motion.div>
      </motion.div>

      <motion.div
        whileHover={
          isMobile ? {} : { scale: 1.05, transition: { duration: 0.2 } }
        }
        whileTap={isMobile ? {} : { scale: 0.95 }}
        initial={getInitialState({ opacity: 0, y: 20 })}
        animate={{ opacity: 1, y: 0 }}
        transition={getTransition({ duration: 0.6, delay: 0.7 })}
        className="mb-8"
      >
        <button
          onClick={handleWalletClick}
          className="relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white transition-all duration-300 ease-out rounded-lg shadow-lg group bg-[#121A22]/40 border border-white/5 hover:bg-[#121A22]/60 hover:shadow-primary/20 before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-white/10 before:transition-all before:duration-300 hover:before:bg-primary/80"
        >
          Get Started
        </button>
      </motion.div>
    </>
  );
};

export default LazyLoadedContent;
