'use strict';

var express = require('express');
var controller = require('./intercom.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/users/:index', controller.users);
router.get('/stats', controller.show);
router.get('/tagNum/:id/:index', controller.tagNum);
router.get('/tagPage/:id/:page', controller.tagPage);
//router.get('/segments', controller.segments)
// router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/', controller.update);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
