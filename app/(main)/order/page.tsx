"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  ShoppingCartIcon, 
  SparklesIcon,
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
  ListBulletIcon,
  RocketLaunchIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";
import { Button } from "../../components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { serviceOrderAPI } from "@/lib/service-order-client";
import ServiceOrderList from "./components/ServiceOrderList";

// Mock data for services
const serviceTypes = [
  { id: "tiktok-follow", name: "TikTok - Tăng Follow", platform: "tiktok" },
  { id: "tiktok-like", name: "TikTok - Tăng Like", platform: "tiktok" },
  { id: "tiktok-view", name: "TikTok - Tăng View", platform: "tiktok" },
  { id: "shopee-follow", name: "Shopee - Tăng Follow Shop", platform: "shopee" },
  { id: "shopee-like", name: "Shopee - Tăng Like Sản Phẩm", platform: "shopee" },
  { id: "shopee-view", name: "Shopee - Tăng View Shop", platform: "shopee" },
  { id: "shopee-order", name: "Shopee - Buff Đơn", platform: "shopee" },
  { id: "lazada-follow", name: "Lazada - Tăng Follower", platform: "lazada" },
  { id: "lazada-like", name: "Lazada - Tăng Like", platform: "lazada" },
  { id: "lazada-order", name: "Lazada - Buff Đơn", platform: "lazada" },
  { id: "facebook-like", name: "Facebook - Tăng Like Page", platform: "facebook" },
  { id: "facebook-follow", name: "Facebook - Tăng Follow", platform: "facebook" },
  { id: "instagram-follow", name: "Instagram - Tăng Follower", platform: "instagram" },
  { id: "instagram-like", name: "Instagram - Tăng Like", platform: "instagram" },
  { id: "youtube-view", name: "YouTube - Tăng View", platform: "youtube" },
  { id: "youtube-sub", name: "YouTube - Tăng Subscribe", platform: "youtube" },
];

const servers = [
  { id: "sv1", name: "Server 1 - Nhanh", priceMultiplier: 1.5, speed: "2-4 giờ" },
  { id: "sv2", name: "Server 2 - Chuẩn", priceMultiplier: 1.0, speed: "6-12 giờ" },
  { id: "sv3", name: "Server 3 - Tiết kiệm", priceMultiplier: 0.8, speed: "12-24 giờ" },
];

const regions = [
  { id: "vn", name: "Việt Nam" },
  { id: "global", name: "Global (Toàn Cầu)" },
  { id: "asia", name: "Châu Á" },
  { id: "us", name: "Hoa Kỳ" },
  { id: "eu", name: "Châu Âu" },
];

const qualityOptions = [
  { id: "standard", name: "Standard - Thường", priceMultiplier: 1.0 },
  { id: "high", name: "High Quality - Cao", priceMultiplier: 1.3 },
  { id: "premium", name: "Premium - Đặc Biệt", priceMultiplier: 1.6 },
];

// Vietnamese provinces
const provinces = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình",
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
  "Vĩnh Phúc", "Yên Bái"
];

export default function OrderPage() {
  const [viewMode, setViewMode] = useState<"create" | "list">("create");
  const [serviceType, setServiceType] = useState("");
  const [server, setServer] = useState("");
  const [region, setRegion] = useState("");
  const [quality, setQuality] = useState("");
  const [productLinks, setProductLinks] = useState([{ id: 1, url: "", quantity: "" }]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping information for buff order
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  // Check if current service requires shipping info
  const requiresShipping = serviceType.includes("order") || serviceType.includes("buff");

  // Calculate total price
  const calculateTotal = () => {
    if (!serviceType || !server || productLinks.length === 0) return 0;

    const selectedServer = servers.find(s => s.id === server);
    const selectedQuality = qualityOptions.find(q => q.id === quality);
    
    const basePrice = 50; // Base price per unit
    const serverMultiplier = selectedServer?.priceMultiplier || 1;
    const qualityMultiplier = selectedQuality?.priceMultiplier || 1;

    const total = productLinks.reduce((sum, link) => {
      const qty = parseInt(link.quantity) || 0;
      return sum + (qty * basePrice * serverMultiplier * qualityMultiplier);
    }, 0);

    return total;
  };

  const handleAddLink = () => {
    setProductLinks([...productLinks, { id: Date.now(), url: "", quantity: "" }]);
  };

  const handleRemoveLink = (id: number) => {
    if (productLinks.length > 1) {
      setProductLinks(productLinks.filter(link => link.id !== id));
    }
  };

  const handleLinkChange = (id: number, field: "url" | "quantity", value: string) => {
    setProductLinks(productLinks.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const handleSubmitOrder = async () => {
    // Validation
    if (!serviceType) {
      toast.error("Vui lòng chọn loại dịch vụ!");
      return;
    }
    if (!server) {
      toast.error("Vui lòng chọn máy chủ!");
      return;
    }
    if (productLinks.some(link => !link.url || !link.quantity)) {
      toast.error("Vui lòng điền đầy đủ link và số lượng!");
      return;
    }

    // Validate shipping info for buff orders
    if (requiresShipping) {
      if (!fullName || !phoneNumber || !address || !province) {
        toast.error("Vui lòng điền đầy đủ thông tin nhận hàng!");
        return;
      }
      if (phoneNumber.length < 10) {
        toast.error("Số điện thoại không hợp lệ!");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        serviceType,
        server,
        region: region || undefined,
        quality: quality || undefined,
        productLinks: productLinks.map(link => ({
          url: link.url,
          quantity: parseInt(link.quantity)
        })),
        shippingInfo: requiresShipping ? {
          fullName,
          phoneNumber,
          address,
          province,
          district,
          ward
        } : undefined,
        note: note || undefined
      };

      const response = await serviceOrderAPI.createServiceOrder(orderData);

      const selectedService = serviceTypes.find(s => s.id === serviceType);
      const selectedServer = servers.find(s => s.id === server);

      toast.success("Đặt đơn thành công!", {
        description: `${selectedService?.name} - ${selectedServer?.name}. Tổng tiền: ${response.data.order.totalPrice.toLocaleString("vi-VN")}đ`,
        duration: 5000,
      });

      // Reset form
      setServiceType("");
      setServer("");
      setRegion("");
      setQuality("");
      setProductLinks([{ id: 1, url: "", quantity: "" }]);
      setNote("");
      setFullName("");
      setPhoneNumber("");
      setAddress("");
      setProvince("");
      setDistrict("");
      setWard("");

    } catch (error: any) {
      console.error("Submit order error:", error);
      toast.error(error.message || "Đặt đơn thất bại!", {
        description: "Vui lòng kiểm tra lại thông tin hoặc số dư tài khoản",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = calculateTotal();
  const selectedServer = servers.find(s => s.id === server);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-md border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur opacity-50"></div>
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Đặt Đơn Dịch Vụ
              <SparklesIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tạo đơn hàng cho nhiều nền tảng khác nhau
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setViewMode("create")}
            className={`flex-1 sm:flex-initial ${
              viewMode === "create"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            <RocketLaunchIcon className="w-4 h-4 mr-2" />
            Tạo tiến trình
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            variant="outline"
            className={`flex-1 sm:flex-initial ${
              viewMode === "list"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                : ""
            }`}
          >
            <ListBulletIcon className="w-4 h-4 mr-2" />
            Danh sách order
          </Button>
        </div>
      </div>

      {/* Conditional Content */}
      {viewMode === "create" ? (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Main Form Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-gray-200 dark:border-slate-700">
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/10 to-pink-500/10 blur-3xl -z-0"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 lg:p-5">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  Thông Tin Đặt Đơn
                </h2>
              </div>

              {/* Form Content */}
              <div className="p-6 lg:p-8 space-y-6">
                {/* Service Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service-type" className="text-gray-700 dark:text-gray-300">
                    Chọn loại dịch vụ <span className="text-red-500">*</span>
                  </Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="service-type" className="w-full">
                      <SelectValue placeholder="-- Chọn dịch vụ --" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Server Selection */}
                <div className="space-y-2">
                  <Label htmlFor="server" className="text-gray-700 dark:text-gray-300">
                    Chọn máy chủ <span className="text-red-500">*</span>
                  </Label>
                  <Select value={server} onValueChange={setServer}>
                    <SelectTrigger id="server" className="w-full">
                      <SelectValue placeholder="-- Chọn máy chủ --" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map(srv => (
                        <SelectItem key={srv.id} value={srv.id}>
                          {srv.name} - Tốc độ: {srv.speed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Attributes Alert */}
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                      <p className="font-semibold">⚠️ Lưu ý khi đặt đơn (vui lòng đọc kỹ trước khi đặt hàng):</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li>Hệ thống sẽ tự động xử lý đơn hàng trong vòng 2-24 giờ tùy máy chủ</li>
                        <li>Vui lòng điền chính xác link sản phẩm/tài khoản cần tăng tương tác</li>
                        <li>Đơn hàng đã đặt không thể hủy hoặc hoàn tiền</li>
                        <li>Số lượng tối thiểu: 100. Đơn nhỏ hơn sẽ bị từ chối</li>
                        <li>Thời gian bảo hành: 30 ngày kể từ khi hoàn thành</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Product Links Section */}
                <div className="space-y-4">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Link sản phẩm / Tài khoản <span className="text-red-500">*</span>
                  </Label>
                  
                  {productLinks.map((link, index) => (
                    <div key={link.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                      <div className="md:col-span-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Link {index + 1}:
                      </div>
                      <div className="md:col-span-7">
                        <Label htmlFor={`url-${link.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                          Nhập link sản phẩm/tài khoản
                        </Label>
                        <Input
                          id={`url-${link.id}`}
                          type="url"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => handleLinkChange(link.id, "url", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor={`qty-${link.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                          Số lượng
                        </Label>
                        <Input
                          id={`qty-${link.id}`}
                          type="number"
                          placeholder="100"
                          min="100"
                          value={link.quantity}
                          onChange={(e) => handleLinkChange(link.id, "quantity", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-1">
                        {productLinks.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveLink(link.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddLink}
                    className="w-full border-dashed border-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Thêm link sản phẩm
                  </Button>
                </div>

                {/* Shipping Information - Only show for buff order services */}
                {requiresShipping && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPinIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                        Địa Chỉ Nhận Hàng
                      </h3>
                      <span className="text-red-500 text-sm">(Bắt buộc cho dịch vụ buff đơn)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          Họ và Tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullname"
                          type="text"
                          placeholder="Ví dụ: Nguyễn Văn A"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Ví dụ: 098xxxxxxx"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>

                      {/* Province */}
                      <div className="space-y-2">
                        <Label htmlFor="province" className="text-gray-700 dark:text-gray-300">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </Label>
                        <Select value={province} onValueChange={setProvince}>
                          <SelectTrigger id="province" className="bg-white dark:bg-slate-800">
                            <SelectValue placeholder="-- Chọn Tỉnh/Thành phố --" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map(prov => (
                              <SelectItem key={prov} value={prov}>
                                {prov}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* District */}
                      <div className="space-y-2">
                        <Label htmlFor="district" className="text-gray-700 dark:text-gray-300">
                          Quận/Huyện
                        </Label>
                        <Input
                          id="district"
                          type="text"
                          placeholder="Nhập Quận/Huyện"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>

                      {/* Ward */}
                      <div className="space-y-2">
                        <Label htmlFor="ward" className="text-gray-700 dark:text-gray-300">
                          Phường/Xã
                        </Label>
                        <Input
                          id="ward"
                          type="text"
                          placeholder="Nhập Phường/Xã"
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>

                      {/* Full Address */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
                          Địa chỉ chi tiết <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Số nhà, tên đường..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Region */}
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-gray-700 dark:text-gray-300">
                      Khu vực / Nguồn
                    </Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="-- Chọn khu vực --" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(reg => (
                          <SelectItem key={reg.id} value={reg.id}>
                            {reg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quality */}
                  <div className="space-y-2">
                    <Label htmlFor="quality" className="text-gray-700 dark:text-gray-300">
                      Chất lượng
                    </Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger id="quality">
                        <SelectValue placeholder="-- Chọn chất lượng --" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map(qual => (
                          <SelectItem key={qual.id} value={qual.id}>
                            {qual.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-gray-700 dark:text-gray-300">
                    Ghi chú (không bắt buộc)
                  </Label>
                  <textarea
                    id="note"
                    rows={3}
                    placeholder="Nhập ghi chú cho đơn hàng..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Price Summary */}
                {server && serviceType && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-5 border border-gray-200 dark:border-slate-600">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Máy chủ đã chọn:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {selectedServer?.name}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Thời gian xử lý:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {selectedServer?.speed}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 dark:border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                            Thành Tiền:
                          </span>
                          <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                            {total.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Tạo Đơn Hàng
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Uy tín cao</h3>
              <p className="text-sm text-green-700 dark:text-green-400">Hơn 10,000+ đơn hàng thành công</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">⚡ Xử lý nhanh</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">Tự động xử lý 24/7 không nghỉ</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">🔒 Bảo mật</h3>
              <p className="text-sm text-purple-700 dark:text-purple-400">Cam kết không lưu thông tin cá nhân</p>
            </div>
          </div>
        </div>
      ) : (
        // Order List View
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <ServiceOrderList />
          </div>
        </div>
      )}
    </div>
  );
}
