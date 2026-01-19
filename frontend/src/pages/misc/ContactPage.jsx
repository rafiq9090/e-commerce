import { useEffect, useState } from 'react';
import { getAllContent } from '../../api/contentApi';

const ContactPage = () => {
  const [contentMap, setContentMap] = useState({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getAllContent();
        const data = res.data || res;
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(item => { map[item.key] = item.value; });
          setContentMap(map);
        } else if (data && typeof data === 'object') {
          setContentMap(data);
        }
      } catch (error) {
        console.error('Failed to load contact content', error);
      }
    };
    fetchContent();
  }, []);

  const title = contentMap.contact_us_title || 'Contact Us';
  const body = contentMap.contact_us_body || 'Have a question or need help with an order? Reach out anytime and our support team will respond within 24 hours.';

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">{body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Contact Info</h2>
              <div className="space-y-3 text-slate-700">
                <p><span className="font-semibold">Email:</span> {contentMap.contact_email || 'support@deshshera.com'}</p>
                <p><span className="font-semibold">Phone:</span> {contentMap.contact_phone || '+880 1234-567890'}</p>
                <p className="whitespace-pre-line"><span className="font-semibold">Address:</span> {contentMap.contact_address || '123 Shopping Street,\nDhaka 1205, Bangladesh'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-500">
                We usually respond within 24 hours. For urgent issues, please call us directly.
              </div>
            </div>

            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Send a Message</h2>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <textarea
                  rows="5"
                  placeholder="Your message"
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
              <p className="text-xs text-slate-400 mt-3">This demo form does not send emails yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
