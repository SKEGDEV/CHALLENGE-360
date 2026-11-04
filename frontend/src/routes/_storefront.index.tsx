import { createFileRoute } from '@tanstack/react-router';
import { commonQueries, HOME_PAGE_SIZE } from '@hooks';
import { HomePage } from '@pages';

export const Route = createFileRoute('/_storefront/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(commonQueries.productList({ pageSize: HOME_PAGE_SIZE })),
  component: HomePage,
});
