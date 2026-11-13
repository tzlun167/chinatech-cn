import type { CollectionConfig } from 'payload'

/**
 * 統一媒體庫（A-07）
 * 圖片白名單 + 衍生尺寸；拒絕可執行檔。
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: '媒體',
    plural: '媒體庫',
  },
  admin: {
    group: '內容',
    description: '圖片與型錄檔案。上傳圖片建議寬度 ≥ 1200px。',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'application/pdf',
    ],
    imageSizes: [
      { name: 'thumbnail', width: 200, height: 200, position: 'centre' },
      { name: 'card', width: 600, height: 600, position: 'centre' },
      { name: 'large', width: 1200 },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: '替代文字（alt）',
      required: true,
      admin: {
        description: '供 SEO 與無障礙使用，請描述圖片內容。',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: '圖說',
    },
  ],
}
