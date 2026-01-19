// src/config/mailer.js
const nodemailer = require('nodemailer');

const buildTransporter = ({ host, port, user, pass } = {}) => {
  const resolvedHost = host || process.env.EMAIL_HOST;
  const resolvedPort = parseInt(port || process.env.EMAIL_PORT || '587', 10);
  const resolvedUser = user || process.env.EMAIL_USER;
  const resolvedPass = pass || process.env.EMAIL_PASS;

  return nodemailer.createTransport({
    host: resolvedHost,
    port: resolvedPort,
    secure: resolvedPort === 465,
    auth: {
      user: resolvedUser,
      pass: resolvedPass,
    },
  });
};

module.exports = { buildTransporter };
