/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Позволяет деплоить, даже если есть ошибки в TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорирует предупреждения линтера при сборке
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;