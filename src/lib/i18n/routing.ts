import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ms', 'en'],
  defaultLocale: 'ms',
  localePrefix: 'as-needed',
});
