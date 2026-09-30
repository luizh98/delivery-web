# LP de links por tenant

`/` continua o cardápio. `/links` aparece apenas quando `public/landing-pages/<slug>/config.json` é válido. Slug deve coincidir com o subdomínio do restaurante. A LP usa arquivos públicos, sem consulta ao backend. Mudanças exigem novo build e publicação autorizada.

## Adicionar tenant

1. Crie `public/landing-pages/<slug>/` com `config.json`, logo, hero mobile e hero desktop. Imagem social é opcional. Use nomes versionados como `hero-mobile.v1.webp`; mudar imagem exige mudar nome para renovar cache.
2. Preencha textos, cores e URLs finais aprovados. `config.json` é acessível publicamente; mantenha apenas dados públicos.
3. Informe dimensões reais de cada imagem. Limites: hero mobile 150 KB; logo + hero mobile 250 KB; logo 100 KB; hero desktop 500 KB; social 250 KB. Formatos: WebP, AVIF e PNG. Links externos exigem HTTPS. Cores de texto e destaque precisam de contraste 4,5:1 com o fundo.
4. Rode `npm run validate:landing-pages`, `npm test` e `npm run build`. Confira `/links` no host do tenant e `/` diretamente. `node scripts/landing-fixtures.mjs setup` cria fixtures temporárias para testes; rode `cleanup` depois.
5. Revise visual mobile/desktop, links e metadados. Publique somente com autorização.

## Exemplo de `config.json`

Troque todos os valores de exemplo por conteúdo real antes de incluir cliente.

```json
{
  "schemaVersion": 1,
  "tenantSlug": "restaurante-exemplo",
  "name": "Restaurante Exemplo",
  "headline": "Peça seu favorito",
  "description": "Cardápio, localização e contato.",
  "logo": { "file": "logo.v1.webp", "width": 128, "height": 128 },
  "heroMobile": { "file": "hero-mobile.v1.webp", "width": 720, "height": 900 },
  "heroDesktop": { "file": "hero-desktop.v1.webp", "width": 1200, "height": 900 },
  "heroAlt": "Prato servido pelo Restaurante Exemplo",
  "colors": { "background": "#FFFFFF", "foreground": "#202124", "accent": "#0F766E" },
  "menuLabel": "Ver cardápio",
  "addressText": "Rua Exemplo, 123 · Cidade, SP",
  "mapsUrl": "https://maps.example.com/restaurante",
  "whatsappUrl": "https://wa.me/5511999999999",
  "systemUrl": "https://flyfoods.com.br/",
  "extraLinks": [],
  "seo": {
    "title": "Restaurante Exemplo | links",
    "description": "Acesse o cardápio e veja como chegar.",
    "image": { "file": "social.v1.webp", "width": 1200, "height": 630 }
  }
}
```

`addressText`, `mapsUrl`, `whatsappUrl`, `systemUrl` e `seo.image` são opcionais. Sem esses campos, texto e botões opcionais somem; hero mobile ocupa a imagem social padrão. `extraLinks` aceita até três itens. Botão de cardápio aponta para `/` no mesmo host e preserva apenas UTMs permitidas.
