# Herramientas instaladas para trabajar en Mey Society

Todo lo que se fue instalando en las sesiones de Claude Code queda aquí, para que cualquier sesión nueva sobre
`mey2010/Meysociety` lo tenga desde el primer momento.

## Skills (en `.claude/skills/`)
Claude Code carga solas las skills de la carpeta `.claude/skills` del repositorio.

| Grupo | Para qué | Ejemplos |
|---|---|---|
| Diseño y animación | interfaz, animaciones, páginas con scroll | `scroll-craft`, `design`, `animate`, `apple-design`, `ui-ux-pro-max`, `unslop` |
| SEO (claude-seo v2.6.0) | auditorías, schema, local, GEO/IA, sitemap | `seo`, `seo-audit`, `seo-local`, `seo-schema`, `seo-geo`… |
| Marketing (marketingskills) | copy, ofertas, CRO, emails, referidos, anuncios | `copywriting`, `offers`, `cro`, `referrals`, `ads`, `marketing-ideas`… |
| Instagram | reels, captions, carruseles, DMs, plan semanal | `ig-reel`, `ig-caption`, `ig-carousel`, `ig-plan`… |
| Superpowers | método de trabajo: planes, depuración, revisión | `brainstorming`, `writing-plans`, `systematic-debugging`… |
| Agent Reach | leer redes y webs (Instagram, YouTube, Reddit…) | `agent-reach` (necesita su programa, ver abajo) |
| Trading | herramientas de análisis (no forman parte de la web) | `trader-*` |

Se han copiado sin las carpetas pesadas que se regeneran solas (entornos de Python y navegadores):
la skill `seo` vuelve a instalar sus dependencias la primera vez que se usa.

## Programas que instala el entorno «Mey Society (IGN)»
El entorno de Claude Code en la nube tiene un script de arranque que instala, en cada sesión nueva:
- **rtk v0.49.0**: compacta la salida de los comandos para ahorrar tokens, con su enganche (`rtk hook claude`).
- **Agent Reach v1.6.1**: el lector de redes sociales que usa la skill `agent-reach`.
- Las mismas skills de arriba, en la carpeta personal de Claude.

Si abres una sesión con otro entorno, las skills de este repositorio funcionan igual; rtk y Agent Reach
solo están en el entorno «Mey Society (IGN)», que además tiene permitido el acceso a las fotos aéreas del IGN.
