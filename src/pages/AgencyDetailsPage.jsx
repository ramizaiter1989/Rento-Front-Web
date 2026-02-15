import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/axios";
import { CarCard } from "@/components/CarCard";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";

const ITEMS_PER_PAGE = 25;
const DEFAULT_AVATAR = "/avatar.png";
const ASSET_BASE = "https://rento-lb.com/api/storage/";


function getProfileImg(agent) {
  if (!agent?.profile_picture) return DEFAULT_AVATAR;
  if (agent.profile_picture.startsWith("http"))
    return agent.profile_picture;

  const cleaned = agent.profile_picture.startsWith("/")
    ? agent.profile_picture.slice(1)
    : agent.profile_picture;

  return ASSET_BASE + cleaned;
}

const AgencyDetailsPage = () => {
  const { id } = useParams();

  const [agency, setAgency] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAgencyData();
  }, [id]);

  const fetchAgencyData = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch Agency
      const agencyRes = await api.get(`/agency/${id}`);
      setAgency(agencyRes.data);

      // 2️⃣ Fetch Cars Related To Agency
      const carsRes = await api.get(`/cars?agent_id=${id}`);
      setCars(carsRes.data?.cars?.data || carsRes.data || []);

    } catch (err) {
      console.error("Failed to load agency page");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCars = cars.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!agency) return <div className="p-6">Agency not found</div>;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <header className="border-b border-border px-6 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <img
              src={getProfileImg(agency)}
              alt={agency.username}
              className="h-14 w-14 rounded-full object-cover"
            />

            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {agency.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                {agency.city || "Lebanon"}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {cars.length} vehicles in stock
          </p>
        </div>
      </header>

      {/* Cars Grid */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {currentCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            No cars available for this agency
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-accent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-secondary text-secondary-foreground disabled:opacity-30 hover:bg-accent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgencyDetailsPage;
