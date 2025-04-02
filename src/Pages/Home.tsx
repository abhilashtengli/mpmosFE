import { ChevronRight, MapPin, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/navbar";
import { PromoMeter } from "@/components/promo-meter";
import { EventCard } from "@/components/event-card";
import { SuccessStoryCarousel } from "@/components/success-story-carousel";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 text-white">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-section.png"
            alt="Millet field"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <div className="inline-block rounded-lg bg-green-600/90 px-4 py-1 text-sm font-medium backdrop-blur-sm">
                Millets-Project Monitoring System
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Empowering Millets, Transforming the Northeast
              </h1>
              <p className="max-w-md text-lg text-gray-100">
                A Digital Platform for Monitoring Millet Promotion in the NEH
                Region
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex h-16 items-center justify-center rounded bg-white/90 p-2">
                  <img
                    src="/images/AICRP_logo.png"
                    alt="AICRP on Sorghum and Millets"
                    width={80}
                    height={80}
                    className="h-auto max-h-full w-auto"
                  />
                </div>
                <div className="flex h-16 items-center justify-center rounded bg-white/90 p-2">
                  <img
                    src="/images/CPGS_logo.jpg"
                    alt="CPGS Logo"
                    width={80}
                    height={80}
                    className="h-auto max-h-full w-auto"
                  />
                </div>
                <div className="flex h-16 items-center justify-center rounded bg-white/90 p-2">
                  <img
                    src="/images/IIMR_logo.jpg"
                    alt="IIMR Logo"
                    width={120}
                    height={80}
                    className="h-auto max-h-full w-auto"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="bg-green-700 hover:bg-green-800">
                  Explore Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative overflow-hidden rounded-lg border-2 border-white/20 bg-white/95 p-3 backdrop-blur-sm">
                <img
                  src="/images/NE_map.jpg"
                  alt="Millets map of North East India"
                  width={180}
                  height={180}
                  className="h-auto w-full"
                />
              </div>

              {/* Subtle farmer image */}
              <div className="absolute bottom-0 right-0 md:right-16 lg:right-24 w-32 h-32 md:w-40 md:h-40 opacity-70 transition-opacity hover:opacity-90">
                <img
                  src="/images/farmer-woman.png"
                  alt="Northeast farmer tending to millet"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-900/40 to-transparent" />
      </section>

      {/* Millet Promo-meter */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-green-800">
              Millet Promo-meter
            </h2>
            <p className="mt-2 text-gray-600">
              Real-time statistics of our millet promotion initiatives
            </p>
          </div>
          <PromoMeter />
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-green-800">
                Upcoming Events
              </h2>
              <p className="mt-2 text-gray-600">
                Join us in our mission to promote millets
              </p>
            </div>
            <Button variant="outline" className="gap-2 text-green-800">
              View All Events <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <EventCard
              title="Millet Cultivation Workshop"
              date="April 15, 2025"
              location="Imphal, Manipur"
              description="Learn advanced techniques for millet cultivation from agricultural experts."
              image="/placeholder.svg?height=200&width=400"
            />
            <EventCard
              title="Northeast Millet Festival"
              date="May 10, 2025"
              location="Guwahati, Assam"
              description="A celebration of millet diversity with cooking demonstrations and cultural programs."
              image="/placeholder.svg?height=200&width=400"
            />
            <EventCard
              title="Farmer-Scientist Interface Meeting"
              date="June 5, 2025"
              location="Shillong, Meghalaya"
              description="Bridging the gap between research and field application for millet cultivation."
              image="/placeholder.svg?height=200&width=400"
            />
          </div>
        </div>
      </section>

      {/* Project Highlights */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-green-800">
              Project Highlights
            </h2>
            <p className="mt-2 text-gray-600">
              Showcasing our impact across the Northeast
            </p>
          </div>
          <Tabs defaultValue="farmers" className="w-full">
            <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="farmers" className="text-sm md:text-base">
                Farmer Stories
              </TabsTrigger>
              <TabsTrigger value="researchers" className="text-sm md:text-base">
                Researcher Insights
              </TabsTrigger>
            </TabsList>
            <TabsContent value="farmers">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card
                    key={item}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=200&width=400&text=Farmer+${item}`}
                        alt={`Farmer Story ${item}`}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-lg font-bold text-green-800">
                        Transforming Lives with Finger Millet
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        How traditional millet farming is creating sustainable
                        livelihoods in Nagaland.
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Kohima Farmers Collective</span>
                      </div>
                      <Button
                        variant="link"
                        className="mt-2 p-0 text-green-700"
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="researchers">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card
                    key={item}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=200&width=400&text=Researcher+${item}`}
                        alt={`Researcher Story ${item}`}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 text-lg font-bold text-green-800">
                        Innovations in Millet Processing
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        New technologies making millet processing more efficient
                        and accessible.
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Agricultural Research Institute, Tripura</span>
                      </div>
                      <Button
                        variant="link"
                        className="mt-2 p-0 text-green-700"
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-green-800">
              Farmer Success Stories
            </h2>
            <p className="mt-2 text-gray-600">
              Real impact of millet adoption across the Northeast
            </p>
          </div>
          <SuccessStoryCarousel />
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
                  <Link to="#" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Partner Institutions</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white">
                    Agricultural Research Institute
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Northeast Agricultural University
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white">
                    Rural Development Foundation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold">Connect With Us</h3>
              <div className="flex space-x-4">
                <Link to="#" className="hover:text-white">
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
                <Link to="#" className="hover:text-white">
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
                <Link to="#" className="hover:text-white">
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
                <Link to="#" className="hover:text-white">
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
