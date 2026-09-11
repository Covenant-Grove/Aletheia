'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createCompetencyDefinitionSchema, createLearningDomainSchema, createPedagogicalModelDefinitionSchema,
  type CompetencyDefinitionResponseDto, type LearningDomainResponseDto, type PedagogicalModelDefinitionResponseDto,
} from '@aletheia/contracts';
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Select, Textarea } from '@aletheia/ui';
import { api } from '../../lib/api';

const resources = [
  { value: 'learning-domains', label: 'Domínios de aprendizagem' },
  { value: 'competency-definitions', label: 'Competências' },
  { value: 'pedagogical-model-definitions', label: 'Modelos pedagógicos' },
] as const;
type Resource = typeof resources[number]['value'];
type CatalogRow = LearningDomainResponseDto | CompetencyDefinitionResponseDto | PedagogicalModelDefinitionResponseDto;
const basePath = '/admin/curriculum-definitions';

export function AdminCatalog() {
  const [resource, setResource] = useState<Resource>('learning-domains');
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gap: '1.5rem' }}>
      <div>
        <h1>Catálogo administrativo</h1>
        <p>Crie definições em rascunho e publique quando estiverem prontas para uso.</p>
      </div>
      <Select label="Recurso" value={resource} onChange={(event) => setResource(event.target.value as Resource)}
        options={resources.map((item) => ({ ...item }))} />
      {/* Each resource owns its form and requests, so late responses cannot replace another list. */}
      <CatalogResource key={resource} resource={resource} />
    </div>
  );
}

function CatalogResource({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [domains, setDomains] = useState<LearningDomainResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const mutationPending = useRef(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1');
  const [domainId, setDomainId] = useState('');
  const isCompetency = resource === 'competency-definitions';
  const path = `${basePath}/${resource}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      api.get<CatalogRow[]>(path),
      isCompetency ? api.get<LearningDomainResponseDto[]>(`${basePath}/learning-domains`) : Promise.resolve([]),
    ]).then(([definitions, learningDomains]) => {
      if (cancelled) return;
      setRows(definitions);
      setDomains(learningDomains);
    }).catch((err: unknown) => {
      if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar o catálogo.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [path, isCompetency, attempt]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (mutationPending.current) return;
    setError(null);
    setNotice(null);
    const common = { code: code.trim(), version: Number(version), status: 'DRAFT' as const };
    const parsed = isCompetency
      ? createCompetencyDefinitionSchema.safeParse({ ...common, title: name.trim(), domainId })
      : (resource === 'learning-domains' ? createLearningDomainSchema : createPedagogicalModelDefinitionSchema)
        .safeParse({ ...common, name: name.trim(), description: description.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '));
      return;
    }
    mutationPending.current = true;
    setBusy(true);
    try {
      const created = await api.post<CatalogRow>(path, parsed.data);
      setRows((current) => [created, ...current]);
      setCode('');
      setName('');
      setDescription('');
      setVersion('1');
      setDomainId('');
      setNotice('Rascunho criado.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o rascunho.');
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }

  async function publish(id: string) {
    if (mutationPending.current) return;
    mutationPending.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const published = await api.patch<CatalogRow>(`${path}/${id}/status`, { status: 'PUBLISHED' });
      setRows((current) => current.map((row) => row.id === id ? published : row));
      setNotice('Definição publicada.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar a definição.');
    } finally {
      mutationPending.current = false;
      setBusy(false);
    }
  }

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <h2>{resources.find((item) => item.value === resource)?.label}</h2>
      {loading ? <p role="status">Carregando catálogo...</p> : loadError ? (
        <div><p role="alert">{loadError}</p><Button onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button></div>
      ) : (
        <>
          {error && <p role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          <Card>
            <CardHeader><CardTitle as="h3">Nova definição</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={create}>
                <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: '1rem', minWidth: 0 }}>
                  <Input label="Código" value={code} onChange={(event) => setCode(event.target.value)} required maxLength={isCompetency ? 150 : 100}
                    helperText="Use letras maiúsculas, números, pontos e sublinhados. Exemplo: MUSIC.BASS" />
                  <Input label="Nome" value={name} onChange={(event) => setName(event.target.value)} required maxLength={isCompetency ? 250 : 150} />
                  <Input label="Versão" type="number" min={1} step={1} value={version} onChange={(event) => setVersion(event.target.value)} required />
                  {isCompetency ? (
                    <Select label="Domínio de aprendizagem" required value={domainId} onChange={(event) => setDomainId(event.target.value)}
                      options={[{ value: '', label: 'Selecione um domínio' }, ...domains.map((domain) => ({ value: domain.id, label: `${domain.name} (${domain.code}, v${domain.version}, ${domain.status})` }))]} />
                  ) : <Textarea label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} />}
                  {isCompetency && domains.length === 0 && <p>Crie um domínio de aprendizagem antes de cadastrar competências.</p>}
                  <Button type="submit" isLoading={busy} disabled={busy || (isCompetency && domains.length === 0)}>Criar rascunho</Button>
                </fieldset>
              </form>
            </CardContent>
          </Card>
          {rows.length === 0 ? <EmptyState title="Nenhuma definição cadastrada" description="Use o formulário para criar o primeiro rascunho." /> : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
              {rows.map((row) => (
                <Card key={row.id}>
                  <CardHeader><CardTitle as="h3">{'title' in row ? row.title : row.name}</CardTitle></CardHeader>
                  <CardContent style={{ display: 'grid', gap: '0.75rem', overflowWrap: 'anywhere' }}>
                    <code>{row.code}</code>
                    <span>Versão {row.version}</span>
                    <span>{row.status}</span>
                    {'description' in row && row.description && <p>{row.description}</p>}
                    {row.status === 'DRAFT' && <Button variant="secondary" aria-label={`Publicar ${row.code}`} disabled={busy} onClick={() => publish(row.id)}>Publicar</Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
