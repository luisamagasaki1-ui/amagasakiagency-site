// Gera a versão para hospedagem em ../dist
// Uso: node build.mjs https://seudominio.com.br
// Sem o domínio, gera tudo menos as URLs absolutas (canonical, og:url, sitemap).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, "..", "dist");
const SITE = (process.argv[2] || "").replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const abs = (p) => (SITE ? `${SITE}/${p}` : p);

const TITLE = "AMGSK Agency | Marketing digital, tráfego pago e criação de sites";
const DESC = "Agência de marketing digital, tráfego pago e criação de sites. A AMGSK ajuda empresas que fazem um bom trabalho a serem vistas. Fale no WhatsApp.";
const FONTS_URL = "https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap";

const faq = [
  ["O que a AMGSK faz?", "A AMGSK Agency é uma agência de marketing digital. Trabalhamos com três serviços: tráfego pago (anúncios no Instagram, Facebook e Google), marketing digital (estratégia, posicionamento e conteúdo para redes sociais) e criação de sites e landing pages."],
  ["Para que tipo de empresa vocês trabalham?", "Para empresas que já fazem um bom trabalho e querem ser vistas por mais clientes: comércios, prestadores de serviço e negócios que dependem de atrair gente nova todo mês."],
  ["Preciso contratar os três serviços?", "Não. Cada serviço funciona sozinho. Depois do diagnóstico, indicamos o que faz mais sentido para o seu momento, e você escolhe."],
  ["Quanto custa?", "Depende do objetivo e do tamanho do projeto. Primeiro fazemos o diagnóstico da sua marca e depois enviamos uma proposta com escopo e valor, sem compromisso."],
  ["Como faço para começar?", "Chame a gente no WhatsApp (61) 99344-0990 ou preencha o formulário do site. Respondemos com um primeiro olhar sobre a sua marca e marcamos uma conversa."],
];

const org = {
  "@type": ["Organization", "ProfessionalService"],
  "@id": abs("#agencia"),
  name: "AMGSK Agency",
  alternateName: ["AMGSK", "Amagasaki Agency"],
  description: "Agência de marketing digital, tráfego pago e criação de sites para empresas que fazem um bom trabalho e ainda não são vistas.",
  slogan: "Acendemos marcas.",
  logo: abs("favicon.svg"),
  image: abs("og.png"),
  telephone: "+55 61 99344-0990",
  sameAs: ["https://www.instagram.com/amagasaki.agency/"],
  contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", telephone: "+55 61 99344-0990", availableLanguage: ["pt-BR"], url: "https://wa.me/5561993440990" }],
  knowsAbout: ["Marketing digital", "Tráfego pago", "Anúncios no Instagram", "Anúncios no Facebook", "Google Ads", "Criação de sites", "Landing pages", "Estratégia de conteúdo"],
  founder: [
    { "@type": "Person", name: "Luís", jobTitle: "CEO e Diretor Estratégico" },
    { "@type": "Person", name: "Arthur", jobTitle: "Diretor Comercial" },
    { "@type": "Person", name: "Vitor", jobTitle: "Diretor Audiovisual" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog", name: "Serviços da AMGSK",
    itemListElement: [
      ["Tráfego pago", "Anúncios no Instagram, no Facebook e no Google, mostrados para quem tem chance real de comprar."],
      ["Marketing digital", "Estratégia, posicionamento e conteúdo com cara de marca para redes sociais."],
      ["Criação de sites", "Sites e landing pages rápidos, bonitos e feitos para vender."],
    ].map(([n, d]) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n, description: d, provider: { "@id": abs("#agencia") } } })),
  },
};
if (SITE) org.url = SITE + "/";
const ld = {
  "@context": "https://schema.org",
  "@graph": [
    org,
    Object.assign({ "@type": "WebSite", name: "AMGSK Agency", inLanguage: "pt-BR", publisher: { "@id": abs("#agencia") } }, SITE ? { url: SITE + "/" } : {}),
    { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ],
};

async function selfHostFonts() {
  // baixa os arquivos .woff2 (latim) do Google Fonts e serve do próprio domínio: nenhum dado do visitante vai ao Google
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  let css = await (await fetch(FONTS_URL, { headers: { "User-Agent": ua } })).text();
  const blocks = css.split("}").filter((b) => b.includes("@font-face"));
  const keep = blocks.filter((b) => /\/\* (latin|latin-ext) \*\//.test(b));
  await fs.mkdir(path.join(dist, "fonts"), { recursive: true });
  let out = "";
  const seen = new Map(); // fontes variáveis: o mesmo arquivo serve vários pesos
  for (let b of keep) {
    const url = b.match(/url\((https:[^)]+)\)/)[1];
    if (!seen.has(url)) {
      const fam = /Jost/.test(b) ? "jost" : "instrument-sans";
      const sub = /latin-ext/.test(b) ? "latin-ext" : "latin";
      const name = `${fam}-${sub}.woff2`;
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      await fs.writeFile(path.join(dist, "fonts", name), buf);
      seen.set(url, name);
    }
    out += b.replace(url, `fonts/${seen.get(url)}`) + "}\n";
  }
  await fs.writeFile(path.join(dist, "fonts.css"), out);
}

function headCommon(extra = "") {
  return [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    extra,
    '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
    '<link rel="preload" href="fonts.css" as="style">',
    '<link rel="stylesheet" href="fonts.css">',
  ].join("\n");
}

async function buildIndex() {
  const src = await fs.readFile(path.join(here, "index.html"), "utf8");
  const styleStart = src.indexOf("<style>");
  const styleEnd = src.indexOf("</style>") + "</style>".length;
  const style = src.slice(styleStart, styleEnd);
  const body = src.slice(styleEnd);
  const seo = [
    `<title>${TITLE}</title>`,
    `<meta name="description" content="${DESC}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    '<meta name="theme-color" content="#F4F1EA">',
    '<meta name="author" content="AMGSK Agency">',
    SITE ? `<link rel="canonical" href="${SITE}/">` : "",
    SITE ? `<link rel="alternate" hreflang="pt-BR" href="${SITE}/">` : "",
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="pt_BR">',
    '<meta property="og:site_name" content="AMGSK Agency">',
    `<meta property="og:title" content="AMGSK Agency: acendemos marcas">`,
    `<meta property="og:description" content="${DESC}">`,
    `<meta property="og:image" content="${abs("og.png")}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="AMGSK Agency: acendemos marcas. Marketing digital, tráfego pago e criação de sites.">',
    SITE ? `<meta property="og:url" content="${SITE}/">` : "",
    '<meta name="twitter:card" content="summary_large_image">',
    '<link rel="preload" href="assets/amagasaki-motion-poster.jpg" as="image" fetchpriority="high">',
    `<script type="application/ld+json">${JSON.stringify(ld)}</script>`,
  ].filter(Boolean).join("\n");
  const html = `<!doctype html>\n<html lang="pt-BR">\n<head>\n${headCommon(seo)}\n${style}\n</head>\n<body>${body}\n</body>\n</html>\n`;
  await fs.writeFile(path.join(dist, "index.html"), html);
}

async function buildLegal(name) {
  let html = await fs.readFile(path.join(here, name), "utf8");
  html = html
    .replace(/<link rel="preconnect"[^>]*>\n/g, "")
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts.css">')
    .replace('<link rel="icon" href="favicon.svg" type="image/svg+xml">', '<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="apple-touch-icon.png">' + (SITE ? `\n<link rel="canonical" href="${SITE}/${name}">` : ""));
  await fs.writeFile(path.join(dist, name), html);
}

async function main() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(path.join(dist, "assets"), { recursive: true });
  for (const f of ["escritorio.webp", "luis.jpg", "arthur.jpg", "vitor.jpg", "amagasaki-motion.mp4", "amagasaki-motion-poster.jpg"]) await fs.copyFile(path.join(here, "assets", f), path.join(dist, "assets", f));
  for (const f of ["favicon.svg", "legal.css", "og.png", "apple-touch-icon.png"]) {
    try { await fs.copyFile(path.join(here, f), path.join(dist, f)); } catch { console.warn("faltando:", f); }
  }
  await selfHostFonts();
  await buildIndex();
  await buildLegal("privacidade.html");
  await buildLegal("termos.html");

  // domínio próprio no GitHub Pages
  if (SITE) await fs.writeFile(path.join(dist, "CNAME"), new URL(SITE).hostname + "\n");

  const pages = [["", "1.0"], ["privacidade.html", "0.3"], ["termos.html", "0.3"]];
  await fs.writeFile(path.join(dist, "robots.txt"),
    "User-agent: *\nAllow: /\n" + (SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ""));
  if (SITE) {
    await fs.writeFile(path.join(dist, "sitemap.xml"),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      pages.map(([p, pr]) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join("\n") +
      "\n</urlset>\n");
  }
  // GEO: resumo em texto simples para buscadores com IA (ChatGPT, Perplexity, Gemini, Claude)
  // BOM no início: hospedagens que não informam o charset de .txt ainda mostram os acentos certos
  await fs.writeFile(path.join(dist, "llms.txt"), `﻿# AMGSK Agency

> AMGSK Agency (também chamada de Amagasaki Agency) é uma agência brasileira de marketing digital, tráfego pago e criação de sites. Ajuda empresas que fazem um bom trabalho, mas ainda não são notadas, a serem vistas por mais clientes. Slogan: "Acendemos marcas."

## Serviços
- Tráfego pago: anúncios no Instagram, no Facebook e no Google, mostrados para quem tem chance real de comprar.
- Marketing digital: estratégia, posicionamento e conteúdo com cara de marca para redes sociais.
- Criação de sites: sites e landing pages rápidos, bonitos e feitos para vender.

## Como trabalha
1. Diagnóstico: analisa perfil, anúncios e site do cliente do jeito que o consumidor vê.
2. Plano: define com quem falar, o que dizer e onde aparecer, combinado antes de investir.
3. Execução: cria, publica, anuncia e ajusta conforme a resposta do público.

## Equipe
- Luís: CEO e Diretor Estratégico
- Arthur: Diretor Comercial
- Vitor: Diretor Audiovisual

## Contato
- WhatsApp: +55 61 99344-0990 (https://wa.me/5561993440990)
- Instagram: @amagasaki.agency (https://www.instagram.com/amagasaki.agency/)

## Perguntas frequentes
${faq.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}

## Páginas
- [Início](${abs("")})
- [Política de Privacidade](${abs("privacidade.html")})
- [Termos de Uso](${abs("termos.html")})
`);
  console.log("dist pronto" + (SITE ? ` para ${SITE}` : " (sem domínio: canonical, og:url e sitemap ficaram de fora)"));
}
main().catch((e) => { console.error(e); process.exit(1); });
