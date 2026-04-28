import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Info', 'Warning', 'Critical'],
    default: 'Info',
  },
}, { timestamps: true });

export default mongoose.model('Alert', AlertSchema);
