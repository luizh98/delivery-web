"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import {
  AddressAutocomplete,
  type AddressSelection,
} from "./AddressAutocomplete";
import {
  AddressModalActions,
  AddressModalCloseButton,
  AddressModalDescription,
  AddressModalDialog,
  AddressModalFields,
  AddressModalHeader,
  AddressModalOverlay,
  AddressModalTitle,
} from "./styles";

export type DeliveryAddress = AddressSelection & {
  complement: string;
};

type AddressErrors = Partial<
  Record<"street" | "number" | "neighborhood", string>
>;

type DeliveryAddressModalProps = {
  initialAddress: DeliveryAddress | null;
  onClose: () => void;
  onSave: (address: DeliveryAddress) => void;
};

export function DeliveryAddressModal({
  initialAddress,
  onClose,
  onSave,
}: DeliveryAddressModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<DeliveryAddress | null>(() =>
    initialAddress ? { ...initialAddress } : null,
  );
  const [errors, setErrors] = useState<AddressErrors>({});

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("input")?.focus();
    });

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function selectAddress(address: AddressSelection) {
    setDraft({
      ...address,
      complement: "",
    });
    setErrors({});
  }

  function saveAddress() {
    if (!draft) {
      return;
    }

    const nextDraft = {
      ...draft,
      street: draft.street.trim(),
      number: draft.number.trim(),
      complement: draft.complement.trim(),
      neighborhood: draft.neighborhood.trim(),
    };
    const nextErrors: AddressErrors = {};

    if (!nextDraft.street) {
      nextErrors.street = "Informe a rua.";
    }
    if (!nextDraft.number) {
      nextErrors.number = "Informe o número.";
    }
    if (!nextDraft.neighborhood) {
      nextErrors.neighborhood = "Informe o bairro.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave(nextDraft);
  }

  return (
    <AddressModalOverlay role="presentation" onClick={onClose}>
      <AddressModalDialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-address-title"
        onClick={(event) => event.stopPropagation()}
      >
        <AddressModalHeader>
          <div>
            <AddressModalTitle id="delivery-address-title">
              {initialAddress ? "Alterar endereço" : "Selecionar endereço"}
            </AddressModalTitle>
            <AddressModalDescription>
              Busque sua rua e escolha uma sugestão para continuar.
            </AddressModalDescription>
          </div>
          <AddressModalCloseButton
            type="button"
            onClick={onClose}
            aria-label="Fechar seleção de endereço"
          >
            <X size={18} />
          </AddressModalCloseButton>
        </AddressModalHeader>

        <AddressAutocomplete onSelect={selectAddress} />

        {draft ? (
          <AddressModalFields>
            <Field label="Rua" error={errors.street}>
              <Input
                value={draft.street}
                onChange={(event) => {
                  setDraft({ ...draft, street: event.target.value });
                  setErrors((current) => ({ ...current, street: undefined }));
                }}
                autoComplete="address-line1"
              />
            </Field>
            <Field label="Número" error={errors.number}>
              <Input
                value={draft.number}
                onChange={(event) => {
                  setDraft({ ...draft, number: event.target.value });
                  setErrors((current) => ({ ...current, number: undefined }));
                }}
                inputMode="numeric"
              />
            </Field>
            <Field label="Complemento">
              <Input
                value={draft.complement}
                onChange={(event) =>
                  setDraft({ ...draft, complement: event.target.value })
                }
                autoComplete="address-line2"
              />
            </Field>
            <Field label="Bairro" error={errors.neighborhood}>
              <Input
                value={draft.neighborhood}
                onChange={(event) => {
                  setDraft({ ...draft, neighborhood: event.target.value });
                  setErrors((current) => ({
                    ...current,
                    neighborhood: undefined,
                  }));
                }}
              />
            </Field>
          </AddressModalFields>
        ) : null}

        <AddressModalActions>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveAddress} disabled={!draft}>
            Salvar endereço
          </Button>
        </AddressModalActions>
      </AddressModalDialog>
    </AddressModalOverlay>
  );
}
