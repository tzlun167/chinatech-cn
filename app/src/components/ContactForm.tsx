'use client'

import React, { useState } from 'react'

/**
 * 聯絡我們表單（F-08 / F-09）。
 * 送出至 Payload `inquiries`（product 可空）。
 */
export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const fd = new FormData(form)

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
          message: fd.get('message'),
          source: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.errors?.[0]?.message || `HTTP ${res.status}`)
      }

      const umami = (window as unknown as { umami?: { track: (n: string) => void } }).umami
      umami?.track('contact_submit')

      setStatus('ok')
      setMessage('已收到您的讯息，我们将尽快与您联系。')
      form.reset()
    } catch (err) {
      setStatus('error')
      setMessage(`送出失败：${(err as Error).message}`)
    }
  }

  if (status === 'ok') {
    return <p className="notice">✓ {message}</p>
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="ct-name">称呼 *</label>
          <input id="ct-name" name="name" required />
        </div>
        <div className="field">
          <label htmlFor="ct-email">Email *</label>
          <input id="ct-email" name="email" type="email" required />
        </div>
        <div className="field">
          <label htmlFor="ct-phone">联络电话</label>
          <input id="ct-phone" name="phone" />
        </div>
        <div className="field">
          <label htmlFor="ct-company">公司名称</label>
          <input id="ct-company" name="company" />
        </div>
        <div className="field field-full">
          <label htmlFor="ct-message">留言内容 *</label>
          <textarea id="ct-message" name="message" rows={4} required />
        </div>
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
          {status === 'sending' ? '送出中…' : '送出留言'}
        </button>
      </p>
      {status === 'error' ? <p style={{ color: '#b03a2e' }}>{message}</p> : null}
    </form>
  )
}
