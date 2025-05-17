const { Therapist, Tag } = require('../models');

// Pobierz wszystkich terapeutów
exports.getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.findAll({
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapists', error: error.message });
  }
};

// Pobierz pojedynczego terapeutę
exports.getTherapistById = async (req, res) => {
  try {
    const therapist = await Therapist.findByPk(req.params.id, {
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }
    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching therapist', error: error.message });
  }
};

// Utwórz nowego terapeutę
exports.createTherapist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, description, tags } = req.body;
    
    // Walidacja tylko wymaganych pól
    if (!firstName || !lastName || !specialization) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          firstName: !firstName ? 'First name is required' : null,
          lastName: !lastName ? 'Last name is required' : null,
          specialization: !specialization ? 'Specialization is required' : null
        }
      });
    }

    const therapist = await Therapist.create({
      firstName,
      lastName,
      specialization,
      description
    });

    // Tagi są opcjonalne - dodaj tylko jeśli zostały przekazane
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await therapist.setTags(tags);
    }

    const createdTherapist = await Therapist.findByPk(therapist.id, {
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });

    res.status(201).json(createdTherapist);
  } catch (error) {
    res.status(500).json({ message: 'Error creating therapist', error: error.message });
  }
};

// Aktualizuj terapeutę
exports.updateTherapist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, description, tags } = req.body;
    const therapist = await Therapist.findByPk(req.params.id);

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    // Walidacja tylko wymaganych pól
    if (!firstName || !lastName || !specialization) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: {
          firstName: !firstName ? 'First name is required' : null,
          lastName: !lastName ? 'Last name is required' : null,
          specialization: !specialization ? 'Specialization is required' : null
        }
      });
    }

    await therapist.update({
      firstName,
      lastName,
      specialization,
      description
    });

    // Tagi są opcjonalne - aktualizuj tylko jeśli zostały przekazane
    if (tags !== undefined) {
      await therapist.setTags(tags || []);
    }

    const updatedTherapist = await Therapist.findByPk(therapist.id, {
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });

    res.json(updatedTherapist);
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