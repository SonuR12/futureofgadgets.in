"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "@/components/ui/optimized-image";

export default function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const discounted = product.mrp && product.mrp > product.price;
  const discountPct =
    discounted && product.mrp
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Card>
      <article>
        <CardHeader className="gap-2">
          <Link href={`/products/${product.slug}`} className="block">
            <CardTitle className="text-pretty text-foreground hover:underline">
              {product.name}
            </CardTitle>
          </Link>
          <div className="text-sm text-muted-foreground">{product.brand}</div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href={`/products/${product.slug}`} className="block">
            <OptimizedImage
              src={product.frontImage || product.image || "/placeholder.svg"}
              alt={`${product.name} image`}
              className="h-48 w-full rounded-md border bg-card object-cover"
            />
          </Link>
          <div>
            {discounted && (
              <>
                <div className="flex flex-col items-baseline justify-between gap-2">
                  <div className="space-x-2">
                    <span className="font-semibold text-foreground">
                      ₹{product.price.toFixed(2)}{" "}
                    </span>
                    <span className="text-muted-foreground line-through">
                      ₹{product.mrp?.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <span
                      className="text-green-600 text-sm"
                      aria-label={`${discountPct}% off`}
                    >
                      {discountPct}% off
                    </span>
                    <span
                      className={
                        product.quantity <= 5
                          ? "text-amber-700 text-sm"
                          : "text-muted-foreground text-sm"
                      }
                    >
                      {product.quantity <= 5 ? "Low stock" : "In stock"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button
            className="cursor-pointer hover:bg-blue-500"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => {
              addToCart({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.frontImage || product.image,
              });
            }}
            disabled={product.quantity <= 0}
          >
            Add to Cart
          </Button>
        </CardContent>
      </article>
    </Card>
  );
}
