import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // ⚠️ dev 模式必要：Next.js 預設【封鎖跨來源請求】對 dev 資源的存取。
  // 透過 cloudflared quick tunnel 等外部網域瀏覽時，JS/CSS 會被 403 擋掉
  // → 頁面變成全黑（標題正常但無畫面）。
  // 這裡放行 trycloudflare.com（quick tunnel 隨機網址），僅影響 dev。
  allowedDevOrigins: ['*.trycloudflare.com', '**.trycloudflare.com'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
