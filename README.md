# AMGSK Agency: site

Site institucional da AMGSK Agency (Amagasaki Agency), agência de marketing digital, tráfego pago e criação de sites. **Acendemos marcas.**

Domínio: [amagasakiagency.com.br](https://amagasakiagency.com.br)

## Pastas

| Pasta | O que tem |
|---|---|
| `site/` | Os arquivos-fonte. É aqui que se edita texto, foto ou estilo. |
| `dist/` | A versão pronta para hospedar, gerada a partir de `site/`. É o conteúdo desta pasta que vai para a raiz da hospedagem. |

Dentro de `site/`:

- `index.html`: a página inicial (textos, estilos e animações num arquivo só)
- `privacidade.html` e `termos.html`: Política de Privacidade e Termos de Uso
- `legal.css`: estilo das páginas legais
- `assets/`: fotos da recepção e da equipe
- `favicon.svg`, `apple-touch-icon.png`, `og.png`: ícones e imagem de compartilhamento
- `og.html` e `touch.html`: modelos usados para gerar `og.png` e `apple-touch-icon.png`
- `build.mjs`: gera a pasta `dist/`

## Como atualizar o site

1. Edite os arquivos em `site/`.
2. Gere a versão final (precisa do [Node.js](https://nodejs.org) 18 ou mais recente):

   ```bash
   cd site
   node build.mjs https://amagasakiagency.com.br
   ```

3. Suba o conteúdo de `dist/` para a hospedagem.

O build:

- monta o `<head>` com título, descrição, Open Graph, link canônico e dados estruturados (schema.org)
- baixa as fontes (Jost e Instrument Sans) e serve do próprio domínio, sem chamar o Google ao abrir a página
- gera `robots.txt`, `sitemap.xml` e `llms.txt` (resumo para buscadores com IA)

## Cookies e ferramentas de medição

O site já tem aviso de cookies conforme a LGPD. Nenhuma ferramenta opcional carrega sem o "sim" do visitante.
Para ativar o Google Analytics ou o Pixel da Meta, preencha `GA4_ID` e `META_PIXEL_ID` no script de `site/index.html` e gere o build de novo.

## Contato

- WhatsApp: [(61) 99344-0990](https://wa.me/5561993440990)
- Instagram: [@amagasaki.agency](https://www.instagram.com/amagasaki.agency/)
