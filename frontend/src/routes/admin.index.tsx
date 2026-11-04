import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboardPage } from '@pages';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardPage,
});
