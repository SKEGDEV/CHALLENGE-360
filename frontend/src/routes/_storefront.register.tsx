import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '@pages';

export const Route = createFileRoute('/_storefront/register')({ component: RegisterPage });
