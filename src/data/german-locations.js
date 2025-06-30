/**
 * German Locations Data
 * Complete list of German cities, states, and regions with coordinates
 */

export const germanStates = {
  'baden-wuerttemberg': {
    name: 'Baden-Württemberg',
    shortCode: 'BW',
    capital: 'Stuttgart',
    area: 35751,
    population: 11100394,
    bounds: {
      north: 49.791,
      south: 47.532,
      east: 10.495,
      west: 7.511
    }
  },
  'bayern': {
    name: 'Bayern',
    shortCode: 'BY',
    capital: 'München',
    area: 70550,
    population: 13140183,
    bounds: {
      north: 50.564,
      south: 47.270,
      east: 13.839,
      west: 8.976
    }
  },
  'berlin': {
    name: 'Berlin',
    shortCode: 'BE',
    capital: 'Berlin',
    area: 891,
    population: 3664088,
    bounds: {
      north: 52.675,
      south: 52.338,
      east: 13.761,
      west: 13.088
    }
  },
  'brandenburg': {
    name: 'Brandenburg',
    shortCode: 'BB',
    capital: 'Potsdam',
    area: 29654,
    population: 2531071,
    bounds: {
      north: 53.558,
      south: 51.359,
      east: 14.765,
      west: 11.266
    }
  },
  'bremen': {
    name: 'Bremen',
    shortCode: 'HB',
    capital: 'Bremen',
    area: 419,
    population: 681202,
    bounds: {
      north: 53.606,
      south: 53.010,
      east: 8.990,
      west: 8.483
    }
  },
  'hamburg': {
    name: 'Hamburg',
    shortCode: 'HH',
    capital: 'Hamburg',
    area: 755,
    population: 1899160,
    bounds: {
      north: 53.965,
      south: 53.395,
      east: 10.326,
      west: 9.652
    }
  },
  'hessen': {
    name: 'Hessen',
    shortCode: 'HE',
    capital: 'Wiesbaden',
    area: 21115,
    population: 6293154,
    bounds: {
      north: 51.657,
      south: 49.395,
      east: 10.235,
      west: 7.771
    }
  },
  'mecklenburg-vorpommern': {
    name: 'Mecklenburg-Vorpommern',
    shortCode: 'MV',
    capital: 'Schwerin',
    area: 23211,
    population: 1610774,
    bounds: {
      north: 54.685,
      south: 53.115,
      east: 14.412,
      west: 10.593
    }
  },
  'niedersachsen': {
    name: 'Niedersachsen',
    shortCode: 'NI',
    capital: 'Hannover',
    area: 47614,
    population: 8003421,
    bounds: {
      north: 53.894,
      south: 51.295,
      east: 11.598,
      west: 6.654
    }
  },
  'nordrhein-westfalen': {
    name: 'Nordrhein-Westfalen',
    shortCode: 'NW',
    capital: 'Düsseldorf',
    area: 34110,
    population: 17925570,
    bounds: {
      north: 52.531,
      south: 50.322,
      east: 9.461,
      west: 5.866
    }
  },
  'rheinland-pfalz': {
    name: 'Rheinland-Pfalz',
    shortCode: 'RP',
    capital: 'Mainz',
    area: 19854,
    population: 4098391,
    bounds: {
      north: 50.942,
      south: 48.966,
      east: 8.508,
      west: 6.112
    }
  },
  'saarland': {
    name: 'Saarland',
    shortCode: 'SL',
    capital: 'Saarbrücken',
    area: 2569,
    population: 983991,
    bounds: {
      north: 49.639,
      south: 49.112,
      east: 7.404,
      west: 6.356
    }
  },
  'sachsen': {
    name: 'Sachsen',
    shortCode: 'SN',
    capital: 'Dresden',
    area: 18450,
    population: 4056941,
    bounds: {
      north: 51.683,
      south: 50.171,
      east: 15.042,
      west: 11.872
    }
  },
  'sachsen-anhalt': {
    name: 'Sachsen-Anhalt',
    shortCode: 'ST',
    capital: 'Magdeburg',
    area: 20452,
    population: 2180684,
    bounds: {
      north: 53.042,
      south: 50.938,
      east: 13.186,
      west: 10.561
    }
  },
  'schleswig-holstein': {
    name: 'Schleswig-Holstein',
    shortCode: 'SH',
    capital: 'Kiel',
    area: 15802,
    population: 2910875,
    bounds: {
      north: 55.058,
      south: 53.352,
      east: 11.684,
      west: 7.869
    }
  },
  'thueringen': {
    name: 'Thüringen',
    shortCode: 'TH',
    capital: 'Erfurt',
    area: 16173,
    population: 2120237,
    bounds: {
      north: 51.649,
      south: 50.204,
      east: 12.653,
      west: 9.876
    }
  }
};

export const majorCities = [
  // Top 20 German cities by population
  { name: 'Berlin', state: 'Berlin', lat: 52.520008, lng: 13.404954, population: 3664088, zipPrefix: '10' },
  { name: 'Hamburg', state: 'Hamburg', lat: 53.551086, lng: 9.993682, population: 1899160, zipPrefix: '20' },
  { name: 'München', state: 'Bayern', lat: 48.135125, lng: 11.581981, population: 1484226, zipPrefix: '80' },
  { name: 'Köln', state: 'Nordrhein-Westfalen', lat: 50.937531, lng: 6.960279, population: 1073096, zipPrefix: '50' },
  { name: 'Frankfurt am Main', state: 'Hessen', lat: 50.110924, lng: 8.682127, population: 753056, zipPrefix: '60' },
  { name: 'Stuttgart', state: 'Baden-Württemberg', lat: 48.775845, lng: 9.182932, population: 626275, zipPrefix: '70' },
  { name: 'Düsseldorf', state: 'Nordrhein-Westfalen', lat: 51.227741, lng: 6.773456, population: 621877, zipPrefix: '40' },
  { name: 'Leipzig', state: 'Sachsen', lat: 51.339695, lng: 12.373075, population: 597493, zipPrefix: '04' },
  { name: 'Dortmund', state: 'Nordrhein-Westfalen', lat: 51.513587, lng: 7.465298, population: 588462, zipPrefix: '44' },
  { name: 'Essen', state: 'Nordrhein-Westfalen', lat: 51.455643, lng: 7.011555, population: 582760, zipPrefix: '45' },
  { name: 'Bremen', state: 'Bremen', lat: 53.079296, lng: 8.801694, population: 567559, zipPrefix: '28' },
  { name: 'Dresden', state: 'Sachsen', lat: 51.050409, lng: 13.737262, population: 556227, zipPrefix: '01' },
  { name: 'Hannover', state: 'Niedersachsen', lat: 52.375892, lng: 9.732010, population: 535932, zipPrefix: '30' },
  { name: 'Nürnberg', state: 'Bayern', lat: 49.452102, lng: 11.076665, population: 518370, zipPrefix: '90' },
  { name: 'Duisburg', state: 'Nordrhein-Westfalen', lat: 51.434146, lng: 6.762692, population: 495152, zipPrefix: '47' },
  { name: 'Bochum', state: 'Nordrhein-Westfalen', lat: 51.481846, lng: 7.216236, population: 365587, zipPrefix: '44' },
  { name: 'Wuppertal', state: 'Nordrhein-Westfalen', lat: 51.256213, lng: 7.150764, population: 355100, zipPrefix: '42' },
  { name: 'Bielefeld', state: 'Nordrhein-Westfalen', lat: 52.021533, lng: 8.534970, population: 333451, zipPrefix: '33' },
  { name: 'Bonn', state: 'Nordrhein-Westfalen', lat: 50.735851, lng: 7.095190, population: 329673, zipPrefix: '53' },
  { name: 'Münster', state: 'Nordrhein-Westfalen', lat: 51.960906, lng: 7.625763, population: 315293, zipPrefix: '48' }
];

export const businessRegions = [
  {
    name: 'Rhein-Main',
    description: 'Wirtschaftsregion Frankfurt',
    cities: ['Frankfurt am Main', 'Wiesbaden', 'Mainz', 'Darmstadt', 'Offenbach'],
    center: { lat: 50.110924, lng: 8.682127 }
  },
  {
    name: 'Rhein-Ruhr',
    description: 'Größter Ballungsraum Deutschlands',
    cities: ['Düsseldorf', 'Köln', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal'],
    center: { lat: 51.433333, lng: 7.566667 }
  },
  {
    name: 'Rhein-Neckar',
    description: 'Metropolregion Rhein-Neckar',
    cities: ['Mannheim', 'Heidelberg', 'Ludwigshafen'],
    center: { lat: 49.487459, lng: 8.466039 }
  },
  {
    name: 'Stuttgart',
    description: 'Region Stuttgart',
    cities: ['Stuttgart', 'Esslingen', 'Ludwigsburg', 'Böblingen'],
    center: { lat: 48.775845, lng: 9.182932 }
  },
  {
    name: 'München',
    description: 'Metropolregion München',
    cities: ['München', 'Augsburg', 'Rosenheim', 'Freising'],
    center: { lat: 48.135125, lng: 11.581981 }
  },
  {
    name: 'Berlin-Brandenburg',
    description: 'Hauptstadtregion',
    cities: ['Berlin', 'Potsdam', 'Frankfurt (Oder)'],
    center: { lat: 52.520008, lng: 13.404954 }
  },
  {
    name: 'Hamburg',
    description: 'Metropolregion Hamburg',
    cities: ['Hamburg', 'Lübeck', 'Lüneburg'],
    center: { lat: 53.551086, lng: 9.993682 }
  }
];

// ZIP code ranges for major cities
export const zipCodeRanges = {
  '01': 'Dresden',
  '02': 'Bautzen, Görlitz',
  '03': 'Cottbus',
  '04': 'Leipzig',
  '06': 'Halle (Saale)',
  '07': 'Gera, Jena',
  '08': 'Zwickau',
  '09': 'Chemnitz',
  '10-12': 'Berlin',
  '13-14': 'Berlin (Umland)',
  '15-16': 'Frankfurt (Oder)',
  '17-19': 'Neubrandenburg, Rostock',
  '20-22': 'Hamburg',
  '23-25': 'Kiel, Lübeck',
  '26-27': 'Oldenburg, Bremerhaven',
  '28-29': 'Bremen',
  '30-31': 'Hannover',
  '32-33': 'Herford, Bielefeld',
  '34': 'Kassel',
  '35': 'Marburg, Gießen',
  '36': 'Fulda',
  '37': 'Göttingen',
  '38-39': 'Braunschweig, Magdeburg',
  '40-42': 'Düsseldorf, Wuppertal',
  '44-45': 'Dortmund, Essen',
  '46-47': 'Duisburg',
  '48-49': 'Münster, Osnabrück',
  '50-51': 'Köln',
  '52-53': 'Aachen, Bonn',
  '54': 'Trier',
  '55': 'Mainz',
  '56-57': 'Koblenz, Siegen',
  '58-59': 'Hagen, Arnsberg',
  '60-65': 'Frankfurt am Main, Wiesbaden',
  '66-67': 'Ludwigshafen, Kaiserslautern',
  '68-69': 'Mannheim, Heidelberg',
  '70-76': 'Stuttgart, Karlsruhe',
  '77-79': 'Freiburg, Konstanz',
  '80-86': 'München, Rosenheim',
  '87-89': 'Kempten, Augsburg',
  '90-96': 'Nürnberg, Würzburg',
  '97': 'Schweinfurt',
  '98': 'Erfurt',
  '99': 'Erfurt (Umland)'
};

// Helper functions
export function getStateByCity(cityName) {
  const city = majorCities.find(c => c.name === cityName);
  return city ? city.state : null;
}

export function getCitiesByState(stateName) {
  return majorCities.filter(city => city.state === stateName);
}

export function getBusinessRegionByCities(cityName) {
  return businessRegions.filter(region => 
    region.cities.includes(cityName)
  );
}

export function getCityByZipCode(zipCode) {
  const prefix = zipCode.substring(0, 2);
  for (const [range, city] of Object.entries(zipCodeRanges)) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      const prefixNum = Number(prefix);
      if (prefixNum >= start && prefixNum <= end) {
        return city.split(',')[0].trim();
      }
    } else if (range === prefix) {
      return city.split(',')[0].trim();
    }
  }
  return null;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Get cities within radius
export function getCitiesWithinRadius(centerLat, centerLng, radiusKm) {
  return majorCities.filter(city => {
    const distance = calculateDistance(centerLat, centerLng, city.lat, city.lng);
    return distance <= radiusKm;
  }).sort((a, b) => {
    const distA = calculateDistance(centerLat, centerLng, a.lat, a.lng);
    const distB = calculateDistance(centerLat, centerLng, b.lat, b.lng);
    return distA - distB;
  });
}

// Normalize German text for searching (handle umlauts)
export function normalizeGermanText(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '');
}

// Search cities with fuzzy matching
export function searchCities(query, limit = 10) {
  const normalizedQuery = normalizeGermanText(query);
  
  const results = majorCities
    .map(city => {
      const normalizedCity = normalizeGermanText(city.name);
      let score = 0;
      
      // Exact match
      if (normalizedCity === normalizedQuery) {
        score = 100;
      }
      // Starts with query
      else if (normalizedCity.startsWith(normalizedQuery)) {
        score = 80;
      }
      // Contains query
      else if (normalizedCity.includes(normalizedQuery)) {
        score = 60;
      }
      // Fuzzy match (simple Levenshtein-like scoring)
      else {
        const minLength = Math.min(normalizedCity.length, normalizedQuery.length);
        const maxLength = Math.max(normalizedCity.length, normalizedQuery.length);
        let matches = 0;
        
        for (let i = 0; i < minLength; i++) {
          if (normalizedCity[i] === normalizedQuery[i]) {
            matches++;
          }
        }
        
        score = (matches / maxLength) * 40;
      }
      
      return { ...city, score };
    })
    .filter(city => city.score > 20)
    .sort((a, b) => b.score - a.score || b.population - a.population)
    .slice(0, limit);
  
  return results;
}