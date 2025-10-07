"use client";

import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  User,
  Crown,
  Search,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "@/app/loading";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  image?: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [sortField, setSortField] = useState<
    "name" | "email" | "role" | "createdAt"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (
      status === "loading" ||
      !session ||
      (session.user?.role !== "admin" &&
        session.user?.email !== process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID)
    ) {
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, status]);

  if (status === "loading") return <Loading />;
  
  if (
    !session ||
    (session.user?.role !== "admin" &&
      session.user?.email !== process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID)
  )
    notFound();

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    setUpdatingUser(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success(
          `${newRole === "admin" ? "User now has admin access." : "Admin access removed."}`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSort = (field: "name" | "email" | "role" | "createdAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: "name" | "email" | "role" | "createdAt") => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const filteredAndSortedUsers = users
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 px-4 sm:px-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-9 sm:w-9 text-blue-600" />
              <span className="hidden sm:inline">User Management</span>
              <span className="sm:hidden">Users</span>
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage accounts, roles and permissions
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:pl-10 w-full sm:w-96 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 px-4 sm:px-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 mb-2 animate-pulse"></div>
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-10 sm:w-12 animate-pulse"></div>
                  </div>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={users.length}
                icon={<Users className="h-6 w-6 text-blue-600" />}
                color="bg-blue-100"
              />
              <StatCard
                label="Admins"
                value={adminCount}
                icon={<Crown className="h-6 w-6 text-orange-600" />}
                color="bg-orange-100"
              />
              <StatCard
                label="Regular Users"
                value={userCount}
                icon={<User className="h-6 w-6 text-green-600" />}
                color="bg-green-100"
              />
            </>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                  <TableHeader className="bg-gray-50 sticky top-0 z-10 border-t">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-3 py-4 sm:px-6">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-8 sm:w-12 animate-pulse"></div>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 hidden sm:table-cell">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-8 sm:w-12 animate-pulse"></div>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 hidden md:table-cell">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 text-xs sm:text-sm">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-12 sm:w-16 animate-pulse"></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
                          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-32 animate-pulse mb-1"></div>
                            <div className="h-2 sm:h-3 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
                            <div className="sm:hidden mt-1">
                              <div className="h-5 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-12 sm:w-16 animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 hidden md:table-cell">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-24 animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-gray-50 sticky top-0 z-10 border-t">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-3 py-4 sm:px-6">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-pointer"
                      >
                        User <span className="hidden sm:inline">{getSortIcon("name")}</span>
                      </button>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 hidden sm:table-cell">
                      <button
                        onClick={() => handleSort("role")}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        Role {getSortIcon("role")}
                      </button>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 hidden md:table-cell">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        Joined {getSortIcon("createdAt")}
                      </button>
                    </TableHead>
                    <TableHead className="px-3 sm:px-6 text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user, idx) => (
                    <TableRow
                      key={user.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm sm:text-base flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {user.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 truncate">
                              {user.email}
                            </div>
                            {/* Mobile role display */}
                            <div className="sm:hidden mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {user.role === "admin" ? (
                                  <Crown className="h-2.5 w-2.5 mr-1" />
                                ) : (
                                  <User className="h-2.5 w-2.5 mr-1" />
                                )}
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Crown className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                        {user.email === process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAIL_ID ? (
                          <span className="px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 cursor-not-allowed">
                            <span className="hidden sm:inline">Protected</span>
                            <span className="sm:hidden">🔒</span>
                          </span>
                        ) : updatingUser === user.id ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-500" />
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                onClick={() => setSelectedUser(user)}
                                className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                  user.role === "admin"
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                              >
                                <span className="hidden sm:inline">
                                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                </span>
                                <span className="sm:hidden">
                                  {user.role === "admin" ? "Remove" : "Admin"}
                                </span>
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <ShieldAlert className="h-5 w-5 text-orange-600" />
                                  {user.role === "admin" ? "Remove Admin Access" : "Grant Admin Access"}
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  <div className="text-left text-sm text-muted-foreground">
                                    {user.role === "admin" ? (
                                      <>
                                        <p>Remove admin access from <strong className="text-black">{user.name}</strong> ({user.email})?</p>
                                        <p className="mt-2 font-semibold text-black">They will lose access to:</p>
                                        <ul className="list-disc list-inside mt-2">
                                          <li>Admin dashboard</li>
                                          <li>User management</li>
                                          <li>Order management</li>
                                          <li>Product management</li>
                                        </ul>
                                      </>
                                    ) : (
                                      <>
                                        <p>Grant admin access to <strong className="text-black">{user.name}</strong> ({user.email})?</p>
                                        <p className="mt-2 font-semibold text-black">They will gain access to:</p>
                                        <ul className="list-disc list-inside mt-2">
                                          <li>Admin dashboard</li>
                                          <li>User management</li>
                                          <li>Order management</li>
                                          <li>Product management</li>
                                        </ul>
                                      </>
                                    )}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")}
                                  className={user.role === "admin" ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}
                                >
                                  {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div
        className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full ${color}`}
      >
        {icon}
      </div>
    </div>
  );
}
