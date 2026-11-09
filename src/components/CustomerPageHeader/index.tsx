import type { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import { Description, Header, Title, TitleRow } from "./styles";

type CustomerPageHeaderProps = {
  title: string;
  description: string;
  onBack: () => void;
  backLabel?: string;
  trailing?: ReactNode;
  className?: string;
};

export function CustomerPageHeader({ title, description, onBack, backLabel = "Voltar ao cardápio", trailing, className }: CustomerPageHeaderProps) {
  return <Header className={className}>
    <TitleRow>
      <BackButton onClick={onBack} aria-label={backLabel} />
      <Title>{title}</Title>
      {trailing}
    </TitleRow>
    <Description>{description}</Description>
  </Header>;
}
