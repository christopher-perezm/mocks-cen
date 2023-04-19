const express = require('express');
const router = express.Router();

const demandController = require('../services/demand.service');

router.get('/demanda-real/v3/sum/', demandController.getRealDemands);
router.get('/demanda-real/maxima-mensual/v3/findAll/', demandController.getRealDemandsMax);
router.get('/demanda-programada/v3/sum/', demandController.getForecastDemands);
router.get('/demanda/v3/resumen/', demandController.getResumeDemands);

module.exports = router;
