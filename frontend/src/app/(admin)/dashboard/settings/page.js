// src/app/(admin)/dashboard/settings/page.js

import SettingsPage from "@/components/admin/Settingspage";

export const metadata = {
    title: "Settings | Meta IT Admin",
    robots: { index: false, follow: false },
};

export default function Page() {
    return <SettingsPage />;
}