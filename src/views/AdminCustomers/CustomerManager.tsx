"use client";

import {
  CalendarDays,
  Eye,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  ShoppingBag,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Field";
import { clientApi } from "@/services/api/client";
import type {
  Address,
  AdminCustomerDetails,
  AdminCustomerPage,
} from "@/types/api";
import { money } from "@/utils/format";
import {
  ActionLink,
  Actions,
  AddressText,
  DetailsGrid,
  Empty,
  ErrorText,
  FilterActions,
  Filters,
  Header,
  InfoCard,
  InfoLabel,
  InfoValue,
  Modal,
  ModalBody,
  ModalHeader,
  ModalOverlay,
  Muted,
  Pagination,
  PaginationInfo,
  Root,
  Subtitle,
  Table,
  TableCard,
  TableScroll,
  Title,
} from "./styles";

type CustomerManagerProps = {
  initialPage: AdminCustomerPage;
};

export function CustomerManager({ initialPage }: CustomerManagerProps) {
  const [pageData, setPageData] = useState(initialPage);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<AdminCustomerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  async function loadCustomers(page: number) {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: page.toString(), size: "20" });
    if (name.trim()) {
      query.set("name", name.trim());
    }
    if (phone.trim()) {
      query.set("phone", phone.trim());
    }

    try {
      setPageData(
        await clientApi<AdminCustomerPage>(`admin/customers?${query.toString()}`),
      );
    } catch {
      setError("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadCustomers(0);
  }

  async function openDetails(phoneNormalized: string) {
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      setDetails(
        await clientApi<AdminCustomerDetails>(
          `admin/customers/${encodeURIComponent(phoneNormalized)}`,
        ),
      );
    } catch {
      setDetailsError("Não foi possível carregar os detalhes do cliente.");
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeDetails() {
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(false);
  }

  const modalOpen = detailsLoading || Boolean(details) || Boolean(detailsError);

  return (
    <Root>
      <Header>
        <div>
          <Title>Clientes</Title>
          <Subtitle>
            Histórico de relacionamento e compras no restaurante.
          </Subtitle>
        </div>
        <Muted>{pageData.totalElements} cliente(s)</Muted>
      </Header>

      <Filters onSubmit={submitFilters}>
        <Field label="Nome">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do cliente"
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="DDD e número"
            inputMode="tel"
          />
        </Field>
        <FilterActions>
          <Button type="submit" disabled={loading}>
            <Search size={16} />
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </FilterActions>
      </Filters>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <TableCard aria-busy={loading}>
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Celular</th>
                <th>Cliente há</th>
                <th>Último pedido</th>
                <th>Pedidos</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {pageData.items.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="Nome">{customer.name || "Sem nome"}</td>
                  <td data-label="Celular">{formatPhone(customer.phoneNormalized)}</td>
                  <td data-label="Cliente há">{formatElapsed(customer.customerSince)}</td>
                  <td data-label="Último pedido">{formatElapsed(customer.lastOrderAt)}</td>
                  <td data-label="Pedidos">{customer.orderCount}</td>
                  <td>
                    <Actions>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void openDetails(customer.phoneNormalized)}
                      >
                        <Eye size={16} />
                        Detalhes
                      </Button>
                      <ActionLink
                        href={`https://wa.me/${whatsAppPhone(customer.phoneNormalized)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Conversar com ${customer.name} no WhatsApp`}
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </ActionLink>
                    </Actions>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>

        {!loading && pageData.items.length === 0 ? (
          <Empty>Nenhum cliente encontrado.</Empty>
        ) : null}

        <Pagination>
          <PaginationInfo>
            Página {pageData.totalPages === 0 ? 0 : pageData.page + 1} de {pageData.totalPages}
          </PaginationInfo>
          <div>
            <Button
              type="button"
              variant="outline"
              disabled={loading || pageData.page === 0}
              onClick={() => void loadCustomers(pageData.page - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading || pageData.page + 1 >= pageData.totalPages}
              onClick={() => void loadCustomers(pageData.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </Pagination>
      </TableCard>

      {modalOpen ? (
        <ModalOverlay role="presentation" onMouseDown={closeDetails}>
          <Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-details-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <ModalHeader>
              <div>
                <Title id="customer-details-title">Detalhes do cliente</Title>
                <Subtitle>Dados consolidados neste restaurante.</Subtitle>
              </div>
              <Button type="button" variant="ghost" onClick={closeDetails}>
                <X size={18} />
                Fechar
              </Button>
            </ModalHeader>
            <ModalBody>
              {detailsLoading ? <Muted>Carregando detalhes...</Muted> : null}
              {detailsError ? <ErrorText>{detailsError}</ErrorText> : null}
              {details ? <CustomerDetails details={details} /> : null}
            </ModalBody>
          </Modal>
        </ModalOverlay>
      ) : null}
    </Root>
  );
}

function CustomerDetails({ details }: { details: AdminCustomerDetails }) {
  return (
    <DetailsGrid>
      <InfoCard>
        <UserRound size={18} />
        <div>
          <InfoLabel>Nome</InfoLabel>
          <InfoValue>{details.name || "Sem nome"}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard>
        <MessageCircle size={18} />
        <div>
          <InfoLabel>Celular</InfoLabel>
          <InfoValue>{formatPhone(details.phoneNormalized)}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard>
        <CalendarDays size={18} />
        <div>
          <InfoLabel>Cliente há</InfoLabel>
          <InfoValue>{formatElapsed(details.customerSince)}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard>
        <PackageCheck size={18} />
        <div>
          <InfoLabel>Último pedido</InfoLabel>
          <InfoValue>{formatElapsed(details.lastOrderAt)}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard>
        <ShoppingBag size={18} />
        <div>
          <InfoLabel>Quantidade de pedidos</InfoLabel>
          <InfoValue>{details.orderCount}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard>
        <WalletCards size={18} />
        <div>
          <InfoLabel>Total gasto</InfoLabel>
          <InfoValue>{money(details.totalSpentCents)}</InfoValue>
        </div>
      </InfoCard>
      <InfoCard data-wide>
        <MapPin size={18} />
        <div>
          <InfoLabel>Último endereço cadastrado</InfoLabel>
          <AddressText>
            {details.lastAddress
              ? formatAddress(details.lastAddress)
              : "Nenhum endereço de entrega cadastrado."}
          </AddressText>
        </div>
      </InfoCard>
    </DetailsGrid>
  );
}

function formatPhone(phone: string) {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  return phone;
}

function whatsAppPhone(phone: string) {
  return phone.startsWith("55") && phone.length > 11 ? phone : `55${phone}`;
}

function formatElapsed(value: string) {
  const date = new Date(value);
  const elapsedDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (elapsedDays < 1) {
    return "hoje";
  }
  if (elapsedDays < 30) {
    return `${elapsedDays} ${elapsedDays === 1 ? "dia" : "dias"}`;
  }
  const months = Math.floor(elapsedDays / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }
  const years = Math.floor(elapsedDays / 365);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

function formatAddress(address: Address) {
  return [
    [address.street, address.number].filter(Boolean).join(", "),
    address.complement,
    address.neighborhood,
    [address.city, address.state].filter(Boolean).join(" - "),
    address.zipCode ? `CEP ${address.zipCode}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}
