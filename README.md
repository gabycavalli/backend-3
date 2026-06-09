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
