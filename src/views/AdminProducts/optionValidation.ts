import type { ProductOptionGroup } from "@/types/api";

export type ProductOptionItemErrors = {
  name?: string;
  priceCents?: string;
};

export type ProductOptionGroupErrors = {
  name?: string;
  minSelections?: string;
  maxSelections?: string;
  items?: string;
  itemErrors?: Record<number, ProductOptionItemErrors>;
};

export type ProductOptionsErrors = {
  groups: Record<number, ProductOptionGroupErrors>;
};

export const emptyProductOptionsErrors: ProductOptionsErrors = {
  groups: {},
};

export function validateOptionGroups(
  groups: ProductOptionGroup[],
): ProductOptionsErrors {
  const errors: ProductOptionsErrors = { groups: {} };

  groups.forEach((group, groupIndex) => {
    if (group.deleted) {
      return;
    }

    const groupErrors: ProductOptionGroupErrors = {};
    const visibleItems = group.items.filter((item) => !item.deleted);

    if (!group.name.trim()) {
      groupErrors.name = "Informe o nome do grupo.";
    }

    if (!Number.isInteger(group.minSelections) || group.minSelections < 0) {
      groupErrors.minSelections = "Minimo deve ser zero ou maior.";
    }

    if (!Number.isInteger(group.maxSelections) || group.maxSelections < 1) {
      groupErrors.maxSelections = "Maximo deve ser pelo menos 1.";
    }

    if (group.required && group.minSelections < 1) {
      groupErrors.minSelections = "Grupo obrigatorio precisa de minimo 1.";
    }

    if (group.maxSelections < group.minSelections) {
      groupErrors.maxSelections = "Maximo deve ser maior ou igual ao minimo.";
    }

    if (!visibleItems.length) {
      groupErrors.items = "Adicione pelo menos um item.";
    }

    group.items.forEach((item, itemIndex) => {
      if (item.deleted) {
        return;
      }

      const itemErrors: ProductOptionItemErrors = {};

      if (!item.name.trim()) {
        itemErrors.name = "Informe o nome do item.";
      }

      if (!Number.isInteger(item.priceCents) || item.priceCents < 0) {
        itemErrors.priceCents = "Preco deve ser um valor em reais zero ou maior.";
      }

      if (Object.keys(itemErrors).length > 0) {
        groupErrors.itemErrors = {
          ...groupErrors.itemErrors,
          [itemIndex]: itemErrors,
        };
      }
    });

    if (Object.keys(groupErrors).length > 0) {
      errors.groups[groupIndex] = groupErrors;
    }
  });

  return errors;
}

export function hasOptionErrors(errors: ProductOptionsErrors): boolean {
  return Object.keys(errors.groups).length > 0;
}

export function normalizeOptionGroups(
  groups: ProductOptionGroup[],
): ProductOptionGroup[] {
  return groups
    .filter((group) => group.id || !group.deleted)
    .map((group) => ({
      ...group,
      name: group.name.trim(),
      required: Boolean(group.required),
      deleted: Boolean(group.deleted),
      minSelections: Number.isInteger(group.minSelections)
        ? group.minSelections
        : 0,
      maxSelections: Number.isInteger(group.maxSelections)
        ? group.maxSelections
        : 1,
      items: group.items
        .filter((item) => item.id || !item.deleted)
        .map((item) => ({
          ...item,
          name: item.name.trim(),
          priceCents: Number.isInteger(item.priceCents) ? item.priceCents : 0,
          active: Boolean(item.active),
          deleted: Boolean(item.deleted),
        })),
    }));
}
