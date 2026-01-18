import Navbar from "./components/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#800020] to-[#1a1a1a] text-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 text-[#d4af37]">
              Welcome to Amanda Cinema
            </h1>
            <p className="text-xl mb-8 text-[#f5f5f5]/80">
              Experience the magic of movies like never before
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/movies"
                className="bg-[#d4af37] text-[#0f0f0f] px-8 py-3 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-all hover:shadow-lg hover:shadow-[#d4af37]/30"
              >
                Browse Movies
              </Link>
              <Link
                href="/booking"
                className="bg-transparent border-2 border-[#d4af37] text-[#d4af37] px-8 py-3 rounded-lg font-semibold hover:bg-[#d4af37] hover:text-[#0f0f0f] transition-all"
              >
                Book Tickets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold text-[#d4af37] mb-8">Now Showing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Movie Card 1 */}
          <div className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#d4af37]/20 transition-all border border-gray-800">
            <div className="h-64 bg-gradient-to-br from-[#800020] to-[#d4af37] flex items-center justify-center text-white text-6xl">
              🎭
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-[#f5f5f5]">The Grand Adventure</h3>
              <p className="text-[#f5f5f5]/60 mb-4">Action • Adventure • 2h 15m</p>
              <Link
                href="/booking"
                className="block text-center bg-[#d4af37] text-[#0f0f0f] py-2 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Movie Card 2 */}
          <div className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#d4af37]/20 transition-all border border-gray-800">
            <div className="h-64 bg-gradient-to-br from-[#d4af37] to-[#800020] flex items-center justify-center text-white text-6xl">
              🌌
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-[#f5f5f5]">Cosmic Journey</h3>
              <p className="text-[#f5f5f5]/60 mb-4">Sci-Fi • Drama • 2h 30m</p>
              <Link
                href="/booking"
                className="block text-center bg-[#d4af37] text-[#0f0f0f] py-2 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Movie Card 3 */}
          <div className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#d4af37]/20 transition-all border border-gray-800">
            <div className="h-64 bg-gradient-to-br from-[#1a1a1a] via-[#800020] to-[#d4af37] flex items-center justify-center text-white text-6xl">
              😂
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-[#f5f5f5]">Comedy Night</h3>
              <p className="text-[#f5f5f5]/60 mb-4">Comedy • Romance • 1h 45m</p>
              <Link
                href="/booking"
                className="block text-center bg-[#d4af37] text-[#0f0f0f] py-2 rounded-lg font-semibold hover:bg-[#f5f5f5] transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#1a1a1a] py-16 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-12 text-center">
            Why Choose Amanda Cinema?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-[#d4af37] transition-colors">
              <div className="text-5xl mb-4">🪑</div>
              <h3 className="text-xl font-bold mb-2 text-[#d4af37]">Premium Seating</h3>
              <p className="text-[#f5f5f5]/70">
                Comfortable reclining seats with plenty of legroom
              </p>
            </div>
            <div className="text-center p-6 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-[#d4af37] transition-colors">
              <div className="text-5xl mb-4">🍿</div>
              <h3 className="text-xl font-bold mb-2 text-[#d4af37]">Gourmet Snacks</h3>
              <p className="text-[#f5f5f5]/70">
                Fresh popcorn, beverages, and delicious treats
              </p>
            </div>
            <div className="text-center p-6 bg-[#0f0f0f] rounded-lg border border-gray-800 hover:border-[#d4af37] transition-colors">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl font-bold mb-2 text-[#d4af37]">Easy Booking</h3>
              <p className="text-[#f5f5f5]/70">
                Book your tickets online in just a few clicks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] text-[#f5f5f5] py-8 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-[#f5f5f5]/50">
            © 2024 Amanda Cinema. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}