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
import {
  Actions,
  BuilderTitle,
  CardActions,
  CardTitle,
  Empty,
  ErrorTextLarge,
  ItemTitle,
  Muted,
  Pane,
  PaneGrid,
  PanelRoot,
  ScrollList,
  SearchIcon,
  SearchLabel,
  SearchWrap,
  SectionHeader,
  SectionTitle,
  SummaryCard,
  TemplateCard,
} from "./styles";

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
    <PanelRoot>
      {showHeader ? (
        <div>
          <BuilderTitle>Cadastro de grupos</BuilderTitle>
          <Muted>
            Crie, pesquise, altere e exclua grupos reutilizaveis.
          </Muted>
        </div>
      ) : null}

      {error ? <ErrorTextLarge>{error}</ErrorTextLarge> : null}

      <PaneGrid>
        <Pane>
          <SectionHeader>
            <div>
              <SectionTitle>
                {isEditing ? "Alterar grupo" : "Adicionar grupo"}
              </SectionTitle>
              <Muted>
                Um grupo por vez deixa o cadastro mais claro.
              </Muted>
            </div>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={onCancelEdit}>
                <X size={16} />
                Cancelar
              </Button>
            ) : null}
          </SectionHeader>

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
            <SummaryCard
              key={group.id ?? groupIndex}
            >
              <ItemTitle>
                {group.name || `Grupo ${groupIndex + 1}`}
              </ItemTitle>
              <Muted>{groupSummary(group)}</Muted>
            </SummaryCard>
          ))}

          <Actions>
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
          </Actions>
        </Pane>

        <Pane>
          <div>
            <SectionTitle>Grupos cadastrados</SectionTitle>
            <Muted>
              {templates.length} grupo(s) disponivel(is)
            </Muted>
          </div>

          <SearchLabel>
            <span>Pesquisar</span>
            <SearchWrap>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome do grupo ou item"
              />
            </SearchWrap>
          </SearchLabel>

          {templates.length === 0 ? (
            <Empty>
              Nenhum grupo salvo.
            </Empty>
          ) : null}

          {templates.length > 0 && filteredTemplates.length === 0 ? (
            <Empty>
              Nenhum grupo encontrado.
            </Empty>
          ) : null}

          <ScrollList>
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
              >
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <Muted>{groupSummary(template)}</Muted>
                  <Muted>{itemsSummary(template.items)}</Muted>
                </div>
                <CardActions>
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
                </CardActions>
              </TemplateCard>
            ))}
          </ScrollList>
        </Pane>
      </PaneGrid>
    </PanelRoot>
  );
}
