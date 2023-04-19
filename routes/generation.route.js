const express = require('express');
const router = express.Router();

const generationController = require('../services/generation.service');

router.delete('/generacion-real/:fecha', generationController.deleteGenerationsReal);
router.delete('/generacion-programada/:fecha', generationController.deleteGenerationsForecast);
router.get('/generacion-real/v3/sum/', generationController.getGenerationsReal);
router.get('/generacion-real/maxima-mensual/v3/findAll/', generationController.getGenerationsRealMax);
router.get('/generacion-programada/v3/sum/', generationController.getGenerationsForecasts);
router.get('/generacion/v3/resumen/', generationController.getResumeGeneration);

module.exports = router;
