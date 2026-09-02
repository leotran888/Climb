import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CreateFolderCard } from './VocabFoldersClient'

const FOLDER_BG: Record<string, string> = {
  green:  'rgba(22,163,68,.06)',
  amber:  'rgba(245,170,0,.06)',
  blue:   'rgba(80,80,220,.04)',
  pink:   'rgba(220,80,80,.04)',
  purple: 'rgba(120,80,220,.04)',
}

export default async function VocabularyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: folders } = await supabase
    .from('vocab_folders')
    .select('*, vocab_words(status)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const allWords      = (folders ?? []).flatMap((f: { vocab_words: { status: string }[] }) => f.vocab_words ?? [])
  const totalWords    = allWords.length
  const knownCount    = allWords.filter((w: { status: string }) => w.status === 'known').length
  const learningCount = allWords.filter((w: { status: string }) => w.status === 'learning').length
  const newCount      = allWords.filter((w: { status: string }) => w.status === 'new').length

  const STAT_CARD = { background: '#fff', border: '1.5px solid rgba(22,163,68,0.13)', borderRadius: 16, padding: '18px 20px' }

  return (
    <div style={{ paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#16a344', marginBottom: 6 }}>
          ✦ Kho từ vựng
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#192e1e', letterSpacing: '-.02em', lineHeight: 1.1 }}>
          Sổ từ vựng
        </h1>
      </div>

      {/* 4-stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Tổng từ</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#192e1e', fontVariantNumeric: 'tabular-nums' }}>{totalWords || '—'}</p>
        </div>
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Đã thuộc</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#16a344', fontVariantNumeric: 'tabular-nums' }}>{knownCount || '—'}</p>
        </div>
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Đang học</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#f5aa00', fontVariantNumeric: 'tabular-nums' }}>{learningCount || '—'}</p>
        </div>
        <div style={STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Từ mới</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#192e1e', fontVariantNumeric: 'tabular-nums' }}>{newCount || '—'}</p>
        </div>
      </div>

      {/* Featured — Writing vocabulary */}
      <Link href="/vocabulary/writing" style={{ textDecoration: 'none', display: 'block', marginBottom: 28 }}>
        <div style={{ background: 'linear-gradient(135deg, #1b3621 0%, #1e5c2e 100%)', borderRadius: 20, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>✦ Bộ từ vựng Writing</p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 6 }}>Từ vựng 18 chủ đề IELTS</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>80 từ học thuật cần thiết cho Writing Task 2</p>
          </div>
          <button style={{ padding: '10px 22px', borderRadius: 50, border: 'none', background: '#16a344', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Học ngay →
          </button>
        </div>
      </Link>

      {/* Folder section */}
      <p style={{ fontSize: 16, fontWeight: 900, color: '#192e1e', marginBottom: 16 }}>Thư mục của bạn</p>

      {(folders ?? []).length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <CreateFolderCard userId={user!.id} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {(folders ?? []).map((folder: { id: string; name: string; color: string; vocab_words: { status: string }[] }) => {
            const words   = folder.vocab_words ?? []
            const known   = words.filter((w: { status: string }) => w.status === 'known').length
            const pct     = words.length ? Math.round((known / words.length) * 100) : 0
            const bgColor = FOLDER_BG[folder.color] ?? FOLDER_BG.green
            return (
              <Link key={folder.id} href={`/vocabulary/${folder.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: bgColor, border: '1.5px solid rgba(22,163,68,0.13)', borderRadius: 16, padding: 20, cursor: 'pointer' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#192e1e', marginBottom: 4 }}>{folder.name}</p>
                  <p style={{ fontSize: 12, color: '#5a7864', fontWeight: 600, marginBottom: 14 }}>{words.length} từ</p>
                  <div style={{ background: 'rgba(22,163,68,.1)', borderRadius: 50, height: 6 }}>
                    <div style={{ height: '100%', borderRadius: 50, background: '#16a344', width: `${pct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, fontWeight: 700, color: '#5a7864' }}>
                    <span>{known} đã thuộc</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              </Link>
            )
          })}
          <CreateFolderCard userId={user!.id} />
        </div>
      )}
    </div>
  )
}
