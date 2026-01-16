import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Point specifically to your custom location
const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
