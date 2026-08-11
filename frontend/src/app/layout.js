import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Root metadata yahan rahega
export const metadata = {
  title: "Meta IT Services",
  description: "Workflow Automation & Digital Growth Agency",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning={true}
    >
      <body
        className="min-h-full flex flex-col font-sans bg-white text-gray-900"
        suppressHydrationWarning={true} // <-- Ye line yahan add karein
      >
        {children}
      </body>
    </html>
  );
}
