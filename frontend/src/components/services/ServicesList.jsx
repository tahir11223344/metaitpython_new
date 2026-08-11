import { getPublicServices } from "@/lib/serviceApi";
import ServiceCard from "./ServiceCard";

/**
 * Server component — data server par fetch hoti hai, is liye services HTML me
 * hi aa jati hain (SEO ke liye zaroori). "use client" yahan NAHI hai.
 *
 * @param services  Optional. Parent already fetch kar chuka ho to pass kar dein.
 * @param error     Optional. Parent ki fetch fail hui ho to uska message.
 */
export default async function ServicesList({ services = null, error = null }) {
  let items = services;
  let failure = error;

  if (!items) {
    try {
      const data = await getPublicServices();
      items = data.items || [];
    } catch (err) {
      failure = err.message;
      items = [];
    }
  }

  if (failure) {
    console.error("[ServicesList] Failed to load services:", failure);
  }

  if (!items.length) {
    // Production me section chup chaap hat jata hai — visitor ko toota page na dikhe.
    if (process.env.NODE_ENV === "production") return null;

    // Development me chup rehna sirf debugging ka waqt zaya karta hai.
    return (
      <section className="py-8 px-6 max-w-[1320px] mx-auto">
        <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">
            ServicesList rendered nothing (dev-only message)
          </p>
          <p className="mt-1 text-sm text-amber-800">
            {failure ? `API call failed: ${failure}` : "API returned 0 services."}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">
            <li>
              Test the endpoint directly:{" "}
              <code className="rounded bg-amber-100 px-1">
                curl http://localhost:8000/public/services
              </code>
            </li>
            <li>404 — router not registered in main.py</li>
            <li>500 — services table missing (model not imported / no migration)</li>
            <li>
              <code className="rounded bg-amber-100 px-1">
                {'{"items":[],"total":0}'}
              </code>{" "}
              — no services yet, or all saved with Active = No
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6 max-w-[1320px] mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
          Outthinking The Digital Jungle: Sharper Insights For Real Growth
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Marketing instincts are knowing that hesitation gets you hunted. Meta IT works
          with the same confident intention to help you harness b2b digital transformation
          strategies.
        </p>
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        {items.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </section>
  );
}