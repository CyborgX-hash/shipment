import express from 'express';
import Shipment from '../models/Shipment.js';
import Alert from '../models/Alert.js';
import { io } from '../server.js';

const router = express.Router();

router.post('/event', async (req, res) => {
  try {
    const { eventType, shipmentId } = req.body;
    
    const shipment = await Shipment.findOne({ shipmentId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    let alertMessage = '';
    let newRisk = shipment.riskLevel;
    let newStatus = shipment.status;
    let etaAddHours = 0;
    let suggestion = '';

    switch (eventType) {
      case 'rain':
        newRisk = 'Medium';
        newStatus = 'Delayed';
        etaAddHours = 2;
        alertMessage = 'Delay due to heavy rain. Adjusting ETA.';
        suggestion = 'Proceeding with caution on current route.';
        break;
      case 'traffic':
        newRisk = 'Medium';
        newStatus = 'Delayed';
        etaAddHours = 1;
        alertMessage = 'Minor delay due to heavy traffic ahead.';
        suggestion = 'Alternate route suggested: US-1 N. Taking alternate route.';
        break;
      case 'roadblock':
        newRisk = 'High';
        newStatus = 'High Risk';
        etaAddHours = 5;
        alertMessage = 'CRITICAL: Severe Roadblock detected.';
        suggestion = 'No alternate route found, significant delay expected.';
        break;
      default:
        return res.status(400).json({ error: 'Invalid event type' });
    }

    // Update shipment details
    shipment.riskLevel = newRisk;
    shipment.status = newStatus;
    shipment.eta = new Date(new Date(shipment.eta).getTime() + etaAddHours * 60 * 60 * 1000);
    await shipment.save();

    // Create alert record
    const alert = new Alert({
      shipmentId: shipment._id,
      message: `${alertMessage} ${suggestion}`,
      severity: newRisk === 'High' ? 'Critical' : 'Warning'
    });
    await alert.save();

    // Emit real-time socket events
    io.emit('shipment-updated', shipment);
    io.emit('new-alert', { shipmentId: shipment.shipmentId, message: alert.message, severity: alert.severity });

    res.json({ message: 'Simulation applied', shipment, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
