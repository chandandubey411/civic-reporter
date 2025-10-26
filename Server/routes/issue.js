const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const { createIssue, getIssues, getUserIssues } = require('../controller/issueController');

// Storage config - store file in 'uploads/' folder locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route: note `upload.single('image')` middleware before controller
router.post('/', auth, upload.single('image'), createIssue);
router.get('/', getIssues);
router.get('/my', auth, getUserIssues);

module.exports = router;
