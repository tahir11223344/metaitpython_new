// src/app/reset-password/page.js
import { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata = {
    title: "Reset Password | Meta IT",
    robots: { index: false, follow: false },
};

export default function Page() {
    // useSearchParams() ke liye Suspense boundary zaroori hai Next.js App Router mein,
    // warna "useSearchParams() should be wrapped in a suspense boundary" error aayega.
    return (
        <Suspense fallback={null}>
            <ResetPasswordPage />
        </Suspense>
    );
}