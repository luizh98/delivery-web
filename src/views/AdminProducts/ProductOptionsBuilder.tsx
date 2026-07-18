"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { centsToReais, money, reaisToCents } from "@/utils/format";
import type { ProductOptionGroup, ProductOptionItem } from "@/types/api";
import type { ProductOptionsErrors } from "./optionValidation";
import {
  BuilderHeader,
  BuilderTitle,
  CardTitle,
  CheckboxSurface,
  EmptyInfo,
  ErrorText,
  GridTwo,
  GroupCard,
  GroupFields,
  GroupList,
  IconActions,
  IconButton,
  ItemFields,
  ItemHeader,
  ItemList,
  ItemRow,
  ItemTitle,
  Muted,
  OptionBuilder,
  SectionHeader,
} from "./styles";

type ProductOptionsBuilderProps = {
  value: ProductOptionGroup[];
  onChange: (value: ProductOptionGroup[]) => void;
  errors?: ProductOptionsErrors;
  title?: string;
  description?: string;
  addGroupLabel?: string;
  maxGroups?: number;
};

const newGroup = (): ProductOptionGroup => ({
  name: "",
  required: false,
  minSelections: 0,
  maxSelections: 1,
  items: [],
});

const newItem = (): ProductOptionItem => ({
  name: "",
  priceCents: 0,
  active: true,
});

function moveArrayItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function visibleIndexes<T extends { deleted?: boolean }>(items: T[]) {
  return items.reduce<number[]>((indexes, item, index) => {
    if (!item.deleted) {
      indexes.push(index);
    }

    return indexes;
  }, []);
}

function visibleTargetIndex<T extends { deleted?: boolean }>(
  items: T[],
  currentIndex: number,
  direction: -1 | 1,
) {
  const indexes = visibleIndexes(items);
  const currentPosition = indexes.indexOf(currentIndex);

  return indexes[currentPosition + direction];
}

function deletedPatch() {
  return {
    deleted: true,
    deletedAt: new Date().toISOString(),
  };
}

function toNumber(value: string) {
  return Number(value);
}

function selectionsLabel(count: number) {
  return count === 1 ? "selecao" : "selecoes";
}

function groupSummary(group: ProductOptionGroup) {
  const visibleItems = group.items.filter((item) => !item.deleted);
  const type = group.required ? "Obrigatorio" : "Opcional";
  const limit =
    group.minSelections > 0
      ? `${group.minSelections} a ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`
      : `ate ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`;
  const items = visibleItems.length === 1 ? "1 item" : `${visibleItems.length} itens`;

  return `${type} - ${limit} - ${items}`;
}

export function ProductOptionsBuilder({
  value,
  onChange,
  errors,
  title = "Opcionais",
  description = "Crie grupos como molhos, adicionais ou ponto da carne.",
  addGroupLabel = "Adicionar grupo",
  maxGroups,
}: ProductOptionsBuilderProps) {
  function patchGroup(groupIndex: number, patch: Partial<ProductOptionGroup>) {
    onChange(
      value.map((group, index) =>
        index === groupIndex ? { ...group, ...patch } : group,
      ),
    );
  }

  function removeGroup(groupIndex: number) {
    const group = value[groupIndex];

    if (!group.id) {
      onChange(value.filter((_, index) => index !== groupIndex));
      return;
    }

    patchGroup(groupIndex, deletedPatch());
  }

  function moveGroup(groupIndex: number, direction: -1 | 1) {
    const targetIndex = visibleTargetIndex(value, groupIndex, direction);

    if (targetIndex === undefined) {
      return;
    }

    onChange(moveArrayItem(value, groupIndex, targetIndex));
  }

  function addItem(groupIndex: number) {
    const group = value[groupIndex];
    patchGroup(groupIndex, { items: [...(group.items ?? []), newItem()] });
  }

  function patchItem(
    groupIndex: number,
    itemIndex: number,
    patch: Partial<ProductOptionItem>,
  ) {
    const group = value[groupIndex];
    patchGroup(groupIndex, {
      items: (group.items ?? []).map((item, index) =>
        index === itemIndex ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeItem(groupIndex: number, itemIndex: number) {
    const group = value[groupIndex];
    const item = group.items[itemIndex];

    if (!item.id) {
      patchGroup(groupIndex, {
        items: group.items.filter((_, index) => index !== itemIndex),
      });
      return;
    }

    patchGroup(groupIndex, {
      items: group.items.map((currentItem, index) =>
        index === itemIndex
          ? { ...currentItem, ...deletedPatch(), active: false }
          : currentItem,
      ),
    });
  }

  function moveItem(groupIndex: number, itemIndex: number, direction: -1 | 1) {
    const group = value[groupIndex];
    const targetIndex = visibleTargetIndex(group.items, itemIndex, direction);

    if (targetIndex === undefined) {
      return;
    }

    patchGroup(groupIndex, {
      items: moveArrayItem(group.items, itemIndex, targetIndex),
    });
  }

  const visibleGroups = value
    .map((group, index) => ({ group, groupIndex: index }))
    .filter(({ group }) => !group.deleted);
  const canAddGroup = maxGroups === undefined || visibleGroups.length < maxGroups;

  return (
    <OptionBuilder>
      <BuilderHeader>
        <div>
          <BuilderTitle>{title}</BuilderTitle>
          <Muted>{description}</Muted>
        </div>
        {canAddGroup ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange([...value, newGroup()])}
          >
            <Plus size={16} />
            {addGroupLabel}
          </Button>
        ) : null}
      </BuilderHeader>

      {visibleGroups.length === 0 ? (
        <EmptyInfo>
          <p>Nenhum opcional cadastrado.</p>
          <p>Use quando o cliente puder escolher molhos, adicionais ou variacoes.</p>
        </EmptyInfo>
      ) : null}

      <GroupList>
        {visibleGroups.map(({ group, groupIndex }, visibleGroupIndex) => {
          const groupErrors = errors?.groups[groupIndex];
          const visibleItemIndexes = visibleIndexes(group.items);

          return (
            <GroupCard
              key={group.id ?? groupIndex}
            >
              <SectionHeader>
                <div>
                  <CardTitle>Grupo {visibleGroupIndex + 1}</CardTitle>
                  <Muted>{groupSummary(group)}</Muted>
                </div>
                <IconActions>
                  <IconButton
                    type="button"
                    onClick={() => moveGroup(groupIndex, -1)}
                    disabled={visibleGroupIndex === 0}
                    aria-label={`Subir grupo ${visibleGroupIndex + 1}`}
                    title="Subir grupo"
                  >
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() => moveGroup(groupIndex, 1)}
                    disabled={visibleGroupIndex === visibleGroups.length - 1}
                    aria-label={`Descer grupo ${visibleGroupIndex + 1}`}
                    title="Descer grupo"
                  >
                    <ArrowDown size={16} />
                  </IconButton>
                  <Button
                    type="button"
                    variant="dangerGhost"
                    onClick={() => removeGroup(groupIndex)}
                    aria-label={`Remover grupo ${visibleGroupIndex + 1}`}
                    title="Remover grupo"
                  >
                    <Trash2 size={16} />
                    Excluir grupo
                  </Button>
                </IconActions>
              </SectionHeader>

              <GroupFields>
                <Field label="Nome do grupo" error={groupErrors?.name}>
                  <Input
                    value={group.name}
                    onChange={(event) =>
                      patchGroup(groupIndex, { name: event.target.value })
                    }
                    placeholder="Ex: Molhos"
                  />
                </Field>
                <CheckboxSurface>
                  <input
                    type="checkbox"
                    checked={group.required}
                    onChange={(event) =>
                      patchGroup(groupIndex, {
                        required: event.target.checked,
                        minSelections: event.target.checked
                          ? Math.max(1, group.minSelections)
                          : group.minSelections,
                      })
                    }
                  />
                  Obrigatorio
                </CheckboxSurface>
                <Button type="button" variant="outline" onClick={() => addItem(groupIndex)}>
                  <Plus size={16} />
                  Adicionar item
                </Button>
              </GroupFields>

              <GridTwo>
                <Field label="Minimo" error={groupErrors?.minSelections}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={group.minSelections}
                    onChange={(event) =>
                      patchGroup(groupIndex, {
                        minSelections: toNumber(event.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Maximo" error={groupErrors?.maxSelections}>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={group.maxSelections}
                    onChange={(event) =>
                      patchGroup(groupIndex, {
                        maxSelections: toNumber(event.target.value),
                      })
                    }
                  />
                </Field>
              </GridTwo>

              {groupErrors?.items ? (
                <ErrorText>{groupErrors.items}</ErrorText>
              ) : null}

              <ItemList>
                {visibleItemIndexes.map((itemIndex, visibleItemIndex) => {
                  const item = group.items[itemIndex];
                  const itemErrors = groupErrors?.itemErrors?.[itemIndex];

                  return (
                    <ItemRow
                      key={item.id ?? itemIndex}
                    >
                      <ItemHeader>
                        <div>
                          <ItemTitle>
                            {item.name || `Item ${visibleItemIndex + 1}`}
                          </ItemTitle>
                          <Muted>{money(item.priceCents)}</Muted>
                        </div>
                        <IconActions>
                          <IconButton
                            type="button"
                            onClick={() => moveItem(groupIndex, itemIndex, -1)}
                            disabled={visibleItemIndex === 0}
                            aria-label={`Subir item ${visibleItemIndex + 1}`}
                            title="Subir item"
                          >
                            <ArrowUp size={16} />
                          </IconButton>
                          <IconButton
                            type="button"
                            onClick={() => moveItem(groupIndex, itemIndex, 1)}
                            disabled={visibleItemIndex === visibleItemIndexes.length - 1}
                            aria-label={`Descer item ${visibleItemIndex + 1}`}
                            title="Descer item"
                          >
                            <ArrowDown size={16} />
                          </IconButton>
                          <Button
                            type="button"
                            variant="dangerGhost"
                            onClick={() => removeItem(groupIndex, itemIndex)}
                            aria-label={`Remover item ${visibleItemIndex + 1}`}
                            title="Remover item"
                          >
                            <Trash2 size={16} />
                            Excluir item
                          </Button>
                        </IconActions>
                      </ItemHeader>

                      <ItemFields>
                        <Field label="Nome do item" error={itemErrors?.name}>
                          <Input
                            value={item.name}
                            onChange={(event) =>
                              patchItem(groupIndex, itemIndex, {
                                name: event.target.value,
                              })
                            }
                            placeholder="Ex: Barbecue"
                          />
                        </Field>
                        <Field label="Preco (R$)" error={itemErrors?.priceCents}>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            value={centsToReais(item.priceCents)}
                            onChange={(event) =>
                              patchItem(groupIndex, itemIndex, {
                                priceCents: reaisToCents(toNumber(event.target.value)),
                              })
                            }
                          />
                        </Field>
                        <CheckboxSurface>
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={(event) =>
                              patchItem(groupIndex, itemIndex, {
                                active: event.target.checked,
                              })
                            }
                          />
                          Ativo
                        </CheckboxSurface>
                      </ItemFields>
                    </ItemRow>
                  );
                })}
              </ItemList>
            </GroupCard>
          );
        })}
      </GroupList>
    </OptionBuilder>
  );
}
