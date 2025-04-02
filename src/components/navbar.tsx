// import { useState, useEffect, useRef } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { ChevronDown, Menu, X } from "lucide-react"
// import * as THREE from "three"

// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Link } from "react-router-dom"

// export function Navbar() {
//   const [isScrolled, setIsScrolled] = useState(false)
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const threeContainerRef = useRef<HTMLDivElement>(null)

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10)
//     }
//     window.addEventListener("scroll", handleScroll)
//     return () => window.removeEventListener("scroll", handleScroll)
//   }, [])

//   // Three.js millet animation
//   useEffect(() => {
//     if (!threeContainerRef.current) return

//     // Set up scene
//     const scene = new THREE.Scene()
//     const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
//     const renderer = new THREE.WebGLRenderer({
//       alpha: true,
//       antialias: true,
//     })

//     renderer.setSize(40, 40)
//     threeContainerRef.current.appendChild(renderer.domElement)

//     // Create a stylized millet grain
//     const geometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8)
//     const material = new THREE.MeshStandardMaterial({
//       color: 0xf59e0b,
//       roughness: 0.5,
//       metalness: 0.2,
//     })

//     // Create multiple grains to form a millet head
//     const milletHead = new THREE.Group()

//     // Main stem
//     const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8)
//     const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4ade80 })
//     const stem = new THREE.Mesh(stemGeometry, stemMaterial)
//     stem.position.y = -1.5
//     milletHead.add(stem)

//     // Add multiple grains in a pattern
//     for (let i = 0; i < 20; i++) {
//       const grain = new THREE.Mesh(geometry, material)

//       // Position grains in a spiral pattern
//       const angle = i * 0.5
//       const radius = 0.2 + i * 0.02
//       const height = -0.5 + i * 0.1

//       grain.position.x = Math.sin(angle) * radius
//       grain.position.z = Math.cos(angle) * radius
//       grain.position.y = height

//       // Rotate each grain to point outward
//       grain.rotation.x = Math.random() * 0.5
//       grain.rotation.z = angle

//       milletHead.add(grain)
//     }

//     scene.add(milletHead)

//     // Add lighting
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
//     scene.add(ambientLight)

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
//     directionalLight.position.set(1, 1, 1)
//     scene.add(directionalLight)

//     camera.position.z = 5

//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate)

//       milletHead.rotation.y += 0.01
//       milletHead.rotation.x = Math.sin(Date.now() * 0.001) * 0.1

//       renderer.render(scene, camera)
//     }

//     animate()

//     // Cleanup
//     return () => {
//       if (threeContainerRef.current) {
//         threeContainerRef.current.removeChild(renderer.domElement)
//       }

//       // Dispose resources
//       geometry.dispose()
//       material.dispose()
//       stemGeometry.dispose()
//       stemMaterial.dispose()
//       renderer.dispose()
//     }
//   }, [])

//   const navVariants = {
//     hidden: { opacity: 0, y: -20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.5,
//         staggerChildren: 0.1,
//         delayChildren: 0.2,
//       },
//     },
//   }

//   const itemVariants = {
//     hidden: { opacity: 0, y: -10 },
//     visible: { opacity: 1, y: 0 },
//   }

//   return (
//     <>
//       <motion.header
//         className={`fixed top-0 z-50 border border-red-500 pl-20 pr-12 w-full ${
//           isScrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-transparent"
//         } transition-all duration-300`}
//         initial="hidden"
//         animate="visible"
//         variants={navVariants}
//       >
//         <div className="container mx-auto px-4">
//           <div className="flex h-16 items-center justify-between">
//             {/* Logo */}
//             <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               {/* <div ref={threeContainerRef} className="h-10 w-10" /> */}
//               <Link to="/" className="flex items-center">
//                 <span className="bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-xl font-bold text-transparent">
//                   M-PMoS
//                 </span>
//               </Link>
//             </motion.div>

//             {/* Desktop Navigation */}
//             <nav className="hidden md:flex">
//               <motion.ul className="flex space-x-2" variants={navVariants}>
//                 <motion.li variants={itemVariants}>
//                   <NavLink href="/">Home</NavLink>
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <NavLink href="/about">About</NavLink>
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <NavLink href="/publication">Publication</NavLink>
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         className="flex items-center gap-1 px-4 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
//                       >
//                         Projects
//                         <ChevronDown className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="center" className="w-48 bg-white p-2">
//                       <DropdownMenuItem asChild>
//                         <Link to="/nehprojects" className="cursor-pointer">
//                           NEH Projects
//                         </Link>
//                       </DropdownMenuItem>
//                       <DropdownMenuItem asChild>
//                         <Link to="/aicrp" className="cursor-pointer">
//                           AICRP NEH
//                         </Link>
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <NavLink href="/gallery">Gallery</NavLink>
//                 </motion.li>
//                 <motion.li variants={itemVariants}>
//                   <NavLink href="/contact">Contact</NavLink>
//                 </motion.li>
//               </motion.ul>
//             </nav>

//             {/* Mobile Menu Button */}
//             <div className="md:hidden">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="text-amber-800"
//               >
//                 {isMobileMenuOpen ? <X /> : <Menu />}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.header>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             className="fixed inset-0 z-40 bg-white pt-16"
//             initial={{ opacity: 0, x: "100%" }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: "100%" }}
//             transition={{ type: "spring", damping: 25, stiffness: 200 }}
//           >
//             <div className="container mx-auto p-4">
//               <nav>
//                 <ul className="space-y-4">
//                   <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
//                     Home
//                   </MobileNavLink>
//                   <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
//                     About
//                   </MobileNavLink>
//                   <MobileNavLink href="/publication" onClick={() => setIsMobileMenuOpen(false)}>
//                     Publication
//                   </MobileNavLink>
//                   <li>
//                     <div className="border-b border-gray-100 py-2 font-medium text-gray-900">Projects</div>
//                     <ul className="ml-4 mt-2 space-y-2">
//                       <MobileNavLink href="/projects/neh" onClick={() => setIsMobileMenuOpen(false)}>
//                         NEH Projects
//                       </MobileNavLink>
//                       <MobileNavLink href="/projects/aicrp" onClick={() => setIsMobileMenuOpen(false)}>
//                         AICRP NEH
//                       </MobileNavLink>
//                     </ul>
//                   </li>
//                   <MobileNavLink href="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
//                     Gallery
//                   </MobileNavLink>
//                   <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
//                     Contact
//                   </MobileNavLink>
//                 </ul>
//               </nav>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Spacer for fixed header */}
//       <div className="h-16" />
//     </>
//   )
// }

// function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
//   return (
//     <Link to={href}>
//       <motion.div
//         className="px-4 py-2 text-base font-medium text-gray-700 transition-all duration-300 hover:bg-amber-50 rounded-md relative overflow-hidden group"
//         whileHover={{
//           scale: 1.05,
//           boxShadow: "0 2px 8px rgba(251, 191, 36, 0.2)",
//           transition: { duration: 0.2 },
//         }}
//         whileTap={{ scale: 0.95 }}
//       >
//         <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-800">{children}</span>
//         <motion.div
//           className="absolute inset-0 bg-amber-50 opacity-0"
//           initial={{ x: "-100%" }}
//           whileHover={{
//             x: 0,
//             opacity: 1,
//             transition: { duration: 0.3 },
//           }}
//         />
//       </motion.div>
//     </Link>
//   )
// }

// function MobileNavLink({
//   href,
//   onClick,
//   children,
// }: {
//   href: string
//   onClick: () => void
//   children: React.ReactNode
// }) {
//   return (
//     <motion.li whileTap={{ scale: 0.95 }} whileHover={{ x: 5 }}>
//       <Link to={href} className="block border-b border-gray-100 py-2 font-medium text-gray-900" onClick={onClick}>
//         {children}
//       </Link>
//     </motion.li>
//   )
// }

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
      className={`sticky w-full lg:px-20 top-0 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? "py-3"
        : "bg-white py-4"}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`transition-all duration-500 ease-in-out ${scrolled
          ? "mx-auto w-fit px-24 rounded-full py-2 bg-black/70 backdrop-blur-md border-[0.5px] border-gray-700"
          : "container mx-auto px-4"}`}
      >
        <div
          className={`flex items-center transition-all duration-500 ease-in-out ${scrolled
            ? "justify-center gap-x-24"
            : "justify-between"}`}
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
                className={`font-bold text-2xl ${scrolled
                  ? "text-white"
                  : "text-green-800"} transition-colors duration-500`}
              >
                MPMoS
              </span>
            </Link>
          </motion.div>
          {/* Desktop Navigation */}
          <motion.div
            className={`hidden lg:flex items-center space-x-6 transition-all duration-500`}
          >
            {navLinks.map(link =>
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 font-medium transition-all duration-300 ${scrolled
                  ? "text-white hover:text-green-200 hover:bg-black/50 rounded-md"
                  : "text-gray-900 hover:bg-green-200 rounded-md"}`}
              >
                {link.name}
              </Link>
            )}

            {/* Projects Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("projects")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                className={`px-3 py-2 cursor-pointer font-medium flex items-center transition-all duration-300 ${scrolled
                  ? "text-white hover:text-green-200 hover:bg-black/50 rounded-md"
                  : "text-gray-900 hover:bg-green-200 hover:text-green-700 rounded-md"}`}
              >
                Projects
                {activeDropdown === "projects"
                  ? <ChevronUp className="ml-1 mt-0.5 h-5 w-5 transition-transform duration-500 ease-out" />
                  : <ChevronDown className="ml-1 mt-0.5 h-5 w-5 transition-transform duration-500 ease-out" />}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeDropdown === "projects" &&
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
                  </motion.div>}
              </AnimatePresence>
            </div>

            {/* Search and Login */}
            <div className="flex items-center space-x-3 transition-all duration-500">
              <div
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300
                  ${scrolled
                    ? "bg-green-700 text-white hover:bg-green-800"
                    : "bg-white text-green-800 hover:bg-green-100"}
                `}
              >
                Login
              </div>
            </div>
          </motion.div>
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-md transition-colors duration-300 ${scrolled
                ? "text-white bg-green-700 hover:bg-green-800"
                : "text-white bg-green-700 hover:bg-green-800"}`}
            >
              {isOpen
                ? <X className="h-6 w-6" />
                : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-md"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map(link =>
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-3 rounded-md text-gray-700 font-medium hover:bg-green-100"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              )}

              {/* Projects Dropdown for Mobile */}
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "mobileProjects"
                      ? null
                      : "mobileProjects"
                  )}
                className="flex justify-between items-center w-full px-4 py-3 rounded-md text-gray-700 font-medium hover:bg-green-100"
              >
                <span>Projects</span>
                {activeDropdown === "mobileProjects"
                  ? <ChevronUp className="h-5 w-5" />
                  : <ChevronDown className="h-5 w-5" />}
              </button>

              <AnimatePresence>
                {activeDropdown === "mobileProjects" &&
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
                  </motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.nav>
  );
}
