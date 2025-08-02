// server/lib/models/PriceRequest.js
import mongoose from 'mongoose';

const priceRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  downloadLink: {
    type: String
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const PriceRequest = mongoose.models.PriceRequest || mongoose.model('PriceRequest', priceRequestSchema);

export default PriceRequest;