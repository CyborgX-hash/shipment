import Shipment from '../models/Shipment.js';
import { io } from '../server.js';

// Simple helper to calculate distance between two lat/lng points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export const startLogicEngine = () => {
  console.log('Starting Logic Engine for Real-Time Simulation...');
  
  // How far (km) the shipment moves per tick — ~30km every 6s for fast demo
  const MOVE_SPEED_KM = 30;
  // When within this distance (km) of a waypoint, snap to it and advance
  const SNAP_THRESHOLD_KM = 20;
  // When within this distance (km) of the final destination, mark delivered
  const DELIVERY_THRESHOLD_KM = 25;

  setInterval(async () => {
    try {
      const activeShipments = await Shipment.find({});
      
      for (let shipment of activeShipments) {
        if (!shipment.route || shipment.route.length === 0) continue;
        if (shipment.status === 'Delivered') continue;

        const dest = shipment.route[shipment.route.length - 1];
        const distToDest = getDistanceFromLatLonInKm(
          shipment.currentLocation.lat, shipment.currentLocation.lng,
          dest.lat, dest.lng
        );

        // --- ARRIVED AT DESTINATION ---
        if (distToDest < DELIVERY_THRESHOLD_KM) {
          shipment.currentLocation = { lat: dest.lat, lng: dest.lng };
          shipment.status = 'Delivered';
          shipment.riskLevel = 'Low';
          await shipment.save();
          io.emit('shipment-updated', shipment);
          io.emit('location-updated', {
            shipmentId: shipment.shipmentId,
            currentLocation: shipment.currentLocation
          });
          console.log(`📦 ${shipment.shipmentId} DELIVERED!`);
          continue;
        }

        // --- FIND TARGET WAYPOINT ---
        // Find the closest waypoint index
        let closestIndex = 0;
        let minDistance = Infinity;
        shipment.route.forEach((node, index) => {
          const dist = getDistanceFromLatLonInKm(
            shipment.currentLocation.lat, shipment.currentLocation.lng,
            node.lat, node.lng
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = index;
          }
        });

        // Target the NEXT waypoint (not the one we're already at/near)
        let targetIndex = closestIndex;
        if (minDistance < SNAP_THRESHOLD_KM && targetIndex < shipment.route.length - 1) {
          targetIndex = closestIndex + 1;
        }
        // Safety: never target past the last waypoint
        if (targetIndex >= shipment.route.length) targetIndex = shipment.route.length - 1;

        const target = shipment.route[targetIndex];
        const distToTarget = getDistanceFromLatLonInKm(
          shipment.currentLocation.lat, shipment.currentLocation.lng,
          target.lat, target.lng
        );

        // --- MOVE TOWARDS TARGET ---
        let newLat, newLng;

        if (distToTarget < SNAP_THRESHOLD_KM) {
          // Close enough — snap directly to this waypoint
          newLat = target.lat;
          newLng = target.lng;
        } else {
          // Move a fixed distance towards the target (not a %)
          const fraction = Math.min(MOVE_SPEED_KM / distToTarget, 1);
          newLat = shipment.currentLocation.lat + (target.lat - shipment.currentLocation.lat) * fraction;
          newLng = shipment.currentLocation.lng + (target.lng - shipment.currentLocation.lng) * fraction;
        }

        shipment.currentLocation = { lat: newLat, lng: newLng };
        await shipment.save();

        io.emit('location-updated', {
          shipmentId: shipment.shipmentId,
          currentLocation: shipment.currentLocation
        });
      }
    } catch (err) {
      console.error('Logic engine error:', err);
    }
  }, 6000); // 6s interval for faster demo
};
