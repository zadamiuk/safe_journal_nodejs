const mongoose = require('mongoose');

const Key = new mongoose.Schema({
    value: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      user: {
        type: String,
        required: true
      }
})

const Note = mongoose.model('Note', NoteSchema)

module.exports = Note