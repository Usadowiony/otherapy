const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { verifyToken } = require('../middleware/authMiddleware');
const { TherapistTag } = require('../models');

// Usunięta obsługa tras tagów. Zarządzanie tagami odbywa się wyłącznie przez tags-service.

// TESTOWY ENDPOINT - sprawdzenie czy router działa
router.get('/test', (req, res) => {
  res.json({ ok: true });
});

// Pobierz terapeutów używających danego tagu
router.get('/tags/:tagId/usage', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId, 10);
    const { Therapist, TherapistTag } = require('../models');
    const therapistTags = await TherapistTag.findAll({ where: { TagId: tagId } });
    if (!therapistTags.length) return res.json([]);
    const therapistIds = therapistTags.map(tt => tt.TherapistId);
    const therapists = await Therapist.findAll({ where: { id: therapistIds } });
    res.json(therapists.map(t => ({ id: t.id, firstName: t.firstName, lastName: t.lastName })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wyłączony endpoint usuwania powiązań tagu z terapeutami
// router.delete('/tags/:tagId/remove-from-therapists', async (req, res) => {
//   try {
//     const tagId = parseInt(req.params.tagId, 10);
//     console.log('DEBUG: Otrzymano żądanie usunięcia powiązań tagu z terapeutami, tagId:', tagId);
//     const result = await require('../models').TherapistTag.destroy({ where: { TagId: tagId } });
//     console.log('DEBUG: Liczba usuniętych powiązań TherapistTag:', result);
//     res.json({ message: 'Powiązania tagu z terapeutami zostały usunięte.' });
//   } catch (error) {
//     console.error('BŁĄD podczas usuwania powiązań tagu z terapeutami:', error);
//     res.status(500).json({ error: 'Błąd podczas usuwania powiązań tagu z terapeutami.' });
//   }
// });

module.exports = router;