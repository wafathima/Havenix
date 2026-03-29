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

// Existing routes
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

router.get("/", getAllProperties);
router.get("/:id", getSingleProperty);


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
      
      // Check if property.location matches any city
      const cityMatch = Object.keys(defaultCoords).find(city => 
        property.location.toLowerCase().includes(city.toLowerCase())
      );
      
      if (cityMatch) {
        lat = defaultCoords[cityMatch].lat;
        lon = defaultCoords[cityMatch].lon;
        console.log(`✅ Using default coordinates for ${cityMatch}`);
      } else {
        // Default to Pune if nothing matches
        lat = 18.5204;
        lon = 73.8567;
        console.log(`⚠️ Using default Pune coordinates`);
      }
    }

    const radius = 3000; 

    // Comprehensive place categories
    const placeCategories = [
      // Food & Drink
      { tag: 'amenity=restaurant', type: 'restaurant', icon: '🍽️', name: 'Restaurant' },
      { tag: 'amenity=cafe', type: 'cafe', icon: '☕', name: 'Cafe' },
      { tag: 'amenity=fast_food', type: 'restaurant', icon: '🍔', name: 'Fast Food' },
      { tag: 'amenity=bar', type: 'bar', icon: '🍺', name: 'Bar' },
      
      // Shopping
      { tag: 'shop=mall', type: 'mall', icon: '🛍️', name: 'Shopping Mall' },
      { tag: 'shop=supermarket', type: 'supermarket', icon: '🛒', name: 'Supermarket' },
      { tag: 'shop=department_store', type: 'store', icon: '🏬', name: 'Department Store' },
      
      // Healthcare
      { tag: 'amenity=hospital', type: 'hospital', icon: '🏥', name: 'Hospital' },
      { tag: 'amenity=clinic', type: 'clinic', icon: '🏥', name: 'Clinic' },
      { tag: 'amenity=pharmacy', type: 'pharmacy', icon: '💊', name: 'Pharmacy' },
      
      // Education
      { tag: 'amenity=school', type: 'school', icon: '🏫', name: 'School' },
      { tag: 'amenity=college', type: 'college', icon: '🎓', name: 'College' },
      { tag: 'amenity=university', type: 'university', icon: '🏛️', name: 'University' },
      
      // Transport
      { tag: 'railway=station', type: 'transport', icon: '🚂', name: 'Railway Station' },
      { tag: 'highway=bus_stop', type: 'transport', icon: '🚌', name: 'Bus Stop' },
      { tag: 'amenity=bus_station', type: 'transport', icon: '🚏', name: 'Bus Station' },
      { tag: 'aeroway=aerodrome', type: 'transport', icon: '✈️', name: 'Airport' },
      
      // Entertainment & Leisure
      { tag: 'leisure=park', type: 'park', icon: '🌳', name: 'Park' },
      { tag: 'leisure=garden', type: 'park', icon: '🌸', name: 'Garden' },
      { tag: 'amenity=cinema', type: 'entertainment', icon: '🎬', name: 'Cinema' },
      { tag: 'amenity=theatre', type: 'entertainment', icon: '🎭', name: 'Theatre' },
      { tag: 'amenity=gym', type: 'gym', icon: '💪', name: 'Gym' },
      
      // Services
      { tag: 'amenity=bank', type: 'bank', icon: '🏦', name: 'Bank' },
      { tag: 'amenity=atm', type: 'atm', icon: '💳', name: 'ATM' },
      { tag: 'amenity=police', type: 'police', icon: '👮', name: 'Police Station' },
      { tag: 'amenity=fire_station', type: 'fire', icon: '🚒', name: 'Fire Station' },
      { tag: 'amenity=post_office', type: 'post', icon: '📮', name: 'Post Office' },
      
      // Accommodation
      { tag: 'tourism=hotel', type: 'hotel', icon: '🏨', name: 'Hotel' },
      { tag: 'tourism=guest_house', type: 'hotel', icon: '🏠', name: 'Guest House' }
    ];

    // Build enhanced Overpass query
    const overpassQuery = `
      [out:json][timeout:30];
      (
        ${placeCategories.map(cat => `node["${cat.tag}"](around:${radius},${lat},${lon});`).join('\n        ')}
        ${placeCategories.map(cat => `way["${cat.tag}"](around:${radius},${lat},${lon});`).join('\n        ')}
        node["shop"](around:${radius},${lat},${lon});
        way["shop"](around:${radius},${lat},${lon});
        node["leisure"](around:${radius},${lat},${lon});
        way["leisure"](around:${radius},${lat},${lon});
        node["tourism"](around:${radius},${lat},${lon});
        way["tourism"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    console.log("🔍 Querying Overpass API...");
    const overpassResponse = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: {
          'Content-Type': 'text/plain'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log(`✅ Found ${overpassResponse.data.elements.length} raw elements`);

    // Process and format the results
    const places = overpassResponse.data.elements
      .filter(element => element.tags) // Filter out elements without tags
      .map(element => {
        // Determine place type
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

        // If no match, check shop/amenity/leisure tags
        if (type === 'place') {
          if (element.tags.shop) {
            type = 'shop';
            icon = '🏪';
            defaultName = 'Shop';
          } else if (element.tags.amenity) {
            type = element.tags.amenity;
            icon = '🏢';
            defaultName = element.tags.amenity.charAt(0).toUpperCase() + element.tags.amenity.slice(1);
          } else if (element.tags.leisure) {
            type = 'leisure';
            icon = '🎯';
            defaultName = 'Recreation Area';
          } else if (element.tags.tourism) {
            type = 'tourist';
            icon = '🗺️';
            defaultName = 'Tourist Attraction';
          }
        }

        // Get coordinates
        const placeLat = element.lat || (element.center && element.center.lat);
        const placeLon = element.lon || (element.center && element.center.lon);
        
        // Calculate distance
        let distance = '';
        if (placeLat && placeLon) {
          const distanceInMeters = calculateDistance(lat, lon, placeLat, placeLon);
          distance = distanceInMeters < 1000 
            ? `${Math.round(distanceInMeters)} m` 
            : `${(distanceInMeters / 1000).toFixed(1)} km`;
        }

        // Get place name
        let name = element.tags.name || 
                  element.tags['brand'] || 
                  element.tags['operator'] || 
                  defaultName;

        // Clean up name
        if (name.length > 30) {
          name = name.substring(0, 30) + '...';
        }

        return {
          id: element.id,
          name: name,
          type,
          icon,
          distance,
          coordinates: placeLat && placeLon ? { lat: placeLat, lng: placeLon } : null,
          address: element.tags['addr:street'] 
            ? `${element.tags['addr:street']}${element.tags['addr:housenumber'] ? ' ' + element.tags['addr:housenumber'] : ''}`
            : null
        };
      })
      .filter(place => place.coordinates) // Filter out places without coordinates
      .filter((place, index, self) => 
        // Remove duplicates by name and type
        index === self.findIndex(p => p.name === place.name && p.type === place.type)
      )
      .slice(0, 20); // Limit to 20 places

    // Sort by distance
    places.sort((a, b) => {
      const aDist = parseFloat(a.distance) || 9999;
      const bDist = parseFloat(b.distance) || 9999;
      return aDist - bDist;
    });

    console.log(`✅ Returning ${places.length} formatted places`);

    res.json({
      success: true,
      propertyLocation: { lat, lon },
      places,
      total: places.length
    });

  } catch (error) {
    console.error("❌ Error fetching nearby places:", error);
    
    // Return mock data for Pune if API fails
    if (property && property.location.toLowerCase().includes('pune')) {
      const mockPunePlaces = [
        { 
          name: "Phoenix Market City", 
          distance: "2.5 km", 
          type: "mall",
          icon: "🛍️",
          coordinates: { lat: 18.5623, lng: 73.9089 }
        },
        { 
          name: "Pune Railway Station", 
          distance: "3.2 km", 
          type: "transport",
          icon: "🚂",
          coordinates: { lat: 18.5285, lng: 73.8746 }
        },
        { 
          name: "Jehangir Hospital", 
          distance: "1.8 km", 
          type: "hospital",
          icon: "🏥",
          coordinates: { lat: 18.5256, lng: 73.8723 }
        },
        { 
          name: "Bishop's School", 
          distance: "1.2 km", 
          type: "school",
          icon: "🏫",
          coordinates: { lat: 18.5298, lng: 73.8789 }
        },
        { 
          name: "Osho Garden", 
          distance: "0.8 km", 
          type: "park",
          icon: "🌳",
          coordinates: { lat: 18.5321, lng: 73.8823 }
        },
        { 
          name: "Barista Cafe", 
          distance: "0.5 km", 
          type: "cafe",
          icon: "☕",
          coordinates: { lat: 18.5267, lng: 73.8798 }
        }
      ];
      
      return res.json({
        success: true,
        propertyLocation: { lat: 18.5204, lon: 73.8567 },
        places: mockPunePlaces,
        total: mockPunePlaces.length,
        message: "Using mock data for Pune"
      });
    }
    
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

  return R * c; // Distance in meters
}

module.exports = router;