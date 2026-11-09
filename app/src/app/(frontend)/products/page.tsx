import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '产品',
  description: '测试与量测仪器产品型录：电源、电子负载、频谱分析仪、信号发生器、EMC 测试系统等。',
}

const PAGE_SIZE = 12

type SearchParams = { q?: string; cat?: string; brand?: string; page?: string }

export default async function ProductsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await props.searchParams
  const q = (sp.q || '').trim()
  const catSlug = (sp.cat || '').trim()
  const brandSlug = (sp.brand || '').trim()
  const page = Math.max(1, Number.parseInt(sp.page || '1', 10) || 1)

  const payload = await getPayloadClient()

  // 分類清單（含各分類商品數）
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'sortOrder',
  })

  let categoryId: number | undefined
  let activeCatLabel = ''
  if (catSlug) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: catSlug } },
      limit: 1,
    })
    if (found.docs.length) {
      categoryId = found.docs[0].id as number
      activeCatLabel = found.docs[0].nameZh || found.docs[0].name
    }
  }

  // 品牌（可選）
  let brandId: number | undefined
  let activeBrandLabel = ''
  if (brandSlug) {
    const found = await payload.find({
      collection: 'brands',
      where: { slug: { equals: brandSlug } },
      limit: 1,
    })
    if (found.docs.length) {
      brandId = found.docs[0].id as number
      activeBrandLabel = found.docs[0].name
    }
  }

  const where: Record<string, unknown> = { status: { equals: 'published' } }
  if (categoryId) where.categories = { in: [categoryId] }
  if (brandId) where.brand = { equals: brandId }
  if (q) {
    where.or = [
      { name: { like: q } },
      { model: { like: q } },
      { summary: { like: q } },
    ]
  }

  const result = await payload.find({
    collection: 'products',
    where,
    limit: PAGE_SIZE,
    page,
    sort: 'sortOrder',
    depth: 2,
  })

  const buildHref = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    const merged = { q, cat: catSlug, brand: brandSlug, page, ...over }
    if (merged.q) params.set('q', String(merged.q))
    if (merged.cat) params.set('cat', String(merged.cat))
    if (merged.brand) params.set('brand', String(merged.brand))
    const p = Number(merged.page) || 1
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/products?${s}` : '/products'
  }

  return (
    <div className="wrap">
      <div className="breadcrumb">
        <Link href="/">首页</Link> / 产品
      </div>

      <div className="section-head">
        <h2>
          {[activeBrandLabel, activeCatLabel].filter(Boolean).join(' · ') || '全部产品'}
        </h2>
        <p>
          {q ? `搜索「${q}」：` : ''}
          共 {result.totalDocs} 项
          {result.totalPages > 1 ? `（第 ${result.page} / ${result.totalPages} 页）` : ''}
        </p>
      </div>

      <div className="filter-bar">
        <Link
          className={`chip${!catSlug && !brandSlug ? ' chip-active' : ''}`}
          href={buildHref({ cat: undefined, brand: undefined, page: 1 })}
        >
          全部
        </Link>
        {categories.docs.map((c) => (
          <Link
            key={c.id}
            className={`chip${catSlug === c.slug ? ' chip-active' : ''}`}
            href={buildHref({ cat: String(c.slug), brand: undefined, page: 1 })}
          >
            {c.nameZh || c.name}
          </Link>
        ))}
        {activeBrandLabel ? (
          <Link
            className="chip chip-active"
            href={buildHref({ brand: undefined, page: 1 })}
          >
            {activeBrandLabel} ✕
          </Link>
        ) : null}
      </div>

      {result.docs.length > 0 ? (
        <div className="product-grid">
          {result.docs.map((p) => (
            <ProductCard key={p.id} product={p as unknown as ProductCardData} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          没有符合条件的产品。
          <br />
          <Link className="more-link" href="/products">
            清除筛选
          </Link>
        </div>
      )}

      {result.totalPages > 1 ? (
        <nav className="pagination" aria-label="分页">
          {result.hasPrevPage ? (
            <Link href={buildHref({ page: result.page - 1 })}>上一页</Link>
          ) : null}
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((n) =>
            n === result.page ? (
              <span key={n} className="current">
                {n}
              </span>
            ) : (
              <Link key={n} href={buildHref({ page: n })}>
                {n}
              </Link>
            ),
          )}
          {result.hasNextPage ? (
            <Link href={buildHref({ page: result.page + 1 })}>下一页</Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
