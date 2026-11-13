import type { CollectionConfig } from 'payload'

/**
 * 商品（R2 核心 / F-04 F-05 F-06 F-07 / A-03）
 * 網址 /products/<slug>
 */
export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: '商品',
    plural: '商品',
  },
  admin: {
    useAsTitle: 'name',
    group: '商品',
    defaultColumns: ['name', 'model', 'brand', 'status', 'updatedAt'],
    description: '商品型錄。發佈後才會出現在前台。',
    listSearchableFields: ['name', 'model', 'slug'],
  },
  access: {
    // 前台只能看到已發佈；登入者可看全部
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: '基本資料',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: '商品名稱',
              required: true,
              admin: {
                description:
                  '不含行銷詞。格式建議「型號 + 空格 + 中文品名」，如「1908 系列 台式数字万用表」。',
              },
            },
            {
              name: 'model',
              type: 'text',
              label: '型號',
              admin: { description: '如 1908P、TG1006。系列品可留空。' },
            },
            {
              name: 'slug',
              type: 'text',
              label: '網址代稱',
              required: true,
              unique: true,
              admin: { description: '留空會由名稱自動產生。' },
              hooks: {
                beforeValidate: [
                  ({ value, data }) =>
                    value ||
                    data?.name
                      ?.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
                      .replace(/-+/g, '-'),
                ],
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'brands',
                  label: '品牌',
                  admin: { width: '50%' },
                },
                {
                  name: 'sortOrder',
                  type: 'number',
                  label: '排序',
                  defaultValue: 100,
                  admin: { width: '50%', description: '數字越小越前面。' },
                },
              ],
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: '商品分類',
            },
            {
              name: 'summary',
              type: 'textarea',
              label: '列表短述',
              maxLength: 160,
              admin: { description: '顯示於型錄卡片，建議 ≤ 120 字。' },
            },
            {
              name: 'features',
              type: 'array',
              label: '特色條列',
              labels: { singular: '特色', plural: '特色條列' },
              fields: [
                { name: 'text', type: 'text', label: '內容', required: true },
              ],
            },
          ],
        },
        {
          label: '內容',
          fields: [
            {
              name: 'description',
              type: 'richText',
              label: '商品描述',
              admin: { description: '支援段落、清單、表格與圖片。' },
            },
            {
              name: 'specs',
              type: 'array',
              label: '規格',
              labels: { singular: '規格列', plural: '規格' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      label: '規格名',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'value',
                      type: 'text',
                      label: '規格值',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'unit',
                      type: 'text',
                      label: '單位',
                      admin: { width: '20%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: '媒體',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: '商品圖片',
              admin: { description: '第一張為主圖。建議 1200×1200 白底。' },
            },
            {
              name: 'datasheet',
              type: 'upload',
              relationTo: 'media',
              label: '型錄 PDF',
              filterOptions: { mimeType: { equals: 'application/pdf' } },
            },
          ],
        },
        {
          label: '關聯與 SEO',
          fields: [
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              label: '相關商品',
              admin: { description: '留空則前台依分類自動推薦。' },
              filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
            },
            {
              name: 'seo',
              type: 'group',
              label: 'SEO',
              fields: [
                { name: 'title', type: 'text', label: '標題', admin: { description: '留空則用商品名稱。' } },
                { name: 'description', type: 'textarea', label: '描述', admin: { description: '留空則用列表短述。' } },
                { name: 'ogImage', type: 'upload', relationTo: 'media', label: '分享圖' },
              ],
            },
          ],
        },
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
    {
      name: 'publishedAt',
      type: 'date',
      label: '發佈時間',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?.status === 'published' && !value) return new Date()
            return value
          },
        ],
      },
    },
  ],
}
