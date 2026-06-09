const express = require('express');
const adoptionRouter = require('./adoption/adoption.router');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use('/api/adoptions', adoptionRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

module.exports = app;
