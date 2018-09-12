const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;

const productSchema = new Schema({
  category:{
    type: String,
    required: true
  },
  imageName:{
    type:String,
    required: true
  },
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  price:{
    type: String,
    required: true
  },
  isbn:{
    type: String,
    required: true
  },
  language:{
    type: String,
    required: true
  },
  synopsis:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  }

});

var Product = mongoose.model('Product', productSchema);

module.exports = Product;
