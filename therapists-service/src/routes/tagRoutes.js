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

module.exports = router; 