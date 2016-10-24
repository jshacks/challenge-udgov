var router = require('express').Router();

var _datasets = require('./datasets.js');
var _document = require('./document.js');

router.get('/datasets', _datasets.getList);
router.get('/package/:package_id/resource/:resource_id', _document.getData);

module.exports = router;
