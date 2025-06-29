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
import millet1 from "@/assets/millet_1.jpg";
import millet2 from "@/assets/millet_2.jpg";
import millet3 from "@/assets/millet_3.jpg";
import millet4 from "@/assets/millet_4.jpg";
import millet5 from "@/assets/millet_5.jpg";
import millet6 from "@/assets/millet_6.jpg";
import iimr from "@/assets/IIMR_logo.jpg";
import cpgs from "@/assets/CPGS_logo.jpg";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
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
        <h3 className="mb-1 text-xl font-bold text-amber-800">{name}</h3>
        <p className="mb-3 text-sm italic text-gray-500">{scientificName}</p>
        <p className="text-gray-600">{description}</p>
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
        <div className="mb-4">{icon}</div>
        <h3 className="mb-2 text-xl font-bold text-green-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
