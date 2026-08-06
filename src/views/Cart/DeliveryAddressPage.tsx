"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/Button";
import {
  type CheckoutDraft,
  useCart,
} from "@/components/CartProvider";
import { Field, Input } from "@/components/Field";
import { PageShell } from "@/components/PageShell";
import { CartCard } from "@/views/Home/styles";
import {
  AddressAutocomplete,
  type AddressSelection,
} from "./AddressAutocomplete";
import {
  AddressFormActions,
  AddressFormFields,
  AddressPageForm,
  CartPageContent,
  CartPageHeader,
  CartPageText,
  CartPageTitle,
  CartPageTitleRow,
} from "./styles";

type DeliveryAddress = AddressSelection & {
  complement: string;
};

type AddressErrors = Partial<
  Record<"street" | "number" | "neighborhood", string>
>;

function savedAddress(checkout: CheckoutDraft): DeliveryAddress | null {
  if (
    !checkout.street.trim() ||
    !checkout.number.trim() ||
    !checkout.neighborhood.trim() ||
    !checkout.city.trim() ||
    !checkout.state.trim()
  ) {
    return null;
  }

  return {
    formattedAddress: "",
    street: checkout.street,
    number: checkout.number,
    complement: checkout.complement,
    neighborhood: checkout.neighborhood,
    city: checkout.city,
    state: checkout.state,
    zipCode: checkout.zipCode,
  };
}

export function DeliveryAddressPage() {
  const router = useRouter();
  const { checkout, updateCheckout } = useCart();
  const persistedAddress = savedAddress(checkout);
  const [draft, setDraft] = useState<DeliveryAddress | null>(null);
  const [errors, setErrors] = useState<AddressErrors>({});
  const address = draft ?? persistedAddress;

  function returnToCheckout() {
    router.push("/cart?step=checkout");
  }

  function selectAddress(selection: AddressSelection) {
    setDraft({
      ...selection,
      complement: "",
    });
    setErrors({});
  }

  function saveAddress() {
    if (!address) {
      return;
    }

    const nextAddress = {
      ...address,
      street: address.street.trim(),
      number: address.number.trim(),
      complement: address.complement.trim(),
      neighborhood: address.neighborhood.trim(),
    };
    const nextErrors: AddressErrors = {};

    if (!nextAddress.street) {
      nextErrors.street = "Informe a rua.";
    }
    if (!nextAddress.number) {
      nextErrors.number = "Informe o número.";
    }
    if (!nextAddress.neighborhood) {
      nextErrors.neighborhood = "Informe o bairro.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    updateCheckout({
      ...checkout,
      street: nextAddress.street,
      number: nextAddress.number,
      complement: nextAddress.complement,
      neighborhood: nextAddress.neighborhood,
      city: nextAddress.city,
      state: nextAddress.state,
      zipCode: nextAddress.zipCode,
    });
    returnToCheckout();
  }

  return (
    <PageShell>
      <CartPageContent>
        <CartPageHeader>
          <CartPageTitleRow>
            <BackButton
              aria-label="Voltar ao checkout"
              onClick={returnToCheckout}
            />
            <CartPageTitle>
              {persistedAddress ? "Alterar endereço" : "Selecionar endereço"}
            </CartPageTitle>
          </CartPageTitleRow>
          <CartPageText>
            Busque sua rua, revise os dados e salve para continuar.
          </CartPageText>
        </CartPageHeader>

        <CartCard>
          <AddressPageForm
            onSubmit={(event) => {
              event.preventDefault();
              saveAddress();
            }}
          >
            <AddressAutocomplete onSelect={selectAddress} />

            {address ? (
              <AddressFormFields>
                <Field label="Rua" error={errors.street}>
                  <Input
                    value={address.street}
                    onChange={(event) => {
                      setDraft({ ...address, street: event.target.value });
                      setErrors((current) => ({
                        ...current,
                        street: undefined,
                      }));
                    }}
                    autoComplete="address-line1"
                  />
                </Field>
                <Field label="Número" error={errors.number}>
                  <Input
                    value={address.number}
                    onChange={(event) => {
                      setDraft({ ...address, number: event.target.value });
                      setErrors((current) => ({
                        ...current,
                        number: undefined,
                      }));
                    }}
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Complemento">
                  <Input
                    value={address.complement}
                    onChange={(event) =>
                      setDraft({ ...address, complement: event.target.value })
                    }
                    autoComplete="address-line2"
                  />
                </Field>
                <Field label="Bairro" error={errors.neighborhood}>
                  <Input
                    value={address.neighborhood}
                    onChange={(event) => {
                      setDraft({ ...address, neighborhood: event.target.value });
                      setErrors((current) => ({
                        ...current,
                        neighborhood: undefined,
                      }));
                    }}
                  />
                </Field>
              </AddressFormFields>
            ) : null}

            <AddressFormActions>
              <Button type="button" variant="outline" onClick={returnToCheckout}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!address}>
                Salvar endereço
              </Button>
            </AddressFormActions>
          </AddressPageForm>
        </CartCard>
      </CartPageContent>
    </PageShell>
  );
}
