// src/pages/dashboard/index.tsx
import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryFilterCard } from "@/components/shared/category/CategoryFilterCard";
import { CreateOrderSheet } from "@/components/shared/CreateOrderSheet";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { api } from "@/utils/api";
import { Search, ShoppingCart } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import type { NextPageWithLayout } from "../_app";
import { toast } from "sonner";

const DashboardPage: NextPageWithLayout = () => {
  const cartStore = useCartStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  const { data: products } = api.product.getProducts.useQuery({
    categoryId: selectedCategory,
  });

  const { data: categories } = api.category.getCategories.useQuery();

  const totalProducts = categories?.reduce((a, b) => {
    return a + b._count.products;
  }, 0);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAddToCart = (productId: string) => {
    const productToAdd = products?.find((product) => product.id === productId);

    if (!productToAdd) {
      toast("Product not found");
      return;
    }

    cartStore.addToCart({
      name: productToAdd.name,
      productId: productToAdd.id,
      imageUrl: productToAdd.imageUrl ?? "",
      price: productToAdd.price,
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Dashboard {cartStore.items.length}</DashboardTitle>
            <DashboardDescription>
              Welcome to your Simple POS system dashboard.
            </DashboardDescription>
          </div>

          {!!cartStore.items.length && (
            <Button
              className="animate-in slide-in-from-right"
              onClick={() => setOrderSheetOpen(true)}
            >
              <ShoppingCart /> Cart
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="relative">
          {/* Gunakan debouncing/throttling */}
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          <CategoryFilterCard
            key="all"
            name="All"
            isSelected={selectedCategory === "all"}
            onClick={() => handleCategoryClick("all")}
            productCount={totalProducts ?? 0}
          />

          {categories?.map((category) => {
            return (
              <CategoryFilterCard
                key={category.id}
                name={category.name}
                isSelected={category.id === selectedCategory}
                onClick={() => handleCategoryClick(category.id)}
                productCount={category._count.products}
              />
            );
          })}
        </div>

        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products?.map((product) => (
              <ProductMenuCard
                key={product.id}
                productId={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl ?? "https://placehold.co/600x400"}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      <CreateOrderSheet
        open={orderSheetOpen}
        onOpenChange={setOrderSheetOpen}
      />
    </>
  );
};

DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = getAuth(context.req);

  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default DashboardPage;
