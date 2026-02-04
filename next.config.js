/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем строгий режим React, чтобы избежать двойных рендеров и конфликтов
  reactStrictMode: false,
  // Игнорируем ошибки TypeScript при сборке
  typescript: {
    ignoreBuildErrors: true,
  },
  // Игнорируем ошибки линтера
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;