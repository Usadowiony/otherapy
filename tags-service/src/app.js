const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const tagRoutes = require('./routes/tagRoutes');

const app = express();
app.use(bodyParser.json());
app.use(tagRoutes);

const PORT = process.env.PORT || 4003;
(async () => {
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Tags service running on port ${PORT}`);
  });
})();