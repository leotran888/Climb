import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FolderCard, CreateFolderCard } from './VocabFoldersClient'
import { ALL_ITEMS } from './writing/data'

const ITEM_MAP = new Map(ALL_ITEMS.map(i => [i.id, i]))

const TYPE_LABEL: Record<string, string> = {
  vocabulary:    'Từ vựng',
  collocation:   'Collocation',
  phrasal_verb:  'Phrasal verb',
}

export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: folders }, { data: progressRows }] = await Promise.all([
    supabase
      .from('vocab_folders')
      .select('*, vocab_words(status)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('writing_vocab_progress')
      .select('item_id, status')
      .eq('user_id', user!.id),
  ])

  const knownCount    = (progressRows ?? []).filter((r: { status: string }) => r.status === 'learned').length
  const learningCount = (progressRows ?? []).filter((r: { status: string }) => r.status === 'learning').length
  const totalWords    = knownCount + learningCount

  // Words to show in detail view
  const viewStatus = view === 'learned' ? 'learned' : view === 'learning' ? 'learning' : null
  const viewItems = viewStatus
    ? (progressRows ?? [])
        .filter((r: { item_id: string; status: string }) => r.status === viewStatus)
        .map((r: { item_id: string; status: string }) => ({ row: r, item: ITEM_MAP.get(r.item_id) }))
        .filter(({ item }) => !!item)
    : []

  const STAT_CARD: React.CSSProperties = {
    background: '#fff',
    border: '1.5px solid rgba(22,163,68,0.13)',
    borderRadius: 16,
    padding: '18px 20px',
    textDecoration: 'none',
    display: 'block',
  }
  const STAT_CARD_ACTIVE: React.CSSProperties = {
    ...STAT_CARD,
    border: '1.5px solid rgba(22,163,68,.45)',
    boxShadow: '0 0 0 3px rgba(22,163,68,.08)',
  }

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

      {/* 3-stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <Link href="/vocabulary" style={view ? STAT_CARD : STAT_CARD_ACTIVE}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Tổng từ</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#192e1e', fontVariantNumeric: 'tabular-nums' }}>{totalWords || '—'}</p>
        </Link>
        <Link href={view === 'learned' ? '/vocabulary' : '/vocabulary?view=learned'} style={view === 'learned' ? STAT_CARD_ACTIVE : STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Đã thuộc</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#16a344', fontVariantNumeric: 'tabular-nums' }}>{knownCount || '—'}</p>
        </Link>
        <Link href={view === 'learning' ? '/vocabulary' : '/vocabulary?view=learning'} style={view === 'learning' ? STAT_CARD_ACTIVE : STAT_CARD}>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a7864', marginBottom: 6 }}>Đang học</p>
          <p style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: '#f5aa00', fontVariantNumeric: 'tabular-nums' }}>{learningCount || '—'}</p>
        </Link>
      </div>

      {/* Word list (when a stat card is active) */}
      {viewStatus && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 16, fontWeight: 900, color: '#192e1e', marginBottom: 14 }}>
            {viewStatus === 'learned' ? 'Từ đã thuộc' : 'Từ đang học'}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#5a7864', marginLeft: 8 }}>({viewItems.length} từ)</span>
          </p>
          {viewItems.length === 0 ? (
            <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 16, padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#5a7864', fontWeight: 600 }}>Chưa có từ nào.</p>
              <Link href="/vocabulary/writing" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 800, color: '#16a344', textDecoration: 'none' }}>
                Học từ vựng Writing →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {viewItems.map(({ item }) => {
                if (!item) return null
                return (
                  <Link key={item.id} href={`/vocabulary/writing?highlight=${item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1.5px solid rgba(22,163,68,.13)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#192e1e' }}>{item.term}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#5a7864', background: 'rgba(22,163,68,.08)', borderRadius: 6, padding: '2px 7px' }}>
                            {TYPE_LABEL[item.type] ?? item.type}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#5a7864', background: 'rgba(22,163,68,.06)', borderRadius: 6, padding: '2px 7px' }}>
                            {item.topic}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#5a7864', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.definition}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: viewStatus === 'learned' ? '#16a344' : '#d4900a', fontWeight: 800, flexShrink: 0 }}>
                        {viewStatus === 'learned' ? '✓ Learned' : '⟳ Learning'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

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
          {(folders ?? []).map((folder: { id: string; name: string; color: string; vocab_words: { status: string }[] }) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
          <CreateFolderCard userId={user!.id} />
        </div>
      )}
    </div>
  )
}
