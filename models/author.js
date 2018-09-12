const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  imageName:{
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  birth:{
    type: String,
    required: true
  },
  nationality:{
    type: String,
    required: true
  },
  biography:{
    type: String,
    required: true
  }
});

var Author = mongoose.model('Author', authorSchema);

module.exports = Author;
