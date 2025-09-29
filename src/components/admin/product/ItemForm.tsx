"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertFileToBase64, validateImageFile } from "@/lib/image-utils";

interface Item {
  id: string;
  name: string;
  type: string;
  description: string;
  frontImage: string;
  images: string[];
  price: string;
  brand?: string;
}

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function ItemFormWithList() {
  const [items, setItems] = useState<Item[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      price: "",
    },
  });

  // Load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("items") || "[]");
    setItems(stored);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);



  const onSubmit = async (data: ItemFormValues) => {
    if (!frontImage) {
      toast.error("Front image is required");
      return;
    }

    setUploading(true);
    try {
      // Convert images to compressed base64
      const frontImageBase64 = await convertFileToBase64(frontImage, 600, 0.6);
      const additionalImagesBase64 = await Promise.all(
        additionalImages.map(img => convertFileToBase64(img, 400, 0.5))
      );

      const allImages = [frontImageBase64, ...additionalImagesBase64];

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: allImages }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      const item: Item = {
        id: editId || Date.now().toString(),
        name: data.name,
        type: data.type,
        description: data.description,
        frontImage: result.files[0],
        images: result.files.slice(1),
        price: data.price,
      };

      if (editId) {
        setItems(items.map((it) => (it.id === editId ? item : it)));
        toast.success("Item updated successfully!");
      } else {
        setItems([...items, item]);
        toast.success("Item added successfully!");
      }

      setEditId(null);
      setFrontImage(null);
      setAdditionalImages([]);
      form.reset();
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: Item) => {
    form.reset({
      name: item.name,
      type: item.type,
      description: item.description,
      price: item.price,
    });
    setEditId(item.id);
    setFrontImage(null);
    setAdditionalImages([]);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item deleted successfully!", {
      style: { background: "#fff", color: "#ef4444" },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* --- Item List Section --- */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Added Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <img
                    src={item.frontImage}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <h3 className="font-semibold">₹{item.price}</h3>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Edit this item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to edit this item? You can update its details on the next screen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleEdit(item)}
                          className="bg-blue-600"
                        >
                          Edit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete this item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* --- Form Section --- */}
      <div className="sticky top-10 max-h-[90vh] overflow-y-auto p-4 bg-white">
        <h2 className="text-xl font-semibold mb-4">
          {editId ? "Edit Item" : "Add Item"}
        </h2>

        {/* Success Message */}
        {/* {successMessage && (
          <div
            className={`text-sm font-medium px-4 py-2 rounded-md mb-4 border ${
              successMessage.includes("added")
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-blue-100 text-blue-700 border-blue-300"
            }`}
          >
            {successMessage}
          </div>
        )} */}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Shirt, Pant, Shoes, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Front Image *</label>
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
                    }
                    setFrontImage(file);
                  }}
                  className="cursor-pointer"
                />
                {frontImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(frontImage)}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Additional Images</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      const validation = validateImageFile(file);
                      if (!validation.valid) {
                        toast.error(`${file.name}: ${validation.error}`);
                        return;
                      }
                    }
                    setAdditionalImages(files);
                  }}
                  className="cursor-pointer"
                />
                {additionalImages.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {additionalImages.map((img, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 1299" {...field} className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="cursor-pointer">
                {uploading ? "Uploading..." : editId ? "Update Item" : "Add Item"}
              </Button>
              {editId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setEditId(null);
                    setFrontImage(null);
                    setAdditionalImages([]);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
