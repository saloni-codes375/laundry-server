const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const MAX_BODY_SIZE = 10 * 1024;
const ROOT_DIRECTORY = __dirname;

const pageRoutes = {
  '/home': path.join(ROOT_DIRECTORY, 'pages', 'home.html'),
  '/about': path.join(ROOT_DIRECTORY, 'pages', 'about.html'),
  '/contact': path.join(ROOT_DIRECTORY, 'pages', 'contact.html'),
  '/style.css': path.join(ROOT_DIRECTORY, 'public', 'style.css'),
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(html);
}

function sendFile(response, filePath, statusCode = 200, transform) {
  fs.readFile(filePath, 'utf8', (error, contents) => {
    if (response.writableEnded) {
      return;
    }

    if (error) {
      console.error(`Could not read ${filePath}:`, error.message);
      sendHtml(response, 500, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Server error</title><h1>Sorry, something went wrong.</h1><p>Please try again later.</p></html>');
      return;
    }

    const body = transform ? transform(contents) : contents;
    response.writeHead(statusCode, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(body);
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const escapedCharacters = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapedCharacters[character];
  });
}

function handleFormSubmission(request, response) {
  let body = '';
  let bodySize = 0;
  let responseSent = false;

  request.on('data', (chunk) => {
    if (responseSent) {
      return;
    }

    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      responseSent = true;
      sendHtml(response, 413, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Request too large</title><h1>Your message is too large</h1><p>Please shorten it and try again.</p><p><a href="/contact">Return to the contact page</a></p></html>');
      request.resume();
      return;
    }

    body += chunk.toString('utf8');
  });

  request.on('end', () => {
    if (responseSent) {
      return;
    }

    const formData = new URLSearchParams(body);
    const name = (formData.get('name') || '').trim();
    const email = (formData.get('email') || '').trim();
    const message = (formData.get('message') || '').trim();

    if (!name || !email || !message || !/^\S+@\S+\.\S+$/.test(email)) {
      responseSent = true;
      sendHtml(response, 400, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Check your message</title><h1>Please check your contact form</h1><p>Enter your name, a valid email address, and a message.</p><p><a href="/contact">Return to the contact page</a></p></html>');
      return;
    }

    responseSent = true;
    sendFile(response, path.join(ROOT_DIRECTORY, 'pages', 'success.html'), 200, (html) =>
      html.replace('{{NAME}}', escapeHtml(name))
    );
  });

  request.on('error', (error) => {
    if (!responseSent && !response.writableEnded) {
      responseSent = true;
      console.error('Error while receiving a form submission:', error.message);
      sendHtml(response, 400, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Request error</title><h1>We could not read your message</h1><p>Please return to the contact page and try again.</p><p><a href="/contact">Contact us</a></p></html>');
    }
  });
}

const server = http.createServer((request, response) => {
  let requestUrl;
  try {
    requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  } catch {
    sendHtml(response, 400, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Bad request</title><h1>Invalid request</h1></html>');
    return;
  }

  const route = requestUrl.pathname;

  if (request.method === 'POST' && route === '/submit') {
    handleFormSubmission(request, response);
    return;
  }

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET, POST');
    sendHtml(response, 405, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Method not allowed</title><h1>Method not allowed</h1><p>This server does not support that request method.</p></html>');
    return;
  }

  if (route === '/submit') {
    response.setHeader('Allow', 'POST');
    sendHtml(response, 405, '<!doctype html><html lang="en"><meta charset="utf-8"><title>Method not allowed</title><h1>Use the contact form to send a message</h1><p><a href="/contact">Go to the contact page</a></p></html>');
    return;
  }

  if (route === '/') {
    response.writeHead(302, { Location: '/home' });
    response.end();
    return;
  }

  if (pageRoutes[route]) {
    sendFile(response, pageRoutes[route]);
    return;
  }

  sendFile(response, path.join(ROOT_DIRECTORY, 'pages', '404.html'), 404);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Laundry Care server is running at http://localhost:${PORT}`);
});
