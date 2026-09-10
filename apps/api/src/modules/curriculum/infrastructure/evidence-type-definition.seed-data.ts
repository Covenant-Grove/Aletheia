import type { EvidenceTypeMetadata } from '@aletheia/contracts';

// --- Fase 0 seed data for evidence_type_definitions (issue #96 section 9) ---
//
// The base set the issue asks the platform to support at minimum: texto,
// foto, vídeo, áudio, arquivo, certificado, observação. This is a starting
// seed, not a closed list -- new PUBLISHED rows are picked up by anything
// that reads this table generically, no code change required.
export interface EvidenceTypeDefinitionSeedRow {
  code: string;
  name: string;
  description: string;
  metadata: Partial<EvidenceTypeMetadata>;
}

export const BASE_EVIDENCE_TYPE_SEED_ROWS: EvidenceTypeDefinitionSeedRow[] = [
  {
    code: 'TEXT',
    name: 'Texto',
    description: 'Registro escrito -- resposta, reflexão, resenha ou relato produzido pelo aluno.',
    metadata: { requiresValidation: false },
  },
  {
    code: 'PHOTO',
    name: 'Foto',
    description: 'Fotografia de um trabalho, projeto ou momento de aprendizagem.',
    metadata: { acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], requiresValidation: false },
  },
  {
    code: 'VIDEO',
    name: 'Vídeo',
    description: 'Gravação em vídeo de uma apresentação, prática ou demonstração de habilidade.',
    metadata: { acceptedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'], requiresValidation: false },
  },
  {
    code: 'AUDIO',
    name: 'Áudio',
    description: 'Gravação em áudio de uma leitura, execução musical ou explicação oral.',
    metadata: { acceptedMimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/wav'], requiresValidation: false },
  },
  {
    code: 'FILE',
    name: 'Arquivo',
    description: 'Documento genérico -- planilha, PDF, apresentação ou outro arquivo produzido pelo aluno.',
    metadata: { acceptedMimeTypes: ['application/pdf'], requiresValidation: false },
  },
  {
    code: 'CERTIFICATE',
    name: 'Certificado',
    description: 'Certificado ou comprovante emitido por terceiros (curso, competição, avaliação externa).',
    metadata: { acceptedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'], requiresValidation: true },
  },
  {
    code: 'OBSERVATION',
    name: 'Observação',
    description: 'Observação registrada por um responsável ou mentor, sem arquivo anexo.',
    metadata: { requiresValidation: true },
  },
];
