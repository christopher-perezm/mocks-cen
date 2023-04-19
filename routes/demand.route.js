const express = require('express');
const router = express.Router();

const demandController = require('../services/demand.service');

router.get('/real/', demandController.getRealDemands);
router.get('/real/max/', demandController.getRealDemandsMax);
router.get('/pronosticada/', demandController.getForecastDemands);

module.exports = router;
