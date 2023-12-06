const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({

follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
