"use client";

import { useSession } from "next-auth/react";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Search,
  ChevronDown,
  Bell,
  User,
  Eye,
  Download,
  ArrowUpDown,
  Loader2,
  Filter,
  MoreHorizontal,
  Clock,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/app/loading";

// Component to fetch and display product image
function ProductImage({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((products) => {
        const product = products.find((p: any) => p.id === productId);
        setImageSrc(
          product?.frontImage ||
            product?.image ||
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
        );
      })
      .catch(() => {
        setImageSrc(
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop"
        );
      });
  }, [productId]);

  return (
    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
      {!imageSrc ? (
        <span className="text-xs text-gray-500">loading</span>
      ) : (
        <img
          src={imageSrc}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop";
          }}
        />
      )}
    </div>
  );
}

type Order = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    qty: number;
  }[];
  total: number;
  status: string;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string;
  deliveryDate: string;
  billUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [uploadingBill, setUploadingBill] = useState(false);
  const [removingBill, setRemovingBill] = useState(false);
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [updatingDialogStatus, setUpdatingDialogStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [statusChangeTime, setStatusChangeTime] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (
      status === "loading" ||
      !session ||
      (session.user?.role !== "admin" &&
        session.user?.email !== "admin@electronic.com")
    ) {
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders");
        if (!response.ok) {
          let errorMessage = "Failed to fetch orders";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        console.error("Orders fetch error:", err);
        toast.error(`Failed to load orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [session, status]);

  if (status === "loading") {
    return <Loading />;
  }

  if (
    !session ||
    (session.user?.role !== "admin" &&
      session.user?.email !== "admin@electronic.com")
  ) {
    notFound();
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statusOrder = ["pending", "shipped", "out-for-delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);

    // Check if trying to revert
    if (newIndex < currentIndex) {
      const lastChangeTime = statusChangeTime[orderId] || new Date(order.updatedAt).getTime();
      const timeSinceUpdate = Date.now() - lastChangeTime;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceUpdate > fiveMinutes) {
        toast.error("Cannot revert status after 5 minutes");
        return;
      }

      if (currentIndex - newIndex > 1) {
        toast.error("Cannot revert more than one step at a time");
        return;
      }
    }

    setUpdatingOrder(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const data = await response.json();
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data.order : order))
      );

      // Track the time of this status change
      setStatusChangeTime(prev => ({
        ...prev,
        [orderId]: Date.now()
      }));

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleBillUpload = async (file: File) => {
    if (!selectedOrder) return;

    // Validate file using the same method as products
    const { validateImageFile } = await import("@/lib/image-utils");
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    setUploadingBill(true);
    try {
      // Convert to base64 with smaller size for bills
      const { convertFileToBase64 } = await import("@/lib/image-utils");
      const base64 = await convertFileToBase64(file, 800, 0.6);
      
      // Check if base64 is too large (MongoDB has 16MB document limit)
      if (base64.length > 10 * 1024 * 1024) { // 10MB limit
        throw new Error("Image too large after compression. Please use a smaller image.");
      }

      // Update order with base64 bill directly
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Content-Length": JSON.stringify({
            orderId: selectedOrder.id,
            billUrl: base64,
          }).length.toString()
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          billUrl: base64,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update order with bill";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }
      const updatedOrder = data.order;

      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      toast.success("Bill uploaded successfully");
    } catch (error: any) {
      console.error("Bill upload error:", error);
      toast.error(`Failed to upload bill: ${error.message}`);
    } finally {
      setUploadingBill(false);
    }
  };

  const handleBillRemove = async () => {
    if (!selectedOrder) return;

    setRemovingBill(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          billUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove bill");
      }

      const data = await response.json();
      const updatedOrder = { ...data.order, billUrl: null };

      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      toast.success("Bill removed successfully");
    } catch (error: any) {
      toast.error(`Failed to remove bill: ${error.message}`);
    } finally {
      setRemovingBill(false);
    }
  };

  const handleDialogStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;

    const statusOrder = ["pending", "shipped", "out-for-delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(selectedOrder.status);
    const newIndex = statusOrder.indexOf(newStatus);

    // Check if trying to revert
    if (newIndex < currentIndex) {
      const lastChangeTime = statusChangeTime[selectedOrder.id] || new Date(selectedOrder.updatedAt).getTime();
      const timeSinceUpdate = Date.now() - lastChangeTime;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceUpdate > fiveMinutes) {
        toast.error("Cannot revert status after 5 minutes");
        return;
      }

      if (currentIndex - newIndex > 1) {
        toast.error("Cannot revert more than one step at a time");
        return;
      }

      toast.warning("Reverting order status - allowed within 5 minutes");
    } else {
      toast.success(`Updating order status to ${newStatus}`);
    }

    setUpdatingDialogStatus(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder.id, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const data = await response.json();
      const updatedOrder = data.order;

      setSelectedOrder(updatedOrder);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? updatedOrder : order
        )
      );

      // Track the time of this status change
      setStatusChangeTime(prev => ({
        ...prev,
        [selectedOrder.id]: Date.now()
      }));

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingDialogStatus(false);
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user.name || order.user.email)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.address.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "price-desc":
          return b.total - a.total;
        case "price-asc":
          return a.total - b.total;
        case "name-asc":
          return (a.user.name || a.user.email).localeCompare(
            b.user.name || b.user.email
          );
        case "name-desc":
          return (b.user.name || b.user.email).localeCompare(
            a.user.name || a.user.email
          );
        default:
          return 0;
      }
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Orders
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {filteredAndSortedOrders.length} of {orders.length} orders
            </p>
          </div>
          <div className="flex items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full "
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-fit sm:w-auto">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                  Name: A to Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                  Name: Z to A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex text-sm overflow-x-auto gap-3 sm:gap-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
        {["all", "shipped", "pending", "delivered"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`pb-0 font-medium border-b-2 transition whitespace-nowrap ${
              statusFilter === tab
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            }`}
          >
            {tab === "all" && "All orders"}
            {tab === "shipped" && "Dispatch"}
            {tab === "pending" && "Pending"}
            {tab === "delivered" && "Completed"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="flex-1 p-0 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Id
                  </TableHead>
                  <TableHead className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Customer
                  </TableHead>
                  <TableHead className="hidden md:table-cell px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Address
                  </TableHead>
                  <TableHead className="hidden sm:table-cell px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Date
                  </TableHead>
                  <TableHead className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Total
                  </TableHead>
                  <TableHead className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="px-3 sm:px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-3 sm:px-6 py-4">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell px-3 sm:px-6 py-4">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No{" "}
                          {statusFilter === "all"
                            ? "orders"
                            : statusFilter === "shipped"
                            ? "dispatched orders"
                            : statusFilter === "pending"
                            ? "pending orders"
                            : "completed orders"}{" "}
                          found
                        </h3>
                        <p className="text-gray-500">
                          {statusFilter === "all"
                            ? "No orders have been placed yet."
                            : statusFilter === "shipped"
                            ? "No orders have been dispatched yet."
                            : statusFilter === "pending"
                            ? "No orders are currently pending."
                            : "No orders have been completed yet."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedOrders.map((order, i) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setSelectedOrder(order);
                        setShowOrderDialog(true);
                      }}
                    >
                      <TableCell className="px-3 sm:px-6 py-4 font-medium">
                        <span className="text-xs sm:text-sm">
                          #{order.id.slice(-6)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {order.user.image ? (
                            <img
                              src={order.user.image}
                              alt={order.user.name || order.user.email}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-medium text-xs bg-gradient-to-r from-blue-500 to-purple-600">
                              {(order.user.name || order.user.email)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-medium truncate">
                              {order.user.name || order.user.email}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden truncate">
                              {order.address.city}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-3 sm:px-6 py-4">
                        <span className="text-sm">
                          {order.address.city}, {order.address.state}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell px-3 sm:px-6 py-4">
                        <span className="text-xs sm:text-sm">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <span className="text-xs sm:text-sm font-medium">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "out-for-delivery"
                              ? "bg-orange-100 text-orange-800"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell
                        className="px-3 sm:px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setSelectedOrder(order);
                                setShowOrderDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.id, "pending")
                              }
                              disabled={updatingOrder === order.id}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.id, "shipped")
                              }
                              disabled={updatingOrder === order.id}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Shipped
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.id, "out-for-delivery")
                              }
                              disabled={updatingOrder === order.id}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Out for Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(order.id, "delivered")
                              }
                              disabled={updatingOrder === order.id}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Delivered
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-0">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 pt-0 pb-3 pl-1">
                <span>
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : selectedOrder.status === "shipped"
                      ? "bg-blue-100 text-blue-800"
                      : selectedOrder.status === "out-for-delivery"
                      ? "bg-orange-100 text-orange-800"
                      : selectedOrder.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedOrder.status === "processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Order Items ({selectedOrder.items.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            window.open(`/products/${item.productId}`, "_blank")
                          }
                        >
                          <ProductImage
                            productId={item.productId}
                            productName={item.name}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.qty}
                            </p>
                            <p className="text-sm text-gray-600">
                              Unit Price: ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₹{(item.price * item.qty).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{selectedOrder.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0 w-full">
                    {/* Customer Details */}
                    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 w-full sm:w-86">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Account Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {selectedOrder.user.name || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900 break-words">
                            {selectedOrder.user.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {selectedOrder.user.phone || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-6 w-full sm:w-96">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Delivery Details
                      </h3>
                      <div className="space-y-0">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900 ml-1 break-words">
                          {selectedOrder.address.fullName}
                        </span>
                        <div>
                          <span className="text-sm text-gray-600">
                            Address:
                          </span>
                          <span className="text-gray-900 ml-1 font-medium break-words">
                            {selectedOrder.address.line1}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Address:
                          </span>
                          {selectedOrder.address.line2 && (
                            <span className="text-gray-900 ml-1 font-medium break-words">
                              {selectedOrder.address.line2}
                            </span>
                          )}
                        </div>
                        <div className="">
                          <div>
                            <span className="text-sm text-gray-600 font-medium">
                              City:
                            </span>
                            <span className="ml-1 text-gray-900 break-words">
                              {selectedOrder.address.city},{" "}
                            </span>
                          </div>
                          <div></div>
                          <div>
                            <span className="text-sm text-gray-600">
                              State:
                            </span>
                            <span className="ml-1 text-gray-900 font-medium break-words">
                              {selectedOrder.address.state}{" "}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            ZipCode:
                          </span>
                          <span className="ml-1 text-gray-900 font-medium break-words">
                            {selectedOrder.address.zip}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="ml-1 text-gray-900 font-medium break-words">
                            {selectedOrder.address.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Bill Management */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Bill Management
                    </h3>
                    {selectedOrder.billUrl ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="mb-3">
                          <p className="text-green-800 font-medium text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Bill uploaded
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Dialog
                            open={showBillDialog}
                            onOpenChange={setShowBillDialog}
                          >
                            <DialogTrigger asChild>
                              <button className="border border-blue-600 bg-blue-100 text-blue-700 px-3 py-1 hover:bg-blue-200 rounded-md text-sm cursor-pointer flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Bill
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Bill - Order #{selectedOrder.id}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <div className="text-center">
                                  <img
                                    src={selectedOrder.billUrl}
                                    alt="Bill"
                                    className="max-w-full h-auto rounded border mx-auto"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                  <div className="mt-4">
                                    <button
                                      onClick={() => {
                                        const link = document.createElement("a");
                                        link.href = selectedOrder.billUrl!;
                                        link.download = `bill-${selectedOrder.id}.jpg`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 mx-auto"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download Bill
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = selectedOrder.billUrl!;
                              link.download = `bill-${selectedOrder.id}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="border border-green-600 bg-green-100 text-green-700 px-3 py-1 hover:bg-green-200 rounded-md text-sm cursor-pointer flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                disabled={removingBill}
                                className="border border-red-600 bg-red-100 text-red-700 px-3 py-1 hover:bg-red-200 rounded-md text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                {removingBill ? "Removing..." : "Remove"}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Bill</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove the bill for order #{selectedOrder.id}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleBillRemove}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Bill
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              e.target.value = "";
                              handleBillUpload(file);
                            }
                          }}
                          disabled={uploadingBill}
                          className="hidden"
                          id="bill-upload-dialog"
                        />
                        <label
                          htmlFor="bill-upload-dialog"
                          className={`cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium ${
                            uploadingBill
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          {uploadingBill ? "Uploading..." : "Upload Bill"}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, JPG, PNG (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Status Timeline */}
                  <div className="bg-white rounded-xl border border-gray-100 p-6 mt-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Order Status Timeline
                    </h3>
                    <div className="space-y-6">
                      {/* Horizontal Timeline */}
                      <div className="relative">
                        <div className="flex justify-between items-start">
                          {/* Order Confirmed */}
                          <div className="flex flex-col items-center text-center flex-1">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              Order Confirmed
                            </h4>
                            <p className="text-xs text-gray-600">
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          {/* Connecting Line */}
                          <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-2"></div>

                          {/* Shipped */}
                          <div className="flex flex-col items-center text-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                [
                                  "shipped",
                                  "out-for-delivery",
                                  "delivered",
                                ].includes(selectedOrder.status)
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <Truck className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              Shipped
                            </h4>
                            <p className="text-xs text-gray-600">
                              {[
                                "shipped",
                                "out-for-delivery",
                                "delivered",
                              ].includes(selectedOrder.status)
                                ? new Date(
                                    selectedOrder.updatedAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "Pending"}
                            </p>
                            {[
                              "shipped",
                              "out-for-delivery",
                              "delivered",
                            ].includes(selectedOrder.status) && (
                              <p className="text-xs text-gray-600">
                                {new Date(
                                  selectedOrder.updatedAt
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>

                          <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-2"></div>

                          {/* Out For Delivery */}
                          <div className="flex flex-col items-center text-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                ["out-for-delivery", "delivered"].includes(
                                  selectedOrder.status
                                )
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <Truck className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              Out For Delivery
                            </h4>
                            <p className="text-xs text-gray-600">
                              {["out-for-delivery", "delivered"].includes(
                                selectedOrder.status
                              )
                                ? new Date(
                                    selectedOrder.updatedAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "Pending"}
                            </p>
                            {["out-for-delivery", "delivered"].includes(
                              selectedOrder.status
                            ) && (
                              <p className="text-xs text-gray-600">
                                {new Date(
                                  selectedOrder.updatedAt
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>

                          <div className="flex-1 h-0.5 bg-gray-200 mt-5 mx-2"></div>

                          {/* Delivered */}
                          <div className="flex flex-col items-center text-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                selectedOrder.status === "delivered"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            >
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              Delivered
                            </h4>
                            <p className="text-xs text-gray-600">
                              {selectedOrder.status === "delivered"
                                ? new Date(
                                    selectedOrder.updatedAt
                                  ).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "Pending"}
                            </p>
                            {selectedOrder.status === "delivered" && (
                              <p className="text-xs text-gray-600">
                                {new Date(
                                  selectedOrder.updatedAt
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Update Status */}
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Update Status
                        </label>
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(newStatus) =>
                            handleDialogStatusChange(newStatus)
                          }
                          disabled={updatingDialogStatus}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              Order Confirmed
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="out-for-delivery">
                              Out for Delivery
                            </SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingDialogStatus && (
                          <div className="flex items-center gap-2 text-blue-600 mt-2">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div> */}
                            <span className="text-sm">Updating...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
