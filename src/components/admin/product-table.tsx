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
import { Plus } from "lucide-react";
import { convertFileToBase64, validateImageFile } from "@/lib/image-utils";
import LoadingButton from "@/components/ui/loading-button";
import { cachedFetch, invalidateCache } from "@/lib/api-cache";

type Item = {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: string;
  description: string;
  image: string;
  images: string[];
  price: number;
  quantity: number;
  brand?: string;
  sku?: string;
  updatedAt: string;
};

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price is required"),
  quantity: z.number().min(0, "Quantity is required"),
  brand: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function ProductTable() {
  const [data, setData] = useState<Item[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentFrontImage, setCurrentFrontImage] = useState<string>("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  // Product type dropdown state
  const [productTypes, setProductTypes] = useState<string[]>([
    "Laptops",
    "Desktops",
    "Monitors",
    "Keyboards",
    "Mouse",
    "Headphones",
    "Speakers",
    "Webcams",
    "Storage",
    "RAM",
    "Graphics Cards",
    "Processors",
    "Motherboards",
    "Power Supply",
    "Cooling",
    "Cases",
    "Cables",
    "Printers",
    "Tablets",
    "Smartphones",
  ]);
  const [addingNewType, setAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");

  const defaultValues: ItemFormValues = {
    name: "",
    category: "",
    description: "",
    price: 0,
    quantity: 0,
    brand: "",
  };

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  useEffect(() => {
    cachedFetch("/api/products", { cache: "no-store" }, 10000)
      .then((products) => {
        const items: Item[] = (products || []).map((p: any) => {
          console.log(
            "Initial loading product:",
            p.name,
            "frontImage:",
            p.frontImage,
            "image:",
            p.image
          );
          return {
            id: p.id ?? Date.now().toString(),
            slug: p.slug ?? "",
            name: p.name ?? p.title ?? "Untitled",
            title: p.title ?? p.name ?? "Untitled",
            category: p.category ?? p.type ?? "General",
            description: p.description ?? "",
            image:
              p.frontImage ?? p.image ?? p.coverImage ?? "/placeholder.svg",
            images: Array.isArray(p.images)
              ? p.images
              : p.images?.split?.(",").map((s: string) => s.trim()) ?? [],
            price: Number(p.price ?? 0),
            quantity: Number(p.quantity ?? p.stock ?? 0),
            brand: p.brand ?? "",
            sku: p.sku ?? `SKU-${Date.now()}`,
            updatedAt: p.updatedAt ?? new Date().toISOString(),
          };
        });
        setData(items);
        setIsLoading(false);

        // Extract unique product types from data
        const uniqueTypes = [
          ...new Set(items.map((item) => item.category).filter(Boolean)),
        ];
        setProductTypes((prev) => [...new Set([...prev, ...uniqueTypes])]);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }, [data, query]);

  useEffect(() => {
    if (open && !editId) {
      form.reset(defaultValues);
    }
    if (!open) {
      setEditId(null);
      setAddingNewType(false);
      setNewType("");
      setCurrentFrontImage("");
      setCurrentImages([]);
    }
  }, [open, editId]);

  const handleEditClick = (item: Item) => {
    setEditId(item.id);
    form.reset({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      brand: item.brand || "",
    });
    setFrontImage(null);
    setAdditionalImages([]);
    setCurrentFrontImage(item.image || "");
    setCurrentImages(item.images || []);
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
      invalidateCache('products');
    } catch (err: any) {
      setData(originalData);
      console.error(err);
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddNewType = () => {
    if (newType.trim() && !productTypes.includes(newType.trim())) {
      setProductTypes((prev) => [...prev, newType.trim()]);
      form.setValue("category", newType.trim());
      toast.success(`Added new type: ${newType.trim()}`);
    }
    setAddingNewType(false);
    setNewType("");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };



  const onSubmit = async (values: ItemFormValues) => {
    if (!frontImage && !editId && !currentFrontImage) {
      toast.error("Front image is required");
      return;
    }

    setUploading(true);
    try {
      let frontImageUrl = currentFrontImage;
      let additionalImageUrls = currentImages;

      // Only upload new images if files are selected
      if (frontImage || additionalImages.length > 0) {
        const imagesToUpload = [];
        
        if (frontImage) {
          const frontImageBase64 = await convertFileToBase64(frontImage, 600, 0.6);
          imagesToUpload.push(frontImageBase64);
        }
        
        if (additionalImages.length > 0) {
          const additionalImagesBase64 = await Promise.all(
            additionalImages.map(img => convertFileToBase64(img, 400, 0.5))
          );
          imagesToUpload.push(...additionalImagesBase64);
        }

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ images: imagesToUpload }),
        });

        const uploadResult = await uploadRes.json();
        if (!uploadResult.success) throw new Error(uploadResult.error);

        if (frontImage) frontImageUrl = uploadResult.files[0];
        if (additionalImages.length > 0)
          additionalImageUrls = uploadResult.files.slice(frontImage ? 1 : 0);
      }

      const productData = {
        name: values.name,
        title: values.name,
        slug: generateSlug(values.name),
        category: values.category,
        description: values.description,
        frontImage: frontImageUrl,
        images: additionalImageUrls,
        price: values.price,
        quantity: values.quantity,
        brand: values.brand,
        status: "active" as const,
        sku: editId
          ? data.find((item) => item.id === editId)?.sku || `SKU-${Date.now()}`
          : `SKU-${Date.now()}`,
      };

      const url = editId ? `/api/products/${editId}` : "/api/products";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData?.error || `Failed to ${editId ? "update" : "add"} item`
        );
      }

      // Optimistic update - update UI immediately
      const newItem = {
        id: editId || Date.now().toString(),
        slug: generateSlug(values.name),
        name: values.name,
        title: values.name,
        category: values.category,
        description: values.description,
        image: frontImageUrl,
        images: additionalImageUrls,
        price: values.price,
        quantity: values.quantity,
        brand: values.brand || "",
        sku: editId ? data.find((item) => item.id === editId)?.sku || `SKU-${Date.now()}` : `SKU-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };

      if (editId) {
        setData(prev => prev.map(item => item.id === editId ? newItem : item));
      } else {
        setData(prev => [newItem, ...prev]);
      }

      // Invalidate cache to ensure fresh data on next load
      invalidateCache('products');
      
      toast.success(`Item ${editId ? "updated" : "added"} successfully!`);
      form.reset(defaultValues);
      setFrontImage(null);
      setAdditionalImages([]);
      setCurrentFrontImage("");
      setCurrentImages([]);
      setEditId(null);
      setOpen(false);
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (error)
    return <p className="text-sm text-destructive">Failed to load items.</p>;

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Add button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, type, or description"
          />
          <Button variant="secondary" onClick={() => setQuery("")}>
            Clear
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              Add Item <Plus />
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:min-w-[60vw] h-[90vh] max-w-none overflow-y-auto p-8">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-semibold">{editId ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 border-b-2 pb-3">Product Details</h3>
                    <div className="space-y-6">
                      {/* Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Item Name" {...field} />
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
                              <Input
                                placeholder="e.g. ASUS, Dell, Samsung"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category with dropdown */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            {!addingNewType ? (
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={(val) => {
                                    if (val === "add_new") {
                                      setAddingNewType(true);
                                    } else {
                                      field.onChange(val);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {productTypes.map((type) => (
                                      <SelectItem key={type} value={type} className="relative flex items-center justify-between pr-8">
                                        <span>{type}</span>
                                        {field.value === type ? (
                                          <span className="absolute right-2 text-green-500 text-sm w-4 h-4 flex items-center justify-center">
                                            ✓
                                          </span>
                                        ) : (
                                          <div
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setProductTypes(prev => prev.filter(t => t !== type));
                                              toast.success(`Removed category: ${type}`);
                                            }}
                                            className="absolute right-2 text-red-500 hover:text-red-700 text-sm w-4 h-4 flex items-center justify-center cursor-pointer z-10"
                                          >
                                            ✕
                                          </div>
                                        )}
                                      </SelectItem>
                                    ))}
                                    <SelectItem value="add_new">
                                      ➕ Add new category
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter new category"
                                  value={newType}
                                  onChange={(e) => setNewType(e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={handleAddNewType}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setAddingNewType(false);
                                    setNewType("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Price + Quantity */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (INR)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 1299"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
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
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 10"
                                  value={field.value === 0 ? "" : field.value}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value) || 0)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                       {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Item description..."
                                {...field}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 border-b-2 pb-3">Product Images</h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Front Image *
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const validation = validateImageFile(file);
                              if (!validation.valid) {
                                toast.error(validation.error);
                                return;
                              }
                              const totalImages = 1 + additionalImages.length;
                              if (totalImages > 5) {
                                toast.error(
                                  `Maximum 5 images allowed. You have ${additionalImages.length} additional images.`
                                );
                                return;
                              }
                            }
                            setFrontImage(file);
                          }}
                          className="cursor-pointer"
                        />
                        {frontImage ? (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(frontImage)}
                              alt="New Preview"
                              className="w-20 h-20 object-cover rounded"
                            />
                          </div>
                        ) : (
                          currentFrontImage && (
                            <div className="mt-2">
                              <img
                                src={currentFrontImage}
                                alt="Current Image"
                                className="w-20 h-20 object-cover rounded border-2 border-blue-200"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Current image
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Additional Images
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            
                            // Validate each file
                            for (const file of files) {
                              const validation = validateImageFile(file);
                              if (!validation.valid) {
                                toast.error(`${file.name}: ${validation.error}`);
                                return;
                              }
                            }
                            
                            const totalImages = (frontImage ? 1 : 0) + files.length;
                            if (totalImages > 5) {
                              toast.error(
                                `Maximum 5 images allowed (including front image). You selected ${totalImages} images.`
                              );
                              return;
                            }
                            setAdditionalImages(files);
                          }}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Max 4 additional images (5 total including front
                          image)
                        </p>
                        {additionalImages.length > 0 ? (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {additionalImages.map((img, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(img)}
                                alt={`New Preview ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                          </div>
                        ) : (
                          currentImages.length > 0 && (
                            <div className="mt-2">
                              <div className="flex gap-2 flex-wrap">
                                {currentImages.map((img, index) => (
                                  <img
                                    key={index}
                                    src={img}
                                    alt={`Current ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border-2 border-blue-200"
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Current additional images
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  {/* First Row - Form Fields */}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 border-t-2 mt-8">
                  <Button className="cursor-pointer"
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <LoadingButton type="submit" loading={uploading}>
                    {editId ? "Update Item" : "Save"}
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>
          Inventory overview. Low-stock items (≤5) are highlighted.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7}>Loading items...</TableCell>
            </TableRow>
          )}
          {!isLoading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>No items found.</TableCell>
            </TableRow>
          )}
          {filtered.map((item) => {
            const lowStock = item.quantity <= 5;
            return (
              <TableRow
                key={item.id}
                className={`${lowStock ? "bg-muted/40" : ""}`}
              >
                <TableCell>
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded hover:underline"
                    onClick={() =>
                      window.open(`/products/${item.slug}`, "_blank")
                    }
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-12 w-12 rounded-md border object-cover"
                      onError={(e) => {
                        console.log("Image failed to load:", item.image);
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {item.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.description.slice(0, 30)}...</TableCell>
                <TableCell className="text-left">
                  ₹{item.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="align-middle space-x-2">
                  {/* Edit with AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="cursor-pointer">
                        Edit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Edit Item</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to edit{" "}
                          <span className="font-semibold">{item.name}</span>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                          onClick={() => handleEditClick(item)}
                        >
                          Yes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Delete with AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <LoadingButton 
                        size="sm" 
                        variant="destructive" 
                        loading={deleting === item.id}
                        disabled={deleting !== null}
                      >
                        Delete
                      </LoadingButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete{" "}
                          <span className="font-semibold">{item.name}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
