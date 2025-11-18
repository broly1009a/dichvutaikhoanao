// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { CategoryTabs } from "@/app/components/CategoryTabs";
// import { ProductTable } from "@/app/components/ProductTable";
// import { StatsCards } from "@/app/components/StatsCards";
// import { toast } from "sonner";

// interface Product {
//   _id: string;
//   id: string;
//   platform: string;
//   category: string;
//   title: string;
//   description: string;
//   price: number;
//   accountCount: number;
//   availableCount: number;
//   status: "available" | "soldout";
//   image?: string;
// }

// export default function HomePage() {
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch products and categories on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [productsRes, categoriesRes] = await Promise.all([
//           fetch("/api/products"),
//           fetch("/api/categories"),
//         ]);

//         if (productsRes.ok) {
//           const data = await productsRes.json();
//           setProducts(data.data || []);
//         }

//         if (categoriesRes.ok) {
//           const data = await categoriesRes.json();
//           setCategories(data.data || []);
//         }
//       } catch (error) {
//         console.error("Failed to fetch data:", error);
//         toast.error("Lỗi khi tải dữ liệu");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleBuy = (productId: string) => {
//     const product = products.find((p) => p.id === productId);
//     if (product) {
//       toast.success(`Đã thêm "${product.title}" vào giỏ hàng!`, {
//         description: `Giá: ${product.price.toLocaleString("vi-VN")} đ`,
//       });
//     }
//   };

//   // Filter products by category
//   const filteredProducts = useMemo(() => {
//     if (activeCategory === "all") {
//       return products;
//     }
//     return products.filter((p) => p.category === activeCategory);
//   }, [activeCategory, products]);

//   // Group products by category for display
//   const productGroups = useMemo(() => {
//     const groups = new Map<string, { title: string; products: typeof products }>();

//     if (activeCategory === "all") {
//       // Show all categories
//       const categoryTitles: Record<string, string> = {
//         tiktok: "Tài khoản TikTok",
//         "shopee-silver": "Nick Shopee Hạng Bạc",
//         "shopee-gold": "Nick Shopee Hạng Vàng",
//         "shopee-coin": "Nick Shopee Có Xu",
//         "shopee-orders": "Nick Shopee Có Đơn Giao Thành Công",
//         "shopee-phone": "Nick Shopee Reg Phone",
//         "shopee-buff": "Nick Shopee Buff Web",
//         lazada: "Tài khoản Lazada",
//         gmail: "Tài khoản Gmail",
//         hotmail: "Tài khoản Hotmail",
//       };

//       products.forEach((product) => {
//         const categoryKey = product.category;
//         if (!groups.has(categoryKey)) {
//           groups.set(categoryKey, {
//             title: categoryTitles[categoryKey] || categoryKey,
//             products: [],
//           });
//         }
//         groups.get(categoryKey)!.products.push(product);
//       });
//     } else {
//       // Show single category
//       const categoryTitles: Record<string, string> = {
//         tiktok: "Tài khoản TikTok",
//         "shopee-silver": "Nick Shopee Hạng Bạc",
//         "shopee-gold": "Nick Shopee Hạng Vàng",
//         "shopee-coin": "Nick Shopee Có Xu",
//         "shopee-orders": "Nick Shopee Có Đơn Giao Thành Công",
//         "shopee-phone": "Nick Shopee Reg Phone",
//         "shopee-buff": "Nick Shopee Buff Web",
//         lazada: "Tài khoản Lazada",
//         gmail: "Tài khoản Gmail",
//         hotmail: "Tài khoản Hotmail",
//       };

//       groups.set(activeCategory, {
//         title: categoryTitles[activeCategory] || activeCategory,
//         products: filteredProducts,
//       });
//     }

//     return Array.from(groups.values());
//   }, [activeCategory, filteredProducts, products]);

//   return (
//     <>
//       {/* Category Tabs */}
//       {!loading && (
//         <CategoryTabs
//           activeCategory={activeCategory}
//           onCategoryChange={setActiveCategory}
//         />
//       )}

//       {/* Main Content Area */}
//       <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
//         {loading ? (
//           <div className="flex items-center justify-center h-96">
//             <div className="text-center">
//               <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Đang tải sản phẩm...
//               </p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Stats Cards */}
//             <StatsCards />

//             {/* Product Tables */}
//             <div className="space-y-6">
//               {productGroups.length === 0 ? (
//                 <div className="text-center py-12">
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Không có sản phẩm nào
//                   </p>
//                 </div>
//               ) : (
//                 productGroups.map((group, index) => (
//                   <ProductTable
//                     key={index}
//                     title={group.title}
//                     products={group.products.map((p) => ({
//                       id: p.id,
//                       platform: p.platform as any,
//                       category: p.category,
//                       title: p.title,
//                       description: p.description,
//                       quantity: p.availableCount,
//                       price: p.price,
//                       status: p.status,
//                     }))}
//                     onBuy={handleBuy}
//                   />
//                 ))
//               )}
//             </div>

//             {/* Empty State */}
//             {filteredProducts.length === 0 && !loading && (
//               <div className="text-center py-12">
//                 <p className="text-gray-500 dark:text-gray-400">
//                   Không có sản phẩm nào trong danh mục này
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </>
//   );
// }
