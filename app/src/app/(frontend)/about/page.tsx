import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { SITE } from '@/lib/payload'

export const metadata: Metadata = {
  title: '关于我们',
  description:
    '上海优电电子科技有限公司成立於 2005 年，是台湾中仪科技股份有限公司设立於上海的分公司，从事测试与量测仪器设备及电子零件的销售。',
}

const PRODUCT_TYPES = [
  '直流电源供应器',
  '交流电源供应器',
  '数字万用表',
  '脉冲／函数／方波／三角波／任意波形产生器',
  '直流电子负载',
  '手持式频谱分析仪',
  '数字源表',
  '精密电阻测试仪',
  '波形放大器',
  '频率计',
  'LCR 表',
  '电流探头',
  'RF 射频信号发生器',
  '变压器综合测试仪',
  '频率响应分析仪',
  '功率分析仪',
  'EN 61000-3-2 / 3 谐波与闪烁测试系统',
  'EMC 电波暗室',
  'EMC 接收机 LISN',
  'EMC 功率放大器',
  '放大参考信号源',
  '硬盘数据备份阵列机',
]

export default function AboutPage() {
  return (
    <div className="wrap">
      <div className="breadcrumb">
        <Link href="/">首页</Link> / 关于我们
      </div>

      <div className="section-head">
        <h2>关于我们</h2>
      </div>

      <div className="prose">
        <p>
          【{SITE.name}】成立於 2005 年，是{SITE.parent}
          【Chinatech Corporation】设立於上海的分公司，从事测试与量测仪器设备以及电子零件的销售。
          主要代理和经销美国、英国、瑞士、中国、台湾地区等国际知名的高精密电子量测仪器和系统。
        </p>
        <p>
          上海优电之前与现在经销的品牌包括：Aim TTi、Laplace、REDLION、N4L、NTi、Voltech、
          ACCORDANCE 等。
        </p>

        <h2>产品类型</h2>
        <p>产品类型包括：</p>
        <ul>
          {PRODUCT_TYPES.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <h2>专业服务</h2>
        <p>
          上海优电以专业的、完善的产品和服务，而普遍为业界所支持和认同，而得以不断成长扩大。
          公司不但能够为中港台分销商和客户提供产品资讯、产品说明、教育训练、技术支援等服务，
          更能提供有效、快捷、专业的安装调整测试、定期校正、维修产品等售后服务。
        </p>

        <h2>联络我们</h2>
        <div className="info-grid">
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

        <p style={{ marginTop: 28 }}>
          <Link className="btn btn-brand" href="/products">
            浏览产品
          </Link>
        </p>
      </div>
    </div>
  )
}
