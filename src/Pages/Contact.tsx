import type React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import neMap from "@/assets/NE_map-removebg-preview.png";
// Contact information
const contactInfo = {
  email: "coemillet@gmail.com",
  address:
    "College of Post Graduate Studies in Agriculture Sciences, Central Agricultural University, Imphal - 793 103",
  workingHours: "Monday - Friday: 9:00 AM - 5:00 PM",
  website: "https://www.millets.res.in"
};

export default function ContactPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
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
                      href={`${contactInfo.website}`}
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
                </div>
              </div>
            </motion.div>
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
