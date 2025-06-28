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

      {/* Footer */}
      <footer className="bg-gradient-to-b from-green-800 to-green-900 py-12 text-green-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">About M-PMoS</h3>
              <p className="text-sm">
                The Millets-Project Monitoring System is a collaborative
                initiative to promote millet cultivation and consumption across
                Northeast India.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Partner Institutions</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Agricultural Research Institute
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Northeast Agricultural University
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Rural Development Foundation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Connect With Us</h3>
              <div className="flex space-x-4">
                <Link to="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link to="#" className="hover:text-white transition-colors">
                  <span className="sr-only">YouTube</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-green-700 pt-8 text-center text-sm">
            <p>
              © 2025 Millets-Project Monitoring System. All rights reserved.
            </p>
            <p className="mt-2">
              Funded by the Ministry of Agriculture and Farmers' Welfare,
              Government of India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
