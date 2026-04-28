import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    required: true,
    unique: true,
  },
  origin: {
    lat: Number,
    lng: Number,
    name: String,
  },
  destination: {
    lat: Number,
    lng: Number,
    name: String,
  },
  currentLocation: {
    lat: Number,
    lng: Number,
  },
  eta: {
    type: Date,
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['On-time', 'Delayed', 'High Risk', 'Delivered'],
    default: 'On-time',
  },
  route: [{
    lat: Number,
    lng: Number,
  }],
}, { timestamps: true });

export default mongoose.model('Shipment', ShipmentSchema);
