// Hooks de validação do Claude Code (js-mygoals-be).
// Uso: node .claude/hooks/check.mjs post-edit | stop
// Exit 2 + stderr => o Claude recebe a mensagem e corrige.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', '..');
const SRC = path.join(ROOT, 'src');
const CODE = /\.ts$/;

const CMD = {
  lint: (f) => `npx eslint "${f}"`,
  tests: (f) => `npx jest --findRelatedTests "${f}" --passWithNoTests --silent`,
  typecheck: 'npx tsc -p tsconfig.json --noEmit',
};

function run(cmd) {
  const r = spawnSync(cmd, { cwd: ROOT, shell: true, encoding: 'utf8', env: { ...process.env, CI: '1', FORCE_COLOR: '0' } });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

const tail = (s, n = 60) => s.split(/\r?\n/).slice(-n).join('\n');

function fail(title, sections) {
  process.stderr.write(`${title}\n\n${sections.map(([name, out]) => `### ${name}\n${tail(out)}`).join('\n\n')}\n`);
  process.exit(2);
}

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* sem stdin */ }

const mode = process.argv[2];

if (mode === 'post-edit') {
  const raw = input.tool_input?.file_path ?? input.tool_response?.filePath;
  if (!raw) process.exit(0);
  const file = path.resolve(raw);
  if (!CODE.test(file) || !file.toLowerCase().startsWith(SRC.toLowerCase() + path.sep)) process.exit(0);

  const rel = path.relative(ROOT, file);
  const lint = run(CMD.lint(rel));
  const tests = run(CMD.tests(rel));
  const failed = [];
  if (!lint.ok) failed.push(['ESLint', lint.out]);
  if (!tests.ok) failed.push(['Testes relacionados (jest --findRelatedTests)', tests.out]);
  if (failed.length) fail(`Validação falhou após editar ${rel}. Corrija antes de seguir:`, failed);
  process.exit(0);
}

if (mode === 'stop') {
  if (input.stop_hook_active) process.exit(0); // evita loop
  const status = run('git status --porcelain');
  const touched = status.out.split(/\r?\n/).some((l) => CODE.test(l.trim()));
  if (!touched) process.exit(0);
  const tc = run(CMD.typecheck);
  if (!tc.ok) fail('Typecheck (tsc --noEmit) falhou. Corrija os erros de tipo antes de encerrar:', [['tsc', tc.out]]);
  process.exit(0);
}
