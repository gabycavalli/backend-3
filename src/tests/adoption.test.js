const request = require('supertest');
const app = require('../server');
const adoptionModel = require('../adoption/adoption.model');

describe('Adoption API Routes - Perros y Gatos', () => {
  let findSpy;
  let createSpy;
  let findByIdSpy;

  beforeEach(() => {
    findSpy = jest.spyOn(adoptionModel, 'find');
    createSpy = jest.spyOn(adoptionModel, 'create');
    findByIdSpy = jest.spyOn(adoptionModel, 'findById');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/adoptions', () => {
    it('Debe retornar la lista de todas las adopciones (200)', async () => {
      const mockData = [{ name: 'Firulais', species: 'perro' }];
      findSpy.mockResolvedValue(mockData);

      const response = await request(app).get('/api/adoptions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it('Debe retornar 500 si ocurre un error al obtener las adopciones', async () => {
      findSpy.mockRejectedValue(new Error('db error'));

      const response = await request(app).get('/api/adoptions');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /api/adoptions', () => {
    it('Debe crear una nueva adopción si la especie es perro o gato (201)', async () => {
      const newPet = { name: 'Mishi', species: 'gato' };
      createSpy.mockResolvedValue({ id: '123', ...newPet });

      const response = await request(app).post('/api/adoptions').send(newPet);

      expect(response.status).toBe(201);
      expect(response.body.species).toBe('gato');
      expect(createSpy).toHaveBeenCalledWith(newPet);
    });

    it('Debe retornar error de validación si la especie no es perro ni gato (400)', async () => {
      const invalidPet = { name: 'Paco', species: 'loro' };

      const response = await request(app)
        .post('/api/adoptions')
        .send(invalidPet);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Solo se permiten perros y gatos');
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('Debe retornar 500 si falla la creación de la adopción', async () => {
      const newPet = { name: 'Mora', species: 'perro' };
      createSpy.mockRejectedValue(new Error('db error'));

      const response = await request(app).post('/api/adoptions').send(newPet);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });

  describe('GET /api/adoptions/:id', () => {
    it('Debe retornar un animal específico por ID (200)', async () => {
      const mockPet = { id: '1', name: 'Rex', species: 'perro' };
      findByIdSpy.mockResolvedValue(mockPet);

      const response = await request(app).get('/api/adoptions/1');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Rex');
    });

    it('Debe retornar 404 si el animal no existe', async () => {
      findByIdSpy.mockResolvedValue(null);

      const response = await request(app).get('/api/adoptions/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Mascota no encontrada');
    });

    it('Debe retornar 500 si ocurre un error al buscar por ID', async () => {
      findByIdSpy.mockRejectedValue(new Error('db error'));

      const response = await request(app).get('/api/adoptions/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
    });
  });
});
