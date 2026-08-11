// src/app/(admin)/dashboard/layout.js
import AdminHeader from "@/components/admin/Adminheader";
import AdminSidebar from "@/components/admin/Adminsidebar";
import AdminGuard from "@/components/auth/AdminGuard";
import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-display",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-body",
});

export const metadata = {
    title: "Dashboard | Meta IT Admin",
    robots: { index: false, follow: false }, // admin panel — Google index nahi hona chahiye
};

export default function DashboardLayout({ children }) {
    return (
        <div
            className={`${spaceGrotesk.variable} ${inter.variable}`}
            style={{ fontFamily: "var(--font-body)" }}
        >
            <AdminGuard>
                <div className="flex min-h-screen w-full max-w-full [overflow-x:clip] ">
                    <AdminSidebar />
                    <div className="flex-1 min-w-0 flex flex-col">
                        <AdminHeader title="Overview" />
                        <main className="flex-1 p-5 sm:p-8">{children}</main>
                    </div>
                </div>
            </AdminGuard>
        </div>
    );
}