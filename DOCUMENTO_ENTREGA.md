# Entregable Final Backend 3

## Datos de entrega

- Alumno: Gabriel Cavalli
- Curso: backend-3
- Repositorio GitHub: https://github.com/gabycavalli/backend-3.git
- Imagen DockerHub: Pendiente (sin crear)
- Web: opcional, no requerida para este entregable

## Estructura del proyecto

### Descripcion general

Este proyecto implementa una API simple de adopcion de mascotas usando Node.js y Express. El foco del entregable es validar funcionalmente todos los endpoints del router de adopciones, dockerizar la aplicacion y documentar el flujo completo de ejecucion.

### Arbol de directorios

```text
.
├── .dockerignore
├── Dockerfile
├── DOCUMENTO_ENTREGA.md
├── README.md
├── package-lock.json
├── package.json
└── src
    ├── adoption
    │   ├── adoption.controller.js
    │   ├── adoption.model.js
    │   └── adoption.router.js
    ├── server.js
    └── tests
        └── adoption.test.js
```

### Proposito de los archivos principales

- `src/server.js`: inicializa Express, monta el router `/api/adoptions` y exporta la app para poder testearla sin levantar el puerto.
- `src/adoption/adoption.router.js`: define los endpoints del modulo de adopciones.
- `src/adoption/adoption.controller.js`: contiene la logica de negocio y el manejo de errores HTTP.
- `src/adoption/adoption.model.js`: fake de persistencia para aislar dependencias externas.
- `src/tests/adoption.test.js`: suite funcional con `jest` y `supertest`.
- `Dockerfile`: define la imagen de produccion de la API.
- `.dockerignore`: evita enviar archivos innecesarios al contexto de build.
- `README.md`: documentacion operativa del proyecto.

## Tests funcionales

### Explicacion general

Los tests funcionales cubren todos los endpoints de `adoption.router.js` y validan:

- respuestas exitosas
- errores de validacion
- recursos inexistentes
- errores internos del servidor

Para aislar dependencias externas se uso `jest.spyOn()` sobre el modelo `adoption.model.js`, simulando respuestas exitosas y fallidas sin requerir base de datos real.

### Codigo completo de los tests

```js
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
```

### Que valida cada grupo de tests

- `GET /api/adoptions`: valida listado correcto y manejo de error interno.
- `POST /api/adoptions`: valida alta exitosa, validacion de negocio y error interno.
- `GET /api/adoptions/:id`: valida busqueda exitosa, inexistencia del recurso y error interno.

### Evidencia de ejecucion de tests

```text
PASS src/tests/adoption.test.js
  Adoption API Routes - Perros y Gatos
    GET /api/adoptions
      ✓ Debe retornar la lista de todas las adopciones (200)
      ✓ Debe retornar 500 si ocurre un error al obtener las adopciones
    POST /api/adoptions
      ✓ Debe crear una nueva adopcion si la especie es perro o gato (201)
      ✓ Debe retornar error de validacion si la especie no es perro ni gato (400)
      ✓ Debe retornar 500 si falla la creacion de la adopcion
    GET /api/adoptions/:id
      ✓ Debe retornar un animal especifico por ID (200)
      ✓ Debe retornar 404 si el animal no existe
      ✓ Debe retornar 500 si ocurre un error al buscar por ID

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### Cobertura validada

```text
src/adoption/adoption.controller.js
Statements: 100%
Branches:   100%
Functions:  100%
Lines:      100%
```

## Dockerizacion

### Dockerfile completo

```dockerfile
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["node", "src/server.js"]
```

### Decisiones de optimizacion

- Se usa `node:20-alpine` para reducir el tamaño de la imagen.
- Se usa `npm ci --omit=dev` para instalaciones reproducibles y solo con dependencias de produccion.
- Se limpia la cache de npm para reducir peso final.
- Se ejecuta la app con un usuario no root para mejorar seguridad.
- Se copia solo el codigo necesario (`src` y `package*.json`).

### Log de construccion de la imagen

Pegar aqui el log cuando lo ejecutes en tu maquina con Docker:

```bash
docker build -t TU_USUARIO/adopcion-api:1.0.0 .
```

```text
PEGAR AQUI EL OUTPUT REAL DE docker build
```

## Imagen Docker

### Nombre y tag sugeridos

- Imagen local: `adopcion-api:1.0.0`
- Imagen remota: `TU_USUARIO/adopcion-api:1.0.0`

### Evidencia de imagen construida correctamente

```text
PEGAR AQUI EL OUTPUT REAL DE docker images | findstr adopcion-api
```

### Evidencia de ejecucion del contenedor

Ejecutar:

```bash
docker run --rm -p 8080:8080 TU_USUARIO/adopcion-api:1.0.0
```

Luego probar en otra terminal:

```bash
curl http://localhost:8080/api/adoptions
```

Pegar aqui la evidencia real:

```text
PEGAR AQUI EL LOG DE INICIO DEL CONTENEDOR
PEGAR AQUI LA RESPUESTA DEL ENDPOINT
```

## Ejecucion del proyecto

### Instalar dependencias

```bash
npm install
```

### Correr los tests

```bash
npm test
```

### Construir la imagen Docker

```bash
docker build -t TU_USUARIO/adopcion-api:1.0.0 .
```

### Ejecutar el contenedor

```bash
docker run --rm -p 8080:8080 TU_USUARIO/adopcion-api:1.0.0
```

### Subir la imagen a DockerHub

```bash
docker login
docker tag adopcion-api:1.0.0 TU_USUARIO/adopcion-api:1.0.0
docker push TU_USUARIO/adopcion-api:1.0.0
```

### Escaneo basico de seguridad

```bash
docker scout quickview TU_USUARIO/adopcion-api:1.0.0
```

### Evidencia de ejecucion exitosa

```text
PEGAR AQUI EL OUTPUT DE npm test
PEGAR AQUI EL OUTPUT DE docker build
PEGAR AQUI EL OUTPUT DE docker run
```

## README

### Contenido completo del README actualizado

`````md
# Adopcion API

API simple de adopcion de mascotas con endpoints para listar, crear y consultar adopciones de perros y gatos.

## Estructura del proyecto

```text
.
├── Dockerfile
├── README.md
├── package-lock.json
├── package.json
└── src
    ├── adoption
    │   ├── adoption.controller.js
    │   ├── adoption.model.js
    │   └── adoption.router.js
    ├── server.js
    └── tests
        └── adoption.test.js
```

### Archivos principales

- `src/server.js`: crea la app de Express, monta el router y exporta la app para testing.
- `src/adoption/adoption.router.js`: define los endpoints `GET /`, `POST /` y `GET /:id`.
- `src/adoption/adoption.controller.js`: contiene la logica de negocio y manejo de errores.
- `src/adoption/adoption.model.js`: fake de acceso a datos para aislar la persistencia real.
- `src/tests/adoption.test.js`: tests funcionales con `supertest` y `jest.spyOn`.
- `Dockerfile`: imagen de produccion basada en `node:20-alpine`.

## Endpoints

- `GET /api/adoptions`: lista todas las adopciones.
- `POST /api/adoptions`: crea una adopcion de `perro` o `gato`.
- `GET /api/adoptions/:id`: obtiene una adopcion por id.

## Tests funcionales

La suite cubre todos los endpoints del router con casos de:

- exito
- validacion de negocio
- recurso inexistente
- error interno del servidor

### Casos cubiertos

- `GET /api/adoptions` devuelve `200` con la lista.
- `GET /api/adoptions` devuelve `500` si falla el modelo.
- `POST /api/adoptions` devuelve `201` al crear una mascota valida.
- `POST /api/adoptions` devuelve `400` si la especie no es `perro` ni `gato`.
- `POST /api/adoptions` devuelve `500` si falla la creacion.
- `GET /api/adoptions/:id` devuelve `200` si existe la mascota.
- `GET /api/adoptions/:id` devuelve `404` si no existe.
- `GET /api/adoptions/:id` devuelve `500` si falla la consulta.

### Ejecutar tests

```bash
npm install
npm test
```

### Evidencia de ejecucion

```text
PASS src/tests/adoption.test.js
  Adoption API Routes - Perros y Gatos
    GET /api/adoptions
      ✓ Debe retornar la lista de todas las adopciones (200)
      ✓ Debe retornar 500 si ocurre un error al obtener las adopciones
    POST /api/adoptions
      ✓ Debe crear una nueva adopcion si la especie es perro o gato (201)
      ✓ Debe retornar error de validacion si la especie no es perro ni gato (400)
      ✓ Debe retornar 500 si falla la creacion de la adopcion
    GET /api/adoptions/:id
      ✓ Debe retornar un animal especifico por ID (200)
      ✓ Debe retornar 404 si el animal no existe
      ✓ Debe retornar 500 si ocurre un error al buscar por ID

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

## Dockerizacion

### Dockerfile

El contenedor usa:

- `node:20-alpine` como imagen base para reducir tamano.
- `npm ci --omit=dev` para instalar dependencias de produccion de forma determinista.
- usuario no root para mejorar seguridad.
- una sola etapa porque la app solo necesita dependencias runtime y codigo fuente simple.

### Construir la imagen

```bash
docker build -t adopcion-api:1.0.0 .
```

### Ejecutar el contenedor

```bash
docker run --rm -p 8080:8080 adopcion-api:1.0.0
```

Luego probar:

```bash
curl http://localhost:8080/api/adoptions
```

## DockerHub

Completar con tus datos al subir la imagen:

- repositorio sugerido: `TU_USUARIO/adopcion-api`
- tag sugerido: `1.0.0`

Comandos:

```bash
docker tag adopcion-api:1.0.0 TU_USUARIO/adopcion-api:1.0.0
docker push TU_USUARIO/adopcion-api:1.0.0
```

Escaneo basico sugerido:

```bash
docker scout quickview TU_USUARIO/adopcion-api:1.0.0
```

## Notas de validacion

- Los tests funcionales fueron validados localmente en este workspace.
- No fue posible validar `docker build` ni la ejecucion del contenedor desde este entorno porque la CLI de Docker no esta instalada.
- La URL publica de DockerHub y la URL del repositorio deben completarse cuando hagas la subida real.
`````

## Enlaces finales a completar

- Repositorio GitHub: `https://github.com/TU_USUARIO/TU_REPO`
- Imagen DockerHub: `https://hub.docker.com/r/TU_USUARIO/adopcion-api`

## Pasos para obtener las URLs publicas

### Publicar el repositorio en GitHub

Si todavia no subiste este proyecto a GitHub, podes hacerlo con estos comandos:

```bash
git init
git add .
git commit -m "Entrega final backend 3"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Cuando el push termine, la URL publica del repositorio va a quedar con este formato:

```text
https://github.com/TU_USUARIO/TU_REPO
```

### Publicar la imagen en DockerHub

Despues de instalar Docker Desktop y crear tu repositorio en DockerHub, ejecutar:

```bash
docker build -t adopcion-api:1.0.0 .
docker login
docker tag adopcion-api:1.0.0 TU_USUARIO/adopcion-api:1.0.0
docker push TU_USUARIO/adopcion-api:1.0.0
```

La URL publica de la imagen va a quedar con este formato:

```text
https://hub.docker.com/r/TU_USUARIO/adopcion-api
```

### Como deberia verse la entrega final

```text
Alumno: TU_NOMBRE
Curso: TU_CURSO
Repositorio GitHub: https://github.com/TU_USUARIO/TU_REPO
Imagen DockerHub: https://hub.docker.com/r/TU_USUARIO/adopcion-api
```

## Teoria

### Introduccion

En este entregable se integran pruebas funcionales, validacion de endpoints, dockerizacion y documentacion tecnica. El objetivo es demostrar una practica de trabajo cercana a un flujo profesional de backend, asegurando calidad mediante tests y una forma estandarizada de despliegue mediante Docker.

### Diseño y ejecucion de tests funcionales

Los tests funcionales validan el comportamiento observable de la API. En este caso, cada endpoint del router `adoption.router.js` fue probado en escenarios de exito, error de negocio y error interno. Para mantener el aislamiento del entorno se usaron mocks parciales del modelo mediante `jest.spyOn()`, evitando dependencias externas y permitiendo reproducibilidad.

### Conclusiones

El proyecto queda preparado para ser evaluado con una suite funcional completa, un Dockerfile reproducible y documentacion suficiente para su ejecucion. Solo resta completar los enlaces publicos y pegar los logs reales generados al construir y publicar la imagen en Docker.
```
