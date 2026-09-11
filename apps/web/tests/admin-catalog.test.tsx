import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminCatalogPage from '../app/(dashboard)/admin/catalog/page';
import { AuthContext, type AuthContextValue } from '../src/lib/auth/auth-context';
import { api } from '../src/lib/api';

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/admin/catalog', useRouter: () => router }));

const base = '/admin/curriculum-definitions';
const domain = { id: '00000000-0000-4000-8000-000000000001', code: 'MUSIC', name: 'Música', status: 'DRAFT', version: 1 };

function session(isPlatformAdmin = true, status: AuthContextValue['status'] = 'authenticated'): AuthContextValue {
  return {
    status, user: status === 'authenticated' ? { id: 'admin', email: 'admin@example.com', fullName: 'Admin',
      emailVerified: true, mfaEnabled: false, isPlatformAdmin, createdAt: '' } : null,
    token: null, activeFamilyId: null, activeFamily: null, families: [], activeRole: null,
    login: vi.fn(), verifyMfa: vi.fn(), register: vi.fn(), logout: vi.fn(), selectFamily: vi.fn(),
    refreshSession: vi.fn(), setActiveFamilyFromCreated: vi.fn(), changePassword: vi.fn(), changeEmail: vi.fn(),
  };
}

function page(value = session()) {
  return <AuthContext.Provider value={value}><AdminCatalogPage /></AuthContext.Provider>;
}

beforeEach(() => {
  vi.spyOn(api, 'get').mockImplementation(async (path) => path === `${base}/learning-domains` ? [domain] : []);
  vi.spyOn(api, 'post').mockResolvedValue({ ...domain, id: 'new', code: 'ART', name: 'Artes' });
  vi.spyOn(api, 'patch').mockResolvedValue({ ...domain, status: 'PUBLISHED' });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); router.replace.mockClear(); });

describe('platform admin catalog', () => {
  it('removes catalog content and navigation when admin access is revoked', async () => {
    const view = render(page());
    await screen.findByText('Música');
    vi.mocked(api.get).mockClear();
    view.rerender(page(session(false)));
    expect(screen.getByText('Acesso restrito')).toBeInTheDocument();
    expect(screen.queryByText('Música')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Catálogo administrativo' })).not.toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('ignores a late list response after switching resources', async () => {
    let finish!: (rows: typeof domain[]) => void;
    vi.mocked(api.get).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    render(page());
    fireEvent.change(screen.getByLabelText('Recurso'), { target: { value: 'pedagogical-model-definitions' } });
    await screen.findByText('Nenhuma definição cadastrada');
    await act(async () => { finish([domain]); });
    expect(screen.queryByText('Música')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Modelos pedagógicos' })).toBeInTheDocument();
  });

  it('requires an existing domain before creating competencies', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    render(page());
    fireEvent.change(screen.getByLabelText('Recurso'), { target: { value: 'competency-definitions' } });
    expect(await screen.findByText('Crie um domínio de aprendizagem antes de cadastrar competências.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar rascunho' })).toBeDisabled();
  });

  it('prevents repeated publication while the request is pending', async () => {
    let finish!: (row: typeof domain) => void;
    vi.mocked(api.patch).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    render(page());
    const publish = await screen.findByRole('button', { name: 'Publicar MUSIC' });
    fireEvent.click(publish);
    expect(publish).toBeDisabled();
    fireEvent.click(publish);
    expect(api.patch).toHaveBeenCalledTimes(1);
    await act(async () => { finish({ ...domain, status: 'PUBLISHED' }); });
    expect(screen.queryByRole('button', { name: 'Publicar MUSIC' })).not.toBeInTheDocument();
  });
  it.each(['loading', 'unauthenticated', 'authenticated'] as const)('does not fetch or render catalogs for non-admin %s sessions', async (status) => {
    render(page(session(false, status)));
    expect(api.get).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Criar rascunho' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Catálogo administrativo' })).not.toBeInTheDocument();
    if (status === 'authenticated') expect(screen.getByText('Acesso restrito')).toBeInTheDocument();
    if (status === 'unauthenticated') await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login?redirect=%2Fadmin%2Fcatalog'));
  });

  it('shows the admin navigation without requiring a family and lists code, name, status and version', async () => {
    render(page());
    expect(screen.getByRole('link', { name: 'Catálogo administrativo' })).toHaveAttribute('href', '/admin/catalog');
    expect(await screen.findByText('Música')).toBeInTheDocument();
    expect(screen.getByText('MUSIC')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('Versão 1')).toBeInTheDocument();
  });

  it.each([
    ['learning-domains', 'Domínios de aprendizagem'],
    ['competency-definitions', 'Competências'],
    ['pedagogical-model-definitions', 'Modelos pedagógicos'],
  ])('creates and publishes %s using its contract', async (resource, label) => {
    vi.mocked(api.patch).mockResolvedValue({ ...domain, id: 'new', code: 'ART', name: 'Artes', title: 'Artes', status: 'PUBLISHED' });
    render(page());
    await screen.findByText('Música');
    fireEvent.change(screen.getByLabelText('Recurso'), { target: { value: resource } });
    await screen.findByRole('heading', { name: label });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Criar rascunho' })).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'ART' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Artes' } });
    if (resource === 'competency-definitions') {
      fireEvent.change(screen.getByLabelText('Domínio de aprendizagem'), { target: { value: domain.id } });
      expect(screen.queryByLabelText('Descrição')).not.toBeInTheDocument();
    } else {
      fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição de artes' } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(`${base}/${resource}`, expect.objectContaining({
      code: 'ART', version: 1, status: 'DRAFT',
      ...(resource === 'competency-definitions' ? { title: 'Artes', domainId: domain.id } : { name: 'Artes', description: 'Descrição de artes' }),
    })));
    expect(await screen.findByText('Artes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar ART' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(`${base}/${resource}/new/status`, { status: 'PUBLISHED' }));
    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publicar ART' })).not.toBeInTheDocument();
  });

  it('validates the code before sending a create request', async () => {
    render(page());
    await screen.findByText('Música');
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'invalid code' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Artes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows a load failure and supports retry', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Falha de rede'));
    render(page());
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Música')).toBeInTheDocument();
  });

  it('preserves the form after a rejected create and the draft after a rejected publish', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Código já existe'));
    vi.mocked(api.patch).mockRejectedValue(new Error('Publicação recusada'));
    render(page());
    await screen.findByText('Música');
    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'MUSIC' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Música' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar rascunho' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Código já existe');
    expect(screen.getByLabelText('Código')).toHaveValue('MUSIC');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar MUSIC' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Publicação recusada');
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });
});
