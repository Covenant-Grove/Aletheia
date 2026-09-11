import React, { useEffect, useState } from 'react';
import { AletheiaIcon, Button, Modal } from '@aletheia/ui';
import type { PedagogicalModelCatalogEntryDto } from '@aletheia/contracts';

export interface TemplateModalProps {
  isOpen: boolean;
  familyId: string;
  onClose: () => void;
  onApply: (template: string) => Promise<void>;
}

// Catalog entries have no per-model icon field (issue #96 Fase 0 didn't
// add one, and adding one just for this would be scope creep for this
// slice) -- every catalog-driven option renders with the same generic
// icon rather than inventing an icon name that isn't registered in
// @aletheia/ui.
const CATALOG_ICON = 'graduation-cap';

export function TemplateModal({ isOpen, familyId, onClose, onApply }: TemplateModalProps) {
  const [templates, setTemplates] = useState<PedagogicalModelCatalogEntryDto[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoadingCatalog(true);
    fetch(`/api/v1/families/${familyId}/curriculum/templates/catalog`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PedagogicalModelCatalogEntryDto[]) => {
        if (cancelled) return;
        setTemplates(data);
        setSelectedTemplate((current) => current || data[0]?.code || '');
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setLoading(true);
    try {
      await onApply(selectedTemplate);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aplicar Modelo Pedagógico"
      description="Escolha uma abordagem para gerar disciplinas sugeridas e objetivos de aprendizagem iniciais."
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="template-form"
            data-testid="apply-template-btn"
            isLoading={loading}
            disabled={!selectedTemplate}
          >
            Aplicar Modelo
          </Button>
        </>
      }
    >
      <form id="template-form" onSubmit={handleSubmit}>
        {loadingCatalog ? (
          <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Carregando modelos disponíveis...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Nenhum modelo pedagógico publicado está disponível no momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {templates.map((t) => (
              <label
                key={t.code}
                data-testid={`template-option-${t.code}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedTemplate === t.code ? 'var(--forest)' : 'var(--border-light)'}`,
                  backgroundColor: selectedTemplate === t.code ? 'var(--color-indigo-50)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="pedagogical-template"
                  value={t.code}
                  checked={selectedTemplate === t.code}
                  onChange={() => setSelectedTemplate(t.code)}
                  style={{ marginTop: '0.25rem' }}
                />
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>
                      <AletheiaIcon name={CATALOG_ICON} size={18} style={{ color: 'var(--color-indigo-700)' }} />
                    </span>
                    <span>{t.name}</span>
                  </div>
                  {t.description ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {t.description}
                    </div>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
        )}
      </form>
    </Modal>
  );
}
