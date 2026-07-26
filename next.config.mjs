/** @type {import('next').NextConfig} */
const nextConfig = {
  // Παράγει self-contained server στο .next/standalone — το Docker image δεν
  // χρειάζεται node_modules ούτε πηγαίο κώδικα.
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
