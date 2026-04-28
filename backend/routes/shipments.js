import express from 'express';
import Shipment from '../models/Shipment.js';
import Alert from '../models/Alert.js';

const router = express.Router();

// Get all active shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a mock shipment (for Demo purposes)
router.post('/', async (req, res) => {
  try {
    // Randomize between several Indian logistics corridors
    const corridors = [
      {
        origin: { name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777 },
        destination: { name: 'Delhi, DL', lat: 28.6139, lng: 77.2090 },
        route: [
          { lat: 19.0760, lng: 72.8777 },   // Mumbai
          { lat: 20.0063, lng: 73.7806 },   // Nashik
          { lat: 21.1458, lng: 79.0882 },   // Nagpur
          { lat: 23.2599, lng: 77.4126 },   // Bhopal
          { lat: 25.4358, lng: 78.5685 },   // Jhansi
          { lat: 26.8467, lng: 80.9462 },   // Lucknow approach
          { lat: 27.1767, lng: 78.0081 },   // Agra
          { lat: 28.6139, lng: 77.2090 },   // Delhi
        ]
      },
      {
        origin: { name: 'Chennai, TN', lat: 13.0827, lng: 80.2707 },
        destination: { name: 'Bangalore, KA', lat: 12.9716, lng: 77.5946 },
        route: [
          { lat: 13.0827, lng: 80.2707 },   // Chennai
          { lat: 12.9249, lng: 79.1369 },   // Vellore
          { lat: 12.9716, lng: 77.5946 },   // Bangalore
        ]
      },
      {
        origin: { name: 'Kolkata, WB', lat: 22.5726, lng: 88.3639 },
        destination: { name: 'Hyderabad, TS', lat: 17.3850, lng: 78.4867 },
        route: [
          { lat: 22.5726, lng: 88.3639 },   // Kolkata
          { lat: 21.2514, lng: 85.8525 },   // Bhubaneswar area
          { lat: 20.2961, lng: 85.8245 },   // Near Cuttack
          { lat: 18.1124, lng: 83.4956 },   // Visakhapatnam area
          { lat: 17.3850, lng: 78.4867 },   // Hyderabad
        ]
      }
    ];

    const corridor = corridors[Math.floor(Math.random() * corridors.length)];

    const newShipment = new Shipment({
      shipmentId: `SHP-${Date.now()}`,
      origin: corridor.origin,
      destination: corridor.destination,
      currentLocation: { lat: corridor.route[0].lat, lng: corridor.route[0].lng },
      eta: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      riskLevel: 'Low',
      status: 'On-time',
      route: corridor.route,
    });
    
    await newShipment.save();
    res.status(201).json(newShipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent alerts for a shipment
router.get('/:id/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ shipmentId: req.params.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
