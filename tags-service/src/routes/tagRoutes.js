const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { adminAuth } = require('../middleware/authMiddleware');
const fetch = require('node-fetch');

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

// DELETE /api/admin/tags/:tagId - usuń tag (admin, bez walidacji powiązań)
router.delete('/api/admin/tags/:tagId', adminAuth, async (req, res) => {
  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) return res.status(404).json({ error: 'Tag not found' });
  try {
    await tag.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania tagu', details: err.message });
  }
});

module.exports = router;
