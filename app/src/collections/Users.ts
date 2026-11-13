import type { CollectionConfig } from 'payload'

/**
 * 後台帳號（R1）
 * 不開放公開註冊；僅 admin 可建立其他使用者。
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '使用者',
    plural: '使用者',
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 小時
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 鎖定 10 分鐘
  },
  admin: {
    useAsTitle: 'email',
    group: '系統',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
  },
  access: {
    // 僅登入者可讀；admin 可管理全部
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
    // 未登入不得呼叫 admin API
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '姓名',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: '角色',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: '管理員（全權）', value: 'admin' },
        { label: '編輯（僅內容）', value: 'editor' },
      ],
      access: {
        // 只有 admin 能改角色，避免 editor 自我提權
        update: ({ req }) => req.user?.role === 'admin',
      },
      saveToJWT: true,
    },
  ],
}
