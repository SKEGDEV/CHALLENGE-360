import { createFileRoute } from '@tanstack/react-router';
import { AdminCuponsPage } from '@pages';

export const Route = createFileRoute('/admin/cupons/')({
  component: AdminCuponsPage,
});
