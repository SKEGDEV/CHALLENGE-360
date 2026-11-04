import { createFileRoute } from '@tanstack/react-router';
import { AdminUsersPage } from '@pages';

export const Route = createFileRoute('/admin/users/')({
  component: AdminUsersPage,
});
