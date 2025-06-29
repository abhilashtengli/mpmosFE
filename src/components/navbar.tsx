import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Publications", href: "/publications" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`sticky w-full lg:px-20 top-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled ? "py-3" : "bg-white py-4"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`transition-all duration-500 ease-in-out ${
          scrolled
            ? "mx-auto w-fit px-24 rounded-full py-2 bg-black/70 backdrop-blur-md border-[0.5px] border-gray-900"
            : "container mx-auto px-4"
        }`}
      >
        <div
          className={`flex items-center transition-all duration-500 ease-in-out ${
            scrolled ? "justify-center gap-x-24" : "justify-between"
          }`}
        >
          <motion.div
            className="flex items-center space-x-4 transition-all duration-500"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Brand Name */}
            <Link to="/">
              <span
                className={`font-bold text-2xl ${
                  scrolled ? "text-white" : "text-green-800"
                } transition-colors duration-500`}
              >
                MPMoS
              </span>
            </Link>
          </motion.div>
          {/* Desktop Navigation */}
          <motion.div
            className={`hidden lg:flex items-center space-x-6 transition-all duration-500`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 font-medium transition-all duration-300 ${
                  scrolled
                    ? "text-white hover:text-green-200 hover:bg-black/50 rounded-md"
                    : "text-gray-900 hover:bg-green-200 rounded-md"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Projects Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("projects")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`px-3 py-2 cursor-pointer font-medium flex items-center transition-all duration-300 ${
                  scrolled
                    ? "text-white hover:text-green-200 hover:bg-black/50 rounded-md"
                    : "text-gray-900 hover:bg-green-200 hover:text-green-700 rounded-md"
                }`}
              >
                Projects
                {activeDropdown === "projects" ? (
                  <ChevronUp className="ml-1 mt-0.5 h-5 w-5 transition-transform duration-500 ease-out" />
                ) : (
                  <ChevronDown className="ml-1 mt-0.5 h-5 w-5 transition-transform duration-500 ease-out" />
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === "projects" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute mt-2 w-48 bg-white rounded-xl shadow-lg z-50"
                  >
                    <Link
                      to="/nehprojects"
                      className="block px-4 py-2 cursor-pointer rounded-tr-xl rounded-tl-xl text-gray-900 hover:bg-green-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      NEH Projects
                    </Link>
                    <Link
                      to="/aicrp"
                      className="block px-4 py-2 cursor-pointer rounded-bl-xl rounded-br-xl text-gray-900 hover:bg-green-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      AICRP NEH
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md transition-colors duration-300 ${
                scrolled
                  ? "text-white bg-green-700 hover:bg-green-800"
                  : "text-white bg-green-700 hover:bg-green-800"
              }`}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-3 rounded-md text-gray-700 font-medium hover:bg-green-100"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Projects Dropdown for Mobile */}
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "mobileProjects"
                      ? null
                      : "mobileProjects"
                  )
                }
                className="flex justify-between items-center w-full px-4 py-3 rounded-md text-gray-700 font-medium hover:bg-green-100"
              >
                <span>Projects</span>
                {activeDropdown === "mobileProjects" ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              <AnimatePresence>
                {activeDropdown === "mobileProjects" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pl-4"
                  >
                    <Link
                      to="/nehprojects"
                      className="block px-4 py-2 rounded-md text-gray-600 hover:bg-green-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      NEH Projects
                    </Link>
                    <Link
                      to="/aicrp"
                      className="block px-4 py-2 rounded-md text-gray-600 hover:bg-green-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      AICRP NEH
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
