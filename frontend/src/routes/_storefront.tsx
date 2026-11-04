import { createFileRoute } from '@tanstack/react-router';
import { StorefrontLayout } from '@layouts';

export const Route = createFileRoute('/_storefront')({ component: StorefrontLayout });
