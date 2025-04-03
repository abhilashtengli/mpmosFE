import {
  BarChart3,
  FileText,
  Database,
  UserCircle,
  Download,
  Leaf
} from "lucide-react";

import { AnimatedMillet } from "@/components/animated-millet";
import { StatsCounter } from "@/components/stats-counter";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import millet1 from "@/assets/millet_1.jpg";
import millet2 from "@/assets/millet_2.jpg";
import millet3 from "@/assets/millet_3.jpg";
import millet4 from "@/assets/millet_4.jpg";
import millet5 from "@/assets/millet_5.jpg";
import millet6 from "@/assets/millet_6.jpg";
import iimr from "@/assets/IIMR_logo.jpg";
import cpgs from "@/assets/CPGS_logo.jpg";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section with Premium Background */}
      <section className="relative overflow-hidden pb-12 pt-12 px-20">
        {/* Premium background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-50" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_70%)]" />
        </div>

        <div className="container relative z-20 mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-3">
              <div className="max-w-2xl">
                <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl drop-shadow-md">
                  About{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-100">
                    M-PMoS
                  </span>
                </h1>
                <div className="mb-4 h-1 w-20 bg-amber-500" />
                <p className="mb-4 text-base leading-relaxed text-white">
                  The Millets-Project Monitoring System (M-PMoS) is an
                  innovative digital platform jointly developed by CAU-CPGSAS,
                  Umiam and ICAR-IIMR Hyderabad, with funding from AICRP Sorghum
                  and Millets. This comprehensive dashboard showcases capacity
                  development activities for promoting millets in Northeast
                  India under the ICAR NEH sub-plan and AICRP.
                </p>
                <p className="text-base leading-relaxed text-white">
                  M-PMoS serves as a centralized hub for project directors and
                  stakeholders to monitor, update, and access information
                  related to millet promotion initiatives in the region.
                </p>

                <StatsCounter />
              </div>
            </div>

            <div className="flex items-center justify-center md:col-span-2">
              <div className="relative hover:scale-105 duration-300 rounded-2xl border-1 border-amber-200/50 bg-white/80 p-6 backdrop-blur-sm shadow-2xl">
                {/* Floating grains spread across the entire container */}
                {/* <div className="absolute inset-0 overflow-hidden">
                  <FloatingGrains />
                </div> */}
                <AnimatedMillet />
                <div className="mt-4 text-center text-sm font-medium text-amber-800">
                  Millet Growth Cycle
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 80"
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

      {/* Millet Varieties Section */}
      <section className="py-16 bg-white px-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-amber-800">
              Millet Varieties 🌾
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Exploring the diversity of millets cultivated in the North Eastern
              Hilly Region
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <MilletCard
              image={millet1}
              name="Pearl Millet"
              scientificName="Pennisetum glaucum"
              description="A highly drought-resistant cereal grown in Assam and Meghalaya. Rich in iron and protein."
            />
            <MilletCard
              image={millet2}
              name="Sorghum"
              scientificName="Sorghum bicolor"
              description="Cultivated in parts of Tripura and Assam, known for its versatility and nutritional value."
            />
            <MilletCard
              image={millet3}
              name="Finger Millet"
              scientificName="Eleusine coracana"
              description="Popular in Sikkim and Arunachal Pradesh, known for its exceptional calcium content."
            />
            <MilletCard
              image={millet4}
              name="Foxtail Millet"
              scientificName="Setaria italica"
              description="Widely grown in Nagaland and Manipur, valued for its drought tolerance and short growing season."
            />
            <MilletCard
              image={millet5}
              name="Proso Millet"
              scientificName="Panicum miliaceum"
              description="Cultivated in parts of Meghalaya, known for its short growing season and low water requirements."
            />
            <MilletCard
              image={millet6}
              name="Barnyard Millet"
              scientificName="Echinochloa frumentacea"
              description="Grown in Arunachal Pradesh and parts of Assam, rich in fiber and micronutrients."
            />
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gradient-to-b from-green-0 to-green-100 px-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-green-800">
              Key Features ⭐
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Powerful tools designed to enhance millet project monitoring and
              management
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Database className="h-10 w-10 text-green-600" />}
              title="Detailed Project Profiles"
              description="Comprehensive information about each millet project, including objectives, timelines, and resources."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-green-600" />}
              title="Interactive Data Visualization"
              description="Dynamic charts and graphs that provide insights into project progress and impact metrics."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-green-600" />}
              title="E-Progress Reporting"
              description="Streamlined digital reporting system that replaces traditional paper-based progress updates."
            />
            <FeatureCard
              icon={<UserCircle className="h-10 w-10 text-green-600" />}
              title="User-Friendly Interface"
              description="Intuitive design that allows stakeholders of all technical levels to navigate and update information."
            />
            <FeatureCard
              icon={<Download className="h-10 w-10 text-green-600" />}
              title="Report Generation"
              description="Automated creation of comprehensive reports that can be downloaded in multiple formats."
            />
            <FeatureCard
              icon={<Leaf className="h-10 w-10 text-green-600" />}
              title="Millet Cultivation Resources"
              description="Access to best practices, research findings, and technical guidance for millet cultivation."
            />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="pt-7 pb-12 bg-gradient-to-r text-gray-600 ">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16  "
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-800">
              Our Partners <span className="text-amber-800">🤝</span>
            </h2>
            <p className="text-md max-w-2xl mx-auto text-gray-600">
              Collaborating to promote sustainable millet cultivation in
              Northeast India
            </p>
          </motion.div>

          <div className="grid grid-cols-1  border-red-400 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className=" backdrop-blur-sm p-6 border shadow-md hover:shadow-neutral-50  bg-gradient-to-r from-green-200 to-green-50 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                  <img
                    src={iimr}
                    alt="iimr"
                    className="w-full rounded-sm h-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-amber-800">
                  ICAR-IIMR Hyderabad
                </h3>
              </div>
              <p className="text-gray-600">
                Indian Institute of Millets Research, leading research and
                development in millet cultivation, processing, and utilization
                technologies.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm p-6 border shadow-md hover:shadow-neutral-50 duration-200 rounded-xl bg-gradient-to-l from-green-200 to-green-50"
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                  <img
                    src={cpgs}
                    alt="cpgs"
                    className="w-full rounded-full h-full"
                  />
                </div>
                <h3 className="text-xl text-amber-800 font-semibold">
                  CAU Imphal
                </h3>
              </div>
              <p className="text-gray-600">
                Central Agricultural University, Imphal, supporting agricultural
                education, research, and extension activities in the
                northeastern region.
              </p>
            </motion.div>
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

function MilletCard({
  image,
  name,
  scientificName,
  description
}: {
  image: string;
  name: string;
  scientificName: string;
  description: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-1 text-xl font-bold text-amber-800">
          {name}
        </h3>
        <p className="mb-3 text-sm italic text-gray-500">
          {scientificName}
        </p>
        <p className="text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="overflow-hidden shadow-lg transition-all border-[0.5px] border-gray-300 hover:shadow-md bg-gradient-to-r from-white to-green-50">
      <CardContent className="p-6">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-green-800">
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
