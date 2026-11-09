import React from 'react'
import Link from 'next/link'
import './styles.css'
import { Analytics } from '@/components/Analytics'

export const metadata = {
  title: {
    default: '上海優電電子科技有限公司 — 測試與量測儀器',
    template: '%s — 上海優電 CTS',
  },
  description:
    '上海優電電子科技有限公司（Chinatech Corporation 上海分公司）成立於 2005 年，代理與經銷美國、英國、瑞士、中國、台灣地區的高精密電子量測儀器與系統。',
}

const NAV = [
  { href: '/about', label: '关于我们' },
  { href: '/brands', label: '品牌' },
  { href: '/products', label: '产品' },
  { href: '/contact', label: '联系方式' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand-mark">
              <span className="brand-name">CTS</span>
              <span className="brand-sub">上海优电电子科技</span>
            </Link>
            <nav className="site-nav">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <form className="header-search" action="/products" method="get">
              <input
                type="search"
                name="q"
                placeholder="搜索商品 / 型号"
                aria-label="搜索商品"
              />
              <button type="submit" aria-label="搜索">
                搜索
              </button>
            </form>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="wrap footer-grid">
            <div>
              <h4>上海优电电子科技有限公司</h4>
              <p>
                台湾中仪科技股份有限公司（Chinatech Corporation）上海分公司
                <br />
                成立於 2005 年
              </p>
            </div>
            <div>
              <h4>联系方式</h4>
              <p>
                电话：021-58133801
                <br />
                邮箱：frank@chinatech.com.tw
              </p>
            </div>
            <div>
              <h4>地址</h4>
              <p>
                上海市浦东新区康桥镇
                <br />
                康桥东路 1258 弄 10 号厂房
              </p>
            </div>
          </div>
          <div className="wrap copyright">
            © {new Date().getFullYear()} CTS 上海优电电子科技有限公司
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  )
}
