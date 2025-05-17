const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const { verifyToken } = require('../middleware/authMiddleware');

// Publiczne endpointy
router.get('/', therapistController.getAllTherapists);
router.get('/:id', therapistController.getTherapistById);

// Chronione endpointy (tylko dla admina)
router.post('/', verifyToken, therapistController.createTherapist);
router.put('/:id', verifyToken, therapistController.updateTherapist);
router.delete('/:id', verifyToken, therapistController.deleteTherapist);

module.exports = router; 