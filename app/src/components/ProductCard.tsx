import Link from 'next/link'
import React from 'react'

export type ProductCardData = {
  id: number | string
  name: string
  slug?: string | null
  model?: string | null
  summary?: string | null
  images?: Array<{
    id?: number | string
    url?: string | null
    alt?: string | null
    sizes?: { card?: { url?: string | null } | null } | null
  }> | null
  brand?: { name?: string } | number | string | null
  categories?: Array<{ nameZh?: string | null; name?: string } | number | string> | null
}

function brandName(brand: ProductCardData['brand']): string | null {
  if (!brand || typeof brand !== 'object') return null
  return brand.name ?? null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = product.images?.[0]
  const src = img?.sizes?.card?.url || img?.url
  const brand = brandName(product.brand)

  return (
    <Link className="product-card" href={`/products/${product.slug}`}>
      <div className="product-thumb">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={img?.alt || product.name} loading="lazy" />
        ) : (
          <span className="no-image">暂无图片</span>
        )}
      </div>
      <div className="product-body">
        {brand ? <span className="product-brand">{brand}</span> : null}
        <h3 className="product-name">{product.name}</h3>
        {product.model ? <span className="product-model">{product.model}</span> : null}
        {product.summary ? <p className="product-summary">{product.summary}</p> : null}
      </div>
    </Link>
  )
}
