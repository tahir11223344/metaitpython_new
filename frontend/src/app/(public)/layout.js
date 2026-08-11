export const dynamic = "force-dynamic";
import ChatWidget from "@/components/chat/ChatWidget";
import FooterSection from "@/components/header/FooterSection";
import Navbar from "@/components/header/Navbar";
import { Toaster } from "react-hot-toast";
import { getPublicSiteSettings } from "@/lib/settingsApi";

export default async function PublicLayout({ children }) {
  // Site settings ek hi baar yahan fetch hoti hain â€” Navbar aur Footer dono ko
  // pass ho jati hain. Backend down ho to null; components apne defaults use
  // kar lete hain, page phir bhi render hota hai.
  let settings = null;
  try {
    settings = await getPublicSiteSettings();
  } catch {
    settings = null;
  }

  return (
    <div className="min-h-screen w-full max-w-full [overflow-x:clip] flex flex-col">
      <Navbar settings={settings} />
      <main className="flex-grow pt-20 lg:pt-30 w-full max-w-full [overflow-x:clip]">
        {children}
      </main>
      <FooterSection settings={settings} />
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />

      <ChatWidget />
    </div>
  );
}
