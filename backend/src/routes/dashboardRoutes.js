const router = require('express').Router();
const auth = require('../middleware/auth');
const { summary } = require('../controllers/dashboardController');
router.get('/summary', auth, summary);
module.exports = router;
