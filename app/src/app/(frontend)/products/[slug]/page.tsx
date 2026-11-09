import Link from 'next/link'
import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { getPayloadClient, SITE } from '@/lib/payload'
import { RichText } from '@/components/RichText'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'
import { InquiryForm } from '@/components/InquiryForm'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

/**
 * ⚠️ Next.js 16 會把 URL 中的非 ASCII slug 以「百分比編碼」原樣傳入 params，
 * 因此含中文的 slug 必須先 decode 才能比對資料庫（否則永遠 404）。
 * 例：params.slug = '1908%e7%b3%bb...' → decode → '1908系列-台...'
 */
function normalizeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

async function loadProduct(rawSlug: string) {
  const payload = await getPayloadClient()
  const slug = normalizeSlug(rawSlug)
  const res = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const p = await loadProduct(slug)
  if (!p) return { title: '产品' }
  return {
    title: p.seo?.title || p.name,
    description: p.seo?.description || p.summary || undefined,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      title: p.seo?.title || p.name,
      description: p.seo?.description || p.summary || undefined,
    },
  }
}

export default async function ProductDetailPage(props: Props) {
  const { slug } = await props.params
  const product = await loadProduct(slug)
  if (!product) notFound()

  const payload = await getPayloadClient()

  const brand =
    product.brand && typeof product.brand === 'object' ? product.brand : null

  const imageIds = (product.images || [])
    .map((i) => (typeof i === 'object' ? i?.id : i))
    .filter(Boolean) as Array<number | string>

  const toCard = (i: unknown): ProductCardData['images'] => [i as never]

  // 相關商品：優先用人工指定，否則依分類推薦
  let related: Array<Record<string, unknown>> = []
  if (product.relatedProducts?.length) {
    related = product.relatedProducts.filter(
      (r) => typeof r === 'object',
    ) as Array<Record<string, unknown>>
  } else {
    const catIds = (product.categories || [])
      .map((c) => (typeof c === 'object' ? c?.id : c))
      .filter(Boolean) as Array<number | string>
    if (catIds.length) {
      const r = await payload.find({
        collection: 'products',
        where: {
          status: { equals: 'published' },
          categories: { in: catIds },
          id: { not_equals: product.id },
        },
        limit: 4,
        depth: 2,
      })
      related = r.docs as unknown as Array<Record<string, unknown>>
    }
  }

  const specs = product.specs || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.model ? { model: product.model } : {}),
    ...(brand?.name ? { brand: { '@type': 'Brand', name: brand.name } } : {}),
    ...(product.summary ? { description: product.summary } : {}),
    url: `${SITE.url}/products/${product.slug}`,
  }

  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="breadcrumb">
        <Link href="/">首页</Link> / <Link href="/products">产品</Link> /{' '}
        {product.name}
      </div>

      <div className="detail-grid">
        <div>
          <div className="gallery-main">
            {product.images?.[0] && typeof product.images[0] === 'object' && product.images[0].url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
              />
            ) : (
              <span className="no-image" style={{ color: '#7b8a99' }}>
                暂无图片
              </span>
            )}
          </div>
          {imageIds.length > 1 ? (
            <div className="gallery-thumbs">
              {product.images!.slice(1, 7).map((img, i) =>
                typeof img === 'object' && img?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={img.url} alt={img.alt || `${product.name} ${i + 2}`} />
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        <div>
          {brand?.name ? <span className="detail-brand">{brand.name}</span> : null}
          <h1 className="detail-title">{product.name}</h1>
          {product.model ? (
            <div className="product-model">型号：{product.model}</div>
          ) : null}

          {product.categories?.length ? (
            <div className="detail-cats">
              {product.categories.map((c, i) =>
                typeof c === 'object' && c ? (
                  <Link key={i} className="chip" href={`/products?cat=${c.slug}`}>
                    {c.nameZh || c.name}
                  </Link>
                ) : null,
              )}
            </div>
          ) : null}

          {product.summary ? <p>{product.summary}</p> : null}

          {product.features?.length ? (
            <ul className="feature-list">
              {product.features.map((f, i) => (
                <li key={i}>{f.text}</li>
              ))}
            </ul>
          ) : null}

          {product.description ? (
            <div style={{ marginTop: 22 }}>
              <RichText data={product.description} />
            </div>
          ) : (
            <div className="notice notice-warn" style={{ marginTop: 22 }}>
              ⚠️ 此产品尚无详细描述（旧站亦为空白），待补充。
            </div>
          )}

          {specs.length ? (
            <table className="spec-table">
              <tbody>
                {specs.map((s, i) => (
                  <tr key={i}>
                    <th>{s.label}</th>
                    <td>
                      {s.value}
                      {s.unit ? ` ${s.unit}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {product.datasheet && typeof product.datasheet === 'object' && product.datasheet.url ? (
            <p style={{ marginTop: 20 }}>
              <a
                className="btn btn-brand"
                href={product.datasheet.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                下载型录 PDF
              </a>
            </p>
          ) : null}

          <InquiryForm productId={product.id} productName={product.name} />
        </div>
      </div>

      {related.length ? (
        <section className="section">
          <div className="section-head">
            <h2>相关产品</h2>
          </div>
          <div className="product-grid">
            {related.slice(0, 4).map((r) => (
              <ProductCard key={String(r.id)} product={r as unknown as ProductCardData} />
            ))}
          </div>
        </section>
      ) : null}

      <div style={{ height: 40 }} />
    </div>
  )
}
