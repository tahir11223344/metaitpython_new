"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const rotatingWords = ["Business", "Growth", "Revenue", "Impact", "Success"];

// Har word ka apna gradient (order rotatingWords se match karta hai)
const wordGradients = [
  "linear-gradient(90deg,#FF7A59,#fb923c,#fbbf24)", // Business - orange
  "linear-gradient(90deg,#34d399,#10b981,#4ade80)", // Growth   - green
  "linear-gradient(90deg,#38bdf8,#0ea5e9,#22d3ee)", // Brands   - blue/cyan
  "linear-gradient(90deg,#a78bfa,#c084fc,#f472b6)", // Startups - purple/pink
  "linear-gradient(90deg,#fbbf24,#f59e0b,#fcd34d)", // Success  - gold
];

const wordVariants = {
  hidden: { transition: { staggerChildren: 0.045 } },
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
  exit: { transition: { staggerChildren: 0.03 } },
};

const letterVariants = {
  hidden: { y: "0.55em", opacity: 0, rotateX: -75, filter: "blur(6px)" },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: "-0.55em",
    opacity: 0,
    rotateX: 75,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: [0.55, 0, 0.55, 0.2] },
  },
};

const Hero = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000); // speed
    return () => clearInterval(interval);
  }, []);

  const animationProps = {
    whileInView: { opacity: 1, y: 0, x: 0, scale: 1 },
    viewport: { once: true, amount: 0.3 },
  };

  const currentWord = rotatingWords[wordIndex];
  const currentGradient = wordGradients[wordIndex % wordGradients.length];
  const len = Math.max(currentWord.length - 1, 1);

  return (
    <section className="relative w-full min flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-img.png')" }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 grid md:grid-cols-2 gap-12 py-20">
        {/* Left Side: Text */}
        <div className="flex flex-col">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            {...animationProps}
            transition={{ duration: 0.6 }}
            className="text-[24px] md:text-[30px] lg:text-[44px] font-bold text-white leading-tight mb-6"
          >
            Strategic Marketing Company Formulated To Empower{" "}
            {/* Rotating word wrapper: fixed height + hidden overflow taake letters upar-neeche na "leak" karein */}
            <span
              className="relative inline-block align-bottom overflow-hidden"
              style={{
                perspective: "700px",
                height: "1.15em",
                lineHeight: "1.15em",
                verticalAlign: "bottom",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWord}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-flex items-baseline"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {currentWord.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      variants={letterVariants}
                      className="inline-block"
                      style={{
                        transformOrigin: "50% 100%",
                        backgroundImage: currentGradient,
                        backgroundSize: `${currentWord.length * 100}% 100%`,
                        backgroundPosition: `${(i / len) * 100}% 0`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            {...animationProps}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed"
          >
            Creating superior conversions and outlasting worthy competitors
            means expanding beyond the ordinary. Meta IT pushes through the
            digital noise and propels itself towards more ambitious results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            {...animationProps}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <button className="bg-[#FF7A59] hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:scale-105">
              Start Your Project
            </button>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex text-yellow-400 text-sm lg:text-[25px] gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <span className="text-white text-sm lg:text-[25px] font-semibold">
                4.3{" "}
                <span className="text-gray-400 font-normal text-sm lg:text-[25px]">
                  Google Rating
                </span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Image */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          {...animationProps}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full"
        >
          <img
            src="/images/home-hero.png"
            alt="Strategic Marketing Illustration"
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;