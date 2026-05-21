"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AdminNavbar from "../components/Navbar";

const API_BASE = "http://localhost:8080";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  provider: string;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const { isLoading, userRole } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("CUSTOMER");

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const loggedAdmin = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        userId: null as number | null,
        name: "",
        email: "",
        role: "",
      };
    }

    const storedUserId = localStorage.getItem("userId");

    return {
      userId: storedUserId ? Number(storedUserId) : null,
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      role: localStorage.getItem("userRole") || "",
    };
  }, []);

  const readJsonResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    const rawText = await res.text();

    if (!res.ok) {
      if (rawText.includes("accounts.google.com") || rawText.includes("<html")) {
        throw new Error("Authentication failed. Please login again as admin.");
      }

      try {
        const errorData = JSON.parse(rawText);
        throw new Error(errorData.error || "Request failed");
      } catch {
        throw new Error(rawText || "Request failed");
      }
    }

    if (!contentType.includes("application/json")) {
      console.error("Non JSON response:", rawText);

      if (rawText.includes("accounts.google.com") || rawText.includes("<html")) {
        throw new Error("Authentication failed. Please login again as admin.");
      }

      throw new Error(`Server did not return JSON. Response type: ${contentType}`);
    }

    try {
      return JSON.parse(rawText);
    } catch {
      console.error("Invalid JSON response:", rawText);
      throw new Error("Server returned invalid JSON.");
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await readJsonResponse(res);

      if (Array.isArray(data)) {
        setUsers(data as User[]);
      } else {
        setUsers([]);
        throw new Error("Invalid users response from server.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch users";
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoading && userRole !== "ADMIN") {
      router.push("/customer/dashboard");
    }
  }, [isLoading, userRole, router]);

  useEffect(() => {
    if (!isLoading && userRole === "ADMIN") {
      fetchUsers();
    }
  }, [isLoading, userRole, fetchUsers]);

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role || "CUSTOMER");
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditRole("CUSTOMER");
  };

  const updateUser = async (userId: number) => {
    setActionLoading(userId);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
        }),
      });

      await readJsonResponse(res);

      setSuccess("User updated successfully.");
      setEditingUserId(null);
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserRole = async (userId: number, role: string) => {
    setActionLoading(userId);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ role }),
      });

      await readJsonResponse(res);

      setSuccess("User role updated successfully.");
      await fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update user role";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: number) => {
    if (loggedAdmin.userId === userId) {
      setError("You cannot delete your own logged-in admin account.");
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    setActionLoading(userId);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      await readJsonResponse(res);

      setSuccess("User deleted successfully.");
      await fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <h2 className="text-2xl font-bold text-[#d4af37]">
          Loading Users...
        </h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <AdminNavbar />

      <div className="container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d4af37]">
            Manage Users
          </h1>
          <p className="mt-2 text-gray-400">
            View, update, and delete registered users
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[#d4af37]/40 bg-[#1a1a1a] p-6">
          <h2 className="mb-4 text-xl font-bold text-[#d4af37]">
            Logged Admin Details
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-400">Admin ID</p>
              <p className="font-semibold">
                {loggedAdmin.userId ? `#${loggedAdmin.userId}` : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="font-semibold">{loggedAdmin.name || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold">{loggedAdmin.email || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="font-semibold text-[#d4af37]">
                {loggedAdmin.role || "-"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-700 bg-red-950/60 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-700 bg-green-950/60 px-4 py-3 text-green-200">
            {success}
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-lg bg-[#d4af37] px-5 py-2 font-semibold text-black hover:bg-[#c9a227] disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-[#1a1a1a] p-10 text-center">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-[#1a1a1a]">
                <tr className="border-b border-gray-800 text-left">
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isEditing = editingUserId === user.id;
                  const isLoggedAdmin = loggedAdmin.userId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-800 hover:bg-[#1a1a1a] ${
                        isLoggedAdmin ? "bg-[#d4af37]/10" : ""
                      }`}
                    >
                      <td className="p-4 font-semibold text-[#d4af37]">
                        #{user.id}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#d4af37]"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{user.name || "No name"}</span>

                            {isLoggedAdmin && (
                              <span className="rounded-full bg-[#d4af37] px-2 py-1 text-xs font-bold text-black">
                                You
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#d4af37]"
                          />
                        ) : (
                          user.email || "-"
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white outline-none focus:border-[#d4af37]"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        ) : (
                          <select
                            value={user.role || "CUSTOMER"}
                            onChange={(e) =>
                              updateUserRole(user.id, e.target.value)
                            }
                            disabled={actionLoading === user.id}
                            className="rounded-lg border border-gray-700 bg-[#0f0f0f] px-3 py-2 text-white disabled:opacity-60"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-200">
                          {user.provider || "LOCAL"}
                        </span>
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateUser(user.id)}
                              disabled={actionLoading === user.id}
                              className="rounded-lg bg-[#d4af37] px-4 py-2 font-semibold text-black transition hover:bg-[#c9a227] disabled:opacity-60"
                            >
                              {actionLoading === user.id ? "Saving..." : "Save"}
                            </button>

                            <button
                              onClick={cancelEdit}
                              disabled={actionLoading === user.id}
                              className="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white transition hover:bg-gray-600 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(user)}
                              disabled={actionLoading === user.id}
                              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                            >
                              Edit
                            </button>

                            {isLoggedAdmin ? (
                              <button
                                disabled
                                title="You cannot delete your own logged-in admin account"
                                className="cursor-not-allowed rounded-lg bg-gray-700 px-4 py-2 font-semibold text-gray-300 opacity-60"
                              >
                                Cannot Delete
                              </button>
                            ) : (
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={actionLoading === user.id}
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                              >
                                {actionLoading === user.id
                                  ? "Working..."
                                  : "Delete"}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}