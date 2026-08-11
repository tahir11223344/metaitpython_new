"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import apiClient from "@/lib/apiClient";

function Toast({ type, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm mb-5 ${
        type === "success"
          ? "bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]"
          : "bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185]"
      }`}
    >
      {type === "success" ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordToast, setPasswordToast] = useState(null);

  // ============ Load profile (GET /api/auth/me) ============
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data } = await apiClient.get("/api/auth/me");
        setProfile({ full_name: data.full_name, email: data.email });
      } catch (err) {
        setProfileToast({ type: "error", message: "Could not load profile." });
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // ============ Update profile (PUT /api/auth/me) ============
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileToast(null);
    setSavingProfile(true);

    try {
      const { data } = await apiClient.put("/api/auth/me", {
        full_name: profile.full_name,
      });

      localStorage.setItem("user", JSON.stringify(data));
      setProfileToast({
        type: "success",
        message: "Profile updated successfully.",
      });
    } catch (err) {
      setProfileToast({
        type: "error",
        message: err.response?.data?.detail || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ============ Change password (POST /api/auth/change-password) ============
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordToast(null);

    if (passwordForm.new_password.length < 8) {
      setPasswordToast({
        type: "error",
        message: "New password must be at least 8 characters.",
      });
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordToast({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await apiClient.post("/api/auth/change-password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordToast({ type: "success", message: data.detail });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordToast({
        type: "error",
        message: err.response?.data?.detail || "Failed to change password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* ============ Profile Card ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 sm:p-7 bg-[#12172A] border border-[#232B45]"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-[#171D33] border border-[#232B45] flex items-center justify-center text-[#FF7A45]">
            <FiUser size={17} />
          </span>
          <div>
            <h2
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Profile Information
            </h2>
            <p className="text-xs text-[#6B7290]">
              Update your account's name and view your email.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {profileToast && <Toast {...profileToast} />}
        </AnimatePresence>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <span className="w-6 h-6 border-2 border-[#232B45] border-t-[#FF7A45] rounded-full animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                Full name
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                  size={16}
                />
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                Email address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                  size={16}
                />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0D1220]/50 border border-[#232B45] text-[#6B7290] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[#6B7290] mt-2">
                Email cannot be changed here. Contact a super admin if you need
                this updated.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={savingProfile}
              whileHover={{ scale: savingProfile ? 1 : 1.01 }}
              whileTap={{ scale: savingProfile ? 1 : 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF7A45] to-[#ff8f63] text-white font-bold text-sm px-6 py-3 rounded-lg transition-all disabled:opacity-60"
            >
              {savingProfile ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave size={15} />
                  Save Changes
                </>
              )}
            </motion.button>
          </form>
        )}
      </motion.div>

      {/* ============ Change Password Card ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl p-6 sm:p-7 bg-[#12172A] border border-[#232B45]"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 rounded-xl bg-[#171D33] border border-[#232B45] flex items-center justify-center text-[#7B6EF6]">
            <FiLock size={17} />
          </span>
          <div>
            <h2
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Change Password
            </h2>
            <p className="text-xs text-[#6B7290]">
              Choose a strong password you don't use elsewhere.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {passwordToast && <Toast {...passwordToast} />}
        </AnimatePresence>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
              Current password
            </label>
            <div className="relative">
              <FiLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                size={16}
              />
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
                className="w-full pl-10 pr-11 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7290] hover:text-white transition-colors"
              >
                {showPasswords ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                New password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                Confirm new password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                required
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={savingPassword}
            whileHover={{ scale: savingPassword ? 1 : 1.01 }}
            whileTap={{ scale: savingPassword ? 1 : 0.98 }}
            className="flex items-center gap-2 bg-[#171D33] hover:bg-[#1c2440] border border-[#232B45] text-white font-bold text-sm px-6 py-3 rounded-lg transition-all disabled:opacity-60"
          >
            {savingPassword ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiLock size={15} />
                Update Password
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
