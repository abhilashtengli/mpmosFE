import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-green-800 to-green-900 py-5 text-green-50">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-3 border border-green-700 rounded-xl p-4">
          <div>
            <h3 className="mb-2 text-lg font-bold">About M-PMoS</h3>
            <p className="text-sm">
              The Millets-Project Monitoring System is a collaborative
              initiative to promote millet cultivation and consumption across
              Northeast India.
            </p>
          </div>
          <div className=" text-center text-sm ">
            <p>
              © 2025 Millets-Project Monitoring System. All rights reserved.
            </p>
            <p className="mt-2">
              Funded by the Ministry of Agriculture and Farmers' Welfare,
              Government of India.
            </p>
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-bold">Partner Institutions</h3>
            <div className="flex flex-col items-center ">
              <ul className="space-y-2 text-sm ">
                <li>
                  <Link
                    to="https://www.millets.res.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex gap-x-2 items-center"
                  >
                    <ExternalLink className="ml-1 h-4 w-4" />
                    ICAR-IIMR Hyderabad
                  </Link>
                </li>
                <li>
                  <Link
                    to="https://www.cpgs.ac.in/contact-us.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex gap-x-2 items-center"
                  >
                    <ExternalLink className="ml-1 h-4 w-4" />
                    CAU Imphal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
