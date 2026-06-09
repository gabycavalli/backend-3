const adoptionModel = {
  find: async () => [],
  create: async (data) => ({ id: Date.now().toString(), ...data }),
  findById: async () => null,
};

module.exports = adoptionModel;
