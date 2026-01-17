import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Upload, MapPin, DollarSign, Settings, Image, FileText, Sparkles, Check, X, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/axios';

// Car makes and their models
const CAR_DATA = {

  /* ===== GERMANY ===== */
  'BMW': ['1 Series','3 Series','5 Series','7 Series','X1','X3','X5','X7','M3','M5','Z4','i4','i7','iX'],
  'Mercedes-Benz': ['A-Class','C-Class','E-Class','S-Class','GLA','GLC','GLE','GLS','G-Class','AMG GT','Maybach','EQE','EQS'],
  'Audi': ['A3','A4','A6','A8','Q3','Q5','Q7','Q8','TT','R8','e-tron'],
  'Porsche': ['911','Cayenne','Macan','Panamera','Taycan','Boxster','Cayman'],
  'Volkswagen': ['Polo','Golf','Jetta','Passat','Tiguan','Touareg','Arteon','ID.4','ID.7'],
  'Opel': ['Corsa','Astra','Insignia','Mokka','Grandland'],
  'Smart': ['Fortwo','Forfour'],

  /* ===== ITALY ===== */
  'Ferrari': ['Roma','Portofino','F8','812','SF90','Purosangue'],
  'Lamborghini': ['Huracan','Aventador','Urus','Revuelto'],
  'Maserati': ['Ghibli','Quattroporte','Levante','Grecale','MC20'],
  'Alfa Romeo': ['Giulia','Stelvio','Tonale','Giulietta'],
  'Fiat': ['500','Panda','Tipo','Doblo'],
  'Pagani': ['Huayra','Zonda'],

  /* ===== UK ===== */
  'Rolls-Royce': ['Phantom','Ghost','Wraith','Cullinan','Spectre'],
  'Bentley': ['Continental GT','Flying Spur','Bentayga'],
  'Aston Martin': ['Vantage','DB11','DB12','DBX','Valhalla'],
  'Jaguar': ['XE','XF','XJ','F-Type','E-Pace','F-Pace'],
  'Land Rover': ['Range Rover','Range Rover Sport','Velar','Evoque','Defender','Discovery'],
  'McLaren': ['720S','750S','Artura','GT'],
  'Mini': ['Cooper','Countryman','Clubman'],
  'Lotus': ['Emira','Evija','Eletre'],

  /* ===== USA ===== */
  'Tesla': ['Model 3','Model S','Model X','Model Y','Cybertruck','Roadster'],
  'Ford': ['Fiesta','Focus','Mustang','Explorer','Escape','Edge','F-150','Bronco'],
  'Chevrolet': ['Spark','Malibu','Camaro','Corvette','Tahoe','Suburban','Silverado'],
  'Dodge': ['Charger','Challenger','Durango'],
  'Jeep': ['Wrangler','Grand Cherokee','Compass','Renegade','Gladiator'],
  'Cadillac': ['CT4','CT5','Escalade','Lyriq'],
  'Chrysler': ['300','Pacifica'],
  'GMC': ['Sierra','Yukon','Acadia'],
  'Rivian': ['R1T','R1S'],
  'Lucid': ['Air','Gravity'],

  /* ===== JAPAN ===== */
  'Toyota': ['Corolla','Camry','Yaris','Prius','RAV4','Highlander','Land Cruiser','Supra','Hilux'],
  'Lexus': ['IS','ES','GS','LS','NX','RX','GX','LX','LC'],
  'Honda': ['Civic','Accord','City','CR-V','HR-V','Pilot','Odyssey'],
  'Nissan': ['Micra','Sentra','Altima','Maxima','Qashqai','X-Trail','GT-R','370Z'],
  'Infiniti': ['Q50','Q60','QX50','QX60','QX80'],
  'Mazda': ['Mazda2','Mazda3','Mazda6','CX-5','CX-9','MX-5'],
  'Subaru': ['Impreza','Legacy','Outback','Forester','WRX','BRZ'],
  'Mitsubishi': ['Mirage','Lancer','ASX','Outlander','Pajero'],
  'Suzuki': ['Swift','Vitara','Jimny','Baleno'],
  'Isuzu': ['D-Max','MU-X'],

  /* ===== KOREA ===== */
  'Hyundai': ['Accent','Elantra','Sonata','Kona','Tucson','Santa Fe','Palisade','Ioniq 5'],
  'Kia': ['Rio','Cerato','K5','Soul','Sportage','Sorento','Telluride','EV6'],
  'Genesis': ['G70','G80','G90','GV70','GV80'],

  /* ===== FRANCE ===== */
  'Peugeot': ['208','308','508','2008','3008','5008'],
  'Renault': ['Clio','Megane','Talisman','Captur','Kadjar','Koleos'],
  'Citroën': ['C3','C4','C5','C5 Aircross'],
  'Bugatti': ['Chiron','Mistral','Tourbillon'],
  'DS Automobiles': ['DS3','DS4','DS7'],

  /* ===== CHINA / EV ===== */
  'BYD': ['Atto 3','Han','Tang','Seal'],
  'Geely': ['Coolray','Emgrand','Tugella'],
  'Chery': ['Tiggo 7','Tiggo 8'],
  'Great Wall': ['Haval H6','Tank 300'],
  'NIO': ['ES6','ES8','ET5','ET7'],
  'XPeng': ['P7','G6','G9'],
  'MG': ['ZS','HS','MG4','MG5'],
  'Zeekr': ['001','X'],

  /* ===== OTHER ===== */
  'Volvo': ['S60','S90','V60','XC40','XC60','XC90'],
  'Polestar': ['Polestar 2','Polestar 3','Polestar 4'],
  'Koenigsegg': ['Jesko','Regera','Gemera'],
  'Rimac': ['Nevera'],
  'Hennessey': ['Venom F5'],
  'SSC': ['Tuatara'],
  'Mahindra': ['Scorpio','XUV700'],
  'Tata': ['Nexon','Harrier','Safari'],
};


const CAR_COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 
  'Orange', 'Brown', 'Beige', 'Gold', 'Purple', 'Pink', 'Pearl White', 
  'Metallic Gray', 'Metallic Blue', 'Dark Blue', 'Light Blue', 'Burgundy'
];

const FEATURES = ['GPS', 'Bluetooth', 'Backup Camera', 'Sunroof', 'Leather Seats', 'Apple CarPlay', 'Android Auto', 'Heated Seats', 'Cruise Control', 'Parking Sensors'];
const ADD_ONS = ['Child Seat', 'GPS Device', 'Phone Holder', 'WiFi Hotspot', 'Roof Rack'];
const REASONS = ['Vacation', 'Business Trip', 'Wedding', 'Daily Use', 'Long Trip', 'Airport Transfer'];

// Map Component
function MapComponent({ center, selectedLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.L) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && window.L) {
      mapRef.current.setView([parseFloat(center.latitude), parseFloat(center.longitude)], 13);
    }
  }, [center]);

  useEffect(() => {
    if (selectedLocation && markerRef.current && window.L) {
      markerRef.current.setLatLng([
        parseFloat(selectedLocation.latitude),
        parseFloat(selectedLocation.longitude),
      ]);
    }
  }, [selectedLocation]);

  const initMap = () => {
    if (!window.L || mapRef.current) return;

    const map = window.L.map("map-container").setView(
      [parseFloat(center.latitude), parseFloat(center.longitude)],
      13
    );

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = window.L.marker([parseFloat(center.latitude), parseFloat(center.longitude)], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
  };

  return <div id="map-container" className="w-full h-full" />;
}

export const CreateCarPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentLocationField, setCurrentLocationField] = useState(null);
  const [tempMapLocation, setTempMapLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    color: '',
    mileage: 0,
    fuelType: '',
    transmission: '',
    wheelsDrive: '',
    carCategory: '',
    seats: 5,
    doors: 4,
    dailyRate: '',
    holidayRate: '',
    notes: '',
    requireDeposit: false,
    depositAmount: 0,
    deliveryAvailable: false,
    deliveryFees: 0,
    driverAvailable: false,
    driverFees: 0,
    maxDrivingMileage: '',
    minRentalDays: 1,
    selectedFeatures: [],
    selectedAddons: [],
    selectedReasons: [],
    liveLocation: { address: '', latitude: 0, longitude: 0 },
    deliveryLocation: { address: '', latitude: 0, longitude: 0 },
    returnLocation: { address: '', latitude: 0, longitude: 0 },
  });
  
  const [images, setImages] = useState({
    main: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });
  
  const [imagePreviews, setImagePreviews] = useState({
    main: null,
    front: null,
    back: null,
    left: null,
    right: null,
  });

  // Update available models when make changes
  useEffect(() => {
    if (formData.make && CAR_DATA[formData.make]) {
      setAvailableModels(CAR_DATA[formData.make]);
      // Reset model if it's not valid for the new make
      if (!CAR_DATA[formData.make].includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }));
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.make]);

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleImageChange = (type, file) => {
    if (file) {
      setImages((prev) => ({ ...prev, [type]: file }));
      setImagePreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const removeImage = (type) => {
    setImages((prev) => ({ ...prev, [type]: null }));
    setImagePreviews((prev) => ({ ...prev, [type]: null }));
  };

  // Location handlers
  const getCurrentLocation = (field) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          address: formData[field].address || '',
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        };
        setFormData((prev) => ({
          ...prev,
          [field]: location,
        }));
        toast.success("Location detected successfully!");
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Could not get your location. Please select manually.");
      }
    );
  };

  const openMapPicker = (field) => {
    setCurrentLocationField(field);
    const currentLoc = formData[field];
    setTempMapLocation({
      latitude: currentLoc.latitude || 33.8547,
      longitude: currentLoc.longitude || 35.8623,
    });
    setShowMapModal(true);
  };

  const handleMapClick = (lat, lng) => {
    setTempMapLocation({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    });
  };

  const confirmLocationSelection = () => {
    if (tempMapLocation && currentLocationField) {
      setFormData((prev) => ({
        ...prev,
        [currentLocationField]: {
          address: prev[currentLocationField].address || '',
          latitude: tempMapLocation.latitude,
          longitude: tempMapLocation.longitude,
        },
      }));
      toast.success("Location selected!");
      setShowMapModal(false);
      setCurrentLocationField(null);
    } else {
      toast.error("Please select a location on the map");
    }
  };

  const handleLocationAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], address: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    
    // Append required fields
    data.append('make', formData.make);
    data.append('model', formData.model);
    data.append('year', formData.year);
    data.append('license_plate', formData.licensePlate.toUpperCase());
    
    // Map fuel type to backend values
    const fuelTypeMap = {
      'Petrol': 'benz',
      'Diesel': 'diesel',
      'Electric': 'electric',
      'Hybrid': 'hybrid'
    };
    data.append('fuel_type', fuelTypeMap[formData.fuelType] || formData.fuelType.toLowerCase());
    
    // Map transmission to lowercase
    data.append('transmission', formData.transmission.toLowerCase());
    
    // Map car category to lowercase
    data.append('car_category', formData.carCategory.toLowerCase());
    
    data.append('daily_rate', formData.dailyRate);
    data.append('seats', formData.seats);
    data.append('doors', formData.doors);
    
    // Append optional fields
    if (formData.color) data.append('color', formData.color);
    if (formData.mileage) data.append('mileage', formData.mileage);
    if (formData.wheelsDrive) data.append('wheels_drive', formData.wheelsDrive.toLowerCase());
    if (formData.holidayRate) data.append('holiday_rate', formData.holidayRate);
    if (formData.notes) data.append('notes', formData.notes);
    if (formData.maxDrivingMileage) data.append('max_driving_mileage', formData.maxDrivingMileage);
    if (formData.minRentalDays) data.append('min_rental_days', formData.minRentalDays);
    
    // Append arrays
    formData.selectedFeatures.forEach((f) => data.append('features[]', f));
    formData.selectedAddons.forEach((a) => data.append('car_add_on[]', a));
    formData.selectedReasons.forEach((r) => data.append('reason_of_rent[]', r));
    
    // Append booleans and related fields
    data.append('is_deposit', formData.requireDeposit ? '1' : '0');
    if (formData.requireDeposit && formData.depositAmount > 0) {
      data.append('deposit', formData.depositAmount);
    }
    
    data.append('is_delivered', formData.deliveryAvailable ? '1' : '0');
    if (formData.deliveryAvailable && formData.deliveryFees > 0) {
      data.append('delivery_fees', formData.deliveryFees);
    }
    
    data.append('with_driver', formData.driverAvailable ? '1' : '0');
    if (formData.driverAvailable && formData.driverFees > 0) {
      data.append('driver_fees', formData.driverFees);
    }
    
    // Append locations as JSON strings
    data.append('live_location', JSON.stringify(formData.liveLocation));
    data.append('delivery_location', JSON.stringify(formData.deliveryLocation));
    data.append('return_location', JSON.stringify(formData.returnLocation));
    
    // Append images as files
    if (images.main) data.append('main_image_url', images.main);
    if (images.front) data.append('front_image_url', images.front);
    if (images.back) data.append('back_image_url', images.back);
    if (images.left) data.append('left_image_url', images.left);
    if (images.right) data.append('right_image_url', images.right);

    try {
      const response = await api.post('/cars', data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
      });
      
      console.log('Car created successfully:', response.data);
      toast.success('Car created successfully! Waiting for admin approval.');
      navigate('/agent/cars');
    } catch (err) {
      console.error('Create car error:', err.response?.data);
      const errors = err.response?.data?.errors;
      
      if (errors) {
        // Show each validation error
        Object.entries(errors).forEach(([field, messages]) => {
          messages.forEach(msg => toast.error(`${field}: ${msg}`));
        });
      } else {
        const message = err.response?.data?.error || err.response?.data?.message || 'Failed to create car';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 dark:from-gray-950 dark:via-teal-950/20 dark:to-cyan-950/20 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>

              <Button
                variant="secondary"
                className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                onClick={() => navigate('/agent/cars')}
              >
                <Car className="w-4 h-4 mr-2" />
                Go to Cars Page
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Create New Car</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Add a premium vehicle to your fleet</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Make <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select Make...</option>
                      {Object.keys(CAR_DATA).sort().map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={!formData.make}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Model...</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    {!formData.make && (
                      <p className="text-xs text-gray-500 mt-1">Please select a make first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="e.g., 2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      License Plate <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g., ABC-1234"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select Color...</option>
                      {CAR_COLORS.map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mileage (km)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 15000"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Specifications */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Specifications</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select...</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select...</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Wheels Drive</label>
                    <select
                      value={formData.wheelsDrive}
                      onChange={(e) => setFormData({ ...formData, wheelsDrive: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select...</option>
                      <option value="4x4">4x4</option>
                      <option value="Front">Front</option>
                      <option value="Rear">Rear</option>
                      <option value="Autoblock">Autoblock</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Seats <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Doors <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="number"
                      placeholder="e.g., 4"
                      value={formData.doors}
                      onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.carCategory}
                      onChange={(e) => setFormData({ ...formData, carCategory: e.target.value })}
                      className="w-full h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl px-4 bg-white dark:bg-gray-900"
                    >
                      <option value="">Select...</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Sport">Sport</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Normal">Normal</option>
                      <option value="Event">Event</option>
                      <option value="Sea">Sea</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Add-ons */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Features & Add-ons</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Features (Click to select)</label>
                    <div className="flex flex-wrap gap-3">
                      {FEATURES.map((feature) => (
                        <Badge
                          key={feature}
                          onClick={() => toggleSelection(feature, formData.selectedFeatures, (selected) => setFormData({ ...formData, selectedFeatures: selected }))}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            formData.selectedFeatures.includes(feature)
                              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {formData.selectedFeatures.includes(feature) && <Check className="w-3 h-3 mr-1" />}
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Add-ons (Click to select)</label>
                    <div className="flex flex-wrap gap-3">
                      {ADD_ONS.map((addon) => (
                        <Badge
                          key={addon}
                          onClick={() => toggleSelection(addon, formData.selectedAddons, (selected) => setFormData({ ...formData, selectedAddons: selected }))}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            formData.selectedAddons.includes(addon)
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {formData.selectedAddons.includes(addon) && <Check className="w-3 h-3 mr-1" />}
                          {addon}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Reason of Rent (Click to select)</label>
                    <div className="flex flex-wrap gap-3">
                      {REASONS.map((reason) => (
                        <Badge
                          key={reason}
                          onClick={() => toggleSelection(reason, formData.selectedReasons, (selected) => setFormData({ ...formData, selectedReasons: selected }))}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            formData.selectedReasons.includes(reason)
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {formData.selectedReasons.includes(reason) && <Check className="w-3 h-3 mr-1" />}
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Rental Terms */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pricing & Rental Terms</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Daily Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        required
                        type="number"
                        placeholder="100"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Holiday Rate</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="150"
                        value={formData.holidayRate}
                        onChange={(e) => setFormData({ ...formData, holidayRate: e.target.value })}
                        className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Rental Days</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
                      value={formData.minRentalDays}
                      onChange={(e) => setFormData({ ...formData, minRentalDays: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Driving Mileage/Day (km)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 200"
                      value={formData.maxDrivingMileage}
                      onChange={(e) => setFormData({ ...formData, maxDrivingMileage: e.target.value })}
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <input
                      type="checkbox"
                      id="requireDeposit"
                      checked={formData.requireDeposit}
                      onChange={(e) => setFormData({ ...formData, requireDeposit: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="requireDeposit" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Require Deposit
                    </label>
                  </div>
                  {formData.requireDeposit && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deposit Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          placeholder="500"
                          value={formData.depositAmount}
                          onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery & Driver Options */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery & Driver Options</h2>
                </div>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="deliveryAvailable"
                      checked={formData.deliveryAvailable}
                      onChange={(e) => setFormData({ ...formData, deliveryAvailable: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="deliveryAvailable" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Delivery Available
                    </label>
                  </div>
                  {formData.deliveryAvailable && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery Fee</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          placeholder="50"
                          value={formData.deliveryFees}
                          onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="driverAvailable"
                      checked={formData.driverAvailable}
                      onChange={(e) => setFormData({ ...formData, driverAvailable: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="driverAvailable" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Driver Available
                    </label>
                  </div>
                  {formData.driverAvailable && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Driver Fee Per Day</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="number"
                          placeholder="50"
                          value={formData.driverFees}
                          onChange={(e) => setFormData({ ...formData, driverFees: e.target.value })}
                          className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl pl-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Car Images */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Car Images</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {['main', 'front', 'back', 'left', 'right'].map((type) => (
                    <div key={type} className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {type === 'main' ? 'Main Image *' : `${type.charAt(0).toUpperCase() + type.slice(1)} Image`}
                      </label>
                      <div className="relative">
                        {imagePreviews[type] ? (
                          <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-300">
                            <img src={imagePreviews[type]} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(type)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageChange(type, e.target.files[0])}
                            />
                            <div className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center hover:border-teal-500 transition bg-gray-50">
                              <Upload className="w-10 h-10 text-gray-400" />
                              <span className="text-sm text-gray-500 mt-2">Click to upload</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location Information</h2>
                </div>
                {['liveLocation', 'deliveryLocation', 'returnLocation'].map((field) => {
                  const label =
                    field === 'liveLocation' ? 'Live Location' : field === 'deliveryLocation' ? 'Delivery Location' : 'Return Location';
                  const loc = formData[field];
                  const hasLocation = loc.latitude && loc.longitude && loc.latitude !== 0 && loc.longitude !== 0;
                  
                  return (
                    <div key={field} className="mb-6 p-5 border-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h4 className="font-semibold mb-4 text-lg">{label}</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Address</label>
                          <Input
                            placeholder="e.g., Beirut, Lebanon"
                            value={loc.address}
                            onChange={(e) => handleLocationAddressChange(field, e.target.value)}
                            className="h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => getCurrentLocation(field)}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Use Current Location
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openMapPicker(field)}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Select on Map
                          </Button>
                        </div>

                        {hasLocation ? (
                          <div className="p-4 bg-primary/10 border-2 border-primary/20 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm mb-1">Location Selected</p>
                                <p className="text-sm text-muted-foreground">
                                  Latitude: {loc.latitude}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Longitude: {loc.longitude}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted/30 border-2 border-dashed rounded-lg text-center">
                            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No location selected yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click one of the buttons above to set location
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-2 border-transparent hover:border-teal-500/30 transition-all duration-300 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Additional Information</h2>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <textarea
                    placeholder="Any additional information about the vehicle..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={5}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl p-4 bg-white dark:bg-gray-900 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={loading || !images.main}
                className="px-8 py-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Upload className="w-5 h-5 mr-2" />
                {loading ? 'Creating Car...' : 'Create Car Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>
              Click on the map or drag the marker to select the location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="w-full h-[500px] bg-muted rounded-lg overflow-hidden">
              {tempMapLocation && (
                <MapComponent
                  center={tempMapLocation}
                  selectedLocation={tempMapLocation}
                  onLocationSelect={handleMapClick}
                />
              )}
            </div>

            {tempMapLocation && (
              <div className="p-3 bg-muted/50 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Selected:</span> {tempMapLocation.latitude}, {tempMapLocation.longitude}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowMapModal(false)}>
                Cancel
              </Button>
              <Button onClick={confirmLocationSelection}>
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateCarPage;
