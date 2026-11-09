import Link from 'next/link'
import React from 'react'

import { getPayloadClient, SITE } from '@/lib/payload'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayloadClient()

  const [featured, brandCount, productCount] = await Promise.all([
    payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 8,
      sort: 'sortOrder',
      depth: 2,
    }),
    payload.count({ collection: 'brands' }),
    payload.count({ collection: 'products' }),
  ])

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>高精密电子量测仪器与系统</h1>
          <p>
            {SITE.name}成立於 2005 年，為{SITE.parent}设立於上海的分公司，
            从事测试与量测仪器设备以及电子零件的销售。
          </p>
          <p>
            代理与经销美国、英国、瑞士、中国、台湾地区等国际知名品牌，
            提供从产品选型、教育训练到安装校准、维修的完整服务。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/products">
              浏览产品
            </Link>
            <Link className="btn btn-ghost" href="/contact">
              联系我们
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="info-grid">
            <div className="info-card">
              <h3>品牌代理</h3>
              <p>Aim TTi、N4L、Voltech、Powertek 等国际知名品牌</p>
            </div>
            <div className="info-card">
              <h3>产品品类</h3>
              <p>直流／交流电源、电子负载、频谱分析仪、信号发生器、EMC 测试系统等</p>
            </div>
            <div className="info-card">
              <h3>售后服务</h3>
              <p>安装调整测试、定期校正、维修产品，中港台分销商与客户支援</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="wrap">
          <div className="section-head section-head-row">
            <div>
              <h2>产品</h2>
              <p>
                目前收录 {productCount.totalDocs} 项产品，涵盖 {brandCount.totalDocs}{' '}
                个代理品牌。
              </p>
            </div>
            <Link className="more-link" href="/products">
              查看全部产品 →
            </Link>
          </div>

          {featured.docs.length > 0 ? (
            <div className="product-grid">
              {featured.docs.map((p) => (
                <ProductCard key={p.id} product={p as unknown as ProductCardData} />
              ))}
            </div>
          ) : (
            <div className="notice notice-warn">
              ⚠️ 尚无已发布的产品。请至後台「商品」将草稿状态改为「已发佈」，商品即会出现在此处。
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>关于我们</h2>
          </div>
          <div className="prose">
            <p>
              上海优电电子科技有限公司以专业的、完善的产品和服务，普遍为业界所支持和认同。
              公司不仅能够为中港台分销商和客户提供产品资讯、产品说明、教育训练、技术支援等服务，
              更能提供有效、快捷、专业的安装调整测试、定期校正、维修产品等售后服务。
            </p>
            <p>
              <Link className="more-link" href="/about">
                了解更多 →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
