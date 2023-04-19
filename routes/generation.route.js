const express = require('express');
const router = express.Router();

const generationController = require('../services/generation.service');

router.delete('/real/:fecha', generationController.deleteGenerationsReal);
router.delete('/pronosticada/:fecha', generationController.deleteGenerationsForecast);
router.get('/real/', generationController.getGenerationsReal);
router.get('/real/max/', generationController.getGenerationsRealMax);
router.get('/pronosticada/', generationController.getGenerationsForecasts);

module.exports = router;
