const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { adminAuth } = require('../middleware/authMiddleware');

// GET /api/tags - lista tagów
router.get('/api/tags', async (req, res) => {
  const tags = await Tag.findAll({ order: [['name', 'ASC']] });
  res.json(tags);
});

// GET /api/tags/:tagId - szczegóły tagu
router.get('/api/tags/:tagId', async (req, res) => {
  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  res.json(tag);
});

// POST /api/admin/tags - dodaj tag (admin)
router.post('/api/admin/tags', adminAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Pole name jest wymagane' });
  try {
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: 'Tag musi być unikalny' });
  }
});

// PUT /api/admin/tags/:tagId - edytuj tag (admin)
router.put('/api/admin/tags/:tagId', adminAuth, async (req, res) => {
  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Pole name jest wymagane' });
  try {
    tag.name = name;
    await tag.save();
    res.json(tag);
  } catch (err) {
    res.status(400).json({ error: 'Tag musi być unikalny' });
  }
});

// Wyłączony endpoint usuwania tagu
// router.delete('/api/admin/tags/:tagId', adminAuth, async (req, res) => {
//   const tag = await Tag.findByPk(req.params.tagId);
//   if (!tag) return res.status(404).json({ error: 'Tag not found' });

//   // --- WALIDACJA: czy tag jest w użyciu? ---
//   try {
//     // Sprawdź powiązania z terapeutami
//     const therapistRes = await fetch(`${process.env.THERAPISTS_SERVICE_URL || 'http://localhost:3001'}/api/tags/${tag.id}/usage`);
//     const therapistUsage = therapistRes.ok ? await therapistRes.json() : [];
//     console.log('DEBUG: therapistUsage for tag', tag.id, ':', JSON.stringify(therapistUsage));
//     if (Array.isArray(therapistUsage) && therapistUsage.length > 0) {
//       console.log('DEBUG: Tag', tag.id, 'NIE MOŻE być usunięty, therapistUsage NIE jest puste');
//       return res.status(409).json({ error: 'Tag jest przypisany do co najmniej jednego terapeuty. Usuń powiązania przed usunięciem tagu.' });
//     }
//     // Sprawdź powiązania z quizem (pytania/odpowiedzi)
//     const quizRes = await fetch(`${process.env.QUIZZES_SERVICE_URL || 'http://localhost:3004'}/api/tags/${tag.id}/quiz-usage`);
//     const quizUsage = quizRes.ok ? await quizRes.json() : { questions: [], answers: [] };
//     console.log('DEBUG: quizUsage for tag', tag.id, ':', JSON.stringify(quizUsage));
//     if ((quizUsage.questions && quizUsage.questions.length > 0) || (quizUsage.answers && quizUsage.answers.length > 0)) {
//       console.log('DEBUG: Tag', tag.id, 'NIE MOŻE być usunięty, quizUsage NIE jest puste');
//       return res.status(409).json({ error: 'Tag jest używany w quizie (pytania lub odpowiedzi). Usuń powiązania przed usunięciem tagu.' });
//     }
//     console.log('DEBUG: Tag', tag.id, 'usage PUSTE, próbuję usunąć tag');
//   } catch (err) {
//     console.error('BŁĄD podczas sprawdzania powiązań tagu:', err);
//     return res.status(500).json({ error: 'Błąd podczas sprawdzania powiązań tagu: ' + err.message });
//   }

//   try {
//     await tag.destroy();
//     console.log('DEBUG: Tag', tag.id, 'usunięty!');
//     res.json({ success: true });
//   } catch (err) {
//     console.error('BŁĄD podczas usuwania tagu:', err);
//     res.status(500).json({ error: 'Błąd podczas usuwania tagu', details: err.message });
//   }
// });

module.exports = router;
