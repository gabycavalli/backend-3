const adoptionModel = require('./adoption.model');

const getAll = async (req, res) => {
  try {
    const adoptions = await adoptionModel.find();
    return res.status(200).json(adoptions);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  const { name, species } = req.body;

  if (species !== 'perro' && species !== 'gato') {
    return res.status(400).json({ error: 'Solo se permiten perros y gatos' });
  }

  try {
    const newPet = await adoptionModel.create({ name, species });
    return res.status(201).json(newPet);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const pet = await adoptionModel.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    return res.status(200).json(pet);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, create, getById };
