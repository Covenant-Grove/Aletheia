'use client';

import React from 'react';
import { ProductShell } from '../../../../src/components/layout/product-shell';
import { AdminCatalog } from '../../../../src/components/admin/admin-catalog';
import { useAuth } from '../../../../src/lib/auth/auth-context';

export default function AdminCatalogPage() {
  const { status, user } = useAuth();
  return (
    <ProductShell>
      {status === 'authenticated' && user?.isPlatformAdmin === true ? <AdminCatalog /> : null}
    </ProductShell>
  );
}
