import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { zhTw } from '@payloadcms/translations/languages/zhTw'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Pages } from './collections/Pages'
import { Inquiries } from './collections/Inquiries'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— 上海優電 CTS 官網管理',
    },
  },
  // 後台介面語系（繁體中文）；使用者可在後台自行切換
  i18n: {
    supportedLanguages: { zhTw },
    fallbackLanguage: 'zhTw',
  },
  collections: [Users, Media, Brands, Categories, Products, Pages, Inquiries],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3300'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3300'],
  plugins: [],
})
