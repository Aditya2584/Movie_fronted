import React from 'react';
import { Film } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#090c15] text-gray-500 text-sm py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Film className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-400 tracking-wider">CINEPASS</span>
        </div>
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} CinePass. All rights reserved. Created for premium cinematic bookings.
        </p>
        <div className="flex space-x-6 text-gray-400">
          <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
