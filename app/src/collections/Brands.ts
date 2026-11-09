import type { CollectionConfig } from 'payload'

/**
 * 代理品牌（F-03 / A-05）
 * 舊站：/?page_id=6078
 */
export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    group: '商品',
    defaultColumns: ['name', 'slug', 'country', 'sortOrder', 'status'],
    description: '代理品牌，如 Aim TTi、N4L、Voltech。',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '品牌名稱',
      required: true,
      unique: true,
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
              .replace(/[^a-z0-9-]/g, ''),
        ],
      },
    },
    {
      name: 'country',
      type: 'text',
      label: '產地／國家',
      admin: { description: '如：英国、美国、瑞士、台灣。' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: '品牌標誌',
    },
    {
      name: 'description',
      type: 'richText',
      label: '品牌簡介',
    },
    {
      name: 'website',
      type: 'text',
      label: '原廠網址',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 100,
      admin: { description: '數字越小越前面。' },
    },
    {
      name: 'status',
      type: 'select',
      label: '狀態',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '顯示', value: 'active' },
        { label: '隱藏', value: 'hidden' },
      ],
    },
  ],
}
