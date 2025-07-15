// South African Provinces and Major Cities
export const SA_PROVINCES = {
  GP: 'Gauteng',
  WC: 'Western Cape',
  KZN: 'KwaZulu-Natal',
  EC: 'Eastern Cape',
  FS: 'Free State',
  LP: 'Limpopo',
  MP: 'Mpumalanga',
  NC: 'Northern Cape',
  NW: 'North West',
};

export const SA_MAJOR_CITIES = [
  // Gauteng
  { city: 'Johannesburg', province: 'GP', fullName: 'Johannesburg, Gauteng' },
  { city: 'Pretoria', province: 'GP', fullName: 'Pretoria, Gauteng' },
  { city: 'Centurion', province: 'GP', fullName: 'Centurion, Gauteng' },
  { city: 'Sandton', province: 'GP', fullName: 'Sandton, Gauteng' },
  { city: 'Midrand', province: 'GP', fullName: 'Midrand, Gauteng' },

  // Western Cape
  { city: 'Cape Town', province: 'WC', fullName: 'Cape Town, Western Cape' },
  {
    city: 'Stellenbosch',
    province: 'WC',
    fullName: 'Stellenbosch, Western Cape',
  },
  { city: 'Paarl', province: 'WC', fullName: 'Paarl, Western Cape' },

  // KwaZulu-Natal
  { city: 'Durban', province: 'KZN', fullName: 'Durban, KwaZulu-Natal' },
  {
    city: 'Pietermaritzburg',
    province: 'KZN',
    fullName: 'Pietermaritzburg, KwaZulu-Natal',
  },

  // Eastern Cape
  {
    city: 'Port Elizabeth',
    province: 'EC',
    fullName: 'Port Elizabeth, Eastern Cape',
  },
  {
    city: 'East London',
    province: 'EC',
    fullName: 'East London, Eastern Cape',
  },

  // Other
  {
    city: 'Bloemfontein',
    province: 'FS',
    fullName: 'Bloemfontein, Free State',
  },
  { city: 'Polokwane', province: 'LP', fullName: 'Polokwane, Limpopo' },
  { city: 'Nelspruit', province: 'MP', fullName: 'Nelspruit, Mpumalanga' },
];

// Tech Hubs in South Africa
export const SA_TECH_HUBS = [
  {
    city: 'Johannesburg',
    province: 'Gauteng',
    description: 'Financial services and fintech hub',
    majorCompanies: [
      'Discovery',
      'Standard Bank',
      'FNB',
      'Nedbank',
      'Old Mutual',
    ],
    averageSalary: { min: 450000, max: 900000 },
    techFocus: ['Fintech', 'Insurance Tech', 'Mining Tech', 'E-commerce'],
  },
  {
    city: 'Cape Town',
    province: 'Western Cape',
    description: 'Startup and e-commerce capital',
    majorCompanies: ['Takealot', 'Naspers', 'MediaTek', 'Amazon', 'Shoprite'],
    averageSalary: { min: 400000, max: 850000 },
    techFocus: ['E-commerce', 'Media Tech', 'Startups', 'Gaming'],
  },
  {
    city: 'Durban',
    province: 'KwaZulu-Natal',
    description: 'Logistics and manufacturing tech',
    majorCompanies: ['Bytes', 'EOH', 'Dimension Data'],
    averageSalary: { min: 350000, max: 700000 },
    techFocus: ['Logistics Tech', 'Manufacturing', 'Port Tech'],
  },
];

// South African Companies (Major Tech Employers)
export const SA_TECH_COMPANIES = [
  // Financial Services
  'Discovery',
  'Standard Bank',
  'FNB',
  'Nedbank',
  'Absa',
  'Capitec',
  'Old Mutual',
  'Sanlam',
  // E-commerce & Media
  'Takealot',
  'Naspers',
  'Konga',
  'Bidorbuy',
  'Superbalist',
  'Spree Commerce',
  // Tech Services
  'EOH',
  'Dimension Data',
  'Bytes Technology',
  'Altron',
  'Adapt IT',
  'Cognizant',
  // Telecommunications
  'MTN',
  'Vodacom',
  'Cell C',
  'Telkom',
  'Rain',
  // Retail Tech
  'Shoprite',
  'Pick n Pay',
  'Woolworths',
  'Clicks',
  'Mr Price',
  // Mining Tech
  'Anglo American',
  'BHP Billiton',
  'Sasol',
  'Exxaro',
  // Global Companies with SA Presence
  'Microsoft South Africa',
  'Amazon',
  'Google',
  'IBM',
  'Oracle',
  'SAP',
];

// Salary ranges by experience level (in ZAR)
export const SA_SALARY_RANGES = {
  junior: { min: 250000, max: 450000 },
  mid: { min: 450000, max: 700000 },
  senior: { min: 700000, max: 1200000 },
  lead: { min: 1000000, max: 1800000 },
  executive: { min: 1500000, max: 3000000 },
};

// Currency formatting for South African Rand
export const formatZAR = (amount, options = {}) => {
  const {
    showDecimals = false,
    abbreviated = false,
    includeSymbol = true,
  } = options;

  if (typeof amount !== 'number') {
    return includeSymbol ? 'R 0' : '0';
  }

  // Handle abbreviations (k, m)
  if (abbreviated) {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      const formatted = showDecimals
        ? millions.toFixed(1)
        : Math.round(millions);
      return includeSymbol ? `R ${formatted}m` : `${formatted}m`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      const formatted = showDecimals
        ? thousands.toFixed(1)
        : Math.round(thousands);
      return includeSymbol ? `R ${formatted}k` : `${formatted}k`;
    }
  }

  // Standard formatting with thousands separators
  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  // Remove the currency symbol if not needed
  if (!includeSymbol) {
    return formatted.replace('R', '').trim();
  }

  return formatted;
};

// Format salary range
export const formatSalaryRange = (min, max, options = {}) => {
  const { abbreviated = true } = options;

  const minFormatted = formatZAR(min, { abbreviated, includeSymbol: true });
  const maxFormatted = formatZAR(max, { abbreviated, includeSymbol: false });

  return `${minFormatted} - R ${maxFormatted}`;
};

// Get salary range by experience level
export const getSalaryRange = experienceLevel => {
  const range = SA_SALARY_RANGES[experienceLevel?.toLowerCase()];
  if (!range) return 'Salary not specified';

  return formatSalaryRange(range.min, range.max);
};

// Get random SA city
export const getRandomSACity = () => {
  const randomIndex = Math.floor(Math.random() * SA_MAJOR_CITIES.length);
  return SA_MAJOR_CITIES[randomIndex];
};

// Get tech hub info by city
export const getTechHub = city => {
  return SA_TECH_HUBS.find(
    hub => hub.city.toLowerCase() === city.toLowerCase()
  );
};

// Generate SA-localized mock user data
export const generateSAMockUser = (baseUser = {}) => {
  const city = getRandomSACity();
  const companies = SA_TECH_COMPANIES;
  const randomCompany = companies[Math.floor(Math.random() * companies.length)];
  const experienceLevels = ['junior', 'mid', 'senior', 'lead'];
  const randomLevel =
    experienceLevels[Math.floor(Math.random() * experienceLevels.length)];

  return {
    ...baseUser,
    location: city.fullName,
    currentRole: `${randomLevel === 'junior' ? 'Junior' : randomLevel === 'mid' ? 'Mid-level' : randomLevel === 'senior' ? 'Senior' : 'Lead'} Developer`,
    company: randomCompany,
    experienceLevel: randomLevel,
    salaryRange: getSalaryRange(randomLevel),
    techHub: getTechHub(city.city),
  };
};

// South African tech meetups and communities
export const SA_TECH_COMMUNITIES = [
  {
    name: 'JHB JS',
    city: 'Johannesburg',
    focus: 'JavaScript',
    url: 'https://www.meetup.com/johannesburg-javascript-meetup/',
  },
  {
    name: 'Cape Town Frontend',
    city: 'Cape Town',
    focus: 'Frontend Development',
    url: 'https://www.meetup.com/cape-town-frontend-developers/',
  },
  {
    name: 'Python ZA',
    city: 'Multiple',
    focus: 'Python',
    url: 'https://za.pycon.org/',
  },
  {
    name: 'DevOps Cape Town',
    city: 'Cape Town',
    focus: 'DevOps',
    url: 'https://www.meetup.com/cape-town-devops/',
  },
  {
    name: 'Silicon Cape',
    city: 'Cape Town',
    focus: 'Tech Entrepreneurship',
    url: 'https://siliconcape.com/',
  },
  {
    name: 'Jozi JUG',
    city: 'Johannesburg',
    focus: 'Java',
    url: 'https://www.meetup.com/johannesburg-java-user-group/',
  },
];

// Learning platforms popular in SA
export const SA_LEARNING_PLATFORMS = [
  {
    name: 'WeThinkCode_',
    url: 'https://wethinkcode.co.za/',
    type: 'Coding School',
    focus: 'Full-stack development',
    cost: 'Free',
  },
  {
    name: 'CodeCollege',
    url: 'https://codecollege.co.za/',
    type: 'Online Courses',
    focus: 'Web Development',
    cost: 'Paid',
  },
  {
    name: 'OfferZen',
    url: 'https://www.offerzen.com/',
    type: 'Job Platform + Learning',
    focus: 'Developer Career Growth',
    cost: 'Free + Premium',
  },
  {
    name: 'HyperionDev',
    url: 'https://www.hyperiondev.com/',
    type: 'Bootcamp',
    focus: 'Software Development',
    cost: 'Paid',
  },
];

// Validate SA phone number
export const validateSAPhoneNumber = phoneNumber => {
  // SA phone number patterns: +27 followed by 9 digits, or 0 followed by 9 digits
  const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  return saPhoneRegex.test(phoneNumber?.replace(/\s/g, ''));
};

// Format SA phone number
export const formatSAPhoneNumber = phoneNumber => {
  if (!phoneNumber) return '';

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Handle different input formats
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    // +27 format
    return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Local format
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phoneNumber; // Return original if can't format
};

// Get business hours for SA timezone (SAST - UTC+2)
export const getSABusinessHours = () => {
  const now = new Date();
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // UTC + 2
  const hour = saTime.getHours();

  return {
    isBusinessHours: hour >= 8 && hour < 17, // 8 AM to 5 PM SAST
    currentSATime: saTime,
    timeZone: 'SAST (UTC+2)',
  };
};

// Default export with commonly used utilities
export default {
  formatZAR,
  formatSalaryRange,
  getSalaryRange,
  generateSAMockUser,
  getRandomSACity,
  getTechHub,
  validateSAPhoneNumber,
  formatSAPhoneNumber,
  getSABusinessHours,
  SA_MAJOR_CITIES,
  SA_TECH_COMPANIES,
  SA_TECH_COMMUNITIES,
  SA_LEARNING_PLATFORMS,
};
