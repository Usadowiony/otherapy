const { Therapist, Tag } = require('../models');

// Pobierz wszystkich terapeutów
exports.getAllTherapists = async (req, res) => {
  try {
    console.log('Pobieranie wszystkich terapeutów...');
    const therapists = await Therapist.findAll({
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });
    console.log('Znalezieni terapeuci:', therapists.map(t => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      tags: t.Tags
    })));
    res.json(therapists);
  } catch (error) {
    console.error('Błąd podczas pobierania terapeutów:', error);
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
    
    console.log('Otrzymane dane terapeuty:', { firstName, lastName, specialization, description, tags });
    
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

    console.log('Utworzony terapeuta:', therapist.toJSON());

    // Tagi są opcjonalne - dodaj tylko jeśli zostały przekazane
    if (tags && Array.isArray(tags) && tags.length > 0) {
      console.log('Przypisywanie tagów:', tags);
      await therapist.setTags(tags);
    }

    const createdTherapist = await Therapist.findByPk(therapist.id, {
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });

    console.log('Terapeuta z tagami:', createdTherapist.toJSON());
    res.status(201).json(createdTherapist);
  } catch (error) {
    console.error('Błąd podczas tworzenia terapeuty:', error);
    res.status(500).json({ message: 'Error creating therapist', error: error.message });
  }
};

// Aktualizuj terapeutę
exports.updateTherapist = async (req, res) => {
  try {
    const { firstName, lastName, specialization, description, tags } = req.body;
    console.log('Otrzymane dane do aktualizacji:', { firstName, lastName, specialization, description, tags });
    
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

    console.log('Zaktualizowany terapeuta:', therapist.toJSON());

    // Tagi są opcjonalne - aktualizuj tylko jeśli zostały przekazane
    if (tags !== undefined) {
      console.log('Aktualizacja tagów:', tags);
      await therapist.setTags(tags || []);
    }

    const updatedTherapist = await Therapist.findByPk(therapist.id, {
      include: [{
        model: Tag,
        through: { attributes: [] }
      }]
    });

    console.log('Terapeuta po aktualizacji z tagami:', updatedTherapist.toJSON());
    res.json(updatedTherapist);
  } catch (error) {
    console.error('Błąd podczas aktualizacji terapeuty:', error);
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