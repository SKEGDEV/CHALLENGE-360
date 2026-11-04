import { createFileRoute } from '@tanstack/react-router';
import { OperatorDashboardPage } from '@pages';

export const Route = createFileRoute('/operator/')({
  component: OperatorDashboardPage,
});
