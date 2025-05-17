const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

module.exports = {
  JWT_SECRET,
  ADMIN_USERNAME,
  ADMIN_PASSWORD
};
