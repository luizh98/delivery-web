"use client";

import { Pencil, Save, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Field";
import { money } from "@/utils/format";
import type {
  ProductOptionGroup,
  ProductOptionGroupTemplate,
  ProductOptionItem,
} from "@/types/api";
import { ProductOptionsBuilder } from "./ProductOptionsBuilder";
import type { ProductOptionsErrors } from "./optionValidation";
import styles from "./styles.module.css";

type ReusableOptionGroupsPanelProps = {
  templates: ProductOptionGroupTemplate[];
  draftGroups: ProductOptionGroup[];
  draftErrors: ProductOptionsErrors;
  savingGroupIndex: number | null;
  deletingTemplateId: string | null;
  editingTemplateId: string | null;
  error?: string;
  showHeader?: boolean;
  onDraftGroupsChange: (groups: ProductOptionGroup[]) => void;
  onSaveGroup: (groupIndex: number) => void;
  onEditTemplate: (template: ProductOptionGroupTemplate) => void;
  onCancelEdit: () => void;
  onDeleteTemplate: (template: ProductOptionGroupTemplate) => void;
};

function visibleItems(items: ProductOptionItem[]) {
  return items.filter((item) => !item.deleted);
}

function selectionsLabel(count: number) {
  return count === 1 ? "selecao" : "selecoes";
}

function groupSummary(group: ProductOptionGroup | ProductOptionGroupTemplate) {
  const items = visibleItems(group.items);
  const type = group.required ? "Obrigatorio" : "Opcional";
  const limit =
    group.minSelections > 0
      ? `${group.minSelections} a ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`
      : `ate ${group.maxSelections} ${selectionsLabel(group.maxSelections)}`;
  const itemCount = items.length === 1 ? "1 item" : `${items.length} itens`;

  return `${type} - ${limit} - ${itemCount}`;
}

function itemsSummary(items: ProductOptionItem[]) {
  const visible = visibleItems(items);

  if (!visible.length) {
    return "Sem itens";
  }

  return visible
    .slice(0, 3)
    .map((item) => `${item.name} (${money(item.priceCents)})`)
    .join(", ");
}

function templateMatchesSearch(
  template: ProductOptionGroupTemplate,
  normalizedSearch: string,
) {
  if (!normalizedSearch) {
    return true;
  }

  const searchableText = [
    template.name,
    groupSummary(template),
    ...visibleItems(template.items).map((item) => item.name),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedSearch);
}

export function ReusableOptionGroupsPanel({
  templates,
  draftGroups,
  draftErrors,
  savingGroupIndex,
  deletingTemplateId,
  editingTemplateId,
  error,
  showHeader = true,
  onDraftGroupsChange,
  onSaveGroup,
  onEditTemplate,
  onCancelEdit,
  onDeleteTemplate,
}: ReusableOptionGroupsPanelProps) {
  const [search, setSearch] = useState("");
  const visibleDraftGroups = draftGroups
    .map((group, index) => ({ group, groupIndex: index }))
    .filter(({ group }) => !group.deleted);
  const draftGroupIndex = visibleDraftGroups[0]?.groupIndex;
  const isEditing = Boolean(editingTemplateId);
  const filteredTemplates = templates.filter((template) =>
    templateMatchesSearch(template, search.trim().toLowerCase()),
  );

  return (
    <section className={styles.panelRoot}>
      {showHeader ? (
        <div>
          <h2 className={styles.builderTitle}>Cadastro de grupos</h2>
          <p className={styles.muted}>
            Crie, pesquise, altere e exclua grupos reutilizaveis.
          </p>
        </div>
      ) : null}

      {error ? <p className={styles.errorTextLarge}>{error}</p> : null}

      <div className={styles.paneGrid}>
        <section className={styles.pane}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>
                {isEditing ? "Alterar grupo" : "Adicionar grupo"}
              </h3>
              <p className={styles.muted}>
                Um grupo por vez deixa o cadastro mais claro.
              </p>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={onCancelEdit}>
                <X size={16} />
                Cancelar
              </Button>
            ) : null}
          </div>

          <ProductOptionsBuilder
            value={draftGroups}
            onChange={onDraftGroupsChange}
            errors={draftErrors}
            title={isEditing ? "Dados do grupo" : "Novo grupo"}
            description="Informe nome, limites e itens antes de salvar."
            addGroupLabel="Adicionar grupo"
            maxGroups={1}
          />

          {visibleDraftGroups.map(({ group, groupIndex }) => (
            <div
              key={group.id ?? groupIndex}
              className={styles.summaryCard}
            >
              <p className={styles.itemTitle}>
                {group.name || `Grupo ${groupIndex + 1}`}
              </p>
              <p className={styles.muted}>{groupSummary(group)}</p>
            </div>
          ))}

          <div className={styles.actions}>
            <Button
              type="button"
              onClick={() => {
                if (draftGroupIndex !== undefined) {
                  onSaveGroup(draftGroupIndex);
                }
              }}
              disabled={
                draftGroupIndex === undefined ||
                savingGroupIndex === draftGroupIndex
              }
            >
              <Save size={16} />
              Salvar grupo
            </Button>
          </div>
        </section>

        <section className={styles.pane}>
          <div>
            <h3 className={styles.sectionTitle}>Grupos cadastrados</h3>
            <p className={styles.muted}>
              {templates.length} grupo(s) disponivel(is)
            </p>
          </div>

          <label className={styles.searchLabel}>
            <span>Pesquisar</span>
            <span className={styles.searchWrap}>
              <Search
                className={styles.searchIcon}
                size={16}
              />
              <Input
                className={styles.searchInput}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome do grupo ou item"
              />
            </span>
          </label>

          {templates.length === 0 ? (
            <div className={styles.empty}>
              Nenhum grupo salvo.
            </div>
          ) : null}

          {templates.length > 0 && filteredTemplates.length === 0 ? (
            <div className={styles.empty}>
              Nenhum grupo encontrado.
            </div>
          ) : null}

          <div className={styles.scrollList}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={styles.templateCard}
              >
                <div>
                  <p className={styles.cardTitle}>{template.name}</p>
                  <p className={styles.muted}>{groupSummary(template)}</p>
                  <p className={styles.muted}>{itemsSummary(template.items)}</p>
                </div>
                <div className={styles.cardActions}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onEditTemplate(template)}
                    disabled={editingTemplateId === template.id}
                  >
                    <Pencil size={16} />
                    {editingTemplateId === template.id ? "Editando" : "Editar"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => onDeleteTemplate(template)}
                    disabled={deletingTemplateId === template.id}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
