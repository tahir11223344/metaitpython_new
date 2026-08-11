"use client";

import React, { useEffect, useState } from "react";
import { motion as FramerMotion } from "framer-motion";
import { FaLinkedinIn, FaTwitter, FaInstagram } from "react-icons/fa";
import { getTeams, mediaUrl } from "@/lib/Team_api";

const bgColors = ["#7C5CFC", "#1B4CA6", "#F5A623"];

export default function MeetTheTeamSection() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        // Sirf active members load karenge, sorted by sort_order
        const data = await getTeams({
          is_active: "true",
          sortBy: "sort_order",
          sortDir: "asc",
          page: 1,
          size: 50, // Max records limits
        });
        setTeam(data.items || []);
      } catch (err) {
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTeamData();
  }, []);

  // Loading indicator state
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm font-medium text-gray-600">Loading our team strategists...</p>
      </div>
    );
  }

  // Agar backend se koi member active nahi hai to section hide ho jayega
  if (team.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-full [overflow-x:clip] py-8 sm:py-16 lg:py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <FramerMotion.div
          initial={{ opacity: 0, y: 140 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-14"
          style={{ backgroundColor: "#F2884B" }}
        >
          {/* Decorative background blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-black/5 pointer-events-none" />

          <FramerMotion.h2
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="relative text-3xl sm:text-4xl font-bold text-slate-900 mb-5"
          >
            Meet The Strategists and Tacticians Behind Meta IT
          </FramerMotion.h2>

          <FramerMotion.p
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative text-slate-800 text-sm sm:text-base leading-relaxed mb-10 sm:mb-12 max-w-4xl"
          >
            Meet the minds who make Meta IT an unstoppable force. Our meetings
            aren’t the typical fancy clipboards, pen-clicking and number toss
            games. This marketing strategy talk comes with installation. Meta
            IT’s offices house number-based thinkers, creative problem solvers,
            and obsessive talented minds from all over the world. Our mission
            isn't aiming for the baseline or simply being “good enough.”
            Bringing to life the enormous potential of our business partners is
            only made possible because we believe in their message and purpose,
            and are ready to put in the grit of hard work towards their cause.
          </FramerMotion.p>

          <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {team.map((member, i) => (
              <FramerMotion.div
                key={member.id || i}
                initial={{ opacity: 0, y: 140 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
                style={{ backgroundColor: bgColors[i % bgColors.length] }}
              >
                {/* Image handled dynamically through mediaUrl helper */}
                <img
                  src={member.profile_image ? mediaUrl(member.profile_image) : "/images/placeholder.jpg"}
                  alt={member.image_alt || member.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Social icons */}
                <div className="absolute top-3 left-0 right-0 flex justify-center gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  {[FaLinkedinIn, FaTwitter, FaInstagram].map((Icon, idx) => (
                    <a
                      key={idx}
                      href="#"
                      aria-label="Social link"
                      onClick={(e) => e.preventDefault()}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-800 transition-colors"
                    >
                      <Icon size={12} />
                    </a>
                  ))}
                </div>

                {/* Name + Designation */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transition-transform duration-500 group-hover:-translate-y-1">
                  <h3 className="text-white font-bold text-sm sm:text-[15px] leading-tight mb-1 truncate">
                    {member.name}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-[13px] leading-snug truncate">
                    {member.designation}
                  </p>
                </div>
              </FramerMotion.div>
            ))}
          </div>
        </FramerMotion.div>
      </div>
    </section>
  );
}