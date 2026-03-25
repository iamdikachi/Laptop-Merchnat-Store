/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-image-domain.com',
    },
  ],
}
}

module.exports = nextConfig
