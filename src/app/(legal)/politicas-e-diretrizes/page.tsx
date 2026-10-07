import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Termos de uso e Política de Privacidade | FlyFoods",
  description: "Conheça os termos de uso da FlyFoods, como seus dados são utilizados e como exercer seus direitos de privacidade.",
  alternates: { canonical: "https://flyfoods.com.br/politicas-e-diretrizes" },
};

const email = "dev.lhdsantos@gmail.com";

export default function PoliciesPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">Ir para o conteúdo</a>
      <header className={styles.header}>
        <a className={styles.brand} href="https://flyfoods.com.br">FlyFoods</a>
        <a href={`mailto:${email}`}>Fale conosco</a>
      </header>

      <main id="conteudo" className={styles.main}>
        <div className={styles.intro}>
          <h1>Políticas e diretrizes</h1>
          <p>Termos de uso e Política de Privacidade da FlyFoods. Saiba como funciona nossa plataforma e como tratamos seus dados pessoais.</p>
          <p className={styles.updated}>Última atualização: <time dateTime="2026-10-07">7 de outubro de 2026</time></p>
        </div>

        <div className={styles.columns}>
          <nav className={styles.navigation} aria-label="Nesta página">
            <strong>Nesta página</strong>
            <a href="#responsavel">Responsável pela plataforma</a>
            <a href="#termos-de-uso">Termos de uso</a>
            <a href="#privacidade">Política de Privacidade</a>
            <a href="#cookies">Cookies e armazenamento</a>
            <a href="#seus-direitos">Seus direitos</a>
            <a href="#contato">Contato</a>
          </nav>

          <article className={styles.content}>
            <section id="responsavel">
              <h2>Responsável pela plataforma</h2>
              <p>A FlyFoods é uma plataforma de cardápio digital e gestão de pedidos, mantida pela empresa identificada abaixo.</p>
              <dl className={styles.company}>
                <dt>Razão social</dt>
                <dd>50.661.506 LUIZ HENRIQUE CALCAGNOTO DOS SANTOS</dd>
                <dt>CNPJ</dt>
                <dd>50.661.506/0001-10</dd>
                <dt>E-mail</dt>
                <dd><a href={`mailto:${email}`}>{email}</a></dd>
              </dl>
              <p>Estas diretrizes abrangem a plataforma e os cardápios dos estabelecimentos que a utilizam, inclusive em subdomínios da FlyFoods.</p>
            </section>

            <section id="termos-de-uso">
              <h2>Termos de uso</h2>
              <h3>Uso da plataforma</h3>
              <p>A FlyFoods permite consultar cardápios, montar pedidos e acompanhar seu atendimento, conforme os recursos disponibilizados pelo estabelecimento. Os estabelecimentos utilizam a plataforma para administrar produtos, clientes, pedidos e entregas.</p>
              <p>Utilize o serviço de forma lícita e forneça informações corretas, especialmente nome, telefone e endereço de entrega. Proteja suas credenciais de acesso e avise nosso contato caso identifique uso indevido da sua conta.</p>
              <p>É proibido usar a plataforma para fraudes, divulgar conteúdo ilegal, acessar contas ou dados de terceiros sem autorização ou comprometer a segurança e o funcionamento do serviço. Acesso utilizado de forma abusiva pode ser restringido, respeitados os direitos aplicáveis.</p>

              <h3>Pedidos, preços e atendimento</h3>
              <p>Cada estabelecimento informa seus produtos, preços, disponibilidade, taxas, formas de pagamento e condições de entrega ou retirada. Confira os itens, o valor total e seus dados antes de enviar um pedido. O envio deve ser acompanhado da confirmação e do status informados pelo estabelecimento.</p>
              <p>Dúvidas sobre ingredientes, alergênicos, preparo, entrega ou alterações no pedido devem ser encaminhadas ao estabelecimento pelos canais apresentados no cardápio. A FlyFoods fornece a tecnologia da plataforma; o estabelecimento realiza a venda, o preparo e o atendimento do pedido.</p>

              <h3>Cancelamentos, reembolsos e direitos do consumidor</h3>
              <p>Para solicitar cancelamento, correção ou reembolso, entre em contato com o estabelecimento e informe o número do pedido. A análise deve considerar o andamento do pedido e a legislação aplicável. Estes termos não afastam direitos do consumidor nem excluem responsabilidades previstas em lei.</p>

              <h3>Disponibilidade e alterações</h3>
              <p>O serviço pode passar por manutenção ou sofrer interrupções técnicas. Em caso de falha no envio ou na confirmação, consulte o estabelecimento antes de repetir o pedido, evitando duplicidade.</p>
              <p>Os recursos e estas diretrizes podem ser atualizados. A versão vigente e sua data ficam disponíveis nesta página. Mudanças que exijam nova autorização para tratamento de dados serão submetidas ao titular quando aplicável; o uso da plataforma não substitui consentimento específico.</p>
            </section>

            <section id="privacidade">
              <h2>Política de Privacidade</h2>
              <h3>Dados utilizados</h3>
              <p>Os dados tratados dependem das funcionalidades usadas e das informações fornecidas:</p>
              <ul>
                <li><strong>Cadastro e identificação:</strong> nome, telefone, credenciais de acesso e data de nascimento, quando solicitada no cadastro.</li>
                <li><strong>Entrega:</strong> endereço, complemento, referências e coordenadas associadas à localização do endereço, quando disponíveis.</li>
                <li><strong>Pedidos:</strong> produtos escolhidos, quantidades, observações, valores, forma de pagamento selecionada e histórico de atendimento.</li>
                <li><strong>Navegação e suporte:</strong> informações técnicas necessárias ao funcionamento do serviço e dados enviados nas solicitações de atendimento.</li>
                <li><strong>Marketing opcional:</strong> eventos de navegação e de compra quando houver integração habilitada pelo estabelecimento e autorização para cookies opcionais.</li>
              </ul>
              <p>Evite incluir informações sensíveis nas observações de pedidos ou mensagens quando não forem necessárias ao atendimento.</p>

              <h3>Finalidades e fundamentos</h3>
              <p>Usamos informações para viabilizar cadastros e pedidos, comunicar seu andamento, apoiar entregas e prestar suporte. Conforme a finalidade, o tratamento se fundamenta na execução de contrato ou em procedimentos solicitados por você, em obrigações legais ou no exercício de direitos. Segurança e prevenção de abuso podem se apoiar em legítimo interesse, mediante avaliação dos direitos do titular. Marketing opcional depende de consentimento.</p>

              <h3>Estabelecimentos e compartilhamento</h3>
              <p>O estabelecimento recebe os dados necessários para atender seu pedido. Serviços envolvidos na operação, como infraestrutura, localização de endereços e entrega, podem tratar os dados necessários às respectivas atividades. Dados também podem ser apresentados a autoridades quando existir obrigação legal.</p>
              <p>O estabelecimento decide sobre o tratamento relacionado às suas vendas e ao relacionamento com seus clientes. A FlyFoods trata dados para fornecer a plataforma e, quando atua em nome do estabelecimento, segue as instruções aplicáveis. Solicitações podem ser direcionadas ao nosso contato para identificação do responsável pelo atendimento.</p>
              <p>Quando autorizado e habilitado pelo estabelecimento, o Meta Pixel envia eventos à Meta para mensuração de campanhas. Fornecedores com infraestrutura fora do Brasil podem envolver transferência internacional de dados, que deve observar os requisitos legais aplicáveis.</p>

              <h3>Conservação e segurança</h3>
              <p>Os dados são mantidos pelo tempo necessário às finalidades descritas, ao atendimento de obrigações legais e ao exercício de direitos. O prazo depende do tipo de dado e do contexto do pedido ou cadastro. Ao solicitar exclusão, você será informado sobre eventual necessidade de conservação.</p>
              <p>A proteção de dados exige medidas técnicas e administrativas proporcionais ao tratamento. Nenhum serviço digital é isento de riscos. Caso perceba acesso indevido ou exposição de informações, entre em contato para que a situação seja apurada.</p>
            </section>

            <section id="cookies">
              <h2>Cookies e armazenamento no navegador</h2>
              <p>A aplicação utiliza cookies de autenticação e armazenamento local para manter informações do carrinho, preferências e a escolha sobre cookies opcionais. Esses recursos permitem dar continuidade à navegação e aos pedidos.</p>
              <p>Nos cardápios com recursos de marketing, o aviso de cookies permite aceitar ou recusar cookies opcionais. O Meta Pixel é ativado quando há consentimento e a integração está habilitada pelo estabelecimento.</p>
              <p>Você pode remover cookies e dados locais nas configurações do navegador. Isso pode encerrar sessões e apagar o carrinho e preferências salvas. Para revogar consentimento ou esclarecer o tratamento de marketing, utilize o contato abaixo. A revogação não altera a validade do tratamento anterior.</p>
            </section>

            <section id="seus-direitos">
              <h2>Seus direitos</h2>
              <p>Nos termos da Lei Geral de Proteção de Dados Pessoais (LGPD), você pode solicitar confirmação de tratamento, acesso e correção de dados; informações sobre compartilhamento; portabilidade nos termos da regulamentação; anonimização, bloqueio ou eliminação de dados desnecessários ou tratados irregularmente; e eliminação de dados tratados com consentimento, observadas as hipóteses legais de conservação.</p>
              <p>Também pode revogar consentimento, conhecer as consequências de não fornecê-lo, opor-se ao tratamento em caso de descumprimento da lei e solicitar revisão de decisões tomadas exclusivamente por tratamento automatizado que afetem seus interesses. É possível apresentar petição à Autoridade Nacional de Proteção de Dados.</p>
              <p>Envie sua solicitação ao e-mail abaixo, indicando o estabelecimento e o pedido ou cadastro relacionado, quando possível. Poderemos pedir informações estritamente necessárias para confirmar sua identidade e proteger seus dados.</p>
            </section>

            <section id="contato">
              <h2>Contato e solicitações de privacidade</h2>
              <p>Para dúvidas sobre estas diretrizes, acesso, correção ou exclusão de dados e demais solicitações de privacidade:</p>
              <a className={styles.contact} href={`mailto:${email}`}>{email}</a>
              <p>Para problemas com produtos, preparo ou entrega, utilize também o canal do estabelecimento que recebeu seu pedido.</p>
            </section>

            <footer className={styles.footer}>
              <p>Referências legais: <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm">LGPD</a> e <a href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm">Código de Defesa do Consumidor</a>.</p>
              <a href="#conteudo">Voltar ao início</a>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}
