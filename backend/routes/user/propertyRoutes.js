const express = require("express");
const axios = require("axios"); 

const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getMyProperties
} = require("../../controllers/user/propertyController");

const protect = require("../../middleware/user/authMiddleware");
const roleCheck = require("../../middleware/roleMiddleware");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllProperties);
router.get("/available", getAllProperties);
router.get("/:id", getSingleProperty);

router.post(
  "/",
  protect,
  roleCheck("seller"),
  upload.array("images"),
  createProperty
);

router.delete("/:id", protect, roleCheck("seller"), deleteProperty);
router.get("/my-properties", protect, roleCheck("seller"), getMyProperties);
router.put(
  "/:id",
  protect,
  roleCheck("seller"),
  upload.array("images"),
  updateProperty
);

// Nearby places route
router.get("/:id/nearby", async (req, res) => {
  try {
    const Property = require("../../models/Property");
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    console.log(`📍 Fetching nearby places for: ${property.location}`);

    const locationQuery = encodeURIComponent(property.location + ", India");
    const geocodeResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'Havenix/1.0',
          'Accept-Language': 'en'
        }
      }
    );

    let lat, lon;
    
    if (geocodeResponse.data && geocodeResponse.data.length > 0) {
      lat = parseFloat(geocodeResponse.data[0].lat);
      lon = parseFloat(geocodeResponse.data[0].lon);
      console.log(`✅ Found coordinates: ${lat}, ${lon} for ${property.location}`);
    } else {
      const defaultCoords = {
        "Mumbai": { lat: 19.0760, lon: 72.8777 },
        "Delhi": { lat: 28.6139, lon: 77.2090 },
        "Bangalore": { lat: 12.9716, lon: 77.5946 },
        "Hyderabad": { lat: 17.3850, lon: 78.4867 },
        "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
        "Chennai": { lat: 13.0827, lon: 80.2707 },
        "Kolkata": { lat: 22.5726, lon: 88.3639 },
        "Pune": { lat: 18.5204, lon: 73.8567 },
        "Jaipur": { lat: 26.9124, lon: 75.7873 },
        "Lucknow": { lat: 26.8467, lon: 80.9462 }
      };
      
      const cityMatch = Object.keys(defaultCoords).find(city => 
        property.location.toLowerCase().includes(city.toLowerCase())
      );
      
      if (cityMatch) {
        lat = defaultCoords[cityMatch].lat;
        lon = defaultCoords[cityMatch].lon;
        console.log(`✅ Using default coordinates for ${cityMatch}`);
      } else {
        lat = 18.5204;
        lon = 73.8567;
        console.log(`⚠️ Using default Pune coordinates`);
      }
    }

    const radius = 3000;

    const placeCategories = [
      { tag: 'amenity=restaurant', type: 'restaurant', icon: '🍽️', name: 'Restaurant' },
      { tag: 'amenity=cafe', type: 'cafe', icon: '☕', name: 'Cafe' },
      { tag: 'shop=mall', type: 'mall', icon: '🛍️', name: 'Shopping Mall' },
      { tag: 'shop=supermarket', type: 'supermarket', icon: '🛒', name: 'Supermarket' },
      { tag: 'amenity=hospital', type: 'hospital', icon: '🏥', name: 'Hospital' },
      { tag: 'amenity=school', type: 'school', icon: '🏫', name: 'School' },
      { tag: 'railway=station', type: 'transport', icon: '🚂', name: 'Railway Station' },
      { tag: 'leisure=park', type: 'park', icon: '🌳', name: 'Park' },
      { tag: 'amenity=bank', type: 'bank', icon: '🏦', name: 'Bank' },
      { tag: 'amenity=atm', type: 'atm', icon: '💳', name: 'ATM' }
    ];

    const overpassQuery = `
      [out:json][timeout:30];
      (
        ${placeCategories.map(cat => `node["${cat.tag}"](around:${radius},${lat},${lon});`).join('\n        ')}
        ${placeCategories.map(cat => `way["${cat.tag}"](around:${radius},${lat},${lon});`).join('\n        ')}
      );
      out body;
    `;

    console.log("🔍 Querying Overpass API...");
    const overpassResponse = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 10000
      }
    );

    const places = overpassResponse.data.elements
      .filter(element => element.tags)
      .map(element => {
        let type = 'place';
        let icon = '📍';
        let defaultName = 'Place';
        
        for (const cat of placeCategories) {
          const [key, value] = cat.tag.split('=');
          if (element.tags[key] === value) {
            type = cat.type;
            icon = cat.icon;
            defaultName = cat.name;
            break;
          }
        }

        const placeLat = element.lat || (element.center && element.center.lat);
        const placeLon = element.lon || (element.center && element.center.lon);
        
        let distance = '';
        if (placeLat && placeLon) {
          const distanceInMeters = calculateDistance(lat, lon, placeLat, placeLon);
          distance = distanceInMeters < 1000 
            ? `${Math.round(distanceInMeters)} m` 
            : `${(distanceInMeters / 1000).toFixed(1)} km`;
        }

        let name = element.tags.name || element.tags['brand'] || defaultName;
        if (name.length > 30) name = name.substring(0, 30) + '...';

        return {
          id: element.id,
          name,
          type,
          icon,
          distance,
          coordinates: placeLat && placeLon ? { lat: placeLat, lng: placeLon } : null
        };
      })
      .filter(place => place.coordinates)
      .filter((place, index, self) => 
        index === self.findIndex(p => p.name === place.name && p.type === place.type)
      )
      .slice(0, 20);

    places.sort((a, b) => {
      const aDist = parseFloat(a.distance) || 9999;
      const bDist = parseFloat(b.distance) || 9999;
      return aDist - bDist;
    });

    res.json({
      success: true,
      propertyLocation: { lat, lon },
      places,
      total: places.length
    });

  } catch (error) {
    console.error("❌ Error fetching nearby places:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby places",
      error: error.message
    });
  }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;