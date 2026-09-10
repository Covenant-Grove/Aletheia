import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../src/lib/i18n/locale-context';

afterEach(cleanup);

function Probe({ translationKey }: { translationKey: string }) {
  const { t } = useLocale();
  return <span data-testid="probe">{t(translationKey)}</span>;
}

describe('i18n', () => {
  it('translates a known key to the pt-BR default', () => {
    render(
      <LocaleProvider>
        <Probe translationKey="common.home" />
      </LocaleProvider>
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('Início');
  });

  it('falls back to the key itself instead of throwing on a missing key', () => {
    render(
      <LocaleProvider>
        <Probe translationKey="nonexistent.key" />
      </LocaleProvider>
    );

    expect(screen.getByTestId('probe')).toHaveTextContent('nonexistent.key');
  });

  it('does not throw when used outside a LocaleProvider (component tests render bare trees)', () => {
    expect(() => render(<Probe translationKey="common.home" />)).not.toThrow();
    expect(screen.getByTestId('probe')).toHaveTextContent('Início');
  });
});
