import type { PedagogicalFramework, TemplateSubjectDefinition } from '@aletheia/contracts';
import { CurriculumTemplateEngine } from './curriculum-template.engine.js';

// --- Fase 0 seed data for pedagogical_model_definitions (issue #96) ---
//
// Deliberately reuses `CurriculumTemplateEngine.getTemplateDefinitions()` --
// the exact same Portuguese content PR #94 wrote -- as the source of each
// row's `metadata.subjects`, instead of retyping it. This both avoids
// drift between the old switch-case and the new data rows, and makes the
// equivalence proof (pedagogical-model-definition.integration-spec.ts)
// close to definitional: the seed *is* a call to the old engine, and the
// new resolver is checked to round-trip it losslessly through Postgres.
//
// `CUSTOM` has no template content of its own in the old engine (it falls
// through to TRADITIONAL) — it is intentionally not seeded as its own row
// here; the framework name/description below stand in for what the old
// switch-case comment described for each case.
const FRAMEWORK_METADATA: Record<Exclude<PedagogicalFramework, 'CUSTOM'>, { name: string; description: string }> = {
  CLASSICAL_TRIVIUM: {
    name: 'Educação Clássica (Trivium)',
    description: 'Gramática, lógica e retórica como progressão formativa, com ênfase em línguas clássicas, história ocidental e literatura.',
  },
  CHARLOTTE_MASON: {
    name: 'Charlotte Mason',
    description: 'Livros vivos, narração, estudo da natureza e formação de hábitos e caráter.',
  },
  TRADITIONAL: {
    name: 'Escolar Tradicional',
    description: 'Disciplinas escolares convencionais (Português, Matemática, História, Geografia, Ciências) em sequência estruturada.',
  },
  UNIT_STUDIES: {
    name: 'Unit Studies',
    description: 'Um tema central explorado de forma interdisciplinar, ancorando literatura, matemática, ciências e história.',
  },
  MONTESSORI: {
    name: 'Montessori',
    description: 'Vida prática, educação sensorial e materiais concretos, partindo da autonomia e da experiência direta da criança.',
  },
  PROJECT_BASED: {
    name: 'Aprendizagem Baseada em Projetos',
    description: 'Um projeto real e significativo conduz o aprendizado, do planejamento à entrega final.',
  },
  GUIDED_UNSCHOOLING: {
    name: 'Unschooling Guiado',
    description: 'Interesses do aluno como eixo do aprendizado, com mediação e acompanhamento ativo dos pais.',
  },
  ECLECTIC: {
    name: 'Eclético',
    description: 'Combinação livre de abordagens e métodos, ajustada ao que melhor funciona para o aluno.',
  },
};

export interface PedagogicalModelDefinitionSeedRow {
  code: Exclude<PedagogicalFramework, 'CUSTOM'>;
  name: string;
  description: string;
  subjects: TemplateSubjectDefinition[];
}

export function buildPedagogicalModelDefinitionSeedRows(
  engine: CurriculumTemplateEngine = new CurriculumTemplateEngine(),
): PedagogicalModelDefinitionSeedRow[] {
  return (Object.keys(FRAMEWORK_METADATA) as (keyof typeof FRAMEWORK_METADATA)[]).map((code) => ({
    code,
    name: FRAMEWORK_METADATA[code].name,
    description: FRAMEWORK_METADATA[code].description,
    subjects: engine.getTemplateDefinitions(code),
  }));
}
