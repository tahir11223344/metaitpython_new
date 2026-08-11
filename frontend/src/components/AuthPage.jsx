"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#464B59] p-6">
      <motion.div
        layout
        className="bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-4xl w-full"
      >
        {/* Left Side: Illustration / Branding */}
        <div className="hidden md:flex w-1/2 p-12 bg-gradient-to-br from-[#EB9873] to-[#464B59] text-white flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold mb-6">Welcome to Meta IT</h2>
          <p className="text-lg opacity-90">
            Start building your future with our cutting-edge AI and Development
            solutions.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-2">
                {isLogin ? "Login" : "Create Account"}
              </h2>
              <p className="text-gray-500 mb-8">
                {isLogin ? "Welcome back!" : "Join our community today."}
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {!isLogin && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-[#EB9873]"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-[#EB9873]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-[#EB9873]"
                />

                <button className="w-full py-4 bg-[#3b4353] text-white rounded-xl font-bold hover:bg-black transition-all">
                  {isLogin ? "Sign In" : "Sign Up"}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-[#EB9873] font-bold hover:underline"
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

