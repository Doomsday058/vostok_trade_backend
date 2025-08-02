// server/lib/models/Product.js
import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  price: { 
    type: Number, 
    default: null
  },
  image: { 
    type: String, 
    default: '/placeholder.jpg' 
  },
  details: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

export default Product