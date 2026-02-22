import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  MousePointerClick,
  Calendar,
  DollarSign,
  MapPin,
  Gauge,
  X,
  Check,
  Navigation,
  Building2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { motion } from 'framer-motion';

const currentYear = new Date().getFullYear();
const VALID_STATUSES = ['available', 'not_available', 'rented', 'maintenance'];
const VALID_TRANSMISSIONS = ['automatic', 'manual'];

// Lebanese governorates / regions for address dropdown (same as Add Car)
const ADDRESS_OPTIONS = [
  'Beirut', 'Mount Lebanon', 'North', 'South', 'Bekaa', 'Baalbek', 'Keserwan', 'Nabatieh', 'Akkar',
];

// Logo colors
const COLORS = {
  darkBlue: '#0E4C81',
  teal: '#008C95',
  limeGreen: '#8AC640',
  darkBlueDim: 'rgba(14, 76, 129, 0.1)',
  tealDim: 'rgba(0, 140, 149, 0.1)',
  limeGreenDim: 'rgba(138, 198, 64, 0.1)',
};

// Car makes and models (same as Create Car page)
const CAR_MAKES_AND_MODELS = {
  'BMW': ['1 Series','3 Series','5 Series','7 Series','X1','X3','X5','X7','M3','M5','Z4','i4','i7','iX'],
  'Mercedes-Benz': ['A-Class','C-Class','E-Class','S-Class','GLA','GLC','GLE','GLS','G-Class','AMG GT','Maybach','EQE','EQS'],
  'Audi': ['A3','A4','A6','A8','Q3','Q5','Q7','Q8','TT','R8','e-tron'],
  'Porsche': ['911','Cayenne','Macan','Panamera','Taycan','Boxster','Cayman'],
  'Volkswagen': ['Polo','Golf','Jetta','Passat','Tiguan','Touareg','Arteon','ID.4','ID.7'],
  'Opel': ['Corsa','Astra','Insignia','Mokka','Grandland'],
  'Smart': ['Fortwo','Forfour'],
  'Ferrari': ['Roma','Portofino','F8','812','SF90','Purosangue'],
  'Lamborghini': ['Huracan','Aventador','Urus','Revuelto'],
  'Maserati': ['Ghibli','Quattroporte','Levante','Grecale','MC20'],
  'Alfa Romeo': ['Giulia','Stelvio','Tonale','Giulietta'],
  'Fiat': ['500','Panda','Tipo','Doblo'],
  'Pagani': ['Huayra','Zonda'],
  'Rolls-Royce': ['Phantom','Ghost','Wraith','Cullinan','Spectre'],
  'Bentley': ['Continental GT','Flying Spur','Bentayga'],
  'Aston Martin': ['Vantage','DB11','DB12','DBX','Valhalla'],
  'Jaguar': ['XE','XF','XJ','F-Type','E-Pace','F-Pace'],
  'Land Rover': ['Range Rover','Range Rover Sport','Velar','Evoque','Defender','Discovery'],
  'McLaren': ['720S','750S','Artura','GT'],
  'Mini': ['Cooper','Countryman','Clubman'],
  'Lotus': ['Emira','Evija','Eletre'],
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
  'Hyundai': ['Accent','Elantra','Sonata','Kona','Tucson','Santa Fe','Palisade','Ioniq 5'],
  'Kia': ['Rio','Cerato','K5','Soul','Sportage','Sorento','Telluride','EV6'],
  'Genesis': ['G70','G80','G90','GV70','GV80'],
  'Peugeot': ['208','308','508','2008','3008','5008'],
  'Renault': ['Clio','Megane','Talisman','Captur','Kadjar','Koleos'],
  'Citroën': ['C3','C4','C5','C5 Aircross'],
  'Bugatti': ['Chiron','Mistral','Tourbillon'],
  'DS Automobiles': ['DS3','DS4','DS7'],
  'BYD': ['Atto 3','Han','Tang','Seal'],
  'Geely': ['Coolray','Emgrand','Tugella'],
  'Chery': ['Tiggo 7','Tiggo 8'],
  'Great Wall': ['Haval H6','Tank 300'],
  'NIO': ['ES6','ES8','ET5','ET7'],
  'XPeng': ['P7','G6','G9'],
  'MG': ['ZS','HS','MG4','MG5'],
  'Zeekr': ['001','X'],
  'Volvo': ['S60','S90','V60','XC40','XC60','XC90'],
  'Polestar': ['Polestar 2','Polestar 3','Polestar 4'],
  'Koenigsegg': ['Jesko','Regera','Gemera'],
  'Rimac': ['Nevera'],
  'Hennessey': ['Venom F5'],
  'SSC': ['Tuatara'],
  'Mahindra': ['Scorpio','XUV700'],
  'Tata': ['Nexon','Harrier','Safari'],
};

const CAR_MAKES_LIST = ['Other', ...Object.keys(CAR_MAKES_AND_MODELS).sort()];

const CAR_COLORS = [
  'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
  'Orange', 'Brown', 'Beige', 'Gold', 'Purple', 'Pink', 'Pearl White',
  'Metallic Gray', 'Metallic Blue', 'Dark Blue', 'Light Blue', 'Burgundy',
];

const FEATURES = ['GPS', 'Bluetooth', 'Backup Camera', 'Sunroof', 'Leather Seats', 'Apple CarPlay', 'Android Auto', 'Heated Seats', 'Cruise Control', 'Parking Sensors'];
const ADD_ONS = ['Child Seat', 'GPS Device', 'Phone Holder', 'WiFi Hotspot', 'Roof Rack'];

function parseGoogleMapsLink(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const atMatch = trimmed.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const qMatch = trimmed.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  const llMatch = trimmed.match(/(?:!3d|!4d|!1d)(-?\d+\.?\d*)/g);
  if (llMatch && llMatch.length >= 2) {
    const lat = parseFloat(llMatch[0].replace(/\D/g, ''));
    const lng = parseFloat(llMatch[1].replace(/\D/g, ''));
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}
function isShortMapLink(url) {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:)?\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url.trim());
}
async function resolveShortMapLinkViaBackend(url) {
  try {
    const { data } = await api.get('/resolve-map-link', { params: { url: (url || '').trim() } });
    const lat = data?.lat ?? data?.latitude;
    const lng = data?.lng ?? data?.longitude;
    if (lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
      return { lat: Number(lat), lng: Number(lng) };
    }
  } catch { /* ignore */ }
  return null;
}
function getAgencyOfficeLocation() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    let loc = user?.agent?.location;
    if (!loc) return null;
    if (typeof loc === 'string') {
      loc = JSON.parse(loc);
      if (typeof loc === 'string') loc = JSON.parse(loc);
    }
    const lat = loc?.lat ?? loc?.latitude;
    const lng = loc?.lng ?? loc?.longitude;
    if (lat != null && lng != null) return { latitude: String(Number(lat)), longitude: String(Number(lng)) };
    return null;
  } catch {
    return null;
  }
}

function EditLocationMapComponent({ center, selectedLocation, onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if (window.L) initMap();
  }, []);
  useEffect(() => {
    if (mapRef.current && window.L && center?.latitude != null && center?.longitude != null) {
      mapRef.current.setView([parseFloat(center.latitude), parseFloat(center.longitude)], 13);
    }
  }, [center?.latitude, center?.longitude]);
  useEffect(() => {
    if (selectedLocation && markerRef.current && window.L) {
      markerRef.current.setLatLng([parseFloat(selectedLocation.latitude), parseFloat(selectedLocation.longitude)]);
    }
  }, [selectedLocation]);
  const initMap = () => {
    if (!window.L || mapRef.current) return;
    const lat = parseFloat(center?.latitude) || 33.8547;
    const lng = parseFloat(center?.longitude) || 35.8623;
    const map = window.L.map('edit-location-map').setView([lat, lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      onLocationSelect(pos.lat, pos.lng);
    });
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;
    markerRef.current = marker;
  };
  return <div id="edit-location-map" className="w-full h-full min-h-[300px]" />;
}

const CAR_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'suv', label: 'SUV' },
  { value: 'crossover', label: 'Crossover' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'convertible', label: 'Convertible' },
];

const CAR_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'rejected':
    default:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'luxury':
      return 'text-white';
    case 'sport':
      return 'text-white';
    default:
      return 'text-white';
  }
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'luxury':
      return COLORS.darkBlue;
    case 'sport':
      return COLORS.limeGreen;
    default:
      return COLORS.teal;
  }
};

const CarDetailModal = ({ car, onClose }) => {
  if (!car) return null;
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]"
      >
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: COLORS.tealDim }}
          onClick={onClose}
        >
          <X className="w-5 h-5" style={{ color: COLORS.teal }} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {car.make} {car.model}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{car.year} • {car.license_plate}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.tealDim }}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" style={{ color: COLORS.teal }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Views</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.teal }}>{car.views_count || 0}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.darkBlueDim }}>
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="w-4 h-4" style={{ color: COLORS.darkBlue }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Clicks</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.darkBlue }}>{car.clicks_count ?? 0}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.limeGreenDim }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" style={{ color: COLORS.limeGreen }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Daily Rate</span>
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.limeGreen }}>${car.daily_rate}</p>
            </div>

            <div className="bg-gradient-to-br p-3 rounded-xl" style={{ background: COLORS.tealDim }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" style={{ color: COLORS.teal }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
              </div>
              <Badge className={`text-xs ${getStatusBadgeClass(car.status)}`}>
                {car.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{ height: '240px' }}>
              {car.main_image_url ? (
                <img
                  src={`/api/storage/${car.main_image_url}`}
                  alt="Main"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: COLORS.tealDim }}>
                  <Car className="w-16 h-16" style={{ color: COLORS.teal, opacity: 0.3 }} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['front', 'back', 'left', 'right'].map((dir) => (
                car[`${dir}_image_url`] ? (
                  <div key={dir} className="relative rounded-lg overflow-hidden shadow" style={{ height: '70px' }}>
                    <img
                      src={`/api/storage/${car[`${dir}_image_url`]}`}
                      alt={dir}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div key={dir} className="rounded-lg flex items-center justify-center" style={{ height: '70px', background: COLORS.tealDim }}>
                    <Car className="w-6 h-6" style={{ color: COLORS.teal, opacity: 0.3 }} />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <DetailRow icon={Car} label="Category" value={car.car_category} />
            <DetailRow icon={DollarSign} label="Holiday Rate" value={`$${car.holiday_rate}/day`} />
            <DetailRow icon={Gauge} label="Mileage" value={`${car.mileage?.toLocaleString()} km`} />
            <DetailRow label="Color" value={car.color} />
            <DetailRow label="Fuel Type" value={car.fuel_type} />
            <DetailRow label="Transmission" value={car.transmission} />
            <DetailRow label="Wheel Drive" value={car.wheels_drive} />
            <DetailRow label="Seats" value={car.seats} />
            <DetailRow label="Doors" value={car.doors} />
            <DetailRow label="Max Driving Mileage" value={`${car.max_driving_mileage} km`} />
            <DetailRow label="Min Rental Days" value={car.min_rental_days} />
            <DetailRow label="Add-Ons" value={safeArray(car.car_add_on).join(', ') || 'N/A'} />
            <DetailRow label="Features" value={safeArray(car.features).join(', ') || 'N/A'} />
            <DetailRow label="Reason for Rent" value={safeArray(car.reason_of_rent).join(', ') || 'N/A'} />
            {car.notes && <DetailRow label="Notes" value={car.notes} />}
            <DetailRow icon={MapPin} label="Delivery Location" value={car.delivery_location?.address || 'N/A'} />
            <DetailRow icon={MapPin} label="Return Location" value={car.return_location?.address || 'N/A'} />
            {car.live_location && <DetailRow icon={MapPin} label="Current Location" value={car.live_location.address} badge />}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-800">
    {Icon && <Icon className="w-4 h-4 mt-0.5" style={{ color: COLORS.teal }} />}
    <div className="flex-1">
      <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>
      {badge ? (
        <Badge className="ml-2 text-xs" style={{ background: COLORS.teal, color: 'white' }}>{value}</Badge>
      ) : (
        <span className="ml-2 text-gray-600 dark:text-gray-400">{value}</span>
      )}
    </div>
  </div>
);

export const MyCarsPage = () => {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'all', status: 'all' });
  const [selectedCar, setSelectedCar] = useState(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showLocationMapModal, setShowLocationMapModal] = useState(false);
  const [tempMapLocation, setTempMapLocation] = useState(null);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [editLocationGoogleLink, setEditLocationGoogleLink] = useState('');
  const [linkResolvingField, setLinkResolvingField] = useState(null);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cars/agent/Mycars', {
        params: { per_page: 1000 },
      });
      const list = data.cars?.data ?? data.cars ?? data?.data ?? [];
      setAllCars(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to fetch cars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters({ search: '', category: 'all', status: 'all' });

  const [deleteModalCar, setDeleteModalCar] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const openDeleteModal = (car) => {
    setDeleteModalCar(car);
    setDeleteConfirmText('');
  };

  const closeDeleteModal = () => {
    setDeleteModalCar(null);
    setDeleteConfirmText('');
  };

  const confirmDelete = async () => {
    if (!deleteModalCar || deleteConfirmText.toLowerCase() !== 'delete') return;
    try {
      await api.delete(`/cars/${deleteModalCar.id}`);
      toast.success('Car deleted successfully.');
      setAllCars((prev) => prev.filter((c) => c.id !== deleteModalCar.id));
      closeDeleteModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete car.');
    }
  };

  const openEditModal = (car) => {
    setSelectedCar(car);
    const rawTransmission = (car.transmission || '').toLowerCase();
    const makeInList = car.make && CAR_MAKES_AND_MODELS[car.make];
    const modelsForMake = makeInList ? CAR_MAKES_AND_MODELS[car.make] : [];
    const modelInList = car.model && modelsForMake.includes(car.model);
    const fuelMap = { benz: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid' };
    const rawFuel = (car.fuel_type || '').toLowerCase();
    const fuelType = fuelMap[rawFuel] || (['Petrol','Diesel','Electric','Hybrid'].includes(car.fuel_type) ? car.fuel_type : 'Petrol');
    const wheelsMap = { '4x4': '4x4', front: 'Front', rear: 'Rear', autoblock: 'Autoblock' };
    const wheelsDrive = wheelsMap[(car.wheels_drive || '').toLowerCase()] || car.wheels_drive || '';
    setEditForm({
      make: makeInList ? car.make : 'Other',
      customMake: makeInList ? '' : (car.make || ''),
      model: modelInList ? car.model : 'Other',
      customModel: modelInList ? '' : (car.model || ''),
      year: car.year || new Date().getFullYear(),
      license_plate: car.license_plate || '',
      color: car.color || '',
      car_category: car.car_category || '',
      fuel_type: fuelType,
      transmission: rawTransmission === 'automatic' || rawTransmission === 'manual' ? rawTransmission : 'automatic',
      wheels_drive: wheelsDrive,
      cylinder_number: car.cylinder_number || '',
      seats: car.seats ?? 5,
      doors: car.doors ?? 4,
      daily_rate: car.daily_rate ?? '',
      holiday_rate: car.holiday_rate ?? '',
      status: VALID_STATUSES.includes(car.status) ? car.status : 'available',
      mileage: car.mileage ?? '',
      max_driving_mileage: car.max_driving_mileage ?? '',
      notes: car.notes || '',
      is_deposit: !!car.is_deposit,
      deposit: car.deposit ?? '',
      is_delivered: !!car.is_delivered,
      delivery_fees: car.delivery_fees ?? '',
      with_driver: !!car.with_driver,
      driver_fees: car.driver_fees ?? '',
      min_rental_days: car.min_rental_days ?? 1,
      insurance_expiry: car.insurance_expiry || '',
      registration_expiry: car.registration_expiry || '',
      features: Array.isArray(car.features) ? car.features : [],
      car_add_on: Array.isArray(car.car_add_on) ? car.car_add_on : [],
      live_location: (() => {
        const loc = car.live_location;
        if (!loc) return { address: '', latitude: 0, longitude: 0 };
        const lat = loc.latitude ?? loc.lat ?? 0;
        const lng = loc.longitude ?? loc.lng ?? 0;
        return { address: loc.address ?? '', latitude: Number(lat) || 0, longitude: Number(lng) || 0 };
      })(),
    });
    setEditLocationGoogleLink('');
    setIsEditModalOpen(true);
  };

  const getResolvedMake = () => {
    const make = editForm.make ?? '';
    return make === 'Other' ? String(editForm.customMake ?? '').trim() : make;
  };
  const getResolvedModel = () => {
    const make = editForm.make ?? '';
    const model = editForm.model ?? '';
    if (make === 'Other') return String(editForm.customModel ?? '').trim();
    return model === 'Other' ? String(editForm.customModel ?? '').trim() : model;
  };

  const validateEditForm = () => {
    const make = getResolvedMake();
    const model = getResolvedModel();
    if (!make) {
      toast.error('Make is required.');
      return false;
    }
    if (make.length > 100) {
      toast.error('Make must be at most 100 characters.');
      return false;
    }
    if (!model) {
      toast.error('Model is required.');
      return false;
    }
    if (model.length > 100) {
      toast.error('Model must be at most 100 characters.');
      return false;
    }
    const year = editForm.year !== undefined && editForm.year !== '' ? Number(editForm.year) : null;
    if (year !== null && (isNaN(year) || year < 1900 || year > currentYear + 1)) {
      toast.error(`Year must be between 1900 and ${currentYear + 1}.`);
      return false;
    }
    const transmission = (editForm.transmission || '').toLowerCase();
    if (transmission && !VALID_TRANSMISSIONS.includes(transmission)) {
      toast.error('Transmission must be Automatic or Manual.');
      return false;
    }
    const status = editForm.status || 'available';
    if (!VALID_STATUSES.includes(status)) {
      toast.error('Invalid status.');
      return false;
    }
    const dailyRateRaw = editForm.daily_rate;
    if (dailyRateRaw === undefined || dailyRateRaw === null || dailyRateRaw === '') {
      toast.error('Daily rate is required.');
      return false;
    }
    const dailyRate = Number(dailyRateRaw);
    if (isNaN(dailyRate) || dailyRate < 0) {
      toast.error('Daily rate must be 0 or greater.');
      return false;
    }
    const holidayRate = editForm.holiday_rate !== undefined && editForm.holiday_rate !== '' ? Number(editForm.holiday_rate) : null;
    if (holidayRate !== null && (isNaN(holidayRate) || holidayRate < 0)) {
      toast.error('Holiday rate must be 0 or greater.');
      return false;
    }
    if (editForm.is_deposit) {
      const deposit = Number(editForm.deposit);
      if (isNaN(deposit) || deposit < 0) {
        toast.error('Deposit amount must be 0 or greater.');
        return false;
      }
    }
    if (editForm.is_delivered) {
      const deliveryFees = Number(editForm.delivery_fees);
      if (isNaN(deliveryFees) || deliveryFees < 0) {
        toast.error('Delivery fees must be 0 or greater.');
        return false;
      }
    }
    if (editForm.with_driver) {
      const driverFees = Number(editForm.driver_fees);
      if (isNaN(driverFees) || driverFees < 0) {
        toast.error('Driver fees must be 0 or greater.');
        return false;
      }
    }
    const minDays = editForm.min_rental_days !== undefined && editForm.min_rental_days !== '' ? Number(editForm.min_rental_days) : 1;
    if (isNaN(minDays) || minDays < 1) {
      toast.error('Minimum rental days must be at least 1.');
      return false;
    }
    const mileage = editForm.mileage !== undefined && editForm.mileage !== '' ? Number(editForm.mileage) : null;
    if (mileage !== null && (isNaN(mileage) || mileage < 0)) {
      toast.error('Mileage must be 0 or greater.');
      return false;
    }
    return true;
  };

  const handleEditChange = (key, value) => {
    setEditForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'make') {
        next.model = '';
        next.customModel = '';
      }
      return next;
    });
  };

  const toggleFeature = (item) => {
    const list = editForm.features || [];
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    handleEditChange('features', updated);
  };
  const toggleAddOn = (item) => {
    const list = editForm.car_add_on || [];
    const updated = list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
    handleEditChange('car_add_on', updated);
  };

  const loc = editForm.live_location || { address: '', latitude: 0, longitude: 0 };
  const hasLocation = loc.latitude && loc.longitude && Number(loc.latitude) !== 0 && Number(loc.longitude) !== 0;

  const getCurrentLocationForEdit = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.info('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleEditChange('live_location', {
          ...loc,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        toast.success('Location set from current position.');
      },
      () => toast.error('Could not get your location. Please select manually.')
    );
  };

  const useOfficeLocationForEdit = () => {
    const office = getAgencyOfficeLocation();
    if (office) {
      handleEditChange('live_location', { ...loc, latitude: office.latitude, longitude: office.longitude });
      toast.success('Location set to office.');
    } else {
      toast.error('Office location not found. Complete your agency profile with a location first.');
    }
  };

  const openLocationMapPicker = () => {
    setTempMapLocation({
      latitude: loc.latitude || 33.8547,
      longitude: loc.longitude || 35.8623,
    });
    setMapSearchQuery('');
    setShowLocationMapModal(true);
  };

  const handleMapLocationSelect = (lat, lng) => {
    setTempMapLocation({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
  };

  const confirmMapLocation = () => {
    if (tempMapLocation) {
      handleEditChange('live_location', {
        ...loc,
        latitude: tempMapLocation.latitude,
        longitude: tempMapLocation.longitude,
      });
      toast.success('Location selected on map.');
    }
    setShowLocationMapModal(false);
  };

  const handleMapSearch = async () => {
    const q = mapSearchQuery.trim();
    if (!q) return;
    setMapSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (data?.[0]) {
        setTempMapLocation({ latitude: parseFloat(data[0].lat).toFixed(6), longitude: parseFloat(data[0].lon).toFixed(6) });
        toast.success('Location found.');
      } else toast.error('No results found.');
    } catch { toast.error('Search failed.'); }
    finally { setMapSearchLoading(false); }
  };

  const useOfficeInMapModal = () => {
    const office = getAgencyOfficeLocation();
    if (office) {
      setTempMapLocation(office);
      toast.success('Office location set. Confirm to use.');
    } else toast.error('Office location not found.');
  };

  const applyGoogleLinkForEdit = async () => {
    const trimmed = (editLocationGoogleLink || '').trim();
    if (!trimmed) return;
    let coords = parseGoogleMapsLink(trimmed);
    if (!coords && isShortMapLink(trimmed)) {
      setLinkResolvingField('live');
      try {
        const res = await fetch(trimmed, { redirect: 'follow', method: 'HEAD' });
        coords = parseGoogleMapsLink(res?.url || trimmed);
        if (!coords) coords = await resolveShortMapLinkViaBackend(trimmed);
      } finally { setLinkResolvingField(null); }
    }
    if (coords) {
      handleEditChange('live_location', {
        ...loc,
        latitude: coords.lat.toFixed(6),
        longitude: coords.lng.toFixed(6),
      });
      toast.success('Location set from Google Maps link.');
    } else {
      toast.error('Could not read coordinates. Use a link with lat,lng (e.g. @33.89,35.50 or ?q=33.89,35.50).');
    }
  };

  const submitEdit = async () => {
    if (!selectedCar) return;
    if (!validateEditForm()) return;
    const payload = {};
    const make = getResolvedMake();
    const model = getResolvedModel();
    if (make) payload.make = make;
    if (model) payload.model = model;
    if (editForm.year !== undefined && editForm.year !== '') payload.year = Number(editForm.year);
    if (editForm.license_plate !== undefined) payload.license_plate = String(editForm.license_plate || '').toUpperCase().trim();
    if (editForm.color !== undefined) payload.color = editForm.color;
    if (editForm.car_category !== undefined) payload.car_category = String(editForm.car_category || '').toLowerCase();
    const fuelMapToBackend = { Petrol: 'benz', Diesel: 'diesel', Electric: 'electric', Hybrid: 'hybrid' };
    if (editForm.fuel_type) payload.fuel_type = fuelMapToBackend[editForm.fuel_type] || editForm.fuel_type.toLowerCase();
    if (editForm.wheels_drive) payload.wheels_drive = String(editForm.wheels_drive || '').toLowerCase();
    if (editForm.cylinder_number) payload.cylinder_number = editForm.cylinder_number;
    if (editForm.seats !== undefined) payload.seats = Number(editForm.seats) || 5;
    if (editForm.doors !== undefined) payload.doors = Number(editForm.doors) || 4;
    if (editForm.max_driving_mileage !== undefined && editForm.max_driving_mileage !== '') payload.max_driving_mileage = Number(editForm.max_driving_mileage);
    if (editForm.insurance_expiry !== undefined) payload.insurance_expiry = editForm.insurance_expiry || null;
    if (editForm.registration_expiry !== undefined) payload.registration_expiry = editForm.registration_expiry || null;
    if (Array.isArray(editForm.features)) payload.features = editForm.features;
    if (Array.isArray(editForm.car_add_on)) payload.car_add_on = editForm.car_add_on;
    if (editForm.daily_rate !== undefined && editForm.daily_rate !== '') payload.daily_rate = Number(editForm.daily_rate);
    if (editForm.holiday_rate !== undefined && editForm.holiday_rate !== '') payload.holiday_rate = Number(editForm.holiday_rate);
    if (editForm.status !== undefined) payload.status = editForm.status;
    const transmission = (editForm.transmission || '').toLowerCase();
    if (transmission && VALID_TRANSMISSIONS.includes(transmission)) payload.transmission = transmission;
    if (editForm.mileage !== undefined && editForm.mileage !== '') payload.mileage = Number(editForm.mileage);
    if (editForm.notes !== undefined) payload.notes = editForm.notes;
    payload.is_deposit = !!editForm.is_deposit;
    if (editForm.is_deposit && editForm.deposit !== undefined && editForm.deposit !== '') payload.deposit = Number(editForm.deposit);
    payload.is_delivered = !!editForm.is_delivered;
    if (editForm.is_delivered && editForm.delivery_fees !== undefined && editForm.delivery_fees !== '') payload.delivery_fees = Number(editForm.delivery_fees);
    payload.with_driver = !!editForm.with_driver;
    if (editForm.with_driver && editForm.driver_fees !== undefined && editForm.driver_fees !== '') payload.driver_fees = Number(editForm.driver_fees);
    if (editForm.min_rental_days !== undefined && editForm.min_rental_days !== '') payload.min_rental_days = Math.max(1, Number(editForm.min_rental_days));
    if (editForm.live_location && (editForm.live_location.address || editForm.live_location.latitude || editForm.live_location.longitude)) {
      payload.live_location = editForm.live_location;
    }
    try {
      const { data } = await api.put(`/cars/${selectedCar.id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success('Car updated successfully');
      setAllCars(prev => prev.map(c => c.id === selectedCar.id ? { ...c, ...data.car } : c));
      setIsEditModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : err.response?.data?.error || err.response?.data?.message || 'Failed to update car';
      toast.error(msg);
    }
  };

  const filteredCars = useMemo(() => {
    return allCars.filter((car) => {
      const categoryMatch = filters.category === 'all' || (car.car_category || '').toLowerCase() === filters.category;
      const statusMatch = filters.status === 'all' || car.status === filters.status;
      const searchMatch = [car.make, car.model, car.license_plate].some(field =>
        field?.toLowerCase().includes(filters.search.toLowerCase())
      );
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [allCars, filters]);

  // Calculate total stats (views = impressions in list; clicks = detail page opens)
  const totalViews = allCars.reduce((sum, car) => sum + (car.views_count || 0), 0);
  const totalClicks = allCars.reduce((sum, car) => sum + (car.clicks_count || 0), 0);
  const approvedCars = allCars.filter(c => c.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-900 dark:to-gray-950 pt-20">
      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
            >
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Cars</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your listed vehicles</p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/add-car')}
            className="h-11 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Car
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Car}
            label="Total Cars"
            value={allCars.length}
            gradient={`linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})`}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={totalViews}
            gradient={`linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})`}
          />
          <StatCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={totalClicks}
            gradient={`linear-gradient(135deg, ${COLORS.teal}, ${COLORS.limeGreen})`}
          />
          <StatCard
            icon={TrendingUp}
            label="Approved"
            value={approvedCars}
            gradient={`linear-gradient(135deg, ${COLORS.limeGreen}, ${COLORS.teal})`}
          />
        </div>

        {/* FILTERS */}
        <Card className="mb-6 border-2 border-transparent shadow-lg rounded-xl">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {/* SEARCH */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search cars..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9 h-10 border-2 rounded-xl transition-all duration-200"
                    style={{ borderColor: filters.search ? COLORS.teal : undefined }}
                  />
                </div>
              </div>

              {/* CATEGORY */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="h-10 border-2 rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* STATUS */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="h-10 border-2 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CLEAR FILTER BUTTON */}
              <div className="md:col-span-1 flex justify-end">
                {(filters.search || filters.category !== 'all' || filters.status !== 'all') && (
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-2"
                    style={{ borderColor: COLORS.teal, color: COLORS.teal }}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="border-2 border-transparent shadow-lg rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Your Listed Cars ({filteredCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: COLORS.teal, borderTopColor: 'transparent' }}></div>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: COLORS.tealDim }}
                >
                  <Car className="w-8 h-8" style={{ color: COLORS.teal }} />
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  No cars found.{' '}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    style={{ color: COLORS.teal }}
                    onClick={() => navigate('/Add/car')}
                  >
                    Add your first car
                  </Button>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredCars.map((car, index) => {
                  const isPending = car.car_accepted === false || car.status === 'pending';
                  return (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className={`rounded-xl border-2 overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200 ${isPending ? 'border-red-200 dark:border-red-900/50' : 'border-transparent'}`}
                    >
                      <div className="relative">
                        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {car.main_image_url ? (
                            <img
                              src={car.main_image_url.startsWith('http') ? car.main_image_url : `/api/storage/${car.main_image_url}`}
                              alt={`${car.make} ${car.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: COLORS.tealDim }}>
                              <Car className="w-12 h-12" style={{ color: COLORS.teal, opacity: 0.5 }} />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                          {car.car_accepted === true ? (
                            <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs font-semibold shadow">
                              Accepted
                            </Badge>
                          ) : (
                            <Badge className="bg-red-600 hover:bg-red-600 text-white text-xs font-semibold shadow">
                              Not accepted
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{car.make} {car.model}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{car.year} · <span className="font-mono">{car.license_plate}</span></div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Badge
                            className="px-2 py-0.5 text-xs text-white font-semibold shrink-0"
                            style={{ background: getCategoryColor(car.car_category) }}
                          >
                            {car.car_category}
                          </Badge>
                          <span className="text-sm font-bold" style={{ color: COLORS.teal }}>${car.daily_rate}<span className="text-xs font-normal text-gray-500">/day</span></span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1" title="Views">
                            <Eye className="w-3.5 h-3.5" style={{ color: COLORS.darkBlue }} />
                            {car.views_count ?? 0}
                          </span>
                          <span className="flex items-center gap-1" title="Clicks">
                            <MousePointerClick className="w-3.5 h-3.5" style={{ color: COLORS.teal }} />
                            {car.clicks_count ?? 0}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 flex-1 p-0 hover:scale-105 transition-transform"
                            style={{ color: COLORS.teal }}
                            onClick={() => setSelectedCar(car)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 flex-1 p-0 hover:scale-105 transition-transform"
                            style={{ color: COLORS.darkBlue }}
                            onClick={() => openEditModal(car)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 flex-1 p-0 text-red-600 hover:text-red-700 hover:scale-105 transition-transform"
                            onClick={() => openDeleteModal(car)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && filteredCars.length > 0 && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing all {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* MODALS */}
        {selectedCar && <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />}

        {/* Delete car – type "delete" to confirm */}
        {deleteModalCar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <button
                type="button"
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: COLORS.tealDim }}
                onClick={closeDeleteModal}
              >
                <X className="w-5 h-5" style={{ color: COLORS.teal }} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete car</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {deleteModalCar.make} {deleteModalCar.model} ({deleteModalCar.license_plate})
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This action cannot be undone. Type <strong className="text-gray-900 dark:text-white">delete</strong> below to confirm.
              </p>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type delete to confirm"
                className="h-10 border-2 rounded-xl mb-6"
                autoComplete="off"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeDeleteModal} className="h-10 rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete'}
                  className="h-10 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Delete car
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && selectedCar && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
            >
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: COLORS.tealDim }}
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-5 h-5" style={{ color: COLORS.teal }} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal})` }}
                >
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Car
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCar.license_plate}
                  </p>
                </div>
              </div>

              {/* Photos - read-only, not editable by agency */}
              {(selectedCar.main_image_url || selectedCar.front_image_url) && (
                <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Photos (read-only)</h3>
                  <div className="flex flex-wrap gap-3">
                    {['main','front','back','left','right'].map((dir) => {
                      const url = selectedCar[`${dir}_image_url`] || selectedCar[`${dir}_image_full_url`];
                      if (!url) return null;
                      const src = url.startsWith('http') ? url : `/api/storage/${url}`;
                      return (
                        <div key={dir} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0">
                          <img src={src} alt={dir} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Photos cannot be changed here.</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Basic info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Basic info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Make <span className="text-red-500">*</span></label>
                      <Select value={editForm.make ?? ''} onValueChange={v => handleEditChange('make', v)}>
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAR_MAKES_LIST.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editForm.make === 'Other' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom Make <span className="text-red-500">*</span></label>
                        <Input
                          value={editForm.customMake ?? ''}
                          onChange={e => handleEditChange('customMake', e.target.value)}
                          placeholder="Type make"
                          className="h-10 border-2 rounded-xl"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Model <span className="text-red-500">*</span></label>
                      {editForm.make && editForm.make !== 'Other' ? (
                        <Select
                          value={
                            editForm.model && CAR_MAKES_AND_MODELS[editForm.make]?.includes(editForm.model)
                              ? editForm.model
                              : editForm.model === 'Other'
                                ? 'Other'
                                : '_'
                          }
                          onValueChange={v => handleEditChange('model', v === '_' ? '' : v)}
                        >
                          <SelectTrigger className="h-10 border-2 rounded-xl">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">Select model...</SelectItem>
                            {(CAR_MAKES_AND_MODELS[editForm.make] || []).map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={editForm.customModel ?? ''}
                          onChange={e => handleEditChange('customModel', e.target.value)}
                          placeholder="Type model"
                          className="h-10 border-2 rounded-xl"
                        />
                      )}
                    </div>
                    {(editForm.make && editForm.make !== 'Other' && editForm.model === 'Other') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom Model <span className="text-red-500">*</span></label>
                        <Input
                          value={editForm.customModel ?? ''}
                          onChange={e => handleEditChange('customModel', e.target.value)}
                          placeholder="Type model"
                          className="h-10 border-2 rounded-xl"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</label>
                      <Input
                        type="number"
                        value={editForm.year ?? ''}
                        onChange={e => handleEditChange('year', e.target.value)}
                        placeholder="e.g. 2023"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <Select
                        value={editForm.car_category || '_'}
                        onValueChange={v => handleEditChange('car_category', v === '_' ? '' : v)}
                      >
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Coupe">Coupe</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Crossover">Crossover</SelectItem>
                          <SelectItem value="Wagon">Wagon</SelectItem>
                          <SelectItem value="Pickup">Pickup</SelectItem>
                          <SelectItem value="Minivan">Minivan</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                      <Select
                        value={editForm.color || '_'}
                        onValueChange={v => handleEditChange('color', v === '_' ? '' : v)}
                      >
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          {(() => {
                            const color = editForm.color ?? '';
                            const hasCustom = color && !CAR_COLORS.includes(color);
                            const options = hasCustom ? [color, ...CAR_COLORS] : CAR_COLORS;
                            return options.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">License plate</label>
                      <Input
                        value={editForm.license_plate ?? ''}
                        onChange={e => handleEditChange('license_plate', e.target.value)}
                        placeholder="e.g. ABC 1234"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fuel type</label>
                      <Select value={editForm.fuel_type || '_'} onValueChange={v => handleEditChange('fuel_type', v === '_' ? '' : v)}>
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Wheels drive</label>
                      <Select value={editForm.wheels_drive || '_'} onValueChange={v => handleEditChange('wheels_drive', v === '_' ? '' : v)}>
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Wheels drive" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="4x4">4x4</SelectItem>
                          <SelectItem value="Front">Front</SelectItem>
                          <SelectItem value="Rear">Rear</SelectItem>
                          <SelectItem value="Autoblock">Autoblock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cylinder number</label>
                      <Select value={editForm.cylinder_number || '_'} onValueChange={v => handleEditChange('cylinder_number', v === '_' ? '' : v)}>
                        <SelectTrigger className="h-10 border-2 rounded-xl">
                          <SelectValue placeholder="Cylinder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_">—</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Seats</label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={editForm.seats ?? ''}
                        onChange={e => handleEditChange('seats', e.target.value)}
                        placeholder="5"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Doors</label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={editForm.doors ?? ''}
                        onChange={e => handleEditChange('doors', e.target.value)}
                        placeholder="4"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Transmission & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Transmission</h3>
                    <Select value={(editForm.transmission || 'automatic').toLowerCase()} onValueChange={v => handleEditChange('transmission', v)}>
                      <SelectTrigger className="h-10 border-2 rounded-xl">
                        <SelectValue placeholder="Transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Status</h3>
                    <Select value={editForm.status ?? 'available'} onValueChange={v => handleEditChange('status', v)}>
                      <SelectTrigger className="h-10 border-2 rounded-xl">
                        <SelectValue placeholder="Car status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="not_available">Not available</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Pricing & costs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Daily rate ($) <span className="text-red-500">*</span></label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm.daily_rate ?? ''}
                        onChange={e => handleEditChange('daily_rate', e.target.value)}
                        placeholder="0"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Holiday rate ($)</label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm.holiday_rate ?? ''}
                        onChange={e => handleEditChange('holiday_rate', e.target.value)}
                        placeholder="0"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min rental days</label>
                      <Input
                        type="number"
                        min={1}
                        value={editForm.min_rental_days ?? 1}
                        onChange={e => handleEditChange('min_rental_days', e.target.value)}
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editForm.is_deposit}
                        onChange={e => handleEditChange('is_deposit', e.target.checked)}
                        className="w-4 h-4 rounded border-2"
                        style={{ accentColor: COLORS.teal }}
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Require deposit</span>
                    </label>
                    {editForm.is_deposit && (
                      <div className="pl-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deposit amount ($)</label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.deposit ?? ''}
                          onChange={e => handleEditChange('deposit', e.target.value)}
                          placeholder="0"
                          className="h-10 border-2 rounded-xl max-w-xs"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editForm.is_delivered}
                        onChange={e => handleEditChange('is_delivered', e.target.checked)}
                        className="w-4 h-4 rounded border-2"
                        style={{ accentColor: COLORS.teal }}
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery available</span>
                    </label>
                    {editForm.is_delivered && (
                      <div className="pl-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Delivery fees ($)</label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.delivery_fees ?? ''}
                          onChange={e => handleEditChange('delivery_fees', e.target.value)}
                          placeholder="0"
                          className="h-10 border-2 rounded-xl max-w-xs"
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!editForm.with_driver}
                        onChange={e => handleEditChange('with_driver', e.target.checked)}
                        className="w-4 h-4 rounded border-2"
                        style={{ accentColor: COLORS.teal }}
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Driver available</span>
                    </label>
                    {editForm.with_driver && (
                      <div className="pl-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Driver fees per day ($)</label>
                        <Input
                          type="number"
                          min={0}
                          value={editForm.driver_fees ?? ''}
                          onChange={e => handleEditChange('driver_fees', e.target.value)}
                          placeholder="0"
                          className="h-10 border-2 rounded-xl max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Features & Add-ons */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Features & Add-ons</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Features</label>
                      <div className="flex flex-wrap gap-2">
                        {FEATURES.map((f) => (
                          <Badge
                            key={f}
                            onClick={() => toggleFeature(f)}
                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${(editForm.features || []).includes(f) ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                            style={{ background: (editForm.features || []).includes(f) ? COLORS.teal : COLORS.tealDim, color: (editForm.features || []).includes(f) ? 'white' : 'inherit' }}
                          >
                            {(editForm.features || []).includes(f) && <Check className="w-3 h-3 inline mr-1" />}
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Add-ons</label>
                      <div className="flex flex-wrap gap-2">
                        {ADD_ONS.map((a) => (
                          <Badge
                            key={a}
                            onClick={() => toggleAddOn(a)}
                            className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${(editForm.car_add_on || []).includes(a) ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                            style={{ background: (editForm.car_add_on || []).includes(a) ? COLORS.darkBlue : COLORS.darkBlueDim, color: (editForm.car_add_on || []).includes(a) ? 'white' : 'inherit' }}
                          >
                            {(editForm.car_add_on || []).includes(a) && <Check className="w-3 h-3 inline mr-1" />}
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Location */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                    Edit Location &amp; Address
                  </h3>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Address (region where car is located)</label>
                      <select
                        value={loc.address || ''}
                        onChange={e => handleEditChange('live_location', { ...loc, address: e.target.value })}
                        className="w-full h-10 border-2 rounded-xl px-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-teal-500"
                      >
                        <option value="">Select region...</option>
                        {ADDRESS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set coordinates using one of these options:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={getCurrentLocationForEdit} className="rounded-xl">
                        <Navigation className="w-4 h-4 mr-2" />
                        Use Current Location
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={openLocationMapPicker} className="rounded-xl">
                        <MapPin className="w-4 h-4 mr-2" />
                        Select on Map
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={useOfficeLocationForEdit} className="rounded-xl">
                        <Building2 className="w-4 h-4 mr-2" />
                        Office location
                      </Button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Or paste Google Maps link</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://www.google.com/maps/@33.89,35.50 or maps.app.goo.gl/..."
                          value={editLocationGoogleLink}
                          onChange={(e) => setEditLocationGoogleLink(e.target.value)}
                          className="h-9 border-2 rounded-xl flex-1 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={linkResolvingField === 'live'}
                          onClick={applyGoogleLinkForEdit}
                          className="h-9 shrink-0"
                        >
                          {linkResolvingField === 'live' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                    </div>
                    {hasLocation ? (
                      <div className="p-3 rounded-lg" style={{ background: COLORS.tealDim }}>
                        <p className="text-sm font-medium" style={{ color: COLORS.teal }}>Location set</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Lat: {loc.latitude} • Lng: {loc.longitude}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">No location selected yet.</p>
                    )}
                  </div>
                </div>

                {/* Mileage, expiry & notes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Other</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <Gauge className="w-4 h-4 inline mr-1" style={{ color: COLORS.teal }} />
                        Mileage (km)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm.mileage ?? ''}
                        onChange={e => handleEditChange('mileage', e.target.value)}
                        placeholder="0"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max driving mileage</label>
                      <Input
                        type="number"
                        min={0}
                        value={editForm.max_driving_mileage ?? ''}
                        onChange={e => handleEditChange('max_driving_mileage', e.target.value)}
                        placeholder="Optional"
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Insurance expiry</label>
                      <Input
                        type="date"
                        value={editForm.insurance_expiry ?? ''}
                        onChange={e => handleEditChange('insurance_expiry', e.target.value)}
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Registration expiry</label>
                      <Input
                        type="date"
                        value={editForm.registration_expiry ?? ''}
                        onChange={e => handleEditChange('registration_expiry', e.target.value)}
                        className="h-10 border-2 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={editForm.notes ?? ''}
                      onChange={e => handleEditChange('notes', e.target.value)}
                      placeholder="Optional notes about the vehicle"
                      rows={3}
                      className="w-full border-2 rounded-xl p-3 bg-white dark:bg-gray-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 -mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitEdit}
                  className="h-10 rounded-xl text-white font-semibold"
                  style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.darkBlue})` }}
                >
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Map picker modal for edit location */}
        <Dialog open={showLocationMapModal} onOpenChange={(open) => { setShowLocationMapModal(open); if (!open) setMapSearchQuery(''); }}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Choose location on map</DialogTitle>
              <DialogDescription>
                Search or click on the map. Drag the marker to adjust. Confirm to save.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-1 min-w-[200px] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <Input
                    placeholder="Search address or place..."
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMapSearch(); } }}
                    className="rounded-r-none border-0 h-11"
                  />
                  <Button type="button" variant="secondary" onClick={handleMapSearch} disabled={mapSearchLoading} className="rounded-l-none h-11 px-4">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={useOfficeInMapModal} className="h-11 shrink-0">
                  <Building2 className="w-4 h-4 mr-2" />
                  Office location
                </Button>
              </div>
              <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {tempMapLocation && (
                  <EditLocationMapComponent
                    center={tempMapLocation}
                    selectedLocation={tempMapLocation}
                    onLocationSelect={handleMapLocationSelect}
                  />
                )}
              </div>
              {tempMapLocation && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: {tempMapLocation.latitude}, {tempMapLocation.longitude}
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowLocationMapModal(false)}>Cancel</Button>
                <Button onClick={confirmMapLocation}>Confirm Location</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <Card className="border-2 border-transparent hover:shadow-lg transition-all duration-300 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: gradient }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);