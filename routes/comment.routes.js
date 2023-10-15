const express = require('express');
const router = express.Router();
const Comment = require('../models/comments.model');

// Async middleware to catch errors and forward to the error handling middleware
const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all comments for a specific post
router.get('/post/:postId', asyncMiddleware(async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comment.findAll({
    where: { PostID: postId },
  });
  res.json(comments);
}));

// POST a new comment for a specific post
router.post('/post/:postId/user/:userId', asyncMiddleware(async (req, res) => {
  const { Comment: commentText } = req.body;
  const postId = req.params.postId;
  const userId = req.params.userId;
  const newComment = await Comment.create({
    PostID: postId,
    UserID: userId,
    Comment: commentText,
  });
  res.json(newComment);
}));

// PUT (update) a comment by CommentID
router.put('/:commentId', asyncMiddleware(async (req, res) => {
  const { Comment: commentText } = req.body;
  const commentId = req.params.commentId;
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  comment.Comment = commentText;
  await comment.save();
  res.json({ message: 'Comment updated successfully' });
}));

// DELETE a comment by CommentID
router.delete('/:commentId', asyncMiddleware(async (req, res) => {
  const commentId = req.params.commentId;
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  await comment.destroy();
  res.json({ message: 'Comment deleted successfully' });
}));

module.exports = router;
