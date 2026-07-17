import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const footerSections = [
  {
    title: "Support",
    links: [
      "Help Center",
      "Safety information",
      "Cancellation options",
      "Our COVID-19 Response",
      "Report a concern",
    ],
  },
  {
    title: "Hosting",
    links: [
      "Airbnb your home",
      "AirCover for Hosts",
      "Hosting resources",
      "Community forum",
      "Hosting responsibly",
    ],
  },
  {
    title: "Airbnb",
    links: ["Newsroom", "New features", "Careers", "Investors", "Gift cards"],
  },
  {
    title: "Community",
    links: [
      "Diversity & Belonging",
      "Accessibility",
      "Airbnb Associates",
      "Frontline Stays",
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-[#f7f7f7] border-t border-gray-300 mt-10">
      
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {footerSections.map((section, index) => (
          <div key={index}>
            <h3 className="font-semibold mb-4">{section.title}</h3>

            <ul className="space-y-2 text-sm text-gray-600">
              {section.links.map((link, i) => (
                <li
                  key={i}
                  className="hover:underline cursor-pointer transition"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">

          {/* Left */}
          <div className="flex flex-wrap gap-3 items-center">
            <span>© {new Date().getFullYear()} Airbnb, Inc.</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="hover:underline cursor-pointer">🌐 English (IN)</span>
            <span className="hover:underline cursor-pointer">₹ INR</span>

            <FaFacebookF className="cursor-pointer hover:text-black transition" />
            <FaTwitter className="cursor-pointer hover:text-black transition" />
            <FaInstagram className="cursor-pointer hover:text-black transition" />
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;