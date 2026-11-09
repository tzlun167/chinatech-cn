import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '品牌',
  description: '代理品牌：Aim TTi、N4L、Voltech、Powertek、Laplace、RedLION、NTi、ACCORDANCE。',
}

export default async function BrandsPage() {
  const payload = await getPayloadClient()
  const brands = await payload.find({
    collection: 'brands',
    where: { status: { equals: 'active' } },
    limit: 100,
    sort: 'sortOrder',
  })

  // 各品牌商品數
  const counts = await Promise.all(
    brands.docs.map((b) =>
      payload.count({
        collection: 'products',
        where: { brand: { equals: b.id }, status: { equals: 'published' } },
      }),
    ),
  )

  return (
    <div className="wrap">
      <div className="breadcrumb">
        <Link href="/">首页</Link> / 品牌
      </div>

      <div className="section-head">
        <h2>代理品牌</h2>
        <p>
          经销美国、英国、瑞士、中国、台湾地区等国际知名的高精密电子量测仪器与系统。
        </p>
      </div>

      {brands.docs.length ? (
        <div className="brand-grid">
          {brands.docs.map((b, i) => (
            <div className="brand-card" key={b.id}>
              <h3>{b.name}</h3>
              {b.country ? <span className="country">{b.country}</span> : null}
              {b.description ? (
                <p>{typeof b.description === 'string' ? b.description : null}</p>
              ) : null}
              <div className="count">
                {counts[i].totalDocs > 0 ? (
                  <Link className="more-link" href={`/products?brand=${b.slug}`}>
                    查看 {counts[i].totalDocs} 项产品 →
                  </Link>
                ) : (
                  '暂无上架产品'
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">暂无品牌资料。</div>
      )}
    </div>
  )
}
