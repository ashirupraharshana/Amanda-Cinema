"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function CustomerDashboard() {
  const { isLoading } = useAuth();
  const [userInfo, setUserInfo] = useState({
    userId: "",
    name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // First try to get from localStorage (faster)
        const storedUserId = localStorage.getItem("userId");
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");
        const storedRole = localStorage.getItem("userRole");

        if (storedUserId && storedName && storedEmail) {
          setUserInfo({
            userId: storedUserId,
            name: storedName,
            email: storedEmail,
            role: storedRole || "CUSTOMER",
          });
        }

        // Then verify with backend
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch("http://localhost:8080/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            // Update state with backend data
            setUserInfo({
              userId: data.userId?.toString() || storedUserId || "",
              name: data.name || storedName || "",
              email: data.email || storedEmail || "",
              role: data.role || storedRole || "CUSTOMER",
            });

            // Update localStorage with latest data
            if (data.userId) localStorage.setItem("userId", data.userId.toString());
            if (data.name) localStorage.setItem("userName", data.name);
            if (data.email) localStorage.setItem("userEmail", data.email);
            if (data.role) localStorage.setItem("userRole", data.role);
          }
        } catch (fetchError) {
          // Backend not available, use cached data
          console.warn("Using cached user data, backend not reachable");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#d4af37]">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-2">
            Welcome back, {userInfo.name?.split(" ")[0] || "Guest"}!
          </h2>
          <p className="text-[#f5f5f5]/60">
            Browse movies, book tickets, and manage your reservations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Total Bookings</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
            <p className="text-xs text-[#f5f5f5]/40 mt-1">All time</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Upcoming Shows</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
            <p className="text-xs text-[#f5f5f5]/40 mt-1">This month</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Reward Points</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
            <p className="text-xs text-[#f5f5f5]/40 mt-1">Earn more!</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Movies Watched</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
            <p className="text-xs text-[#f5f5f5]/40 mt-1">This year</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-[#d4af37] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
              <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
                Browse Movies
              </h3>
              <p className="text-[#f5f5f5]/60 mb-4">
                Discover the latest movies showing in our theaters
              </p>
              <span className="text-[#d4af37] group-hover:text-[#f5f5f5] font-medium">
                Explore Now →
              </span>
            </button>

            <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
              <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
                Book Tickets
              </h3>
              <p className="text-[#f5f5f5]/60 mb-4">
                Reserve your seats for upcoming showtimes
              </p>
              <span className="text-[#d4af37] group-hover:text-[#f5f5f5] font-medium">
                Book Now →
              </span>
            </button>

            <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
              <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
                Upcoming Events
              </h3>
              <p className="text-[#f5f5f5]/60 mb-4">
                Check out special screenings and events
              </p>
              <span className="text-[#d4af37] group-hover:text-[#f5f5f5] font-medium">
                View Events →
              </span>
            </button>
          </div>
        </div>

        {/* User Info Box */}
        <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#d4af37] mb-3">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#f5f5f5]/60">User ID:</span>
              <span className="ml-2 text-[#f5f5f5] font-mono">
                #{userInfo.userId || "---"}
              </span>
            </div>
            <div>
              <span className="text-[#f5f5f5]/60">Account Type:</span>
              <span className="ml-2 text-[#d4af37] font-semibold">
                {userInfo.role}
              </span>
            </div>
            <div>
              <span className="text-[#f5f5f5]/60">Email:</span>
              <span className="ml-2 text-[#f5f5f5]">{userInfo.email}</span>
            </div>
            <div>
              <span className="text-[#f5f5f5]/60">Status:</span>
              <span className="ml-2 text-green-400">Active</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
            <p className="text-[#f5f5f5]/80 text-sm">
              Your session is secure and will persist across browser sessions. You can close the browser and return anytime without logging in again.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}