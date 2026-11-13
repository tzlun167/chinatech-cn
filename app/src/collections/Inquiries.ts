import type { CollectionConfig } from 'payload'

/**
 * 詢價表單（F-09）
 * 前台可寫、後台可讀；不可由 API 讀取（防個資外洩）。
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: {
    singular: '詢價單',
    plural: '詢價單',
  },
  admin: {
    useAsTitle: 'name',
    group: '內容',
    defaultColumns: ['name', 'email', 'product', 'status', 'createdAt'],
    description: '商品詢價表單紀錄。',
  },
  access: {
    // 任何人可送出（create）；僅登入者可讀取
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '稱呼',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: '聯絡電話',
    },
    {
      name: 'company',
      type: 'text',
      label: '公司名稱',
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: '詢問商品',
      admin: { description: '由商品頁自動帶入。' },
    },
    {
      name: 'message',
      type: 'textarea',
      label: '內容',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      label: '來源頁面',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: '處理狀態',
      required: true,
      defaultValue: 'new',
      options: [
        { label: '新進', value: 'new' },
        { label: '已回覆', value: 'replied' },
        { label: '已結案', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
