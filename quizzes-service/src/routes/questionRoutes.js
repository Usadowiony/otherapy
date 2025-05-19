const express = require('express');
const router = express.Router();

// Wszystkie endpointy do pytań są wyłączone w modelu draft-centric
router.all('*', (req, res) => {
  res.status(410).json({ error: 'Obsługa pytań quizu została przeniesiona do wersji roboczych (draftów).' });
});

module.exports = router;