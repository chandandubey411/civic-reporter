const Issue = require('../model/Issue');
const User = require('../model/User');
// Create new issue

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;
    // Note: req.body fields are strings
    const imageURL = req.file ? req.file.path : null;

    // Validation
    if (!title || !description || !category || !latitude || !longitude || !imageURL)
      return res.status(400).json({ message: "All fields including image are required" });

    const location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };

    const issue = new Issue({
      title,
      description,
      category,
      imageURL,
      location,
      createdBy: req.user.userId,
    });
    await issue.save();
    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Get all issues
exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find().populate('createdBy', 'name email');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get issues by user
exports.getUserIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ createdBy: req.user.userId });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAllIssuesWithUser = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('createdBy', 'name email role') // populates user info
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Error fetching issues", error: err.toString() });
  }
};

// Update issue status or resolution (PATCH)
exports.updateIssue = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

    const updated = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Issue not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating issue", error: err.toString() });
  }
};

// Delete an issue
exports.deleteIssue = async (req, res) => {
  try {
    const deleted = await Issue.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Issue not found" });
    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting issue", error: err.toString() });
  }
};

