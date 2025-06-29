import { ArrowDown, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Base_Url } from "@/lib/constants";
import { Link } from "react-router-dom";
import { PromoMeter } from "@/components/public-components/promo-meter";
import { EventCard } from "@/components/public-components/eventCard";
import hs1 from "@/assets/hs-1.png";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
import ph1 from "@/assets/ph1.jpg";
import ph2 from "@/assets/ph2.jpg";
import ph3 from "@/assets/ph3.jpg";
import ph4 from "@/assets/ph4.jpg";

interface PromoMeterData {
  trainings: { target: number; achieved: number };
  awarenessProgram: { target: number; achieved: number };
  inputDistribution: { target: number; achieved: number };
  fld: { target: number; achieved: number };
  infrastructure: { target: number; achieved: number };
  otherActivities: { target: number; achieved: number };
  totalFarmers: number;
  projectCount: number;
}

interface Event {
  id: string;
  title: string;
  location: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
  };
}

export default function Home() {
  const [promoMeterData, setPromoMeterData] = useState<PromoMeterData | null>(
    null
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const eventsRef = useRef<HTMLDivElement>(null);

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch promo meter data
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchPromoMeterData = async () => {
      try {
        const response = await fetch(`${Base_Url}/get-stats-promo-meter`);
        const result = await response.json();
        if (result.success) {
          setPromoMeterData(result.data);
        }
      } catch (error) {
        console.error("Error fetching promo meter data:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch(`${Base_Url}/get-all-events`);
        const result = await response.json();
        if (result.success) {
          setEvents(result.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    Promise.all([fetchPromoMeterData(), fetchEvents()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const projecthighlights = [ph1, ph2, ph3, ph4];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-16 text-white h-screen">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={hs1}
            alt="Millet field"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-block tracking-wider rounded-md bg-green-600/90 px-4 py-1 text-sm font-medium backdrop-blur-sm w-fit">
                Millets-Project Monitoring System
              </div>

              <h1 className="text-4xl tracking-wider font-bold leading-tight md:text-5xl lg:text-6xl">
                Empowering Millets, Transforming the Northeast
              </h1>

              <p className="max-w-md text-lg text-gray-100 tracking-wide">
                A Digital Platform for Monitoring Millet Promotion in the NEH
                Region
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src={aicrp}
                    alt="AICRP on Sorghum and Millets"
                    className="rounded-full w-20 h-20 object-contain"
                  />
                </div>
                <div className=" w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src={cpgs}
                    alt="CPGS Logo"
                    className=" rounded-full w-20 h-20 object-contain"
                  />
                </div>
                <div className="w-32 h-20 rounded- flex items-center justify-center shadow-md">
                  <img
                    src={iimr}
                    alt="IIMR Logo"
                    className="rounded-lg h-16 object-contain"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Link to="/about">
                  <Button className="bg-green-700 hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <motion.button
                onClick={scrollToEvents}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 absolute right-2 bottom-2 cursor-pointer bg-amber-200 text-amber-900 rounded-lg font-medium text-sm md:text-base flex items-center gap-2 hover:bg-amber-300 transition-all shadow-lg hover:shadow-xl"
              >
                <Clock className="h-5 w-5" />
                Upcoming Events
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  <ArrowDown className="h-5 w-5 text-amber-700" />
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-900/40 to-transparent" />
      </section>

      {/* Millet Promo-meter */}
      <section className="bg-gradient-to-b from-green-50 to-white py-8 md:py-16 px-4 md:px-20 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-800">
              Millet Promo-meter
            </h2>
            <p className="mt-2 text-gray-600">
              Real-time statistics of our millet promotion initiatives
            </p>
          </div>

          {loading ? (
            <div className="w-full max-w-7xl mx-auto">
              {/* Key Statistics Shimmer */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 md:p-3 rounded-lg bg-gray-200">
                        <div className="h-5 w-5 md:h-6 md:w-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 md:h-10 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>

              {/* Main Statistics Shimmer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-10 md:h-12 bg-gray-300 rounded mb-2 w-24"></div>
                      <div className="h-5 bg-gray-300 rounded w-32"></div>
                    </div>
                    <div className="p-3 bg-gray-300 rounded-lg">
                      <div className="h-8 w-8 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-10 md:h-12 bg-gray-300 rounded mb-2 w-16"></div>
                      <div className="h-5 bg-gray-300 rounded w-28"></div>
                    </div>
                    <div className="p-3 bg-gray-300 rounded-lg">
                      <div className="h-8 w-8 bg-gray-400 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Progress Shimmer */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="h-6 md:h-8 bg-gray-200 rounded mb-6 w-64 mx-auto animate-pulse"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((activity) => (
                    <div
                      key={activity}
                      className="bg-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-4 md:h-5 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-1">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gray-300 w-3/4"></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="inline-block px-2 py-1 rounded-full bg-gray-200 h-6 w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <PromoMeter data={promoMeterData} />
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section ref={eventsRef} className="py-8 md:py-16 px-4 md:px-20 ">
        <div className="container mx-auto border pt-5 pb-10 px-10 shadow-xs rounded-lg bg-green-50">
          <div className="mb-8 md:mb-10  flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-800">
                Upcoming Events
              </h2>
              <p className="mt-2 text-gray-600">
                Join us in our mission to promote millets
              </p>
            </div>
            {events.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 text-green-800 hover:bg-green-50 bg-transparent"
              >
                View All Events <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6 grid-cols-1">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  date={new Date(event.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                  location={event.location}
                  description={event.description}
                  organizer={event.User.name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Upcoming Events
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Stay tuned! We're planning exciting events to promote millet
                cultivation and awareness across the Northeast region.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Project Highlights */}
      <section className="bg-green-50 py-8 md:py-16 px-4 md:px-20">
        <div className="container mx-auto">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-800">
              Project Highlights
            </h2>
            <p className="mt-2 text-gray-600">
              Visual documentation of our work across the North Eastern Hilly
              Region
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projecthighlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ amount: 0.3 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <div className="aspect-square relative">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-medium">Project Image</h3>
                      <p className="text-sm text-green-100">
                        Millet cultivation in NEH region
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <Link to="/gallery">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-green-700 w-fit cursor-pointer text-white rounded-full font-medium text-lg flex items-center gap-2 mx-auto hover:bg-green-800 transition-all shadow-lg hover:shadow-xl"
              >
                View Full Gallery <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
