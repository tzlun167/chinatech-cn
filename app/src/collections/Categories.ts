import type { CollectionConfig } from 'payload'

/**
 * 商品分類（F-05 / A-04）
 * 舊站 14 類；網址 /products/category/<slug>
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: '商品分類',
    plural: '商品分類',
  },
  admin: {
    useAsTitle: 'name',
    group: '商品',
    defaultColumns: ['name', 'nameZh', 'slug', 'sortOrder'],
    description: '商品分類，用於型錄篩選。',
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
      label: '分類名稱',
      required: true,
      unique: true,
      admin: { description: '建議用英文，如 Function Generators。' },
    },
    {
      name: 'nameZh',
      type: 'text',
      label: '中文名稱',
      admin: { description: '如 函数信号发生器。' },
    },
    {
      name: 'slug',
      type: 'text',
      label: '網址代稱',
      required: true,
      unique: true,
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
      name: 'description',
      type: 'textarea',
      label: '分類說明',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: '上層分類',
      admin: { description: '選用，支援階層分類。' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: '排序',
      defaultValue: 100,
    },
  ],
}
