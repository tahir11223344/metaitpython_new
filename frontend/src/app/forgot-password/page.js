// src/app/forgot-password/page.js
import ForgotPasswordPage from "@/components/auth/ForgotPasswordPage";

export const metadata = {
    title: "Forgot Password | Meta IT",
    robots: { index: false, follow: false },
};

export default function Page() {
    return <ForgotPasswordPage />;
}