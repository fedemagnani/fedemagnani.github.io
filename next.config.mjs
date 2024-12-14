/** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true, // Disable default image optimization
    },
    assetPrefix: isProd ? '/fedemagnani.github.io/' : '',
    basePath: isProd ? '/fedemagnani.github.io' : '',
    output: 'export'
};

export default nextConfig;