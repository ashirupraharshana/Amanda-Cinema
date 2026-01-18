"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbar";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  provider: string;
}

interface DashboardStats {
  totalUsers: number;
  message: string;
}

export default function AdminDashboard() {
  const { isLoading, userRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Verify admin role
  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") {
      router.push("/customer/dashboard");
    }
  }, [isLoading, userRole, router]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          // Fetch all users
          const usersResponse = await fetch("http://localhost:8080/api/admin/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          } else {
            setError("Failed to fetch users");
          }

          // Fetch dashboard stats
          const statsResponse = await fetch("http://localhost:8080/api/admin/dashboard", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          } else {
            setError("Failed to fetch dashboard stats");
          }
        } catch (fetchError) {
          console.warn("Backend not reachable:", fetchError);
          setError("Unable to connect to server. Please check if the backend is running.");
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load admin data");
      } finally {
        setLoadingData(false);
      }
    };

    if (!isLoading && userRole === "ADMIN") {
      fetchAdminData();
    }
  }, [isLoading, userRole]);

  if (isLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#d4af37]">Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5]">
      {/* Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#d4af37] mb-2">
            Admin Dashboard
          </h2>
          <p className="text-[#f5f5f5]/60">
            Manage users, bookings, and cinema operations
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#800020]/20 border border-[#800020] rounded-lg text-[#f5f5f5]">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">
              {stats?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Active Bookings</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Movies</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">0</p>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#f5f5f5]/60">Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-[#d4af37]">$0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
            <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
              Add Movie
            </h3>
            <p className="text-[#f5f5f5]/60">
              Add new movies to the system
            </p>
          </button>

          <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
            <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
              Manage Shows
            </h3>
            <p className="text-[#f5f5f5]/60">
              Schedule and manage showtimes
            </p>
          </button>

          <button className="bg-[#1a1a1a] border border-gray-800 hover:border-[#d4af37] rounded-lg p-6 text-left transition group">
            <h3 className="text-xl font-semibold text-[#d4af37] mb-2">
              View Reports
            </h3>
            <p className="text-[#f5f5f5]/60">
              Analytics and performance reports
            </p>
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-[#d4af37]">All Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f0f0f]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5]/60 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5]/60 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5]/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5]/60 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#f5f5f5]/60 uppercase tracking-wider">
                    Provider
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[#f5f5f5]/40">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#0f0f0f] transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f5]">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f5]">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f5]">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-[#d4af37]/20 text-[#d4af37]"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f5]/60">
                        {user.provider}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}