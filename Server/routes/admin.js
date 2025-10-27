const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const {
  getAllIssuesWithUser,
  updateIssue,
  deleteIssue
} = require('../controller/issueController');

router.get('/', auth, adminOnly, getAllIssuesWithUser); // List all issues with user info
router.patch('/:id', auth, adminOnly, updateIssue);     // Update issue (status, comments)
router.delete('/:id', auth, adminOnly, deleteIssue);    // Delete issue

module.exports = router;
