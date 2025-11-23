// Mock car rental data

export const brands = [
  'All Brands',
  'BMW',
  'Mercedes',
  'Audi',
  'Tesla',
  'Porsche',
  'Lexus',
  'Range Rover',
  'Jaguar'
];

export const carTypes = [
  'All Types',
  'Sedan',
  'SUV',
  'Sports',
  'Luxury',
  'Electric',
  'Convertible'
];

export const transmissionTypes = [
  'All',
  'Automatic',
  'Manual'
];

export const carsData = [
  {
    id: 1,
    brand: 'BMW',
    model: 'M5 Competition',
    type: 'Sports',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    price: 299,
    rating: 4.8,
    reviews: 127,
    image: '/ali1new.jpg',
    images: [
      '/ali2.jpg',
      '/ali3.jpg',
      '/ali4.jpg'
    ],
    description: 'Experience the perfect blend of luxury and performance with the BMW M5 Competition. This high-performance sedan delivers 617 horsepower and can accelerate from 0-60 mph in just 3.1 seconds.',
    features: ['Sport Mode', 'Leather Interior', 'Premium Sound', 'Navigation', 'Adaptive Cruise Control', 'Parking Assist'],
    popular: true
  },
  {
    id: 2,
    brand: 'Mercedes',
    model: 'S-Class',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 5,
    price: 349,
    rating: 4.9,
    reviews: 203,
    image: '/ali6.jpg',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1617531653520-bd788a65c79a?w=800&q=80',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'
    ],
    description: 'The epitome of luxury and innovation. The Mercedes S-Class offers unparalleled comfort with cutting-edge technology and a supremely refined driving experience.',
    features: ['Massage Seats', 'Ambient Lighting', 'Executive Rear Seats', 'Burmester Sound', 'Active Safety', 'Night Vision'],
    popular: true
  },
  {
    id: 3,
    brand: 'Tesla',
    model: 'Model S Plaid',
    type: 'Electric',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 5,
    price: 279,
    rating: 4.7,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80'
    ],
    description: 'The quickest accelerating production car ever made. The Tesla Model S Plaid reaches 0-60 mph in under 2 seconds with a top speed of 200 mph.',
    features: ['Autopilot', 'Premium Connectivity', 'Supercharging', 'Glass Roof', 'HEPA Air Filter', 'Gaming Computer'],
    popular: true
  },
  {
    id: 4,
    brand: 'Range Rover',
    model: 'Sport HSE',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    seats: 7,
    price: 329,
    rating: 4.6,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'
    ],
    description: 'Commanding presence meets refined luxury. The Range Rover Sport HSE delivers exceptional off-road capability while maintaining an elegant and comfortable ride.',
    features: ['Terrain Response', 'Air Suspension', 'Panoramic Roof', 'Meridian Sound', 'Wade Sensing', '7-Seater'],
    popular: false
  },
  {
    id: 5,
    brand: 'Porsche',
    model: '911 Carrera',
    type: 'Sports',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 2,
    price: 399,
    rating: 4.9,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80',
      'https://images.unsplash.com/photo-1611651149758-ab7796b5e5ec?w=800&q=80'
    ],
    description: 'The iconic sports car that defines performance excellence. The Porsche 911 Carrera combines timeless design with cutting-edge engineering for an unforgettable driving experience.',
    features: ['Sport Chrono', 'PASM Suspension', 'Sport Exhaust', 'Porsche Track Precision', 'Carbon Fiber', 'Launch Control'],
    popular: true
  },
  {
    id: 6,
    brand: 'Audi',
    model: 'e-tron GT',
    type: 'Electric',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 4,
    price: 289,
    rating: 4.7,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f8f8c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f8f8c?w=800&q=80',
      'https://images.unsplash.com/photo-1610768764270-790fbec18178?w=800&q=80',
      'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=800&q=80'
    ],
    description: 'Electric performance redefined. The Audi e-tron GT delivers exhilarating acceleration and exceptional range in a stunning grand tourer package.',
    features: ['Quattro AWD', 'Matrix LED', 'Virtual Cockpit', 'Fast Charging', 'Adaptive Air Suspension', 'Bang & Olufsen'],
    popular: false
  },
  {
    id: 7,
    brand: 'Lexus',
    model: 'LC 500',
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 2,
    price: 319,
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80',
      'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
    ],
    description: 'A masterpiece of Japanese craftsmanship. The Lexus LC 500 combines breathtaking design with a naturally aspirated V8 engine for an unforgettable grand touring experience.',
    features: ['Mark Levinson Audio', 'Adaptive Variable Suspension', 'Head-Up Display', 'Handcrafted Interior', 'Sport Mode', 'Active Rear Steering'],
    popular: false
  },
  {
    id: 8,
    brand: 'BMW',
    model: 'X7 M50i',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 7,
    price: 359,
    rating: 4.7,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80'
    ],
    description: 'The ultimate luxury SUV for families who demand both space and performance. The BMW X7 M50i offers seating for seven without compromising on power or prestige.',
    features: ['Sky Lounge Panoramic', 'Executive Lounge Seating', 'Gesture Control', 'Harman Kardon', 'Wireless Charging', 'Trailer Assist'],
    popular: false
  },
  {
    id: 9,
    brand: 'Mercedes',
    model: 'AMG GT',
    type: 'Sports',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 2,
    price: 429,
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80',
      'https://images.unsplash.com/photo-1611651149758-ab7796b5e5ec?w=800&q=80'
    ],
    description: 'Pure automotive passion. The Mercedes-AMG GT combines race-bred performance with everyday usability, delivering an exhilarating driving experience on any road.',
    features: ['AMG Performance Exhaust', 'AMG Ride Control', 'Race Mode', 'Carbon Fiber Package', 'Performance Seats', 'AMG Track Pace'],
    popular: true
  },
  {
    id: 10,
    brand: 'Jaguar',
    model: 'F-Type R',
    type: 'Convertible',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 2,
    price: 339,
    rating: 4.6,
    reviews: 87,
    image: 'https://images.unsplash.com/photo-1580414057167-d31b2f96f6c8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1580414057167-d31b2f96f6c8?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
      'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&q=80'
    ],
    description: 'British sports car excellence. The Jaguar F-Type R delivers supercharged V8 performance with stunning design and an exhaust note that will make your heart race.',
    features: ['Configurable Dynamics', 'Active Exhaust', 'Convertible Top', 'Meridian Sound', 'Performance Brakes', 'Torque Vectoring'],
    popular: false
  },
  {
    id: 11,
    brand: 'Audi',
    model: 'RS Q8',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    price: 369,
    rating: 4.8,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80'
    ],
    description: 'The pinnacle of performance SUVs. The Audi RS Q8 combines brutal acceleration with sophisticated handling and luxurious comfort for the ultimate all-weather sports car.',
    features: ['Sport Differential', 'Dynamic All-Wheel Steering', 'Carbon Ceramic Brakes', 'RS Sport Exhaust', 'Matrix LED', 'Virtual Cockpit Plus'],
    popular: false
  },
  {
    id: 12,
    brand: 'Tesla',
    model: 'Model X',
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 7,
    price: 299,
    rating: 4.7,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80'
    ],
    description: 'The future of family transportation. The Tesla Model X offers falcon-wing doors, seating for seven, and acceleration that rivals sports cars, all with zero emissions.',
    features: ['Falcon Wing Doors', 'Full Self-Driving', 'HEPA Filter', 'Bioweapon Defense Mode', '17" Touchscreen', 'Dog Mode'],
    popular: true
  }
];

// Featured cars for homepage
export const featuredCars = carsData.filter(car => car.popular);

// Testimonials
export const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Business Executive',
    image: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment: 'Exceptional service! The BMW M5 was in perfect condition and the booking process was seamless. Will definitely use again for my next business trip.'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Tech Entrepreneur',
    image: 'https://i.pravatar.cc/150?img=13',
    rating: 5,
    comment: 'The Tesla Model S Plaid was incredible! Fast, comfortable, and the customer service team was incredibly helpful throughout my rental period.'
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Travel Blogger',
    image: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment: 'Best luxury car rental experience ever! The Mercedes S-Class made my road trip unforgettable. Great prices and amazing vehicle selection.'
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Real Estate Developer',
    image: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment: 'Professional service from start to finish. The Porsche 911 was a dream to drive. Highly recommended for anyone looking for premium rentals!'
  }
];