"use client";

import { useState, useEffect, useMemo } from "react";
import { CategoryTabs } from "@/app/components/CategoryTabs";
import { ProductTable } from "@/app/components/ProductTable";
// import { StatsCards } from "@/app/components/StatsCards";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface Product {
  _id: string;
  id: string;
  platform: string;
  category: string;
  title: string;
  description: string;
  price: number;
  accountCount: number;
  availableCount: number;
  status: "available" | "soldout";
  image?: string;
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCategories(),
        ]);

        let productsData: Product[] = [];
        let categoriesData: any[] = [];

        if (productsRes.success && Array.isArray(productsRes.data)) {
          productsData = productsRes.data;
        }

        if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
          categoriesData = categoriesRes.data;
        }

        // Create category map for quick lookup
        const categoryMap = new Map<string, string>();
        categoriesData.forEach((cat) => {
          categoryMap.set(cat._id, cat.name);
        });

        // Map products with category names
        const mappedProducts = productsData.map((product) => ({
          ...product,
          category: categoryMap.get(product.category) || product.category,
        }));

        setProducts(mappedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBuy = (productId: string, quantity: number) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      const total = product.price * quantity;
      toast.success(`Đã thêm "${product.title}" vào giỏ hàng!`, {
        description: `Số lượng: ${quantity} | Tổng: ${total.toLocaleString("vi-VN")} đ`,
      });
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return products;
    }
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory, products]);

  // Group products by category for display
  const productGroups = useMemo(() => {
    const groups = new Map<string, { title: string; products: typeof products }>();

    if (activeCategory === "all") {
      // Show all categories - group by category name
      products.forEach((product) => {
        const categoryKey = product.category;
        if (!groups.has(categoryKey)) {
          groups.set(categoryKey, {
            title: categoryKey,
            products: [],
          });
        }
        groups.get(categoryKey)!.products.push(product);
      });
    } else {
      // Show single category - find by category name
      const filtered = products.filter((p) => p.category === activeCategory);
      groups.set(activeCategory, {
        title: activeCategory,
        products: filtered,
      });
    }

    return Array.from(groups.values());
  }, [activeCategory, products]);

  return (
    <>
      {/* Category Tabs */}
      {!loading && (
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          categories={categories}
        />
      )}

      {/* Main Content Area */}
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Đang tải sản phẩm...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {/* <StatsCards /> */}

            {/* Product Tables */}
            <div className="space-y-6">
              {productGroups.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Không có sản phẩm nào
                  </p>
                </div>
              ) : (
                productGroups.map((group, index) => (
                  <ProductTable
                    key={index}
                    title={group.title}
                    products={group.products.map((p) => ({
                      _id: p._id,
                      platform: p.platform as any,
                      category: p.category,
                      title: p.title,
                      description: p.description,
                      quantity: p.availableCount,
                      price: p.price,
                      status: p.status,
                    }))}
                    onBuy={handleBuy}
                  />
                ))
              )}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  Không có sản phẩm nào trong danh mục này
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
