"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Save token, role, and user info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", "CUSTOMER");
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      
      // Update auth context
      await checkAuth();
      
      // Redirect to customer dashboard
      router.push("/customer/dashboard");
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-md rounded-lg bg-[#1a1a1a] p-8 shadow-2xl border border-gray-800">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#d4af37]">
            Create an Account
          </h1>
          <p className="text-[#f5f5f5]/60 mt-2">Join Amanda Cinema today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#800020]/20 border border-[#800020] rounded text-[#f5f5f5] text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#f5f5f5]">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full rounded border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#f5f5f5]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#f5f5f5]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              minLength={6}
              className="w-full rounded border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            />
            <p className="mt-1 text-xs text-[#f5f5f5]/40">
              Minimum 6 characters
            </p>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d4af37] py-3 text-[#0f0f0f] font-semibold hover:bg-[#f5f5f5] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-[#f5f5f5]/40 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-white py-3 text-gray-900 font-semibold hover:bg-gray-100 transition border border-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-[#f5f5f5]/60">
          Already have an account?{" "}
          <Link href="/login" className="text-[#d4af37] hover:text-[#f5f5f5] font-medium">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}