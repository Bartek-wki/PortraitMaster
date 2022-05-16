const express = require('express');
const router = express.Router();
const requestIp = require('request-ip');

const photos = require('../controllers/photos.controller');

const ipMiddleware = function(req, res, next) {
  req.clientIp = requestIp.getClientIp(req);
  next();
};

router.get('/photos', photos.loadAll);
router.post('/photos', photos.add);
router.put('/photos/vote/:id', ipMiddleware, photos.vote);

module.exports = router;
