const { Therapist, TherapistTag } = require('../models');
const { Op } = require('sequelize');

// Pobierz wszystkich terapeutów
exports.getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.findAll();
    // Pobierz powiązane tagi (ID) dla każdego terapeuty
    const therapistIds = therapists.map(t => t.id);
    const tags = await TherapistTag.findAll({ where: { TherapistId: { [Op.in]: therapistIds } } });
    const tagsByTherapist = {};
    tags.forEach(row => {
      if (!tagsByTherapist[row.TherapistId]) tagsByTherapist[row.TherapistId] = [];
      tagsByTherapist[row.TherapistId].push(row.TagId);
    });
    const result = therapists.map(t => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      specialization: t.specialization,
      description: t.description,
      tagIds: tagsByTherapist[t.id] || []
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapists', error: error.message });
  }
};

// Pobierz pojedynczego terapeutę
exports.getTherapistById = async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    const tags = await TherapistTag.findAll({ where: { TherapistId: therapist.id } });
    const tagIds = tags.map(row => row.TagId);
    res.json({
      id: therapist.id,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      specialization: therapist.specialization,
      description: therapist.description,
      tagIds
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapist', error: error.message });
  }
};

// Utwórz nowego terapeutę
exports.createTherapist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, description, tagIds } = req.body;
    if (!firstName || !lastName || !specialization) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const therapist = await Therapist.create({ firstName, lastName, specialization, description });
    // Przypisz tagi (ID) jeśli podano
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      await Promise.all(tagIds.map(tagId => TherapistTag.create({ TherapistId: therapist.id, TagId: tagId })));
    }
    res.status(201).json({
      id: therapist.id,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      specialization: therapist.specialization,
      description: therapist.description,
      tagIds: tagIds || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating therapist', error: error.message });
  }
};

// Aktualizuj terapeutę
exports.updateTherapist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, description, tagIds } = req.body;
    const therapist = await Therapist.findByPk(req.params.id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    await therapist.update({ firstName, lastName, specialization, description });
    // Zaktualizuj tagi (ID)
    if (Array.isArray(tagIds)) {
      await TherapistTag.destroy({ where: { TherapistId: therapist.id } });
      await Promise.all(tagIds.map(tagId => TherapistTag.create({ TherapistId: therapist.id, TagId: tagId })));
    }
    res.json({
      id: therapist.id,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      specialization: therapist.specialization,
      description: therapist.description,
      tagIds: tagIds || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating therapist', error: error.message });
  }
};

// Usuń terapeutę
exports.deleteTherapist = async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id);
    
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    await therapist.destroy();
    res.json({ message: 'Therapist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting therapist', error: error.message });
  }
};