// India States, Districts, and Cities data
export const indiaStates = [
  'Kerala',
  'Karnataka', 
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Gujarat',
  'Rajasthan',
  'Punjab',
  'Haryana',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'West Bengal',
  'Bihar',
  'Odisha'
];

// State objects for internal mapping
const stateObjects = [
  { value: 'kerala', label: 'Kerala' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'odisha', label: 'Odisha' }
];

export const indiaDistricts = {
  'Kerala': [
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod'
  ],
  'Karnataka': [
    'Bengaluru Urban',
    'Bengaluru Rural',
    'Mysuru',
    'Dakshina Kannada',
    'Dharwad',
    'Belagavi',
    'Tumakuru',
    'Shivamogga',
    'Hassan',
    'Mandya',
    'Chitradurga',
    'Ballari'
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Erode',
    'Vellore',
    'Thanjavur',
    'Dindigul',
    'Kanyakumari',
    'Tiruppur'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Kakinada',
    'Rajahmundry',
    'Tirupati',
    'Anantapur',
    'Chittoor'
  ],
  'Telangana': [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Khammam',
    'Karimnagar',
    'Ramagundam',
    'Mahbubnagar',
    'Nalgonda'
  ],
  'Maharashtra': [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Solapur',
    'Kolhapur',
    'Thane',
    'Ahmednagar',
    'Satara'
  ],
  'Gujarat': [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Gandhinagar',
    'Anand'
  ],
  'Rajasthan': [
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Bikaner',
    'Udaipur',
    'Ajmer',
    'Alwar',
    'Bharatpur'
  ],
  'Punjab': [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Pathankot',
    'Hoshiarpur'
  ],
  'Haryana': [
    'Faridabad',
    'Gurgaon',
    'Panipat',
    'Ambala',
    'Yamunanagar',
    'Rohtak',
    'Hisar',
    'Karnal'
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Ghaziabad',
    'Agra',
    'Varanasi',
    'Meerut',
    'Allahabad',
    'Bareilly',
    'Aligarh',
    'Moradabad'
  ],
  'Madhya Pradesh': [
    'Indore',
    'Bhopal',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Dewas',
    'Satna'
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Siliguri',
    'Bardhaman',
    'Malda',
    'Baharampur'
  ],
  'Bihar': [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Darbhanga',
    'Purnia',
    'Bihar Sharif',
    'Arrah'
  ],
  'Odisha': [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Bhadrak'
  ]
};

export const cropTypes = [
  { value: 'rice', label: 'Rice (Paddy)' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'sugarcane', label: 'Sugarcane' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'jute', label: 'Jute' },
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'rubber', label: 'Rubber' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'arecanut', label: 'Arecanut' },
  { value: 'pepper', label: 'Pepper' },
  { value: 'cardamom', label: 'Cardamom' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'ginger', label: 'Ginger' },
  { value: 'banana', label: 'Banana' },
  { value: 'mango', label: 'Mango' },
  { value: 'cashew', label: 'Cashew' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'pulses', label: 'Pulses' },
  { value: 'millets', label: 'Millets' }
];

// Cities data (simplified for major cities)
export const indiaCities = {
  'Kerala': {
    'Thiruvananthapuram': ['Thiruvananthapuram', 'Neyyattinkara', 'Attingal', 'Varkala'],
    'Kollam': ['Kollam', 'Punalur', 'Karunagappally', 'Paravur'],
    'Ernakulam': ['Kochi', 'Aluva', 'Perumbavoor', 'Angamaly'],
    'Thrissur': ['Thrissur', 'Chalakudy', 'Kodungallur', 'Irinjalakuda'],
    'Kozhikode': ['Kozhikode', 'Vadakara', 'Koyilandy', 'Feroke'],
    'Kannur': ['Kannur', 'Thalassery', 'Payyanur', 'Mattannur']
  },
  'Karnataka': {
    'Bengaluru Urban': ['Bengaluru', 'Yelahanka', 'Devanahalli', 'Doddaballapur'],
    'Mysuru': ['Mysuru', 'Nanjangud', 'Hunsur', 'Piriyapatna'],
    'Dakshina Kannada': ['Mangaluru', 'Puttur', 'Sullia', 'Bantwal'],
    'Dharwad': ['Dharwad', 'Hubli', 'Kalghatgi', 'Navalgund']
  },
  'Tamil Nadu': {
    'Chennai': ['Chennai', 'Tambaram', 'Avadi', 'Ambattur'],
    'Coimbatore': ['Coimbatore', 'Tirupur', 'Pollachi', 'Mettupalayam'],
    'Madurai': ['Madurai', 'Dindigul', 'Theni', 'Usilampatti'],
    'Salem': ['Salem', 'Namakkal', 'Rasipuram', 'Attur']
  },
  'Maharashtra': {
    'Mumbai': ['Mumbai', 'Navi Mumbai', 'Thane', 'Kalyan'],
    'Pune': ['Pune', 'Pimpri-Chinchwad', 'Lonavala', 'Talegaon'],
    'Nagpur': ['Nagpur', 'Kamptee', 'Hingna', 'Parseoni'],
    'Nashik': ['Nashik', 'Malegaon', 'Sinnar', 'Igatpuri']
  },
  'Gujarat': {
    'Ahmedabad': ['Ahmedabad', 'Gandhinagar', 'Kalol', 'Sanand'],
    'Surat': ['Surat', 'Navsari', 'Bardoli', 'Kamrej'],
    'Vadodara': ['Vadodara', 'Anand', 'Bharuch', 'Padra'],
    'Rajkot': ['Rajkot', 'Morbi', 'Wankaner', 'Tankara']
  }
};

// Helper functions
export const getDistrictsByState = (state) => {
  return indiaDistricts[state] || [];
};

export const getCitiesByDistrict = (state, district) => {
  const stateCities = indiaCities[state];
  if (!stateCities) return [];
  
  const districtCities = stateCities[district];
  if (!districtCities) {
    // Return district name as default city if no specific cities found
    return [district];
  }
  
  return districtCities;
};