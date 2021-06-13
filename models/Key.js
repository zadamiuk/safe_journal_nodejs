const mongoose = require('mongoose');

const KeySchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
      },
      iv: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      user: {
        type: String,
        required: true
      }
});


const Key = mongoose.model('Key', KeySchema)

module.exports = Key;