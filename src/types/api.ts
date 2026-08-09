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

export type HolidayHour = {
  date?: string;
  name?: string;
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

export type DeliverySettings = {
  enabled?: boolean;
  maxDistanceKm?: number;
  pricePerKmCents?: number;
  freeDeliveryMinimumOrderCents?: number;
  freeDeliveryDays?: DayOfWeek[];
};

export type RestaurantConfigResponse = {
  id?: string;
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  menuDescription?: string;
  minimumOrderCents?: number;
  whatsapp?: string;
  address?: Address;
  theme?: Theme;
  businessHours?: BusinessHour[];
  holidayHours?: HolidayHour[];
  deliverySettings?: DeliverySettings;
  open?: boolean;
  nextOpeningAt?: string;
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
  templateId?: string;
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
  adultOnly: boolean;
  glutenFree: boolean;
  lactoseFree: boolean;
  vegetarian: boolean;
  optionGroups: ProductOptionGroup[];
};

export type MenuResponse = {
  categories: ProductCategory[];
  products: Product[];
};

export type DeliveryType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH";

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
  trackingCode?: string;
  customer: {
    name: string;
    phone: string;
  };
  deliveryType: DeliveryType;
  deliveryAddress?: Address;
  paymentMethod?: PaymentMethod;
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

export type PublicOrderTrackingResponse = {
  orderNumber: string;
  deliveryType: DeliveryType;
  paymentMethod?: PaymentMethod;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    changedAt: string;
    reason?: string;
  }[];
  totalCents: number;
  cancellation?: {
    reason: string;
    canceledAt: string;
  };
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

export type UpsellTriggerType =
  | "PRODUCT"
  | "CATEGORY"
  | "ANY_CART_ITEM"
  | "CART_AMOUNT";

export type UpsellOfferType = "PRODUCT" | "CATEGORY" | "MIXED";
export type UpsellBenefitType = "NONE" | "FIXED_PRICE";
export type UpsellPriceType = "FIXED" | "PERCENTAGE";
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type UpsellWeekdayPrice = {
  dayOfWeek: DayOfWeek;
  priceType?: UpsellPriceType | null;
  priceCents?: number | null;
  discountPercentage?: number | null;
};

export type UpsellCampaignOffer = {
  productId?: string;
  categoryId?: string;
  displayOrder: number;
  maximumQuantity?: number;
  priceType?: UpsellPriceType | null;
  fixedOfferPriceCents?: number | null;
  discountPercentage?: number | null;
  weekdayPrices: UpsellWeekdayPrice[];
};

export type UpsellCampaign = {
  id: string;
  name: string;
  displayTitle: string;
  active: boolean;
  priority: number;
  triggerType: UpsellTriggerType;
  triggerProductIds: string[];
  triggerCategoryIds: string[];
  minimumCartAmountCents?: number | null;
  maximumCartAmountCents?: number | null;
  minimumItems: number;
  maxSuggestions: number;
  maximumQuantityPerOrder: number;
  offerType: UpsellOfferType;
  offers: UpsellCampaignOffer[];
  benefitType: UpsellBenefitType;
  fixedOfferPriceCents?: number | null;
  allowDiscountStacking: boolean;
  showSavings: boolean;
  skipIfProductInCart: boolean;
  skipIfOfferCategoryInCart: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsellSuggestion = {
  productId: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  originalPriceCents: number;
  offerPriceCents: number;
  discountAmountCents: number;
  discountPercentage: number;
  maximumQuantity: number;
  requiresOptions: boolean;
  showSavings: boolean;
};

export type UpsellPromotionAdjustment = {
  lineId?: string;
  productId: string;
  campaignId: string;
  eligible: boolean;
  originalPriceCents: number;
  offerPriceCents: number;
  message?: string;
};

export type CartUpsellResponse = {
  campaignId?: string;
  title?: string;
  suggestions: UpsellSuggestion[];
  promotionAdjustments: UpsellPromotionAdjustment[];
};

export type UpsellOfferValidationResponse = {
  campaignId: string;
  productId: string;
  originalPriceCents: number;
  offerPriceCents: number;
  discountAmountCents: number;
  maximumQuantity: number;
  requiresOptions: boolean;
};
