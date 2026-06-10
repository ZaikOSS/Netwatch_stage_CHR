const http = require('http');

const data = JSON.stringify({ x: 10, y: 20 });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/devices/1/position',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // We don't have a token, but let's see if we get 401 or 404
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', console.error);
req.write(data);
req.end();
