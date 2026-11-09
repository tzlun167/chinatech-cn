import { getPayload } from 'payload'
import config from '@/payload.config'

/** 取得 Payload 實例（伺服器端）。 */
export async function getPayloadClient() {
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
}

export const SITE = {
  name: '上海优电电子科技有限公司',
  shortName: 'CTS',
  parent: '台湾中仪科技股份有限公司（Chinatech Corporation）',
  phone: '021-58133801',
  email: 'frank@chinatech.com.tw',
  address: '上海市浦东新区康桥镇康桥东路 1258 弄 10 号厂房',
  url: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
}
