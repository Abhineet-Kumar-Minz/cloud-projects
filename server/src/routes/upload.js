const router = require('express').Router();
const upload = require('../config/s3');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, upload.single('file'), (req, res) => {
  res.json({ url: req.file.location });
});

module.exports = router;