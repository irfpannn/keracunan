import type { NextConfig } from "next"; // 1. Import the type
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// 2. Explicitly type the variable
const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
