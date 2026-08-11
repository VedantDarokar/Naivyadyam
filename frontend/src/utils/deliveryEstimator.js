/**
 * India Pincode Delivery Estimator
 * - Uses free India Post API for exact location (city, district, state)
 * - Minimum 4 business days delivery for all locations
 * - Skips weekends in delivery date calculation
 */

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Delivery days by zone — MINIMUM 4 days enforced
const ZONE_DAYS = {
  local:        [4, 5],   // Same state (e.g., Maharashtra to Maharashtra)
  near:         [4, 6],   // Neighbouring states
  central:      [4, 6],   // Central India
  north:        [4, 7],   // Northern India
  south:        [5, 7],   // Southern India
  east:         [5, 8],   // Eastern India
  northeast:    [6, 10],  // Northeast India
  north_remote: [6, 9],   // J&K, Himachal remote areas
  remote:       [7, 12],  // Andaman, Lakshadweep, etc.
  standard:     [4, 7],   // Fallback
};

// Map pincode prefix (first 2 digits) to zone
const PREFIX_ZONE_MAP = {
  // Maharashtra
  '40': 'local', '41': 'local', '42': 'local', '43': 'local', '44': 'local',
  // Gujarat
  '36': 'near', '37': 'near', '38': 'near', '39': 'near',
  // Goa, Dadra, Daman
  '403': 'near', '396': 'near',
  // Karnataka
  '56': 'near', '57': 'near', '58': 'near', '59': 'near',
  // Telangana / AP
  '50': 'near', '51': 'south', '52': 'south', '53': 'south',
  // Tamil Nadu
  '60': 'south', '61': 'south', '62': 'south', '63': 'south', '64': 'south',
  // Kerala
  '67': 'south', '68': 'south', '69': 'south',
  // Delhi / NCR
  '11': 'north',
  // Uttar Pradesh
  '20': 'north', '21': 'north', '22': 'north', '23': 'north',
  '24': 'north', '25': 'north', '26': 'north', '27': 'north', '28': 'north',
  // Rajasthan
  '30': 'north', '31': 'north', '32': 'north', '33': 'north', '34': 'north',
  // Madhya Pradesh
  '45': 'central', '46': 'central', '47': 'central', '48': 'central',
  // Chhattisgarh
  '49': 'central',
  // Punjab / Haryana / Himachal
  '14': 'north', '15': 'north', '16': 'north', '17': 'north_remote',
  // J&K
  '18': 'north_remote', '19': 'north_remote',
  // West Bengal
  '70': 'east', '71': 'east', '72': 'east', '73': 'east', '74': 'east',
  // Bihar / Jharkhand
  '80': 'east', '81': 'east', '82': 'east', '83': 'east', '84': 'east', '85': 'east',
  // Odisha
  '75': 'east', '76': 'east', '77': 'east',
  // Assam / Northeast
  '78': 'northeast', '79': 'northeast', '78': 'northeast',
  // Uttarakhand
  '24': 'north', '25': 'north',
  // Andaman
  '744': 'remote',
};

const FIRST_DIGIT_ZONE = {
  '1': 'north', '2': 'north', '3': 'near',
  '4': 'local', '5': 'south', '6': 'south',
  '7': 'east',  '8': 'east',  '9': 'remote',
};

const addBusinessDays = (startDate, days) => {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++; // skip Sunday (0) and Saturday (6)
  }
  return result;
};

const formatDate = (date) => {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Fetch exact location details from India Post API
 * @param {string} pincode
 * @returns {{ city, district, state, valid }}
 */
export const fetchPincodeLocation = async (pincode) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();

    if (!data || !data[0] || data[0].Status !== 'Success' || !data[0].PostOffice?.length) {
      return { valid: false };
    }

    const po = data[0].PostOffice[0];
    return {
      valid: true,
      city: po.Block !== 'NA' ? po.Block : po.Name,
      district: po.District,
      state: po.State,
      country: po.Country || 'India',
    };
  } catch {
    return { valid: false };
  }
};

/**
 * Get delivery zone from pincode prefix
 * @param {string} pincode
 * @returns {string} zone key
 */
const getZone = (pincode) => {
  const prefix3 = pincode.slice(0, 3);
  const prefix2 = pincode.slice(0, 2);
  return PREFIX_ZONE_MAP[prefix3] || PREFIX_ZONE_MAP[prefix2] || FIRST_DIGIT_ZONE[pincode[0]] || 'standard';
};

/**
 * Main function: Given a 6-digit pincode and fetched location,
 * returns full delivery estimate.
 * @param {string} pincode
 * @param {{ city, district, state, valid }} locationData
 * @returns {object} delivery info
 */
export const estimateDelivery = (pincode, locationData = null) => {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return { valid: false, message: 'Please enter a valid 6-digit pincode' };
  }

  const zone = getZone(pincode);
  const days = ZONE_DAYS[zone] || ZONE_DAYS['standard'];

  const today = new Date();
  // Orders placed after 3PM ship next business day
  const cutoffHour = 15;
  const dispatchDate = today.getHours() >= cutoffHour
    ? addBusinessDays(today, 1)
    : today;

  const earliestDate = addBusinessDays(dispatchDate, days[0]);
  const latestDate   = addBusinessDays(dispatchDate, days[1]);
  const sameDay = earliestDate.toDateString() === latestDate.toDateString();

  const earliest = formatDate(earliestDate);
  const latest   = formatDate(latestDate);

  return {
    valid: true,
    pincode,
    zone,
    earliest,
    latest,
    sameDay,
    displayDate: sameDay ? earliest : `${earliest} – ${latest}`,
    businessDays: sameDay ? `${days[0]} business days` : `${days[0]}–${days[1]} business days`,
    freeShipping: true,
    // Location fields (filled in after API call)
    city:     locationData?.city     || null,
    district: locationData?.district || null,
    state:    locationData?.state    || null,
  };
};
