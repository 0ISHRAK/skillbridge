"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  tokenBalance: number;
  isMentorApproved: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "learner" ? "mentor" : "learner";
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;

    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: { role: newRole } }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;

    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTokens = async (userId: string) => {
    const amount = prompt("Enter number of tokens to add:");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: { addTokens: Number(amount) } }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, tokenBalance: u.tokenBalance + Number(amount) } : u))
        );
      }
    } catch (err) {
      console.error("Failed to add tokens:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground mt-1">{users.length} total registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:border-primary"
        >
          <option value="all">All Roles</option>
          <option value="learner">Learners</option>
          <option value="mentor">Mentors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold">Tokens</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-muted-foreground text-[10px]">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      user.role === "mentor" ? "bg-amber-500/10 text-amber-500" :
                      user.role === "admin" ? "bg-red-500/10 text-red-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{user.tokenBalance}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {user.isEmailVerified ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== "admin" && (
                        <>
                          <button
                            onClick={() => handleAddTokens(user.id)}
                            disabled={actionLoading === user.id}
                            className="px-2 py-1 rounded-md border border-emerald-500/30 text-emerald-500 text-[9px] font-bold hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                            title="Add Tokens"
                          >
                            +Tokens
                          </button>
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={actionLoading === user.id}
                            className="px-2 py-1 rounded-md border border-amber-500/30 text-amber-500 text-[9px] font-bold hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                            title="Switch Role"
                          >
                            Switch
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={actionLoading === user.id}
                            className="px-2 py-1 rounded-md border border-red-500/30 text-red-500 text-[9px] font-bold hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
