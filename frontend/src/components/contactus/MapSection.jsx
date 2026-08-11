export default function MapSection() {
  return (
    <section className="  bg-gray-50">
      <div className="w-full mx-auto">
        {/* <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Visit Our Office
        </h2> */}

        <div className="w-full h-[450px] pb-4 overflow-hidden shadow-lg border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d924247.1421842298!2d66.49600131631568!3d25.191740591840343!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9cf92f44555a0c23!2sKarachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1783603538069!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Office Location"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
