export type Theme = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type BusinessHour = {
  dayOfWeek?: string;
  openTime?: string;
  closeTime?: string;
  closed?: boolean;
};

export type Address = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export type RestaurantConfigResponse = {
  id?: string;
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsapp?: string;
  address?: Address;
  theme?: Theme;
  businessHours?: BusinessHour[];
};

export type ProductCategory = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  deletedAt?: string;
};

export type ProductOptionItem = {
  id?: string;
  name: string;
  priceCents: number;
  active: boolean;
  deleted?: boolean;
  deletedAt?: string;
};

export type ProductOptionGroup = {
  id?: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  deleted?: boolean;
  deletedAt?: string;
  items: ProductOptionItem[];
};

export type ProductOptionGroupTemplate = {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  items: ProductOptionItem[];
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  sortOrder: number;
  active: boolean;
  optionGroups: ProductOptionGroup[];
};

export type MenuResponse = {
  categories: ProductCategory[];
  products: Product[];
};

export type DeliveryType = "DELIVERY" | "PICKUP";

export type OrderStatus =
  | "RECEIVED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELED";

export type OrderItemOption = {
  groupId: string;
  groupName: string;
  itemId: string;
  itemName: string;
  priceCents: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  observations?: string;
  options: OrderItemOption[];
  totalCents: number;
};

export type OrderTotals = {
  subtotalCents: number;
  deliveryFeeCents: number;
  discountCents: number;
  totalCents: number;
};

export type OrderResponse = {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  notes?: string;
  items: OrderItem[];
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    changedAt: string;
    reason?: string;
  }[];
  totals: OrderTotals;
  cancellation?: {
    reason: string;
    canceledAt: string;
  };
  whatsappMessage?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CurrentUserResponse = {
  id: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  roles: string[];
};
