import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@layouts';
import { requireRole } from './-guards';

export const Route = createFileRoute('/admin')({
  beforeLoad: requireRole('ADPRU'),
  component: AdminLayout,
});
