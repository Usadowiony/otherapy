const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { verifyToken } = require('../middleware/authMiddleware');

// Publiczne endpointy
router.get('/', tagController.getAllTags);
router.get('/:id/therapists', tagController.getTherapistsUsingTag);
router.post('/init', tagController.initTags);

// Chronione endpointy (tylko dla admina)
router.post('/', verifyToken, tagController.createTag);
router.put('/:id', verifyToken, tagController.updateTag);
router.delete('/:id', verifyToken, tagController.deleteTag);
// Kaskadowe usuwanie powiązań tagu z terapeutami
router.delete('/:id/remove-from-therapists', verifyToken, tagController.removeTagFromAllTherapists);

module.exports = router;