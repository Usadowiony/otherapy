const { Tag, Therapist } = require('../models');

// Pobierz wszystkie tagi
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
};

// Utwórz nowy tag
exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error creating tag', error: error.message });
  }
};

// Aktualizuj tag
exports.updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.findByPk(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await tag.update({ name });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tag', error: error.message });
  }
};

// Usuń tag
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Sprawdź, czy tag jest używany przez terapeutów
    const therapists = await tag.getTherapists();
    if (therapists.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tag that is in use',
        therapists: therapists.map(t => ({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName
        }))
      });
    }

    await tag.destroy();
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tag', error: error.message });
  }
};

// Usuń powiązania tagu z wszystkimi terapeutami (kaskadowo)
exports.removeTagFromAllTherapists = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    // Usuń wszystkie powiązania tagu z terapeutami
    await tag.setTherapists([]);
    res.json({ message: 'Tag removed from all therapists' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing tag from therapists', error: error.message });
  }
};

// Sprawdź terapeutów używających tagu
exports.getTherapistsUsingTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: [{
        model: Therapist,
        attributes: ['id', 'firstName', 'lastName'],
        through: { attributes: [] } // Nie pobieramy atrybutów z tabeli łączącej
      }]
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Używamy getTherapists() zamiast bezpośredniego dostępu do Therapists
    const therapists = await tag.getTherapists({
      attributes: ['id', 'firstName', 'lastName']
    });

    res.json(therapists);
  } catch (error) {
    console.error('Error in getTherapistsUsingTag:', error);
    res.status(500).json({ message: 'Error fetching therapists using tag', error: error.message });
  }
};

// Inicjalizacja przykładowych tagów
exports.initTags = async (req, res) => {
  try {
    const sampleTags = [
      { name: 'Depresja' },
      { name: 'Lęki' },
      { name: 'Stres' },
      { name: 'Relacje' },
      { name: 'Trauma' }
    ];

    for (const tag of sampleTags) {
      await Tag.findOrCreate({
        where: { name: tag.name }
      });
    }

    const tags = await Tag.findAll();
    res.json({ message: 'Tags initialized successfully', tags });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing tags', error: error.message });
  }
};