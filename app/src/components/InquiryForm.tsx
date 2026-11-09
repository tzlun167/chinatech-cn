'use client'

import React, { useState } from 'react'

/**
 * 詢價表單（F-09）。
 * 送出至 Payload `inquiries` collection（create 開放，read 需登入）。
 */
export function InquiryForm({
  productId,
  productName,
}: {
  productId: number | string
  productName: string
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const fd = new FormData(form)

    // honeypot：機器人會填，真人看不到
    if (fd.get('website')) {
      setStatus('ok')
      return
    }

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          phone: fd.get('phone') || undefined,
          company: fd.get('company') || undefined,
          product: productId,
          message: fd.get('message'),
          source: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.errors?.[0]?.message || `HTTP ${res.status}`)
      }

      // 到訪監控自訂事件（R3 / M-06）
      const umami = (window as unknown as { umami?: { track: (n: string, d?: unknown) => void } }).umami
      umami?.track('inquiry_submit', { product: productName })

      setStatus('ok')
      setMessage('已收到您的询问，我们将尽快与您联系。')
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(`送出失败：${(err as Error).message}`)
    }
  }

  if (status === 'ok') {
    return (
      <div className="inquiry-box">
        <h3>✓ 询价已送出</h3>
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div className="inquiry-box">
      <h3>询问此产品</h3>
      <p>留下联络方式，我们将提供报价与技术支持。</p>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="iq-name">称呼 *</label>
            <input id="iq-name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="iq-email">Email *</label>
            <input id="iq-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="iq-phone">联络电话</label>
            <input id="iq-phone" name="phone" />
          </div>
          <div className="field">
            <label htmlFor="iq-company">公司名称</label>
            <input id="iq-company" name="company" />
          </div>
          <div className="field field-full">
            <label htmlFor="iq-message">询问内容 *</label>
            <textarea id="iq-message" name="message" rows={4} required defaultValue={`我想询问 ${productName} 的报价与交期。`} />
          </div>
          {/* honeypot */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
          />
        </div>
        <p style={{ marginTop: 16 }}>
          <button className="btn btn-brand" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? '送出中…' : '送出询价'}
          </button>
        </p>
        {status === 'error' ? <p style={{ color: '#b03a2e' }}>{message}</p> : null}
      </form>
    </div>
  )
}
