const mongoose = require('mongoose');

const KeySchema = new mongoose.Schema({
    value: {
        type: String,
        // type: Buffer,
        required: true
      },
      iv: {
        type: String,
        // type: Buffer,
        required: true
      },
      _id_note: {
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