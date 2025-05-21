const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { verifyToken } = require('../middleware/authMiddleware');

// Publiczne endpointy
router.get('/', therapistController.getAllTherapists);
router.get('/:id', therapistController.getTherapistById);

// Pobierz wszystkich terapeutów używających danego tagu
router.get('/tags/:tagId/usage', async (req, res) => {
  try {
    const tagId = parseInt(req.params.tagId, 10);
    const { Therapist, TherapistTag } = require('../models');
    const therapistTags = await TherapistTag.findAll({ where: { TagId: tagId } });
    if (!therapistTags.length) return res.json([]);
    const therapistIds = therapistTags.map(tt => tt.TherapistId);
    const therapists = await Therapist.findAll({ where: { id: therapistIds } });
    // Zwróć tylko potrzebne dane (np. imię, nazwisko, id)
    res.json(therapists.map(t => ({ id: t.id, firstName: t.firstName, lastName: t.lastName })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chronione endpointy (tylko dla admina)
router.post('/', verifyToken, therapistController.createTherapist);
router.put('/:id', verifyToken, therapistController.updateTherapist);
router.delete('/:id', verifyToken, therapistController.deleteTherapist);

module.exports = router;