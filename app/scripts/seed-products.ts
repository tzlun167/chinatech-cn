/**
 * 從舊站抓取的商品資料匯入 Payload。
 *
 * 來源：docs/1、需求階段/參考-舊站/商品資料/商品清單-含描述.json
 *
 * 用法：
 *   npm run seed                 # 僅匯入文字資料（快）
 *   npm run seed:images          # 一併下載商品圖片（慢，39 組）
 *
 * 冪等：以 slug 為 key upsert，可重複執行。
 */
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { textToLexical } from './lexical'

const TYPE = 'product'

// ── 舊站分類（英文／中文對照）──────────────────────────────
const CATEGORY_MAP: Record<string, { name: string; nameZh: string }> = {
  仪器: { name: 'Instruments', nameZh: '仪器' },
  Multimeters: { name: 'Multimeters', nameZh: '万用表' },
  'EMC Analyzers': { name: 'EMC Analyzers', nameZh: 'EMC 分析仪' },
  'Current Probes': { name: 'Current Probes', nameZh: '电流探头' },
  'LCR Measurement': { name: 'LCR Measurement', nameZh: 'LCR 测量' },
  'Electronic Loads': { name: 'Electronic Loads', nameZh: '直流电子负载' },
  'Frequency Counters': { name: 'Frequency Counters', nameZh: '频率计' },
  'Spectrum Analyzers': { name: 'Spectrum Analyzers', nameZh: '频谱分析仪' },
  'Power Analyzers': { name: 'Power Analyzers', nameZh: '功率分析仪' },
  'Function Generators': { name: 'Function Generators', nameZh: '函数信号发生器' },
  'Arbitrary Generators': { name: 'Arbitrary Generators', nameZh: '任意波发生器' },
  'Pulse Generators': { name: 'Pulse Generators', nameZh: '脉冲发生器' },
  'RF Signal Generators': { name: 'RF Signal Generators', nameZh: '射频信号发生器' },
  'Waveform Amplifiers': { name: 'Waveform Amplifiers', nameZh: '波形放大器' },
}

// ── 品牌（由舊站商品資料觀察得知）──────────────────────────
const BRANDS: Record<string, { name: string; country?: string }> = {
  aimtti: { name: 'Aim TTi', country: '英国' },
  n4l: { name: 'N4L', country: '英国' },
  powertek: { name: 'Powertek', country: '英国' },
  voltech: { name: 'Voltech', country: '英国' },
  laplace: { name: 'Laplace', country: '法国' },
  redlion: { name: 'RedLION', country: '美国' },
  nti: { name: 'NTi', country: '德国' },
  accordance: { name: 'ACCORDANCE', country: '中国' },
}

// 商品名稱 → 品牌判定關鍵字
// 依舊站商品資料觀察：Aim TTi（英國）佔絕大多數（EL/EX/CPX/QPX/TSX/PL/PLH/QL/MX/LD/LDH/
// TG/TGP/TGR/TGF/WA/PSA/PFM 等系列皆為其產品線）。
const BRAND_HINTS: Array<[RegExp, string]> = [
  [/POWERTEK|Powertek|PAV\s?1010/i, 'powertek'],
  [/N4L|PSM\s*系列|PSM1700|PXE\s?2640/i, 'n4l'],
  [/Voltech|WT3ph|WX3ph/i, 'voltech'],
  // EMC 系列電源／分析儀為通用品項，品牌待委託人確認
  [/\bEMC\b/i, ''],
  [
    /Aim\s*TTi|^AIM|1908|I-prober|\bEL系列|\bEX系列|\bMX系列|CPX|QPX|TSX|\bPLH?系列|\bQL系列|\bLDH?\s?\d|\bLD系列|\bLDH系列|\bTG\d|\bTGP|\bTGR|\bTGF|\bWA\s?301|\bPSA|\bPFM|\bTF\s?900|\bLCR\s?400|\bATH\b|\bCTA-5|\bLCR电表/i,
    'aimtti',
  ],
]

// ── 型號／名稱清理 ─────────────────────────────────────────
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

type OldProduct = {
  url: string
  description?: string
  categories?: string
  images?: string[]
}

/** 解析舊標題 → { name, model, brandKey, extraSpecs } */
function parseTitle(title: string) {
  let t = title.trim()
  let brandKey = ''

  for (const [re, key] of BRAND_HINTS) {
    if (re.test(t)) {
      brandKey = key
      break
    }
  }

  // 抽出「英国XXX品牌」「英国POWERTEK」等國別標記
  t = t.replace(/英国\s*POWERTEK\s*/gi, '').replace(/英国\s*N4L\s*品牌\s*/gi, '')

  // 抽型號：連續大寫字母／數字組合，如 1908P、TG1006、PAV1010A、PXE2640、CTA-5A
  let model = ''
  const modelMatch = t.match(/\b([A-Z]{2,6}[-]?\d{2,5}[A-Za-z]{0,3})\b/)
  if (modelMatch) model = modelMatch[1]

  // 「1-4通道可选」→ 規格
  const specs: Array<{ label: string; value: string }> = []
  const chan = t.match(/(\d+\s*-\s*\d+\s*通道|\d+\s*通道)\s*(可选)?/)
  if (chan) {
    specs.push({ label: '通道數', value: chan[1].replace(/\s+/g, '') + (chan[2] ? '（可選）' : '') })
    t = t.replace(chan[0], ' ')
  }
  // 「phase angle voltmeter」→ 英文別名
  const en = t.match(/([A-Za-z][A-Za-z\s]{6,})/)
  if (en && /phase angle|rogowski|transducer|sensing/i.test(en[1])) {
    t = t.replace(en[1], ' ')
  }

  t = t.replace(/\s+/g, ' ').replace(/^[-–—\s,，、]+|[-–—\s,，、]+$/g, '').trim()

  return { name: t || title.trim(), model, brandKey, specs }
}

// ── 主流程 ─────────────────────────────────────────────────
const here = path.dirname(new URL(import.meta.url).pathname)
const SOURCE = path.resolve(
  here,
  '../../docs/1、需求階段/參考-舊站/商品資料/商品清單-含描述.json',
)
const IMAGE_DIR = path.resolve(here, '../media/imported')

/**
 * ⚠️ 舊站 sitemap／商品頁內的圖片 URL 多數指向 `www.gd.chinatech.com.tw`，
 * 但該網域現已無法解析（NXDOMAIN）。實際圖檔仍在 `www.chinatech-cn.com` 上，
 * 故下載前統一改寫網域。
 */
function normalizeImageUrl(url: string): string {
  return url.replace(/^https?:\/\/www\.gd\.chinatech\.com\.tw/i, 'http://www.chinatech-cn.com')
}
const downloadImages = process.argv.includes('--download-images')
// 預設匯入為草稿（供人工檢視）；加 --publish 直接上架
const publish = process.argv.includes('--publish')

if (!fs.existsSync(SOURCE)) {
  console.error(`✗ 找不到來源檔：${SOURCE}`)
  process.exit(1)
}

const raw: Record<string, OldProduct> = JSON.parse(fs.readFileSync(SOURCE, 'utf-8'))
const payload = await getPayload({ config })

const report: string[] = []
const warnings: string[] = []

// 1) 分類
// ⚠️ 關聯 ID 必須維持數字型別；傳字串會被 Payload 驗證為 invalid relationship。
const categoryIdByName = new Map<string, number>()
for (const [oldName, def] of Object.entries(CATEGORY_MAP)) {
  const found = await payload.find({
    collection: 'categories',
    where: { name: { equals: def.name } },
    limit: 1,
  })
  if (found.docs.length) {
    categoryIdByName.set(oldName, found.docs[0].id as number)
  } else {
    const created = await payload.create({
      collection: 'categories',
      data: { name: def.name, nameZh: def.nameZh, slug: slugify(def.name) },
    })
    categoryIdByName.set(oldName, created.id as number)
  }
}
report.push(`分類：${categoryIdByName.size} 筆`)

// 2) 品牌
const brandIdByKey = new Map<string, number>()
for (const [key, def] of Object.entries(BRANDS)) {
  const found = await payload.find({
    collection: 'brands',
    where: { name: { equals: def.name } },
    limit: 1,
  })
  if (found.docs.length) {
    brandIdByKey.set(key, found.docs[0].id as number)
  } else {
    const created = await payload.create({
      collection: 'brands',
      data: { name: def.name, slug: key, country: def.country },
    })
    brandIdByKey.set(key, created.id as number)
  }
}
report.push(`品牌：${brandIdByKey.size} 筆`)

// 3) 商品
let created = 0
let updated = 0
let skipped = 0
const seenSlugs = new Map<string, string>()

fs.mkdirSync(IMAGE_DIR, { recursive: true })

for (const [title, data] of Object.entries(raw)) {
  const parsed = parseTitle(title)
  const slug = slugify(parsed.name)

  if (seenSlugs.has(slug)) {
    warnings.push(`⚠️ 疑似重複，已略過：「${title}」（與「${seenSlugs.get(slug)}」同 slug）`)
    skipped++
    continue
  }
  seenSlugs.set(slug, title)

  if (!data.description?.trim()) {
    warnings.push(`⚠️ 無描述：「${title}」`)
  }

  if (!parsed.brandKey) {
    warnings.push(`⚠️ 品牌未判定（待人工確認）：「${title}」`)
  }

  const categoryIds: number[] = []
  for (const c of (data.categories || '').split(',').map((x) => x.trim()).filter(Boolean)) {
    const id = categoryIdByName.get(c)
    if (id) categoryIds.push(id)
    else warnings.push(`⚠️ 未知分類「${c}」（商品：${title}）`)
  }

  // 圖片下載（選用）
  const imageIds: number[] = []
  if (downloadImages && data.images?.length) {
    for (const [i, url] of data.images.slice(0, 6).entries()) {
      const dlUrl = normalizeImageUrl(url)
      try {
        const res = await fetch(dlUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cts-site-migration)' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        const ext = (url.split('.').pop() || 'jpg').split('?')[0].slice(0, 4)
        const filename = `${slug}-${i + 1}.${ext}`
        const filepath = path.join(IMAGE_DIR, filename)
        fs.writeFileSync(filepath, buf)

        const existingMedia = await payload.find({
          collection: 'media',
          where: { filename: { equals: filename } },
          limit: 1,
        })
        if (existingMedia.docs.length) {
          imageIds.push(existingMedia.docs[0].id as number)
        } else {
          const m = await payload.create({
            collection: 'media',
            data: { alt: `${parsed.name} 商品圖 ${i + 1}` },
            filePath: filepath,
          })
          imageIds.push(m.id as number)
        }
      } catch (e) {
        warnings.push(`⚠️ 圖片下載失敗（${title}）：${dlUrl} — ${(e as Error).message}`)
      }
    }
  }

  const payloadData = {
    name: parsed.name,
    ...(parsed.model ? { model: parsed.model } : {}),
    slug,
    ...(parsed.brandKey && brandIdByKey.has(parsed.brandKey)
      ? { brand: brandIdByKey.get(parsed.brandKey) }
      : {}),
    ...(categoryIds.length ? { categories: categoryIds } : {}),
    ...(data.description?.trim()
      ? { description: textToLexical(data.description) }
      : {}),
    ...(parsed.specs.length ? { specs: parsed.specs } : {}),
    ...(imageIds.length ? { images: imageIds } : {}),
    status: (publish ? 'published' : 'draft') as 'published' | 'draft',
    ...(publish ? { publishedAt: new Date().toISOString() } : {}),
    sortOrder: 100,
  }

  const existing = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (existing.docs.length) {
    await payload.update({
      collection: 'products',
      id: existing.docs[0].id,
      data: payloadData,
    })
    updated++
  } else {
    await payload.create({ collection: 'products', data: payloadData })
    created++
  }
}

report.push(`商品：新增 ${created}、更新 ${updated}、略過 ${skipped}`)

// 4) 報告
const reportPath = path.resolve(here, '../seed-report.md')
fs.writeFileSync(
  reportPath,
  [
    '# 商品匯入報告',
    '',
    `執行時間：${new Date().toISOString()}`,
    `圖片下載：${downloadImages ? '是' : '否'}`,
    `發佈狀態：${publish ? 'published（已上架）' : 'draft（草稿）'}`,
    '',
    '## 統計',
    '',
    ...report.map((r) => `- ${r}`),
    '',
    `## 待處理（${warnings.length}）`,
    '',
    ...(warnings.length ? warnings.map((w) => `- ${w}`) : ['（無）']),
    '',
  ].join('\n'),
  'utf-8',
)

console.log('✓ 匯入完成')
report.forEach((r) => console.log('  ' + r))
if (warnings.length) {
  console.log(`  ⚠️ ${warnings.length} 項待處理，詳見 seed-report.md`)
}
process.exit(0)
