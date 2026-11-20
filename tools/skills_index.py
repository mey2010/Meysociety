"""Regenera .claude/skills/INDEX.md: todas las skills del proyecto agrupadas por tema."""
import os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', '.claude', 'skills')
VERCEL = set('access-protected-vercel-deployment ai-gateway ai-sdk auth bootstrap build-agents cdn-caching chat-sdk create-a-backend deployments-cicd env-vars eve flags-sdk knowledge-update marketplace microfrontends next-cache-components next-forge next-upgrade nextjs react-best-practices routing-middleware runtime-cache shadcn turbopack vercel-agent vercel-cli vercel-connect vercel-firewall vercel-functions vercel-sandbox vercel-services vercel-storage verification workflow'.split())
DESIGN = set('3d-brain animate animate-expo animation-performance animation-vocabulary apple-design ask-sonner audit banner-design brand break-ui design design-system design-taste-frontend emil-design-eng find-animation-opportunities improve-animations mobile-native onboard pick-ui-library prototype remove-animations review-animations scroll-craft scroll-world slides ui-styling ui-ux-pro-max unslop impeccable accessibility-review design-critique design-handoff design-design-system research-synthesis user-research ux-copy level-up write-swift image video'.split())
DEV = set('brainstorming diagnosing-superpowers dispatching-parallel-agents executing-plans finishing-a-development-branch receiving-code-review requesting-code-review subagent-driven-development systematic-debugging test-driven-development using-git-worktrees using-superpowers verification-before-completion writing-plans writing-skills karpathy-guidelines grill-me prompt-master session-start-hook skill-creator web-artifacts-builder agent-reach link'.split())
SEO = {'schema', 'programmatic-seo', 'ai-seo', 'site-architecture', 'marketing-seo-audit'}
DOCS = {'docx', 'pdf', 'pptx', 'xlsx'}
ORDER = ['Marketing y crecimiento', 'SEO', 'Instagram', 'Diseño, UI y animación', 'Vercel / Next.js', 'Trading', 'Desarrollo y proceso', 'Documentos']


def group(d):
    if d.startswith('seo') or d in SEO: return 'SEO'
    if d.startswith('ig-'): return 'Instagram'
    if d.startswith('trader-'): return 'Trading'
    if d in VERCEL: return 'Vercel / Next.js'
    if d in DESIGN or d.startswith('gsap'): return 'Diseño, UI y animación'
    if d in DEV or d.startswith('ponytail'): return 'Desarrollo y proceso'
    if d in DOCS: return 'Documentos'
    return 'Marketing y crecimiento'


def description(text):
    m = re.search(r'^description:\s*(.*?)(?=^[\w-]+:|^---)', text, re.S | re.M)
    s = ' '.join(m.group(1).split()).strip('"\'>| ') if m else ''
    return s[:160] + ('…' if len(s) > 160 else '')


groups = {g: [] for g in ORDER}
for d in sorted(os.listdir(ROOT)):
    f = os.path.join(ROOT, d, 'SKILL.md')
    if os.path.isfile(f):
        groups[group(d)].append((d, description(open(f, encoding='utf-8').read())))

total = sum(len(v) for v in groups.values())
out = ['# Índice de skills', '',
       f'Todas las skills del proyecto están aquí, en `.claude/skills/` ({total} en total). Cualquier sesión que abra este repositorio las carga solas.',
       '', 'Para regenerar este archivo: `python3 tools/skills_index.py`.', '']
for g in ORDER:
    out += [f'## {g} ({len(groups[g])})', '', '| Skill | Para qué |', '|---|---|']
    out += [f'| `{d}` | {s.replace("|", "/")} |' for d, s in groups[g]] + ['']
open(os.path.join(ROOT, 'INDEX.md'), 'w', encoding='utf-8').write('\n'.join(out))
print(total, {g: len(v) for g, v in groups.items()})
