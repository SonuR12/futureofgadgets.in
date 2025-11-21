"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";
import { uploadFilesToCloudinary, validateImageFile } from "@/lib/image-utils";
import LoadingButton from "@/components/ui/loading-button";
import { cachedFetch, invalidateCache } from "@/lib/api-cache";

type Item = {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  boxContents?: string;
  image: string;
  images: string[];
  price: number;
  mrp?: number;
  quantity: number;
  brand?: string;
  modelName?: string;
  sku?: string;
  updatedAt: string;
  screenSize?: string;
  cpuModel?: string;
  operatingSystem?: string;
  graphics?: string;
  color?: string;
  warranty?: string;
  warrantyType?: string;
  rating?: number;
  ratingCount?: number;
  ramOptions?: { size: string; price: number; quantity?: number }[];
  storageOptions?: { size: string; price: number; quantity?: number }[];
  warrantyOptions?: { duration: string; price: number }[];
};

const itemSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  brand: z.string().optional(),
  modelName: z.string().optional(),
  warranty: z.string().optional(),
  warrantyType: z.string().optional(),
  screenSize: z.string().optional(),
  cpuModel: z.string().optional(),
  operatingSystem: z.string().optional(),
  graphics: z.string().optional(),
  color: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().min(0).optional(),
  ramOptions: z.array(z.object({ size: z.string(), price: z.number() })).optional(),
  storageOptions: z.array(z.object({ size: z.string(), price: z.number() })).optional(),
  warrantyOptions: z.array(z.object({ duration: z.string(), price: z.number() })).optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function ProductTable() {
  const [data, setData] = useState<Item[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentFrontImage, setCurrentFrontImage] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [addingNewType, setAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [ramOptions, setRamOptions] = useState<{ size: string; price: number; quantity: number }[]>([]);
  const [storageOptions, setStorageOptions] = useState<{ size: string; price: number; quantity: number }[]>([]);
  const [warrantyOptions, setWarrantyOptions] = useState<{ duration: string; price: number }[]>([]);
  const [descriptionLines, setDescriptionLines] = useState<string[]>([""]);
  const [boxContents, setBoxContents] = useState<string[]>([""]);

  const defaultValues: ItemFormValues = {
    name: "",
    category: "",
    description: "",
    price: 0,
    mrp: 0,
    discount: 0,
    quantity: 0,
    brand: "",
    modelName: "",
    warranty: "",
    warrantyType: "",
    screenSize: "",
    cpuModel: "",
    operatingSystem: "",
    graphics: "",
    color: "",
    rating: 0,
    ratingCount: 0,
    ramOptions: [],
    storageOptions: [],
    warrantyOptions: [],
  };

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  // Watch MRP and price to auto-calculate discount
  const mrp = form.watch("mrp");
  const price = form.watch("price");

  useEffect(() => {
    if (mrp && price && mrp > 0) {
      const calculatedDiscount = Math.round(((mrp - price) / mrp) * 100);
      form.setValue("discount", calculatedDiscount >= 0 ? calculatedDiscount : 0);
    } else {
      form.setValue("discount", 0);
    }
  }, [mrp, price]);

  // Auto-calculate quantity from RAM options only if RAM options exist
  useEffect(() => {
    if (ramOptions.length > 0) {
      const totalQty = ramOptions.reduce((sum, opt) => sum + (opt.quantity || 0), 0);
      form.setValue("quantity", totalQty);
    }
  }, [ramOptions]);

  useEffect(() => {
    cachedFetch<any[]>("/api/products", { cache: "no-store" }, 10000)
      .then((products) => {
        const items: Item[] = (products || []).map((p: any) => {
          return {
            id: p.id ?? Date.now().toString(),
            slug: p.slug ?? "",
            name: p.name ?? p.title ?? "Untitled",
            title: p.title ?? p.name ?? "Untitled",
            category: p.category ?? p.type ?? "General",
            description: p.description ?? "",
            boxContents: p.boxContents ?? "",
            image:
              p.frontImage ?? p.image ?? p.coverImage ?? "/placeholder.svg",
            images: Array.isArray(p.images)
              ? p.images
              : p.images?.split?.(",").map((s: string) => s.trim()) ?? [],
            price: Number(p.price ?? 0),
            mrp: Number(p.mrp ?? 0),
            quantity: Number(p.quantity ?? p.stock ?? 0),
            brand: p.brand ?? "",
            modelName: p.modelName ?? "",
            sku: p.sku ?? `SKU-${Date.now()}`,
            updatedAt: p.updatedAt ?? p.createdAt ?? new Date().toISOString(),
            screenSize: p.screenSize ?? "",
            cpuModel: p.cpuModel ?? "",
            operatingSystem: p.operatingSystem ?? "",
            graphics: p.graphics ?? "",
            color: p.color ?? "",
            warranty: p.warranty ?? "",
            warrantyType: p.warrantyType ?? "",
            rating: p.rating ?? 0,
            ratingCount: p.ratingCount ?? 0,
            ramOptions: p.ramOptions || [],
            storageOptions: p.storageOptions || [],
            warrantyOptions: p.warrantyOptions || [],
          };
        });
        setData(items);
        setIsLoading(false);

        // Fetch categories
        fetchCategories();
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = data;
    
    // Apply filter
    if (activeFilter === "out-of-stock") {
      result = result.filter(p => p.quantity === 0);
    } else if (activeFilter !== "all") {
      result = result.filter(p => p.category.toLowerCase() === activeFilter.toLowerCase());
    }
    
    // Apply search
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [data, query, activeFilter]);
  
  const outOfStockCount = useMemo(() => {
    return data.filter(p => p.quantity === 0).length;
  }, [data]);

  useEffect(() => {
    if (open && !editId) {
      console.log('Resetting form for create mode');
      form.reset(defaultValues);
      setDescriptionLines([""]);
      setBoxContents([""]);
      setFrontImage(null);
      setAdditionalImages([]);
      setCurrentFrontImage("");
      setCurrentImages([]);
      setRamOptions([]);
      setStorageOptions([]);
      setWarrantyOptions([]);
      
      // Force form to be valid initially
      setTimeout(() => {
        form.clearErrors();
        console.log('Form state after reset:', form.formState);
      }, 100);
    }
    if (!open) {
      setEditId(null);
      setAddingNewType(false);
      setNewType("");
      setCurrentFrontImage("");
      setCurrentImages([]);
      setRamOptions([]);
      setStorageOptions([]);
      setDescriptionLines([""]);
      setBoxContents([""]);
    }
  }, [open, editId]);

  const handleEditClick = (item: Item) => {
    setEditId(item.id);
    const mrp = item.mrp || item.price || 0;
    const price = item.price || 0;
    const discount = mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    form.reset({
      name: item.name,
      category: item.category,
      description: item.description,
      price: price,
      mrp: mrp,
      discount: discount,
      quantity: item.quantity || 0,
      brand: item.brand || "",
      modelName: item.modelName || "",
      warranty: item.warranty || "",
      warrantyType: item.warrantyType || "",
      screenSize: item.screenSize || "",
      cpuModel: item.cpuModel || "",
      operatingSystem: item.operatingSystem || "",
      graphics: item.graphics || "",
      color: item.color || "",
      rating: item.rating || 0,
      ratingCount: item.ratingCount || 0,
      ramOptions: item.ramOptions || [],
      storageOptions: item.storageOptions || [],
    });
    setFrontImage(null);
    setAdditionalImages([]);
    setCurrentFrontImage(item.image || "");
    setCurrentImages(item.images || []);
    setRamOptions((item.ramOptions || []).map(opt => ({ ...opt, quantity: (opt as any).quantity || 0 })));
    setStorageOptions((item.storageOptions || []).map(opt => ({ ...opt, quantity: (opt as any).quantity || 0 })));
    setWarrantyOptions(item.warrantyOptions || []);
    setDescriptionLines(item.description ? item.description.split('\n').filter(line => line.trim()) : [""]);
    setBoxContents(item.boxContents ? item.boxContents.split('\n').filter(line => line.trim()) : [""]);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const originalData = data;

    // Optimistic update
    setData((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item deleted successfully!");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setData(originalData);
        const data = await res.json();
        throw new Error(data?.error || "Failed to delete");
      }

      // Invalidate cache
      invalidateCache("products");
    } catch (err: any) {
      setData(originalData);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddNewType = () => {
    if (newType.trim() && !categories.includes(newType.trim())) {
      setCategories((prev) => [...prev, newType.trim()]);
      form.setValue("category", newType.trim());
      toast.success(`Added new type: ${newType.trim()}`);
    }
    setAddingNewType(false);
    setNewType("");
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      // Failed to fetch categories
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    setCategoryLoading(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      
      if (res.ok) {
        setCategories(prev => [...prev, newCategory.trim()]);
        setNewCategory('');
        toast.success('Category added successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add category');
      }
    } catch (err: any) {
      toast.error('Failed to add category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    setDeletingCategory(categoryName);
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      
      if (res.ok) {
        setCategories(prev => prev.filter(cat => cat !== categoryName));
        toast.success('Category deleted successfully!');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (err: any) {
      toast.error('Failed to delete category');
    } finally {
      setDeletingCategory(null);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (values: ItemFormValues) => {
    
    // Comprehensive validation
    if (!values.name?.trim()) {
      toast.error("Product name is required");
      return;
    }

    // Check for duplicate name
    const duplicateName = data.find(item => 
      item.name.toLowerCase() === values.name?.trim().toLowerCase() && 
      item.id !== editId
    );
    if (duplicateName) {
      toast.error("Product with this Title name already exists");
      return;
    }

    if (!values.category?.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!values.modelName?.trim()) {
      toast.error("Model name is required");
      return;
    }

    if (!values.price || values.price <= 0) {
      toast.error("Valid price is required");
      return;
    }

    // Make image optional for now to test form submission
    // if (!editId && !frontImage && !currentFrontImage) {
    //   toast.error("Front image is required for new product");
    //   return;
    // }

    if (values.mrp && values.price > values.mrp) {
      toast.error("Selling price cannot be greater than MRP");
      return;
    }

    if (descriptionLines.filter(line => line.trim()).length === 0) {
      toast.error("Description is required");
      return;
    }

    // Remove RAM validation - make it optional

    setUploading(true); 
    // toast.loading(editId ? "Updating product..." : "Creating product...", { id: 'product-submit' });
    
    try {
      let frontImageUrl = currentFrontImage;
      let additionalImageUrls = currentImages;

      // Only upload new images if files are selected
      if (frontImage || additionalImages.length > 0) {
        const filesToUpload: File[] = [];

        if (frontImage) {
          filesToUpload.push(frontImage);
        }

        if (additionalImages.length > 0) {
          filesToUpload.push(...additionalImages);
        }

        try {
          const uploadedUrls = await uploadFilesToCloudinary(filesToUpload);

          if (frontImage) frontImageUrl = uploadedUrls[0];
          if (additionalImages.length > 0)
            additionalImageUrls = uploadedUrls.slice(frontImage ? 1 : 0);
        } catch (uploadError: any) {
          toast.warning('Image upload failed, creating product without images');
          frontImageUrl = 'https://via.placeholder.com/300';
          additionalImageUrls = [];
        }
      } else {
        // Use placeholder if no images
        frontImageUrl = frontImageUrl || 'https://via.placeholder.com/300';
      }

      const productData: any = {
        name: values.name,
        title: values.name,
        slug: generateSlug(values.name),
        category: values.category,
        description: descriptionLines.filter(line => line.trim()).join('\n'),
        boxContents: boxContents.filter(line => line.trim()).join('\n'),
        frontImage: frontImageUrl || 'https://via.placeholder.com/300',
        images: additionalImageUrls,
        price: values.price,
        mrp: values.mrp || values.price,
        quantity: values.quantity || 0,
        brand: values.brand,
        modelName: values.modelName,
        warranty: values.warranty,
        warrantyType: values.warrantyType,
        screenSize: values.screenSize,
        cpuModel: values.cpuModel,
        operatingSystem: values.operatingSystem,
        graphics: values.graphics,
        color: values.color,
        ramOptions: ramOptions,
        storageOptions: storageOptions,
        warrantyOptions: warrantyOptions,
        rating: values.rating || 0,
        ratingCount: values.ratingCount || 0,
        status: "active",
        sku: editId
          ? data.find((item) => item.id === editId)?.sku || `SKU-${Date.now()}`
          : `SKU-${Date.now()}`,
      };

      if (editId) {
        // Update existing product (PUT)
        const url = `/api/products/${editId}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to update item");
        }

        // optimistic update
        const updatedItem = {
          id: editId,
          slug: productData.slug,
          name: productData.name,
          title: productData.title,
          category: productData.category,
          description: productData.description,
          boxContents: productData.boxContents,
          image: productData.frontImage,
          images: productData.images,
          price: productData.price,
          mrp: productData.mrp,
          quantity: productData.quantity,
          brand: productData.brand || "",
          modelName: productData.modelName || "",
          warranty: productData.warranty || "",
          warrantyType: productData.warrantyType || "",
          sku: productData.sku,
          updatedAt: new Date().toISOString(),
          screenSize: productData.screenSize || "",
          cpuModel: productData.cpuModel || "",
          operatingSystem: productData.operatingSystem || "",
          graphics: productData.graphics || "",
          color: productData.color || "",
          rating: productData.rating || 0,
          ratingCount: productData.ratingCount || 0,
          ramOptions: productData.ramOptions || [],
          storageOptions: productData.storageOptions || [],
          warrantyOptions: productData.warrantyOptions || [],
        };

        setData((prev) => prev.map((item) => (item.id === editId ? updatedItem : item)));
        invalidateCache("products");
        toast.success("Item updated successfully!", { id: 'product-submit' });
      } else {
        // Create new product (POST)
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.error || errData?.details || "Failed to create product");
        }

        const created = await res.json();

        // Map server response into Item shape and prepend to list
        const newItem: Item = {
          id: created.id ?? `${Date.now()}`,
          slug: created.slug ?? productData.slug,
          name: created.name ?? productData.name,
          title: created.title ?? productData.title,
          category: created.category ?? productData.category,
          description: created.description ?? productData.description,
          boxContents: created.boxContents ?? productData.boxContents,
          image: created.frontImage ?? productData.frontImage,
          images: Array.isArray(created.images) ? created.images : (productData.images || []),
          price: Number(created.price ?? productData.price),
          mrp: Number(created.mrp ?? productData.mrp),
          quantity: Number(created.quantity ?? created.stock ?? productData.quantity ?? 0),
          brand: created.brand ?? productData.brand ?? "",
          modelName: created.modelName ?? productData.modelName ?? "",
          sku: created.sku ?? productData.sku,
          updatedAt: created.updatedAt ?? created.createdAt ?? new Date().toISOString(),
          screenSize: created.screenSize ?? productData.screenSize ?? "",
          cpuModel: created.cpuModel ?? productData.cpuModel ?? "",
          operatingSystem: created.operatingSystem ?? productData.operatingSystem ?? "",
          graphics: created.graphics ?? productData.graphics ?? "",
          color: created.color ?? productData.color ?? "",
          rating: created.rating ?? productData.rating ?? 0,
          ratingCount: created.ratingCount ?? productData.ratingCount ?? 0,
          ramOptions: created.ramOptions ?? productData.ramOptions ?? [],
          storageOptions: created.storageOptions ?? productData.storageOptions ?? [],
          warrantyOptions: created.warrantyOptions ?? productData.warrantyOptions ?? [],
        };

        setData((prev) => [newItem, ...prev]);
        invalidateCache("products");
        toast.success("Item created successfully!", { id: 'product-submit' });
      }

      // Reset UI
      form.reset(defaultValues);
      setFrontImage(null);
      setAdditionalImages([]);
      setRamOptions([]);
      setStorageOptions([]);
      setWarrantyOptions([]);
      setDescriptionLines([""]);
      setBoxContents([""]);
      setCurrentFrontImage("");
      setCurrentImages([]);
      setEditId(null);
      setOpen(false);
    } catch (err: any) {
      
      // Show specific error messages
      if (err.message.includes('Image upload failed')) {
        toast.error(err.message, { id: 'product-submit' });
      } else if (err.message.includes('already exists')) {
        toast.error('A product with this name already exists. Please use a different name.', { id: 'product-submit' });
      } else if (err.message.includes('required fields')) {
        toast.error('Please fill in all required fields', { id: 'product-submit' });
      } else if (err.message.includes('Unique constraint')) {
        toast.error('Product name must be unique', { id: 'product-submit' });
      } else {
        toast.error(`Failed to ${editId ? 'update' : 'create'} product: ${err.message}`, { id: 'product-submit' });
      }
    } finally {
      setUploading(false);
    }
  };

  if (error)
    return <p className="text-sm text-destructive">Failed to load items.</p>;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Search + Add buttons */}
        <div className="flex flex-col md:flex-row px-4 items-start md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-80 md:w-96 h-10 bg-gray-200 shimmer rounded"></div>
            <div className="w-full sm:w-auto h-10 bg-gray-200 shimmer rounded"></div>
          </div>
          <div className="space-x-2 flex flex-col sm:flex-row justify-between md:justify-end sm:w-fit w-full">
            <div className="w-full md:w-auto h-10 bg-gray-200 shimmer rounded mt-2 md:mt-0"></div>
            <div className="w-full md:w-auto h-10 bg-gray-200 shimmer rounded mt-2 md:mt-0"></div>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex text-sm overflow-x-auto gap-3 sm:gap-8 px-4 sm:px-6 lg:px-8 pt-4 border-t border-gray-200">
          <button className="pb-0 font-medium border-b-2 border-blue-600 text-blue-700 whitespace-nowrap">
            All Products
          </button>
          <button className="pb-0 font-medium border-b-2 border-transparent text-gray-400 whitespace-nowrap">
            Out of Stock (0)
          </button>
        </div>

        {/* Table */}
        <Table>
          <TableCaption>Inventory overview. Low-stock items (≤5) are highlighted.</TableCaption>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-t hover:bg-transparent">
              <TableHead className="px-2 md:px-3 lg:px-6 py-4 text-left text-sm font-semibold text-gray-600">Item</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Quantity</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead className="px-2 md:px-3 lg:px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-gray-200 rounded-md animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 md:w-24 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-12 md:w-16 animate-pulse"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 md:gap-2">
                    <div className="h-8 bg-gray-200 rounded w-10 md:w-12 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 md:w-16 animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Add buttons */}
      <div className="flex flex-col md:flex-row px-4 items-start md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <Input
            className="w-full sm:w-80 md:w-96"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, type, or description"
          />
          <Button variant="secondary" onClick={() => setQuery("")} className="w-full sm:w-auto border hover:bg-gray-200">
            Clear
          </Button>
        </div>

        <div className="space-x-2 flex flex-col sm:flex-row justify-between md:justify-end sm:w-fit w-full">
          {/* Category Manager */}
          <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer w-full md:w-auto mt-2 md:mt-0">
                Category <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <LoadingButton
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    loading={categoryLoading}
                  >
                    Add
                  </LoadingButton>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.sort().map((category) => (
                    <div key={category} className="flex items-center justify-between p-2 border rounded">
                      <span>{category}</span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {category}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCategory(category)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Item button (opens same dialog in create mode) */}
          <Button
            onClick={() => {
              setEditId(null);
              setOpen(true);
            }}
            className="cursor-pointer w-full md:w-auto mt-2 md:mt-0"
          >
            Add Item <Plus />
          </Button>

          {/* The form Dialog (shared for Add/Edit) */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="min-w-[95vw] md:min-w-[85vw] lg:min-w-[80vw] h-[90vh] max-w-none overflow-y-auto p-4 md:p-6 lg:p-8">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-semibold">
                  {editId ? "Edit Item" : "Add Item"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.log('Form validation errors:', errors);
                  toast.error('Please fix form validation errors');
                })} className="space-y-10">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <div className="flex flex-col space-y-6 w-full lg:w-1/2">
                      <h3 className="text-lg lg:text-xl font-semibold text-gray-900 border-b-2 pb-3">
                        Product Details
                      </h3>
                      <div className="space-y-6">
                        {/* Name */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Title Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Brand */}
                        <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. ASUS, Dell, Samsung" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Model Name */}
                        <FormField
                          control={form.control}
                          name="modelName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Vivobook 15, XPS 13" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Rating */}
                        <div className="space-y-3">
                          <FormLabel>Rating</FormLabel>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => form.setValue("rating", star)}
                                  type="button"
                                >
                                  <Star className={`w-6 h-6 ${star <= (form.watch("rating") || 0) ? 'fill-green-400 text-green-400' : 'text-gray-300'}`} />
                                </button>
                              ))}
                            </div>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Count"
                              className="w-24"
                              value={form.watch("ratingCount") || ''}
                              onChange={(e) => form.setValue("ratingCount", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        {/* Warranty */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="warranty"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warranty</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 1 Year, 2 Years" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="warrantyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Warranty Type</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Onsite, Carry-in" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Category with dropdown */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.sort().map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* MRP, Discount, Selling Price, Quantity */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name="mrp"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>MRP (INR)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 109999"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount %</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Auto"
                                    value={field.value === 0 ? "" : field.value}
                                    readOnly
                                    className="bg-gray-100 cursor-not-allowed"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Selling Price (INR)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 89999"
                                    value={field.value === 0 ? "" : field.value}
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Qty</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder={ramOptions.length > 0 ? "Auto" : "Enter quantity"}
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    readOnly={ramOptions.length > 0}
                                    className={ramOptions.length > 0 ? "bg-gray-100 cursor-not-allowed" : ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>Description</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setDescriptionLines([...descriptionLines, ""])}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Line
                            </Button>
                          </div>
                          {descriptionLines.map((line, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Textarea
                                className="w-120"
                                placeholder={`Description line ${index + 1}`}
                                value={line}
                                onChange={(e) => {
                                  const updated = [...descriptionLines];
                                  updated[index] = e.target.value;
                                  setDescriptionLines(updated);
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setDescriptionLines(descriptionLines.filter((_, i) => i !== index))}
                                disabled={descriptionLines.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/2">
                      {/* Product Specification */}
                      <div className="flex-1 space-y-6">
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 border-b-2 pb-3">
                          Product Specification
                        </h3>
                        <FormField
                          control={form.control}
                          name="screenSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Screen Size (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 15.6 inches" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cpuModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPU Model (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Intel Core i5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="operatingSystem"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Operating System (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Windows 11" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="graphics"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Graphics (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Intel UHD Graphics" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Color (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Black, Silver" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* RAM Options */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>RAM Options (Optional)</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setRamOptions([...ramOptions, { size: "", price: 0, quantity: 0 }])}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add RAM
                            </Button>
                          </div>
                          {ramOptions.length > 0 && ramOptions.map((option, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Input
                                  placeholder="e.g. 8GB DDR4"
                                  value={option.size}
                                  onChange={(e) => {
                                    const updated = [...ramOptions];
                                    updated[index].size = e.target.value;
                                    setRamOptions(updated);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="number"
                                  placeholder={index === 0 ? "(default)" : "Additional price in ₹"}
                                  value={option.price === 0 ? "" : option.price}
                                  onChange={(e) => {
                                    const updated = [...ramOptions];
                                    updated[index].price = Number(e.target.value) || 0;
                                    setRamOptions(updated);
                                  }}
                                  disabled={index === 0}
                                  className={index === 0 ? "bg-gray-100" : ""}
                                />
                              </div>
                              <div className="w-24">
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  value={option.quantity || ""}
                                  onChange={(e) => {
                                    const updated = [...ramOptions];
                                    updated[index].quantity = Number(e.target.value) || 0;
                                    setRamOptions(updated);
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setRamOptions(ramOptions.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Storage Options */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>Storage Options (Optional)</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setStorageOptions([...storageOptions, { size: "", price: 0, quantity: 0 }])}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Storage
                            </Button>
                          </div>
                          {storageOptions.length > 0 && storageOptions.map((option, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Input
                                  placeholder="e.g. 512GB SSD"
                                  value={option.size}
                                  onChange={(e) => {
                                    const updated = [...storageOptions];
                                    updated[index].size = e.target.value;
                                    setStorageOptions(updated);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="number"
                                  placeholder={index === 0 ? "(default)" : "Additional price in ₹"}
                                  value={option.price === 0 ? "" : option.price}
                                  onChange={(e) => {
                                    const updated = [...storageOptions];
                                    updated[index].price = Number(e.target.value) || 0;
                                    setStorageOptions(updated);
                                  }}
                                  disabled={index === 0}
                                  className={index === 0 ? "bg-gray-100" : ""}
                                />
                              </div>
                              <div className="w-24">
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  value={option.quantity || ""}
                                  onChange={(e) => {
                                    const updated = [...storageOptions];
                                    updated[index].quantity = Number(e.target.value) || 0;
                                    setStorageOptions(updated);
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setStorageOptions(storageOptions.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Warranty Options */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>Extended Warranty Options (Optional)</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setWarrantyOptions([...warrantyOptions, { duration: "", price: 0 }])}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Warranty
                            </Button>
                          </div>
                          {warrantyOptions.map((option, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <Input
                                  placeholder="e.g. 3 months, 6 months, 12 months"
                                  value={option.duration}
                                  onChange={(e) => {
                                    const updated = [...warrantyOptions];
                                    updated[index].duration = e.target.value;
                                    setWarrantyOptions(updated);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="number"
                                  placeholder="Price in ₹"
                                  value={option.price === 0 ? "" : option.price}
                                  onChange={(e) => {
                                    const updated = [...warrantyOptions];
                                    updated[index].price = Number(e.target.value) || 0;
                                    setWarrantyOptions(updated);
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setWarrantyOptions(warrantyOptions.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Box Contents */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>What&apos;s in the Box</FormLabel>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => setBoxContents([...boxContents, ""])}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add box
                            </Button>
                          </div>
                          {boxContents.map((line, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <Input
                                placeholder={`Item ${index + 1}`}
                                value={line}
                                onChange={(e) => {
                                  const updated = [...boxContents];
                                  updated[index] = e.target.value;
                                  setBoxContents(updated);
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => setBoxContents(boxContents.filter((_, i) => i !== index))}
                                disabled={boxContents.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="flex-1 space-y-6 mt-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 border-b-2 pb-3">
                      Product Images
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Front Image {editId ? "(optional)" : "*"}</label>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const validation = validateImageFile(file);
                              if (!validation.valid) {
                                toast.error(validation.error);
                                e.target.value = '';
                                return;
                              }
                              const totalImages = 1 + additionalImages.length;
                              if (totalImages > 5) {
                                toast.error(`Maximum 5 images allowed. You have ${additionalImages.length} additional images.`);
                                e.target.value = '';
                                return;
                              }
                            }
                            setFrontImage(file);
                          }}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5MB • JPEG, PNG, GIF, WebP</p>
                        {frontImage ? (
                          <div className="mt-2">
                            <img src={URL.createObjectURL(frontImage)} alt="New Preview" className="w-20 h-20 object-cover rounded" />
                          </div>
                        ) : (
                          currentFrontImage && (
                            <div className="mt-2">
                              <img src={currentFrontImage} alt="Current Image" className="w-20 h-20 object-cover rounded border-2 border-blue-200" />
                              <p className="text-xs text-gray-500 mt-1">Current image</p>
                            </div>
                          )
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Images</label>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);

                            // Validate each file
                            for (const file of files) {
                              const validation = validateImageFile(file);
                              if (!validation.valid) {
                                toast.error(`${file.name}: ${validation.error}`);
                                e.target.value = '';
                                return;
                              }
                            }

                            const totalImages = (frontImage ? 1 : 0) + files.length;
                            if (totalImages > 5) {
                              toast.error(`Maximum 5 images allowed (including front image). You selected ${totalImages} images.`);
                              e.target.value = '';
                              return;
                            }
                            setAdditionalImages(files);
                          }}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 4 additional images • 5MB each • JPEG, PNG, GIF, WebP</p>
                        {additionalImages.length > 0 ? (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {additionalImages.map((img, index) => (
                              <img key={index} src={URL.createObjectURL(img)} alt={`New Preview ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                            ))}
                          </div>
                        ) : (
                          currentImages.length > 0 && (
                            <div className="mt-2">
                              <div className="flex gap-2 flex-wrap">
                                {currentImages.map((img, index) => (
                                  <img key={index} src={img} alt={`Current ${index + 1}`} className="w-16 h-16 object-cover rounded border-2 border-blue-200" />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Current additional images</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end pt-6 border-t-2 mt-8">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <LoadingButton 
                      type="submit" 
                      loading={uploading}
                      disabled={uploading}
                    >
                      {editId ? "Update Item" : "Create Item"}
                    </LoadingButton>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex text-sm overflow-x-auto gap-3 sm:gap-8 px-4 sm:px-6 lg:px-8 pt-4 border-t border-gray-200">
        <button
          onClick={() => setActiveFilter("all")}
          className={`pb-0 font-medium border-b-2 transition whitespace-nowrap ${
            activeFilter === "all" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          }`}
        >
          All Products
        </button>
        {categories.sort().map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`pb-0 font-medium border-b-2 transition whitespace-nowrap ${
              activeFilter === category ? "border-blue-600 text-blue-700" : "border-transparent text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            }`}
          >
            {category}
          </button>
        ))}
        <button
          onClick={() => setActiveFilter("out-of-stock")}
          className={`pb-0 font-medium border-b-2 transition whitespace-nowrap ${
            activeFilter === "out-of-stock" ? "border-red-500 text-red-600" : "border-transparent text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          }`}
        >
          Out of Stock ({outOfStockCount})
        </button>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>Inventory overview. Low-stock items (≤5) are highlighted.</TableCaption>
        <TableHeader className="bg-gray-50">
          <TableRow className="border-t hover:bg-transparent">
            <TableHead className="px-2 md:px-3 lg:px-6 py-4 text-left text-sm font-semibold text-gray-600">Item</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="hidden md:table-cell">Quantity</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
            <TableHead className="px-2 md:px-3 lg:px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-gray-200 rounded-md animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 md:w-24 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-12 md:w-16 animate-pulse"></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 md:gap-2">
                    <div className="h-8 bg-gray-200 rounded w-10 md:w-12 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-12 md:w-16 animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          {!isLoading && filtered.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="text-center py-8">No items found.</TableCell>
            </TableRow>
          )}
          {filtered.map((item) => {
            const lowStock = item.quantity <= 5;
            return (
              <TableRow key={item.id} className={`${lowStock ? "bg-muted/40" : ""}`}>
                <TableCell>
                  <div className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-gray-50 p-1 md:p-2 rounded hover:underline" onClick={() => window.open(`/products/${item.slug}`, "_blank")}>
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-10 w-10 md:h-12 md:w-12 rounded-md border object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm md:text-base truncate">{item.name.slice(0, 14)}...</div>
                      <div className="text-xs text-muted-foreground md:hidden">{item.category}</div>
                      <div className="text-xs text-muted-foreground hidden md:block">ID: {item.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.description.slice(0, 20)}...</TableCell>
                <TableCell className="text-left">
                  <div className="font-medium">₹{item.price.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground md:hidden">Qty: {item.quantity}</div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">{item.quantity}</TableCell>
                <TableCell className="hidden lg:table-cell">{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell className="align-middle">
                  <div className="flex gap-1 md:gap-2">
                    {/* Edit with AlertDialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="cursor-pointer text-xs md:text-sm px-2 md:px-3">Edit</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Edit Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to edit <span className="font-semibold">{item.name}</span>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="border border-blue-500 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold cursor-pointer"
                            onClick={() => handleEditClick(item)}
                          >
                            Edit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <LoadingButton size="sm" variant="destructive" loading={deleting === item.id} disabled={deleting !== null} className="text-xs md:text-sm px-2 md:px-3">Delete</LoadingButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete <span className="font-semibold">{item.name}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="border border-red-500 bg-red-100 hover:bg-red-200 text-red-700 font-semibold cursor-pointer"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
