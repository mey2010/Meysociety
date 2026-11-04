# MEY-

- `web/` — web de Mey Society (Next.js + TypeScript + Tailwind + shadcn). Ver `web/README.md`.
- `docs/` — storyboard, validación geográfica y estrategia legal de paquetes.
- `open-generative-ai/` — estudio de generación de imagen y vídeo con IA (fork de [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI), MIT). Ver `open-generative-ai/README.md`.
- `tools/` — utilidades de desarrollo en Python (`camera_path.py`: analiza el vuelo de cámara con Numba).
- `.claude/skills/` — skills de Claude Code del proyecto, incluidas las 11 `trader-*` de [Jakeschincariol/trader-skill](https://github.com/Jakeschincariol/trader-skill) (MIT). Necesitan `SEC_USER_AGENT="Nombre email"` o `trader/config.json`; `trader/` no se sube al repo.

## Open-Generative-AI

Importado con `git subtree` desde `mey202020/Open-Generative-AI`. Sus submódulos (`open-generative-ai/packages/*`) se descargan con:

```bash
git submodule update --init
```

Para traer cambios nuevos del original:

```bash
git subtree pull --prefix=open-generative-ai --squash https://github.com/Anil-matcha/Open-Generative-AI.git main
```
