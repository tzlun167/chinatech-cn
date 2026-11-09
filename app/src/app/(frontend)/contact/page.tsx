import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { SITE } from '@/lib/payload'
import { ContactForm } from '@/components/ContactForm'

export const metadata: Metadata = {
  title: '联系方式',
  description: `上海优电电子科技有限公司 — 电话 ${SITE.phone}，${SITE.address}`,
}

export default function ContactPage() {
  return (
    <div className="wrap">
      <div className="breadcrumb">
        <Link href="/">首页</Link> / 联系方式
      </div>

      <div className="section-head">
        <h2>联系方式</h2>
        <p>欢迎来电或填写下方表单，我们将尽快回覆。</p>
      </div>

      <div className="info-grid" style={{ marginBottom: 42 }}>
        <div className="info-card">
          <h3>电话</h3>
          <p>{SITE.phone}</p>
        </div>
        <div className="info-card">
          <h3>联络信箱</h3>
          <p>{SITE.email}</p>
        </div>
        <div className="info-card">
          <h3>联络位置</h3>
          <p>{SITE.address}</p>
        </div>
      </div>

      <div className="inquiry-box" style={{ background: '#fff' }}>
        <h3>在线留言</h3>
        <p>留下您的需求，我们会尽快与您联系。</p>
        <ContactForm />
      </div>
    </div>
  )
}
