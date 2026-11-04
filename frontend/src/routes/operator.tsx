import { createFileRoute } from '@tanstack/react-router';
import { OperatorLayout } from '@layouts';
import { requireRole } from './-guards';

export const Route = createFileRoute('/operator')({
  beforeLoad: requireRole('OPPRU'),
  component: OperatorLayout,
});
