type CheckoutValidationInput = {
  deliveryType?: "DELIVERY" | "PICKUP";
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

const requiredDeliveryAddressFields: Array<keyof CheckoutValidationInput> = [
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
];

export function getCheckoutValidationMessage(
  checkout: CheckoutValidationInput,
) {
  if (
    checkout.deliveryType === "DELIVERY" &&
    requiredDeliveryAddressFields.some((field) => !checkout[field]?.trim())
  ) {
    return "Informe o endereço de entrega para continuar.";
  }

  return "";
}
