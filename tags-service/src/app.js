require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// CORS - pozwala na połączenia z frontendu (np. React na localhost:3000)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(tagRoutes);

const PORT = process.env.PORT || 3003;
(async () => {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Tags service running on port ${PORT}`);
  });
})();