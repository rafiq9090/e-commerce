const http = require('http');
const https = require('https');

const requestJson = (url, { method = 'GET', headers = {}, body } = {}) => (
  new Promise((resolve, reject) => {
    try {
      const target = new URL(url);
      const transport = target.protocol === 'https:' ? https : http;
      const options = {
        method,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        headers,
      };

      const req = transport.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const contentType = res.headers['content-type'] || '';
          let parsed = data;
          if (contentType.includes('application/json')) {
            try {
              parsed = data ? JSON.parse(data) : {};
            } catch (err) {
              parsed = data;
            }
          } else if (typeof data === 'string') {
            const trimmed = data.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || trimmed.startsWith('[')) {
              try {
                parsed = JSON.parse(trimmed);
              } catch (err) {
                parsed = data;
              }
            }
          }
          resolve({ status: res.statusCode || 0, headers: res.headers, data: parsed });
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(body);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  })
);

module.exports = { requestJson };
