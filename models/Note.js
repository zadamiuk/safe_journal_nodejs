const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
      description: {
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
}, )

const Note = mongoose.model('Note', NoteSchema)

module.exports = Note;