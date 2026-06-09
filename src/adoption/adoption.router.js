const express = require('express');
const adoptionController = require('./adoption.controller');

const router = express.Router();

router.get('/', adoptionController.getAll);
router.post('/', adoptionController.create);
router.get('/:id', adoptionController.getById);

module.exports = router;
