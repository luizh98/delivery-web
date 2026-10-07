import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Termos de uso e PolÃ­tica de Privacidade | FlyFoods",
  description: "ConheÃ§a os termos de uso da FlyFoods, como seus dados sÃ£o utilizados e como exercer seus direitos de privacidade.",
  alternates: { canonical: "https://flyfoods.com.br/politicas-e-diretrizes" },
};

const email = "dev.lhdsantos@gmail.com";

export default function PoliciesPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#conteudo">Ir para o conteÃºdo</a>
      <header className={styles.header}>
        <a className={styles.brand} href="https://flyfoods.com.br">FlyFoods</a>
        <a href={`mailto:${email}`}>Fale conosco</a>
      </header>

      <main id="conteudo" className={styles.main}>
        <div className={styles.intro}>
          <h1>PolÃ­ticas e diretrizes</h1>
          <p>Termos de uso e PolÃ­tica de Privacidade da FlyFoods. Saiba como funciona nossa plataforma e como tratamos seus dados pessoais.</p>
          <p className={styles.updated}>Ãšltima atualizaÃ§Ã£o: <time dateTime="2026-10-07">7 de outubro de 2026</time></p>
        </div>

        <div className={styles.columns}>
          <nav className={styles.navigation} aria-label="Nesta pÃ¡gina">
            <strong>Nesta pÃ¡gina</strong>
            <a href="#responsavel">ResponsÃ¡vel pela plataforma</a>
            <a href="#termos-de-uso">Termos de uso</a>
            <a href="#privacidade">PolÃ­tica de Privacidade</a>
            <a href="#cookies">Cookies e armazenamento</a>
            <a href="#seus-direitos">Seus direitos</a>
            <a href="#contato">Contato</a>
          </nav>

          <article className={styles.content}>
            <section id="responsavel">
              <h2>ResponsÃ¡vel pela plataforma</h2>
              <p>A FlyFoods Ã© uma plataforma de cardÃ¡pio digital e gestÃ£o de pedidos, mantida pela empresa identificada abaixo.</p>
              <dl className={styles.company}>
                <dt>RazÃ£o social</dt>
                <dd>50.661.506 LUIZ HENRIQUE CALCAGNOTO DOS SANTOS</dd>
                <dt>CNPJ</dt>
                <dd>50.661.506/0001-10</dd>
                <dt>E-mail</dt>
                <dd><a href={`mailto:${email}`}>{email}</a></dd>
              </dl>
              <p>Estas diretrizes abrangem a plataforma e os cardÃ¡pios dos estabelecimentos que a utilizam, inclusive em subdomÃ­nios da FlyFoods.</p>
            </section>

            <section id="termos-de-uso">
              <h2>Termos de uso</h2>
              <h3>Uso da plataforma</h3>
              <p>A FlyFoods permite consultar cardÃ¡pios, montar pedidos e acompanhar seu atendimento, conforme os recursos disponibilizados pelo estabelecimento. Os estabelecimentos utilizam a plataforma para administrar produtos, clientes, pedidos e entregas.</p>
              <p>Utilize o serviÃ§o de forma lÃ­cita e forneÃ§a informaÃ§Ãµes corretas, especialmente nome, telefone e endereÃ§o de entrega. Proteja suas credenciais de acesso e avise nosso contato caso identifique uso indevido da sua conta.</p>
              <p>Ã‰ proibido usar a plataforma para fraudes, divulgar conteÃºdo ilegal, acessar contas ou dados de terceiros sem autorizaÃ§Ã£o ou comprometer a seguranÃ§a e o funcionamento do serviÃ§o. Acesso utilizado de forma abusiva pode ser restringido, respeitados os direitos aplicÃ¡veis.</p>

              <h3>Pedidos, preÃ§os e atendimento</h3>
              <p>Cada estabelecimento informa seus produtos, preÃ§os, disponibilidade, taxas, formas de pagamento e condiÃ§Ãµes de entrega ou retirada. Confira os itens, o valor total e seus dados antes de enviar um pedido. O envio deve ser acompanhado da confirmaÃ§Ã£o e do status informados pelo estabelecimento.</p>
              <p>DÃºvidas sobre ingredientes, alergÃªnicos, preparo, entrega ou alteraÃ§Ãµes no pedido devem ser encaminhadas ao estabelecimento pelos canais apresentados no cardÃ¡pio. A FlyFoods fornece a tecnologia da plataforma; o estabelecimento realiza a venda, o preparo e o atendimento do pedido.</p>

              <h3>Cancelamentos, reembolsos e direitos do consumidor</h3>
              <p>Para solicitar cancelamento, correÃ§Ã£o ou reembolso, entre em contato com o estabelecimento e informe o nÃºmero do pedido. A anÃ¡lise deve considerar o andamento do pedido e a legislaÃ§Ã£o aplicÃ¡vel. Estes termos nÃ£o afastam direitos do consumidor nem excluem responsabilidades previstas em lei.</p>

              <h3>Disponibilidade e alteraÃ§Ãµes</h3>
              <p>O serviÃ§o pode passar por manutenÃ§Ã£o ou sofrer interrupÃ§Ãµes tÃ©cnicas. Em caso de falha no envio ou na confirmaÃ§Ã£o, consulte o estabelecimento antes de repetir o pedido, evitando duplicidade.</p>
              <p>Os recursos e estas diretrizes podem ser atualizados. A versÃ£o vigente e sua data ficam disponÃ­veis nesta pÃ¡gina. MudanÃ§as que exijam nova autorizaÃ§Ã£o para tratamento de dados serÃ£o submetidas ao titular quando aplicÃ¡vel; o uso da plataforma nÃ£o substitui consentimento especÃ­fico.</p>
            </section>

            <section id="privacidade">
              <h2>PolÃ­tica de Privacidade</h2>
              <h3>Dados utilizados</h3>
              <p>Os dados tratados dependem das funcionalidades usadas e das informaÃ§Ãµes fornecidas:</p>
              <ul>
                <li><strong>Cadastro e identificaÃ§Ã£o:</strong> nome, telefone, credenciais de acesso e data de nascimento, quando solicitada no cadastro.</li>
                <li><strong>Entrega:</strong> endereÃ§o, complemento, referÃªncias e coordenadas associadas Ã  localizaÃ§Ã£o do endereÃ§o, quando disponÃ­veis.</li>
                <li><strong>Pedidos:</strong> produtos escolhidos, quantidades, observaÃ§Ãµes, valores, forma de pagamento selecionada e histÃ³rico de atendimento.</li>
                <li><strong>NavegaÃ§Ã£o e suporte:</strong> informaÃ§Ãµes tÃ©cnicas necessÃ¡rias ao funcionamento do serviÃ§o e dados enviados nas solicitaÃ§Ãµes de atendimento.</li>
                <li><strong>Marketing opcional:</strong> eventos de navegaÃ§Ã£o e de compra quando houver integraÃ§Ã£o habilitada pelo estabelecimento e autorizaÃ§Ã£o para cookies opcionais.</li>
              </ul>
              <p>Evite incluir informaÃ§Ãµes sensÃ­veis nas observaÃ§Ãµes de pedidos ou mensagens quando nÃ£o forem necessÃ¡rias ao atendimento.</p>

              <h3>Finalidades e fundamentos</h3>
              <p>Usamos informaÃ§Ãµes para viabilizar cadastros e pedidos, comunicar seu andamento, apoiar entregas e prestar suporte. Conforme a finalidade, o tratamento se fundamenta na execuÃ§Ã£o de contrato ou em procedimentos solicitados por vocÃª, em obrigaÃ§Ãµes legais ou no exercÃ­cio de direitos. SeguranÃ§a e prevenÃ§Ã£o de abuso podem se apoiar em legÃ­timo interesse, mediante avaliaÃ§Ã£o dos direitos do titular. Marketing opcional depende de consentimento.</p>

              <h3>Estabelecimentos e compartilhamento</h3>
              <p>O estabelecimento recebe os dados necessÃ¡rios para atender seu pedido. ServiÃ§os envolvidos na operaÃ§Ã£o, como infraestrutura, localizaÃ§Ã£o de endereÃ§os e entrega, podem tratar os dados necessÃ¡rios Ã s respectivas atividades. Dados tambÃ©m podem ser apresentados a autoridades quando existir obrigaÃ§Ã£o legal.</p>
              <p>O estabelecimento decide sobre o tratamento relacionado Ã s suas vendas e ao relacionamento com seus clientes. A FlyFoods trata dados para fornecer a plataforma e, quando atua em nome do estabelecimento, segue as instruÃ§Ãµes aplicÃ¡veis. SolicitaÃ§Ãµes podem ser direcionadas ao nosso contato para identificaÃ§Ã£o do responsÃ¡vel pelo atendimento.</p>
              <p>Quando autorizado e habilitado pelo estabelecimento, o Meta Pixel envia eventos Ã  Meta para mensuraÃ§Ã£o de campanhas. Fornecedores com infraestrutura fora do Brasil podem envolver transferÃªncia internacional de dados, que deve observar os requisitos legais aplicÃ¡veis.</p>

              <h3>ConservaÃ§Ã£o e seguranÃ§a</h3>
              <p>Os dados sÃ£o mantidos pelo tempo necessÃ¡rio Ã s finalidades descritas, ao atendimento de obrigaÃ§Ãµes legais e ao exercÃ­cio de direitos. O prazo depende do tipo de dado e do contexto do pedido ou cadastro. Ao solicitar exclusÃ£o, vocÃª serÃ¡ informado sobre eventual necessidade de conservaÃ§Ã£o.</p>
              <p>A proteÃ§Ã£o de dados exige medidas tÃ©cnicas e administrativas proporcionais ao tratamento. Nenhum serviÃ§o digital Ã© isento de riscos. Caso perceba acesso indevido ou exposiÃ§Ã£o de informaÃ§Ãµes, entre em contato para que a situaÃ§Ã£o seja apurada.</p>
            </section>

            <section id="cookies">
              <h2>Cookies e armazenamento no navegador</h2>
              <p>A aplicaÃ§Ã£o utiliza cookies de autenticaÃ§Ã£o e armazenamento local para manter informaÃ§Ãµes do carrinho, preferÃªncias e a escolha sobre cookies opcionais. Esses recursos permitem dar continuidade Ã  navegaÃ§Ã£o e aos pedidos.</p>
              <p>Nos cardÃ¡pios com recursos de marketing, o aviso de cookies permite aceitar ou recusar cookies opcionais. O Meta Pixel Ã© ativado quando hÃ¡ consentimento e a integraÃ§Ã£o estÃ¡ habilitada pelo estabelecimento.</p>
              <p>VocÃª pode remover cookies e dados locais nas configuraÃ§Ãµes do navegador. Isso pode encerrar sessÃµes e apagar o carrinho e preferÃªncias salvas. Para revogar consentimento ou esclarecer o tratamento de marketing, utilize o contato abaixo. A revogaÃ§Ã£o nÃ£o altera a validade do tratamento anterior.</p>
            </section>

            <section id="seus-direitos">
              <h2>Seus direitos</h2>
              <p>Nos termos da Lei Geral de ProteÃ§Ã£o de Dados Pessoais (LGPD), vocÃª pode solicitar confirmaÃ§Ã£o de tratamento, acesso e correÃ§Ã£o de dados; informaÃ§Ãµes sobre compartilhamento; portabilidade nos termos da regulamentaÃ§Ã£o; anonimizaÃ§Ã£o, bloqueio ou eliminaÃ§Ã£o de dados desnecessÃ¡rios ou tratados irregularmente; e eliminaÃ§Ã£o de dados tratados com consentimento, observadas as hipÃ³teses legais de conservaÃ§Ã£o.</p>
              <p>TambÃ©m pode revogar consentimento, conhecer as consequÃªncias de nÃ£o fornecÃª-lo, opor-se ao tratamento em caso de descumprimento da lei e solicitar revisÃ£o de decisÃµes tomadas exclusivamente por tratamento automatizado que afetem seus interesses. Ã‰ possÃ­vel apresentar petiÃ§Ã£o Ã  Autoridade Nacional de ProteÃ§Ã£o de Dados.</p>
              <p>Envie sua solicitaÃ§Ã£o ao e-mail abaixo, indicando o estabelecimento e o pedido ou cadastro relacionado, quando possÃ­vel. Poderemos pedir informaÃ§Ãµes estritamente necessÃ¡rias para confirmar sua identidade e proteger seus dados.</p>
            </section>

            <section id="contato">
              <h2>Contato e solicitaÃ§Ãµes de privacidade</h2>
              <p>Para dÃºvidas sobre estas diretrizes, acesso, correÃ§Ã£o ou exclusÃ£o de dados e demais solicitaÃ§Ãµes de privacidade:</p>
              <a className={styles.contact} href={`mailto:${email}`}>{email}</a>
              <p>Para problemas com produtos, preparo ou entrega, utilize tambÃ©m o canal do estabelecimento que recebeu seu pedido.</p>
            </section>

            <footer className={styles.footer}>
              <p>ReferÃªncias legais: <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm">LGPD</a> e <a href="https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm">CÃ³digo de Defesa do Consumidor</a>.</p>
              <a href="#conteudo">Voltar ao inÃ­cio</a>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
}
