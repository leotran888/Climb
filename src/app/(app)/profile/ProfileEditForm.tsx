'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileEditForm({
  userId,
  initialName,
}: {
  userId: string
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSave() {
    setLoading(true)
    setMsg('')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('user_id', userId)
    setMsg(error ? 'Lỗi: ' + error.message : 'Đã lưu!')
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 8, display: 'block' }}>
          Họ và tên
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', border: '1.5px solid rgba(22,163,68,0.2)', borderRadius: 14, padding: '10px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#192e1e', background: '#fff', outline: 'none' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#16a344' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(22,163,68,0.2)' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#16a344', color: '#fff', border: 'none', borderRadius: 50, padding: '10px 22px', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !name.trim()) ? 0.5 : 1 }}
        >
          {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
        </button>
        {msg && <span style={{ fontSize: 12, fontWeight: 600, color: msg.startsWith('Lỗi') ? '#ef4444' : '#16a344' }}>{msg}</span>}
      </div>
    </div>
  )
}
