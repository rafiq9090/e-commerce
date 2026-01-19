import { useEffect, useState } from 'react';
import { getAllContent } from '../../api/contentApi';

const PolicyPage = ({ titleKey, bodyKey, defaultTitle, defaultBody }) => {
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
        console.error('Failed to load policy content', error);
      }
    };
    fetchContent();
  }, []);

  const title = contentMap[titleKey] || defaultTitle;
  const body = contentMap[bodyKey] || defaultBody;
  const paragraphs = body.split('\n\n');

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto bg-white border border-slate-100 shadow-sm rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">{title}</h1>
          <div className="space-y-4 text-slate-700 leading-relaxed">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
