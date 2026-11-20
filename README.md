# MEY-

Repositorio único de Mey Society: todo (código, skills, documentación) vive aquí, en la rama `main`.

- `web/` — web de Mey Society (Next.js + TypeScript + Tailwind + shadcn). Ver `web/README.md`.
- `concierge/` — asistente concierge.
- `docs/` — storyboard, validación geográfica, estrategia legal de paquetes y guía de herramientas.
- `design-system/` — sistema de diseño de Mey Society.
- `open-generative-ai/` — estudio de generación de imagen y vídeo con IA (fork de [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI), MIT). Ver `open-generative-ai/README.md`.
- `gta6-vaults/` — playbook de la página de clips GTA 6 Vaults.
- `tools/` — utilidades en Python (`camera_path.py`, `skills_index.py`).
- `.claude/skills/` — **todas** las skills de Claude Code (232), agrupadas por tema en [`.claude/skills/INDEX.md`](.claude/skills/INDEX.md). Cualquier sesión que abra este repo las carga solas. Las `trader-*` necesitan `SEC_USER_AGENT="Nombre email"` o `trader/config.json` (`trader/` no se sube al repo). Al añadir o quitar skills: `python3 tools/skills_index.py`.
- `.claude/settings.json` — marketplace oficial de plugins de Claude.

## Cómo trabajar

- Una sola rama: `main`. Cada sesión de Claude trabaja en su rama temporal y se fusiona en `main` al acabar; la rama temporal se borra.
- Un solo entorno en la nube: **Mey Society**, con este repositorio y toda la red que necesitan las skills.

## Open-Generative-AI

Importado con `git subtree` desde `mey202020/Open-Generative-AI`. Sus submódulos (`open-generative-ai/packages/*`) se descargan con:

```bash
git submodule update --init
```

Para traer cambios nuevos del original:

```bash
git subtree pull --prefix=open-generative-ai --squash https://github.com/Anil-matcha/Open-Generative-AI.git main
```
