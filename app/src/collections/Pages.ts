import type { CollectionConfig } from 'payload'

/**
 * 靜態頁面（F-01 F-02 F-03 F-08 / A-06）
 * 對應舊站：關於我們 / 品牌 / 聯絡方式
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: '內容',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    description: '關於我們、聯絡方式等靜態頁面。',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: '頁面標題',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: '網址代稱',
      required: true,
      unique: true,
      admin: { description: '如 about、contact、brands。' },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value ||
            data?.title
              ?.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
        ],
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: '頁面區塊',
      labels: { singular: '區塊', plural: '區塊' },
      blocks: [
        {
          slug: 'hero',
          labels: { singular: '主視覺', plural: '主視覺' },
          fields: [
            { name: 'heading', type: 'text', label: '主標題', required: true },
            { name: 'subheading', type: 'textarea', label: '副標題' },
            { name: 'image', type: 'upload', relationTo: 'media', label: '背景圖' },
          ],
        },
        {
          slug: 'richText',
          labels: { singular: '圖文區塊', plural: '圖文區塊' },
          fields: [{ name: 'content', type: 'richText', label: '內容' }],
        },
        {
          slug: 'brandGrid',
          labels: { singular: '品牌牆', plural: '品牌牆' },
          fields: [
            {
              name: 'brands',
              type: 'relationship',
              relationTo: 'brands',
              hasMany: true,
              label: '顯示品牌',
              admin: { description: '留空則顯示全部。' },
            },
          ],
        },
        {
          slug: 'productCarousel',
          labels: { singular: '商品輪播', plural: '商品輪播' },
          fields: [
            { name: 'heading', type: 'text', label: '區塊標題' },
            {
              name: 'products',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: '顯示商品',
            },
          ],
        },
        {
          slug: 'contactInfo',
          labels: { singular: '聯絡資訊', plural: '聯絡資訊' },
          fields: [
            { name: 'phone', type: 'text', label: '電話' },
            { name: 'email', type: 'text', label: 'Email' },
            { name: 'address', type: 'textarea', label: '地址' },
            { name: 'mapEmbed', type: 'textarea', label: '地圖嵌入碼' },
          ],
        },
        {
          slug: 'cta',
          labels: { singular: '行動呼籲', plural: '行動呼籲' },
          fields: [
            { name: 'heading', type: 'text', label: '標題', required: true },
            { name: 'text', type: 'textarea', label: '說明' },
            { name: 'buttonLabel', type: 'text', label: '按鈕文字' },
            { name: 'buttonHref', type: 'text', label: '按鈕連結' },
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: '標題' },
        { name: 'description', type: 'textarea', label: '描述' },
        { name: 'ogImage', type: 'upload', relationTo: 'media', label: '分享圖' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: '狀態',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發佈', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
