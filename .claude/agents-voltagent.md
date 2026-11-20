# Subagentes de VoltAgent

Origen: https://github.com/VoltAgent/awesome-claude-code-subagents (commit ed74d11, licencia MIT en `agents/LICENSE-voltagent`).

Hay 49 de 166, elegidos para este repo. Todos usan el modelo de la sesión (`model: inherit`).
Cada agente añade su descripción al prompt de todas las sesiones, por eso no están todos.

| Área | Agentes |
|---|---|
| Web (`web/`, Next.js + TS) | nextjs-developer, react-specialist, typescript-pro, javascript-pro, frontend-developer, fullstack-developer, backend-developer, api-designer, ui-designer, design-bridge, deployment-engineer, payment-integration |
| Python / C# (`tools/`, cBot GoldShield) | python-pro, csharp-developer, sql-pro |
| Trading (`trading/`) | quant-analyst, risk-manager, fintech-engineer, data-analyst, data-scientist |
| Calidad | code-reviewer, debugger, test-automator, performance-engineer, security-auditor, accessibility-tester, ui-ux-tester, refactoring-specialist, documentation-engineer |
| IA (`concierge/`, `open-generative-ai/`) | ai-engineer, llm-architect, prompt-engineer, mcp-developer, motion-director |
| Negocio y marketing | product-manager, content-marketer, landing-page-copywriter, growth-loops, ux-researcher, ux-microcopy-reviewer, legal-advisor, gdpr-ccpa-compliance |
| Investigación | market-researcher, competitive-analyst, research-analyst, trend-analyst, project-idea-validator, ab-test-analysis, first-principles-thinking |

## Añadir otro o actualizar

```bash
git clone --depth 1 https://github.com/VoltAgent/awesome-claude-code-subagents /tmp/va
cp /tmp/va/categories/*/<nombre>.md .claude/agents/
sed -i 's/^model: \(sonnet\|haiku\)$/model: inherit/' .claude/agents/<nombre>.md
```
