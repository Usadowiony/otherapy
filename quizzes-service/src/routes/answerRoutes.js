const express = require('express');
const router = express.Router();

// Wszystkie endpointy do odpowiedzi są wyłączone w modelu draft-centric
router.all('*', (req, res) => {
  res.status(410).json({ error: 'Obsługa odpowiedzi quizu została przeniesiona do wersji roboczych (draftów).' });
});

module.exports = router;
