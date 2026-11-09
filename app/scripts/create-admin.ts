/**
 * 建立／更新第一位管理員帳號。
 *
 * 用法：
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run create-admin
 *
 * 冪等：同 email 已存在則更新密碼與角色。
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME || '管理員'

if (!email || !password) {
  console.error('✗ 需要 ADMIN_EMAIL 與 ADMIN_PASSWORD 環境變數')
  process.exit(1)
}

const payload = await getPayload({ config })

const existing = await payload.find({
  collection: 'users',
  where: { email: { equals: email } },
  limit: 1,
})

if (existing.docs.length > 0) {
  const user = existing.docs[0]
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { password, role: 'admin', name },
  })
  console.log(`✓ 已更新既有帳號並重設為管理員：${email}`)
} else {
  await payload.create({
    collection: 'users',
    data: { email, password, role: 'admin', name },
  })
  console.log(`✓ 已建立管理員帳號：${email}`)
}

console.log(`  後台登入：${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin`)
process.exit(0)
