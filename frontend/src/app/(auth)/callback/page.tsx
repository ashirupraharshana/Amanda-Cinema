"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        // Save token to localStorage
        localStorage.setItem("token", token);
        
        // Google OAuth users are always CUSTOMER role
        localStorage.setItem("userRole", "CUSTOMER");
        
        // Fetch user info from backend using the token
        fetch("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.userId) localStorage.setItem("userId", data.userId.toString());
            if (data.name) localStorage.setItem("userName", data.name);
            if (data.email) localStorage.setItem("userEmail", data.email);
            
            // Update auth context and redirect
            checkAuth();
            
            setTimeout(() => {
              router.push("/customer/dashboard");
            }, 300);
          })
          .catch((err) => {
            console.error("Failed to fetch user info:", err);
            // Still redirect even if user info fetch fails
            checkAuth();
            setTimeout(() => {
              router.push("/customer/dashboard");
            }, 300);
          });
      } catch (err) {
        setError("Failed to save authentication token");
      }
    } else {
      setError("No authentication token received");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [searchParams, router, checkAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="text-center">
        <div className="text-6xl mb-4">🎬</div>
        {error ? (
          <>
            <h2 className="text-2xl font-bold text-[#800020] mb-2">
              Authentication Error
            </h2>
            <p className="text-[#f5f5f5]/60 mb-4">{error}</p>
            <p className="text-[#f5f5f5]/40 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#d4af37] mb-2">
              Completing Login...
            </h2>
            <p className="text-[#f5f5f5]/60">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}