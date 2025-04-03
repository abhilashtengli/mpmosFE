import type React from "react";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import neMap from "@/assets/NE_map-removebg-preview.png";
// Contact information
const contactInfo = {
  email: "info@m-pmos.org",
  phone: "+91 123 456 7890",
  address:
    "College of Agriculture, Central Agricultural University, Imphal, Manipur - 795004",
  workingHours: "Monday - Friday: 9:00 AM - 5:00 PM",
  website: "www.m-pmos.org"
};

// Key contacts
// const keyContacts = [
//   {
//     id: 1,
//     name: "Dr. Rajesh Kumar",
//     position: "Project Director",
//     email: "rajesh.kumar@m-pmos.org",
//     phone: "+91 98765 43210",
//     location: "Imphal, Manipur",
//     image: "/placeholder.svg?height=200&width=200&text=Dr.+Rajesh"
//   },
//   {
//     id: 2,
//     name: "Dr. Priya Singh",
//     position: "Co-Project Director",
//     email: "priya.singh@m-pmos.org",
//     phone: "+91 98765 43211",
//     location: "Guwahati, Assam",
//     image: "/placeholder.svg?height=200&width=200&text=Dr.+Priya"
//   },
//   {
//     id: 3,
//     name: "Dr. Amit Patel",
//     position: "Technical Coordinator",
//     email: "amit.patel@m-pmos.org",
//     phone: "+91 98765 43212",
//     location: "Shillong, Meghalaya",
//     image: "/placeholder.svg?height=200&width=200&text=Dr.+Amit"
//   }
// ];

// Office locations
const officeLocations = [
  {
    id: 1,
    name: "Headquarters",
    address:
      "College of Agriculture, Central Agricultural University, Imphal, Manipur - 795004",
    phone: "+91 123 456 7890",
    email: "hq@m-pmos.org",
    coordinates: { lat: 24.7914, lng: 93.9773 }
  },
  {
    id: 2,
    name: "Regional Office - Arunachal Pradesh",
    address: "College of Agriculture, Pasighat, Arunachal Pradesh - 791102",
    phone: "+91 123 456 7891",
    email: "arunachal@m-pmos.org",
    coordinates: { lat: 28.0654, lng: 95.3316 }
  },
  {
    id: 3,
    name: "Regional Office - Meghalaya",
    address: "ICAR Research Complex for NEH Region, Umiam, Meghalaya - 793103",
    phone: "+91 123 456 7892",
    email: "meghalaya@m-pmos.org",
    coordinates: { lat: 25.6751, lng: 91.8933 }
  },
  {
    id: 4,
    name: "Regional Office - Tripura",
    address: "College of Agriculture, Lembucherra, Tripura - 799210",
    phone: "+91 123 456 7893",
    email: "tripura@m-pmos.org",
    coordinates: { lat: 23.8315, lng: 91.2868 }
  }
];

// Funding agencies
const fundingAgencies = [
  {
    id: 1,
    name: "Ministry of Agriculture & Farmers' Welfare",
    description: "Government of India",
    website: "https://agriculture.gov.in/",
    logo: "/placeholder.svg?height=100&width=200&text=MoA"
  },
  {
    id: 2,
    name: "Indian Council of Agricultural Research",
    description: "ICAR, New Delhi",
    website: "https://icar.org.in/",
    logo: "/placeholder.svg?height=100&width=200&text=ICAR"
  },
  {
    id: 3,
    name: "Central Agricultural University",
    description: "Imphal, Manipur",
    website: "https://cau.ac.in/",
    logo: "/placeholder.svg?height=100&width=200&text=CAU"
  }
];

export default function ContactPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeLocation, setActiveLocation] = useState(officeLocations[0].id);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-100" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_70%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl drop-shadow-md">
              Contact Us
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-base text-white font-medium drop-shadow-sm">
              Get in touch with our team to learn more about our millet
              promotion initiatives
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 65"
            className="w-full"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
            />
          </svg>
        </div>
      </section>

      {/* Main Contact Information */}
      <section className="py-16 bg-white px-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Get In Touch
              </h2>

              <div className="space-y-6 grid grid-cols-2">
                <ContactItem
                  icon={<Mail className="h-6 w-6 text-green-600" />}
                  title="Email"
                  content={
                    <motion.a
                      href={`mailto:${contactInfo.email}`}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {contactInfo.email}
                    </motion.a>
                  }
                />

                <ContactItem
                  icon={<Phone className="h-6 w-6 text-green-600" />}
                  title="Phone"
                  content={
                    <motion.a
                      href={`tel:${contactInfo.phone}`}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {contactInfo.phone}
                    </motion.a>
                  }
                />

                <ContactItem
                  icon={<MapPin className="h-6 w-6 text-green-600" />}
                  title="Address"
                  content={contactInfo.address}
                />

                <ContactItem
                  icon={<Clock className="h-6 w-6 text-green-600" />}
                  title="Working Hours"
                  content={contactInfo.workingHours}
                />

                <ContactItem
                  icon={<Globe className="h-6 w-6 text-green-600" />}
                  title="Website"
                  content={
                    <motion.a
                      href={`https://${contactInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 transition-colors flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {contactInfo.website}
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </motion.a>
                  }
                />
                <div className="">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">
                    Connect With Us
                  </h3>
                  <div className="flex space-x-4">
                    <SocialButton icon="twitter" />
                    <SocialButton icon="facebook" />
                    <SocialButton icon="instagram" />
                    <SocialButton icon="youtube" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Map or Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative h-[400px]  rounded-lg overflow-hidden shadow-lg border grid place-content-center"
            >
              <img
                src={neMap}
                alt="North East India Map"
                className="object-cover h-full w-fit m-5"
              />
              <div className="absolute top-2 left-2  flex items-center justify-center ">
                <div className="bg-white/90 backdrop-blur-sm px-1 pt-1  rounded-md max-w-md text-center">
                  <h3 className="text-sm font-bold text-green-800 mb-2">
                    Our Coverage Area
                  </h3>
                  {/* <p className="text-gray-700 text-xs">
                    We operate across all states in the North Eastern Hilly
                    Region, promoting millet cultivation and consumption.
                  </p> */}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Contacts */}
      {/* <section className="py-16 bg-gradient-to-b from-green-0 to-green-100 px-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Key Contacts
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team of experts is ready to assist you with any inquiries
              about millet promotion in the NEH region.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {keyContacts.map((contact, index) => (
              <ContactCard key={contact.id} contact={contact} index={index} />
            ))}
          </div>
        </div>
      </section> */}

      {/* Office Locations */}
      <section className="py-16 bg-white px-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Our Offices
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Visit our offices across the North Eastern Hilly Region to learn
              more about our initiatives.
            </p>
          </motion.div>

          <Tabs
            defaultValue={officeLocations[0].id.toString()}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-green-100 p-1 rounded-lg">
              {officeLocations.map((location) => (
                <TabsTrigger
                  key={location.id}
                  value={location.id.toString()}
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  onClick={() => setActiveLocation(location.id)}
                >
                  {location.name.split(" - ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {officeLocations.map((location) => (
              <TabsContent key={location.id} value={location.id.toString()}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-xl font-bold text-green-800 mb-4">
                    {location.name}
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-start mb-4">
                        <MapPin className="h-5 w-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-gray-700">{location.address}</p>
                      </div>

                      <div className="flex items-center mb-4">
                        <Phone className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <a
                          href={`tel:${location.phone}`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          {location.phone}
                        </a>
                      </div>

                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                        <a
                          href={`mailto:${location.email}`}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          {location.email}
                        </a>
                      </div>
                    </div>

                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                      {/* Placeholder for map - in a real app, you'd use Google Maps or similar */}
                      <div className="absolute inset-0 flex items-center justify-center bg-green-100">
                        <div className="text-center">
                          <MapPin className="h-10 w-10 text-green-600 mx-auto mb-2" />
                          <p className="text-green-800 font-medium">
                            {location.coordinates.lat.toFixed(4)},{" "}
                            {location.coordinates.lng.toFixed(4)}
                          </p>
                          <Button
                            variant="link"
                            className="mt-2 text-green-600"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`,
                                "_blank"
                              )
                            }
                          >
                            View on Google Maps
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Funding Agencies */}
      <section className="py-16 bg-green-50 px-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Our Funding Partners
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are grateful for the support of these organizations in our
              mission to promote millets in the NEH region.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {fundingAgencies.map((agency, index) => (
              <FundingAgencyCard
                key={agency.id}
                agency={agency}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our millet promotion
              initiatives.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              id={1}
              question="How can I participate in your millet promotion programs?"
              answer="Farmers, researchers, and other stakeholders can participate in our programs by contacting the nearest regional office. We offer training, seed distribution, and technical support for millet cultivation."
              isExpanded={expandedFAQ === 1}
              onToggle={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
            />

            <FAQItem
              id={2}
              question="What varieties of millets are suitable for the NEH region?"
              answer="Several millet varieties are well-suited for the NEH region, including finger millet (ragi), foxtail millet, and pearl millet. Our technical team can provide specific recommendations based on your local conditions."
              isExpanded={expandedFAQ === 2}
              onToggle={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
            />

            <FAQItem
              id={3}
              question="How can I access millet processing equipment?"
              answer="We have established millet processing units in various locations across the NEH region. Farmers and entrepreneurs can access these facilities through local farmers' clubs, SHGs, or FPOs. Contact your nearest regional office for details."
              isExpanded={expandedFAQ === 3}
              onToggle={() => setExpandedFAQ(expandedFAQ === 3 ? null : 3)}
            />

            <FAQItem
              id={4}
              question="Are there any subsidies available for millet cultivation?"
              answer="Yes, various subsidies and incentives are available under different government schemes. Our team can guide you through the application process and help you access these benefits."
              isExpanded={expandedFAQ === 4}
              onToggle={() => setExpandedFAQ(expandedFAQ === 4 ? null : 4)}
            />

            <FAQItem
              id={5}
              question="How can I market my millet produce?"
              answer="We facilitate market linkages for millet farmers through various channels, including direct marketing, FPOs, and government procurement. We also provide training on value addition to increase market value."
              isExpanded={expandedFAQ === 5}
              onToggle={() => setExpandedFAQ(expandedFAQ === 5 ? null : 5)}
            />
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
                  <Link to="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/projects/neh" className="hover:text-white">
                    NEH Projects
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-white">
                    Gallery
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
              <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
              <p className="text-sm mb-2">{contactInfo.email}</p>
              <p className="text-sm">{contactInfo.phone}</p>
              <div className="mt-4 flex space-x-4">
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

// Contact Item Component
function ContactItem({
  icon,
  title,
  content
}: {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex items-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mr-4 text-green-600">{icon}</div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="mt-1 text-gray-600">{content}</div>
      </div>
    </motion.div>
  );
}

// Social Button Component
function SocialButton({ icon }: { icon: string }) {
  return (
    <motion.a
      href="#"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 transition-colors hover:bg-green-600 hover:text-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icon === "twitter" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )}
      {icon === "facebook" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {icon === "instagram" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {icon === "youtube" && (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </motion.a>
  );
}

// Contact Card Component
// function ContactCard({
//   contact,
//   index
// }: {
//   contact: (typeof keyContacts)[0];
//   index: number;
// }) {
//   const cardRef = useRef(null);
//   const isInView = useInView(cardRef, { once: true, amount: 0.3 });

//   return (
//     <motion.div
//       ref={cardRef}
//       initial={{ opacity: 0, y: 20 }}
//       animate={isInView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.5, delay: index * 0.1 }}
//     >
//       <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
//         <CardContent className="p-0">
//           <div className="relative h-48 w-full">
//             <img
//               src={contact.image || "/placeholder.svg"}
//               alt={contact.name}
//               className="object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent flex items-end">
//               <div className="p-4 text-white">
//                 <h3 className="text-lg font-bold">{contact.name}</h3>
//                 <p className="text-green-100">{contact.position}</p>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 space-y-3">
//             <div className="flex items-center">
//               <Mail className="h-5 w-5 text-green-600 mr-2" />
//               <a
//                 href={`mailto:${contact.email}`}
//                 className="text-green-600 hover:text-green-800 transition-colors"
//               >
//                 {contact.email}
//               </a>
//             </div>

//             <div className="flex items-center">
//               <Phone className="h-5 w-5 text-green-600 mr-2" />
//               <a
//                 href={`tel:${contact.phone}`}
//                 className="text-green-600 hover:text-green-800 transition-colors"
//               >
//                 {contact.phone}
//               </a>
//             </div>

//             <div className="flex items-center">
//               <MapPin className="h-5 w-5 text-green-600 mr-2" />
//               <span className="text-gray-600">{contact.location}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// Funding Agency Card Component
function FundingAgencyCard({
  agency,
  index
}: {
  agency: (typeof fundingAgencies)[0];
  index: number;
}) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="relative h-20 mb-4 flex items-center justify-center">
            <img
              src={agency.logo || "/placeholder.svg"}
              alt={agency.name}
              width={160}
              height={80}
              className="object-contain"
            />
          </div>

          <h3 className="text-xl font-bold text-green-800 mb-2">
            {agency.name}
          </h3>
          <p className="text-gray-600 mb-4">{agency.description}</p>

          <div className="mt-auto">
            <Button
              variant="outline"
              className="w-full text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
              onClick={() => window.open(agency.website, "_blank")}
            >
              Visit Website <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// FAQ Item Component
function FAQItem({
  id,
  question,
  answer,
  isExpanded,
  onToggle
}: {
  id: number;
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      className="border border-gray-200 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: id * 0.1 }}
    >
      <button
        className="flex w-full items-center justify-between bg-white p-4 text-left font-medium text-gray-900 hover:bg-gray-50"
        onClick={onToggle}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-gray-200 bg-gray-50 p-4 text-gray-700">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
