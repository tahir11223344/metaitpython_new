// "use client";

// import Link from "next/link";
// import { motion } from "framer-motion";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// function mediaUrl(path) {
//   if (!path) return "";
//   if (path.startsWith("http")) return path;
//   return `${API_URL}${path}`;
// }


// export default function ProjectCTASection({
//   title = "Have A Project In Mind?",
//   description = "Is your company ready to quit dreaming and to start building? Contact Meta IT. We'll begin mapping out how we can turn your most difficult technical problems into your biggest competitive advantages.",
//   buttonText = "Contact Us",
//   buttonLink = "/contact-us",
//   images = [],
// }) {
//   const pics = (images || []).filter(Boolean);

//   return (
//     <section className="w-full bg-[#F7DCD3] py-16 px-6 md:px-12 lg:px-20">
//       <div className="max-w-5xl mx-auto text-center">
   
//         <motion.h2
//           initial={{ opacity: 0, y: -120 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: false, amount: 0.3 }}
//           transition={{ duration: 0.6 }}
//           className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-6 max-w-3xl mx-auto"
//         >
//           {title}
//         </motion.h2>

    
//         {description ? (
//           <motion.p
//             initial={{ opacity: 0, y: 220 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: false, amount: 0.3 }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="text-sm sm:text-base text-[#3d4f6b] leading-relaxed mb-8 max-w-2xl mx-auto whitespace-pre-line"
//           >
//             {description}
//           </motion.p>
//         ) : null}

     
//         {pics.length > 0 ? (
//           <div
//             className={`mb-10 grid gap-4 grid-cols-2 ${
//               pics.length >= 4
//                 ? "sm:grid-cols-4"
//                 : pics.length === 3
//                 ? "sm:grid-cols-3"
//                 : "sm:grid-cols-2"
//             }`}
//           >
//             {pics.map((src, i) => (
//               <motion.img
//                 key={i}
//                 initial={{ opacity: 0, y: 40 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: false, amount: 0.3 }}
//                 transition={{ duration: 0.5, delay: i * 0.1 }}
//                 src={mediaUrl(src)}
//                 alt={`${title} ${i + 1}`}
//                 className="aspect-square w-full rounded-2xl object-cover shadow-md"
//               />
//             ))}
//           </div>
//         ) : null}

  
//         {buttonText ? (
//           <motion.div
//             initial={{ opacity: 0, y: 220 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: false, amount: 0.3 }}
//             transition={{ duration: 0.6, delay: 0.2 }}
//           >
//             <Link href={buttonLink || "/contact-us"}>
//               <motion.span
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="inline-block bg-gradient-to-r from-[#E8825B] to-[#2d3142] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-lg shadow-lg cursor-pointer transition-shadow duration-300 hover:shadow-xl"
//               >
//                 {buttonText}
//               </motion.span>
//             </Link>
//           </motion.div>
//         ) : null}
//       </div>
//     </section>
//   );
// }







"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ProjectCTASection({
  title = "Have A Project In Mind?",
  description = "Is your company ready to quit dreaming and to start building? Contact Meta IT. We'll begin mapping out how we can turn your most difficult technical problems into your biggest competitive advantages.",
  buttonText = "Contact Us",
  buttonLink = "/contact-us",
}) {
  return (
    <section className="w-full bg-[#F7DCD3] py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-6"
        >
          {title}
        </motion.h2>

  
        <motion.p
          initial={{ opacity: 0, y: 220 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm sm:text-base text-[#3d4f6b] leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          {description}
        </motion.p>

       
        <motion.div
          initial={{ opacity: 0, y: 220 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href={buttonLink}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-[#E8825B] to-[#2d3142] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-lg shadow-lg cursor-pointer transition-shadow duration-300 hover:shadow-xl"
            >
              {buttonText}
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
