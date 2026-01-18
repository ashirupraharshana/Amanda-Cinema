"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-800 bg-[#1a1a1a] shadow-lg sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo → Homepage */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-2xl font-bold text-[#d4af37] transition-all hover:text-[#f5f5f5]"
        >
          <span className="text-3xl">🎬</span>
          <span>Amanda Cinema</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className="text-[#f5f5f5] font-medium transition-all hover:text-[#d4af37] hover:scale-105"
          >
            Home
          </Link>

          <Link 
            href="/movies" 
            className="text-[#f5f5f5] font-medium transition-all hover:text-[#d4af37] hover:scale-105"
          >
            Movies
          </Link>

          <Link 
            href="/booking" 
            className="text-[#f5f5f5] font-medium transition-all hover:text-[#d4af37] hover:scale-105"
          >
            Booking
          </Link>

          <Link 
            href="/login" 
            className="rounded-lg bg-[#d4af37] px-5 py-2 text-[#0f0f0f] font-semibold transition-all hover:bg-[#f5f5f5] hover:shadow-lg hover:shadow-[#d4af37]/20"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-[#d4af37] transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#d4af37] transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#d4af37] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64' : 'max-h-0'}`}>
        <div className="flex flex-col gap-4 px-6 py-4 bg-[#0f0f0f] border-t border-gray-800">
          <Link 
            href="/" 
            className="text-[#f5f5f5] font-medium hover:text-[#d4af37] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          <Link 
            href="/movies" 
            className="text-[#f5f5f5] font-medium hover:text-[#d4af37] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Movies
          </Link>

          <Link 
            href="/booking" 
            className="text-[#f5f5f5] font-medium hover:text-[#d4af37] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Booking
          </Link>

          <Link 
            href="/login" 
            className="rounded-lg bg-[#d4af37] px-5 py-2 text-[#0f0f0f] font-semibold text-center hover:bg-[#f5f5f5] transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}