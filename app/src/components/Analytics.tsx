import Script from 'next/script'

/**
 * 到訪監控（R3）：注入 Umami 追蹤腳本。
 * 未設定環境變數時不輸出任何內容 → 開發環境不會誤送資料。
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  if (!src || !websiteId) return null

  return (
    <Script
      defer
      src={src}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}
