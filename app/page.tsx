```tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'dhavvin_09', 'lopikpl']
const COUNTRIES = [
  { code: 'pl', name: 'Poland' },
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'be', name: 'Belgium' },
  { code: 'se', name: 'Sweden' },
  { code: 'no', name: 'Norway' },
  { code: 'fi', name: 'Finland' },
  { code: 'dk', name: 'Denmark' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'at', name: 'Austria' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'hu', name: 'Hungary' },
  { code: 'ro', name: 'Romania' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lv', name: 'Latvia' },
  { code: 'ee', name: 'Estonia' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ie', name: 'Ireland' },
  { code: 'gr', name: 'Greece' },
  { code: 'hr', name: 'Croatia' },
  { code: 'rs', name: 'Serbia' },
  { code: 'tr', name: 'Turkey' },
  { code: 'ru', name: 'Russia' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'co', name: 'Colombia' },
  { code: 'pe', name: 'Peru' },
  { code: 've', name: 'Venezuela' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'cn', name: 'China' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'ph', name: 'Philippines' },
  { code: 'id', name: 'Indonesia' },
  { code: 'my', name: 'Malaysia' },
  { code: 'sg', name: 'Singapore' },
  { code: 'th', name: 'Thailand' },
  { code: 'vn', name: 'Vietnam' },
  { code: 'in', name: 'India' },
  { code: 'ae', name: 'United Arab Emirates' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'il', name: 'Israel' },
  { code: 'eg', name: 'Egypt' },
  { code: 'za', name: 'South Africa' },
  { code: 'nz', name: 'New Zealand' },
]

interface VictorEntry {
  username: string
  video_url?: string
}

interface GoofyLevel {
  id: number
  title: string
  creator: string
  verifier?: string
  verification_url?: string
  thumbnail?: string
  points?: number
  mode?: 'classic' | 'platformer'
  gd_level_id?: string
  victors?: VictorEntry[]
  submitted_by?: string
  status?: string
}

interface Submission {
  id: number
  level_id: number
  level_title?: string
  mode: 'classic' | 'platformer'
  player_username: string
  player_name: string
  progress: number
  video_url: string
  enjoyment: number
  mod_notes: string
  status: string
}

interface Profile {
  id: string
  username: string
  display_name: string
  country: string
  email: string
  youtube: string
  discord: string
  twitter: string
  warnings: string[]
}

interface Moderator {
  id: number
  name: string
  clan?: string
  country_code: string
  role: 'editor' | 'helper'
}

interface PlayerLeaderboardRow extends Profile {
  totalPoints: number
  completedCount: number
  hardestLevel: GoofyLevel | null
  entries: {
    level: GoofyLevel
    progress: number
    pointsEarned: number
    role: 'Verifier' | 'Victor' | 'Progress'
    videoUrl?: string
  }[]
}

function getYouTubeThumbnail(url?: string, fallbackSeed = 'gll'): string {
  if (!url) return `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/320/180`
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/)
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  }
  if (url.startsWith('http')) return url
  return `https://picsum.photos/seed/${encodeURIComponent(fallbackSeed)}/320/180`
}

export default function Home() {
  const [levels, setLevels] = useState<GoofyLevel[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [moderators, setModerators] = useState<Moderator[]>([])

  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'classic' | 'platformer' | 'leaderboard' | 'roulette' | 'profile' | 'mod' | 'login' | 'register'>('classic')
  const [sidebarForm, setSidebarForm] = useState<'none' | 'record' | 'level'>('none')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [bannerMsg, setBannerMsg] = useState('')

  // Register states
  const [regUsername, setRegUsername] = useState('')
  const [regDisplay, setRegDisplay] = useState('')
  const [regCountry, setRegCountry] = useState('pl')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  // Login states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Submit Record states
  const [recMode, setRecMode] = useState<'classic' | 'platformer'>('classic')
  const [recLevelId, setRecLevelId] = useState<number>(0)
  const [recProgress, setRecProgress] = useState(100)
  const [recVideo, setRecVideo] = useState('')
  const [recEnjoyment, setRecEnjoyment] = useState(8)
  const [recNotes, setRecNotes] = useState('')

  // Submit Level states
  const [lvlMode, setLvlMode] = useState<'classic' | 'platformer'>('classic')
  const [lvlTitle, setLvlTitle] = useState('')
  const [lvlCreator, setLvlCreator] = useState('')
  const [lvlVerifier, setLvlVerifier] = useState('')
  const [lvlGdId, setLvlGdId] = useState('')
  const [lvlVerifyVideo, setLvlVerifyVideo] = useState('')
  const [lvlPoints, setLvlPoints] = useState('250.00')

  // Profile Editor states
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editCountry, setEditCountry] = useState('pl')
  const [editYoutube, setEditYoutube] = useState('')
  const [editDiscord, setEditDiscord] = useState('')
  const [editTwitter, setEditTwitter] = useState('')

  // Mod Warning & Staff states
  const [warnTargetUser, setWarnTargetUser] = useState('')
  const [warnReason, setWarnReason] = useState('')
  const [modName, setModName] = useState('')
  const [modClan, setModClan] = useState('')
  const [modCountry, setModCountry] = useState('pl')
  const [modRole, setModRole] = useState<'editor' | 'helper'>('editor')

  // Mod Edit Level Modal states
  const [editingLevel, setEditingLevel] = useState<GoofyLevel | null>(null)
  const [newVictorName, setNewVictorName] = useState('')
  const [newVictorVideo, setNewVictorVideo] = useState('')

  // Leaderboard Player Stats Modal state
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerLeaderboardRow | null>(null)

  // Roulette state
  const [rouletteLevel, setRouletteLevel] = useState<GoofyLevel | null>(null)

  const isMod = currentUser ? ALLOWED_MODS.includes(currentUser.username.toLowerCase()) : false

  useEffect(() => {
    refreshAll()
    restoreSession()
  }, [])

  async function restoreSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) {
        setCurrentUser(prof)
        syncProfileEditor(prof)
      }
    }
  }

  function syncProfileEditor(prof: Profile) {
    setEditDisplayName(prof.display_name || prof.username || '')
    setEditEmail(prof.email || '')
    setEditCountry(prof.country || 'pl')
    setEditYoutube(prof.youtube || '')
    setEditDiscord(prof.discord || '')
    setEditTwitter(prof.twitter || '')
  }

  async function refreshAll() {
    const [lvlRes, subRes, profRes, modRes] = await Promise.all([
      supabase.from('demons').select('*').order('points', { ascending: false }),
      supabase.from('submissions').select('*').order('id', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('moderators').select('*').order('id', { ascending: true }),
    ])
    if (lvlRes.data) setLevels(lvlRes.data)
    if (subRes.data) setSubmissions(subRes.data)
    if (profRes.data) setProfiles(profRes.data)
    if (modRes.data) setModerators(modRes.data)
  }

  function showNotice(msg: string) {
    setBannerMsg(msg)
    setTimeout(() => setBannerMsg(''), 7000)
  }

  // AUTH: REGISTER
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    const cleanUser = regUsername.trim().toLowerCase()
    if (!cleanUser) return

    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPass,
    })

    if (error) {
      alert('Registration error: ' + error.message)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          username: cleanUser,
          display_name: regDisplay.trim() || regUsername.trim(),
          country: regCountry,
          email: regEmail.trim(),
          warnings: [],
        },
      ])
    }

    await supabase.auth.signOut()
    setRegPass('')
    setActiveTab('login')
    showNotice('Account registered! Log in now with your email and password.')
  }

  // AUTH: LOGIN
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPass,
    })

    if (error) {
      alert('Login failed: ' + error.message)
      return
    }

    if (data.user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (prof) {
        setCurrentUser(prof)
        syncProfileEditor(prof)
      }
      setLoginPass('')
      setActiveTab('classic')
      refreshAll()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setActiveTab('classic')
  }

  // SUBMIT RECORD
  async function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in first to submit a record!')
      setActiveTab('login')
      return
    }
    const chosen = approvedLevels.find((l) => l.id === recLevelId) || approvedLevels.filter((l) => (l.mode || 'classic') === recMode)[0]
    if (!chosen) {
      alert('No approved levels available in this category yet.')
      return
    }

    const { error } = await supabase.from('submissions').insert([
      {
        level_id: chosen.id,
        level_title: chosen.title,
        mode: recMode,
        player_username: currentUser.username,
        player_name: currentUser.display_name,
        progress: recProgress,
        video_url: recVideo.trim(),
        enjoyment: recEnjoyment,
        mod_notes: recNotes.trim(),
        status: 'pending',
      },
    ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setRecVideo('')
      setRecNotes('')
      setSidebarForm('none')
      refreshAll()
      showNotice('Record submitted! You can track its pending status in your Profile tab.')
    }
  }

  // SUBMIT NEW LEVEL
  async function handleLevelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in first to submit a level!')
      setActiveTab('login')
      return
    }

    const autoThumb = getYouTubeThumbnail(lvlVerifyVideo, lvlTitle)

    const { error } = await supabase.from('demons').insert([
      {
        title: lvlTitle.trim(),
        creator: lvlCreator.trim(),
        verifier: lvlVerifier.trim() || currentUser.display_name,
        gd_level_id: lvlGdId.trim(),
        verification_url: lvlVerifyVideo.trim(),
        thumbnail: autoThumb,
        points: parseFloat(lvlPoints) || 200,
        mode: lvlMode,
        victors: [],
        submitted_by: currentUser.username,
        status: 'pending',
      },
    ])

    if (error) {
      alert('Error submitting level: ' + error.message)
    } else {
      setLvlTitle('')
      setLvlCreator('')
      setLvlVerifier('')
      setLvlGdId('')
      setLvlVerifyVideo('')
      setSidebarForm('none')
      refreshAll()
      showNotice('Goofy Level sent to admins for review! Check pending status in your Profile.')
    }
  }

  // MOD: DELETE LEVEL
  async function handleDeleteLevel(levelId: number, title: string) {
    if (!isMod) return
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    const { error } = await supabase.from('demons').delete().eq('id', levelId)
    if (error) {
      alert('Error deleting level: ' + error.message)
    } else {
      refreshAll()
      showNotice(`Deleted "${title}".`)
    }
  }

  // MOD: SAVE EDITED LEVEL
  async function handleSaveEditedLevel(e: React.FormEvent) {
    e.preventDefault()
    if (!isMod || !editingLevel) return

    const updatedThumb = getYouTubeThumbnail(editingLevel.verification_url, editingLevel.title)

    const { error } = await supabase
      .from('demons')
      .update({
        title: editingLevel.title.trim(),
        creator: editingLevel.creator.trim(),
        verifier: (editingLevel.verifier || '').trim(),
        gd_level_id: (editingLevel.gd_level_id || '').trim(),
        verification_url: (editingLevel.verification_url || '').trim(),
        thumbnail: updatedThumb,
        points: Number(editingLevel.points) || 0,
        mode: editingLevel.mode || 'classic',
        victors: editingLevel.victors || [],
      })
      .eq('id', editingLevel.id)

    if (error) {
      alert('Error updating level: ' + error.message)
    } else {
      setEditingLevel(null)
      refreshAll()
      showNotice('Level updated!')
    }
  }

  function addVictorToEditingLevel() {
    if (!editingLevel || !newVictorName.trim()) return
    const nextVictors = [
      ...(editingLevel.victors || []),
      { username: newVictorName.trim(), video_url: newVictorVideo.trim() },
    ]
    setEditingLevel({ ...editingLevel, victors: nextVictors })
    setNewVictorName('')
    setNewVictorVideo('')
  }

  function removeVictorFromEditingLevel(index: number) {
    if (!editingLevel) return
    const nextVictors = (editingLevel.victors || []).filter((_, i) => i !== index)
    setEditingLevel({ ...editingLevel, victors: nextVictors })
  }

  // UPDATE PROFILE
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return

    const trimmedDisplay = editDisplayName.trim()
    if (!trimmedDisplay) {
      alert('Display name cannot be empty!')
      return
    }

    if (editPassword.trim().length >= 6) {
      const { error: pwErr } = await supabase.auth.updateUser({ password: editPassword.trim() })
      if (pwErr) alert('Password update note: ' + pwErr.message)
    }

    if (editEmail.trim() && editEmail.trim() !== currentUser.email) {
      const { error: emErr } = await supabase.auth.updateUser({ email: editEmail.trim() })
      if (emErr) alert('Email update note: ' + emErr.message)
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: trimmedDisplay,
        email: editEmail.trim(),
        country: editCountry,
        youtube: editYoutube.trim(),
        discord: editDiscord.trim(),
        twitter: editTwitter.trim(),
      })
      .eq('id', currentUser.id)

    if (!error) {
      const updated = {
        ...currentUser,
        display_name: trimmedDisplay,
        email: editEmail.trim(),
        country: editCountry,
        youtube: editYoutube.trim(),
        discord: editDiscord.trim(),
        twitter: editTwitter.trim(),
      }
      setCurrentUser(updated)
      setEditPassword('')
      refreshAll()
      showNotice('Profile settings & display name saved!')
    }
  }

  // MODERATOR: ISSUE WARNING
  async function handleIssueWarning(e: React.FormEvent) {
    e.preventDefault()
    if (!isMod || !warnTargetUser.trim() || !warnReason.trim()) return

    const target = profiles.find((p) => p.username.toLowerCase() === warnTargetUser.trim().toLowerCase())
    if (!target) {
      alert('User not found.')
      return
    }

    const nextWarnings = [...(target.warnings || []), `${warnReason.trim()} (by ${currentUser?.username})`]
    await supabase.from('profiles').update({ warnings: nextWarnings }).eq('id', target.id)
    setWarnTargetUser('')
    setWarnReason('')
    refreshAll()
    showNotice(`Warning issued to ${target.username}.`)
  }

  // LEADERBOARD CALCULATION
  const approvedLevels = levels.filter((l) => (l.status || 'approved') === 'approved')
  const pendingLevels = levels.filter((l) => l.status === 'pending')
  const approvedSubs = submissions.filter((s) => s.status === 'approved')
  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  const leaderboard: PlayerLeaderboardRow[] = profiles
    .map((prof) => {
      const uLower = prof.username.trim().toLowerCase()
      const dLower = (prof.display_name || prof.username).trim().toLowerCase()
      const seenLevelIds = new Set<number>()
      const entries: PlayerLeaderboardRow['entries'] = []

      approvedLevels.forEach((lvl) => {
        const verLower = (lvl.verifier || '').trim().toLowerCase()
        if (verLower && (verLower === uLower || verLower === dLower) && !seenLevelIds.has(lvl.id)) {
          seenLevelIds.add(lvl.id)
          entries.push({
            level: lvl,
            progress: 100,
            pointsEarned: Number(lvl.points || 0),
            role: 'Verifier',
            videoUrl: lvl.verification_url,
          })
        }
      })

      approvedSubs
        .filter((s) => s.player_username.trim().toLowerCase() === uLower)
        .forEach((sub) => {
          const lvl = approvedLevels.find((l) => l.id === sub.level_id)
          if (!lvl || seenLevelIds.has(lvl.id)) return
          seenLevelIds.add(lvl.id)
          const basePts = Number(lvl.points || 0)
          const earned = sub.progress === 100 ? basePts : basePts * (sub.progress / 100) * 0.25
          entries.push({
            level: lvl,
            progress: sub.progress,
            pointsEarned: earned,
            role: sub.progress === 100 ? 'Victor' : 'Progress',
            videoUrl: sub.video_url,
          })
        })

      approvedLevels.forEach((lvl) => {
        if (seenLevelIds.has(lvl.id)) return
        const manualVictor = (lvl.victors || []).find((v) => {
          const vLower = v.username.trim().toLowerCase()
          return vLower === uLower || vLower === dLower
        })
        if (manualVictor) {
          seenLevelIds.add(lvl.id)
          entries.push({
            level: lvl,
            progress: 100,
            pointsEarned: Number(lvl.points || 0),
            role: 'Victor',
            videoUrl: manualVictor.video_url,
          })
        }
      })

      const totalPoints = entries.reduce((sum, e) => sum + e.pointsEarned, 0)
      const fullCompletions = entries.filter((e) => e.progress === 100)
      const hardestLevel =
        fullCompletions.length > 0
          ? fullCompletions.sort((a, b) => Number(b.level.points || 0) - Number(a.level.points || 0))[0].level
          : null

      return {
        ...prof,
        totalPoints,
        completedCount: fullCompletions.length,
        hardestLevel,
        entries: entries.sort((a, b) => Number(b.level.points || 0) - Number(a.level.points || 0)),
      }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)

  function spinRoulette() {
    if (approvedLevels.length > 0) {
      setRouletteLevel(approvedLevels[Math.floor(Math.random() * approvedLevels.length)])
    }
    setActiveTab('roulette')
  }

  const cardClass = darkMode ? 'bg-[#2b2d31] border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-[#2c2f33]'
  const inputClass = darkMode
    ? 'w-full border border-gray-600 bg-[#1e1f22] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007acc]'
    : 'w-full border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#007acc]'

  const shownLevels = approvedLevels.filter(
    (l) =>
      (l.mode || 'classic') === (activeTab === 'platformer' ? 'platformer' : 'classic') &&
      (l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.creator.toLowerCase().includes(search.toLowerCase()) ||
        (l.gd_level_id || '').includes(search.trim()))
  )

  return (
    <div className={darkMode ? 'min-h-screen bg-[#18191c] text-gray-100 font-sans' : 'min-h-screen bg-[#f2f3f5] text-[#2c2f33] font-sans'}>
      {/* TOP HEADER */}
      <header className={darkMode ? 'bg-[#202225] border-b border-gray-800 sticky top-0 z-40' : 'bg-white border-b border-gray-200 sticky top-0 z-40'}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('classic')}>
            <span className="font-black tracking-tight text-xl uppercase text-[#1e3a8a]">
              GLL<span className="text-xs font-bold lowercase text-gray-500">.com</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-400 border-l pl-3">
              Goofy Levels List
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm font-semibold">
            {currentUser && (
              <img
                src={`https://flagcdn.com/w20/${currentUser.country.toLowerCase()}.png`}
                alt={currentUser.country}
                className="w-5 h-3.5 object-cover border border-gray-300"
              />
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 rounded hover:bg-gray-200 transition" title="Toggle Theme">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded font-bold hover:bg-blue-100"
                >
                  {currentUser.display_name}
                </button>
                <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-rose-600">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('login')} className="hover:text-[#007acc]">Login</button>
                <button onClick={() => setActiveTab('register')} className="bg-[#007acc] text-white px-3 py-1.5 rounded text-xs font-bold">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={darkMode ? 'bg-[#1b1c20] border-t border-gray-800' : 'bg-[#fafafa] border-t border-gray-200'}>
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center text-sm font-semibold">
            <button
              onClick={() => setActiveTab('classic')}
              className={`px-5 py-2.5 border-b-2 ${activeTab === 'classic' ? 'border-[#007acc] text-[#007acc]' : 'border-transparent'}`}
            >
              Classic Goofy Levels
            </button>
            <button
              onClick={() => setActiveTab('platformer')}
              className={`px-5 py-2.5 border-b-2 ${activeTab === 'platformer' ? 'border-[#007acc] text-[#007acc]' : 'border-transparent'}`}
            >
              Platformer Goofy Levels
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-5 py-2.5 border-b-2 ${activeTab === 'leaderboard' ? 'border-[#007acc] text-[#007acc]' : 'border-transparent'}`}
            >
              Leaderboard
            </button>
            <button
              onClick={spinRoulette}
              className={`px-5 py-2.5 border-b-2 ${activeTab === 'roulette' ? 'border-[#007acc] text-[#007acc]' : 'border-transparent'}`}
            >
              Roulette
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-5 py-2.5 border-b-2 flex items-center gap-1.5 ${activeTab === 'profile' ? 'border-[#007acc] text-[#007acc]' : 'border-transparent'}`}
              >
                <span>My Profile</span>
                {(currentUser.warnings?.length || 0) > 0 && (
                  <span className="bg-rose-600 text-white text-[10px] px-1.5 rounded-full">{currentUser.warnings.length}</span>
                )}
              </button>
            )}
            {isMod && (
              <button
                onClick={() => setActiveTab('mod')}
                className={`px-5 py-2.5 border-b-2 flex items-center gap-1.5 ${activeTab === 'mod' ? 'border-amber-500 text-amber-600' : 'border-transparent text-amber-600'}`}
              >
                <span>Mod Panel</span>
                {pendingSubs.length + pendingLevels.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">
                    {pendingSubs.length + pendingLevels.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {bannerMsg && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded text-xs font-semibold flex justify-between">
            <span>{bannerMsg}</span>
            <button onClick={() => setBannerMsg('')} className="font-bold ml-4">x</button>
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <div className={`max-w-md mx-auto p-6 rounded border shadow space-y-4 ${cardClass}`}>
            <h2 className="text-2xl font-bold border-b pb-2">GLL Login</h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Password</label>
                <input required type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-[#007acc] text-white font-bold py-2 rounded">LOGIN</button>
            </form>
            <p className="text-xs text-center text-gray-500">
              Need an account?{' '}
              <button onClick={() => setActiveTab('register')} className="text-[#007acc] underline font-bold">Register here</button>
            </p>
          </div>
        )}

        {/* REGISTER TAB */}
        {activeTab === 'register' && (
          <div className={`max-w-md mx-auto p-6 rounded border shadow space-y-4 ${cardClass}`}>
            <h2 className="text-2xl font-bold border-b pb-2">GLL Register</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Username (lowercase, no spaces)</label>
                <input required type="text" placeholder="e.g. finniscrazyy" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Display Name</label>
                <input required type="text" placeholder="e.g. [ANT] FinnIsntCrazyy" value={regDisplay} onChange={(e) => setRegDisplay(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Country</label>
                <select value={regCountry} onChange={(e) => setRegCountry(e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Password (min 6 chars)</label>
                <input required minLength={6} type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-[#007acc] text-white font-bold py-2 rounded">REGISTER</button>
            </form>
          </div>
        )}

        {/* PROFILE TAB (WITH EDIT DISPLAY NAME) */}
        {activeTab === 'profile' && currentUser && (
          <div className={`max-w-2xl mx-auto p-6 rounded border shadow space-y-6 ${cardClass}`}>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>{currentUser.display_name}</span>
                  <img
                    src={`https://flagcdn.com/w20/${currentUser.country.toLowerCase()}.png`}
                    alt={currentUser.country}
                    className="w-5 h-3.5 object-cover border border-gray-300"
                  />
                </h2>
                <p className="text-xs text-gray-400">@{currentUser.username}</p>
              </div>
              {isMod && <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded font-bold">Staff / Mod</span>}
            </div>

            {/* Warning notices if any */}
            {(currentUser.warnings?.length || 0) > 0 && (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded text-xs space-y-1">
                <p className="font-bold">Moderator Warnings ({currentUser.warnings.length}):</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {currentUser.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Profile Editor Form */}
            <form onSubmit={handleProfileSave} className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#007acc]">Edit Profile Settings</h3>
              
              <div>
                <label className="block text-xs font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  maxLength={32}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="min 6 chars" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Country</label>
                <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">YouTube URL / Handle</label>
                  <input type="text" placeholder="e.g. @FinnIsntCrazyy" value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Discord Tag</label>
                  <input type="text" placeholder="e.g. finniscrazyy" value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">X / Twitter</label>
                  <input type="text" placeholder="e.g. @finniscrazyy" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="bg-[#007acc] text-white font-bold text-xs px-4 py-2 rounded">
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* CLASSIC / PLATFORMER LEVEL LIST VIEW */}
        {(activeTab === 'classic' || activeTab === 'platformer') && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  {activeTab === 'platformer' ? 'Platformer Goofy Levels' : 'Classic Goofy Levels'}
                </h1>
                <p className="text-xs text-gray-500">Demon list rated by difficulty and community enjoyment.</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search level or GD ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} w-60`}
                />
                {currentUser && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSidebarForm(sidebarForm === 'record' ? 'none' : 'record')}
                      className="bg-[#007acc] text-white text-xs font-bold px-3 py-2 rounded whitespace-nowrap"
                    >
                      {sidebarForm === 'record' ? 'Close Form' : '+ Submit Record'}
                    </button>
                    <button
                      onClick={() => setSidebarForm(sidebarForm === 'level' ? 'none' : 'level')}
                      className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded whitespace-nowrap"
                    >
                      {sidebarForm === 'level' ? 'Close Form' : '+ Submit Level'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT RECORD / LEVEL DRAWER */}
            {sidebarForm === 'record' && currentUser && (
              <form onSubmit={handleRecordSubmit} className={`p-4 rounded border shadow space-y-3 ${cardClass}`}>
                <h3 className="font-bold text-sm uppercase text-[#007acc]">Submit Record / Completion</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <select value={recMode} onChange={(e) => setRecMode(e.target.value as any)} className={inputClass}>
                      <option value="classic">Classic</option>
                      <option value="platformer">Platformer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Level</label>
                    <select
                      value={recLevelId}
                      onChange={(e) => setRecLevelId(Number(e.target.value))}
                      className={inputClass}
                    >
                      {approvedLevels
                        .filter((l) => (l.mode || 'classic') === recMode)
                        .map((l) => (
                          <option key={l.id} value={l.id}>{l.title} ({l.points} pts)</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Progress (%)</label>
                    <input type="number" min={1} max={100} value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Video Proof URL</label>
                    <input required type="url" placeholder="https://youtube.com/..." value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Enjoyment (1-10)</label>
                    <input type="number" min={1} max={10} value={recEnjoyment} onChange={(e) => setRecEnjoyment(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="bg-[#007acc] text-white font-bold text-xs px-4 py-2 rounded">
                  Send Record for Review
                </button>
              </form>
            )}

            {sidebarForm === 'level' && currentUser && (
              <form onSubmit={handleLevelSubmit} className={`p-4 rounded border shadow space-y-3 ${cardClass}`}>
                <h3 className="font-bold text-sm uppercase text-emerald-600">Submit New Goofy Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Category</label>
                    <select value={lvlMode} onChange={(e) => setLvlMode(e.target.value as any)} className={inputClass}>
                      <option value="classic">Classic</option>
                      <option value="platformer">Platformer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Level Title</label>
                    <input required type="text" placeholder="Level Name" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Creator</label>
                    <input required type="text" placeholder="Creator Name" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">GD Level ID</label>
                    <input type="text" placeholder="12345678" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Verifier</label>
                    <input type="text" placeholder="Verifier (default: you)" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Verification Video URL</label>
                    <input required type="url" placeholder="https://youtube.com/..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Points</label>
                    <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded">
                  Submit Level for Approval
                </button>
              </form>
            )}

            {/* LEVEL LIST DISPLAY */}
            {shownLevels.length === 0 ? (
              <div className={`p-8 text-center rounded border ${cardClass}`}>
                <p className="text-sm text-gray-500">No approved levels found in this category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shownLevels.map((lvl, index) => (
                  <div key={lvl.id} className={`p-4 rounded border shadow flex flex-col sm:flex-row items-center justify-between gap-4 ${cardClass}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <span className="font-black text-xl text-gray-400 w-10">#{index + 1}</span>
                      <a href={lvl.verification_url || '#'} target="_blank" rel="noreferrer" className="shrink-0">
                        <img
                          src={lvl.thumbnail || getYouTubeThumbnail(lvl.verification_url, lvl.title)}
                          alt={lvl.title}
                          className="w-32 h-18 object-cover rounded border border-gray-300 hover:opacity-90 transition"
                        />
                      </a>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base hover:text-[#007acc] transition">{lvl.title}</h3>
                          {lvl.gd_level_id && (
                            <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-mono">
                              ID: {lvl.gd_level_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          By <span className="font-semibold">{lvl.creator}</span> | Verified by <span className="font-semibold text-[#007acc]">{lvl.verifier || 'Unknown'}</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Victors: {(lvl.victors || []).length} players completed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="font-black text-lg text-[#007acc]">{Number(lvl.points || 0).toFixed(2)}</span>
                        <span className="text-xs text-gray-400 block">points</span>
                      </div>
                      {isMod && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingLevel(lvl)}
                            className="bg-amber-500 text-white text-xs px-2.5 py-1 rounded font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(lvl.id, lvl.title)}
                            className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOD EDIT LEVEL MODAL */}
        {editingLevel && isMod && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={handleSaveEditedLevel} className={`max-w-xl w-full p-6 rounded border shadow space-y-4 ${cardClass}`}>
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold">Edit Level: {editingLevel.title}</h3>
                <button type="button" onClick={() => setEditingLevel(null)} className="font-bold text-gray-400 hover:text-gray-200">X</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={editingLevel.title}
                    onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Creator</label>
                  <input
                    type="text"
                    value={editingLevel.creator}
                    onChange={(e) => setEditingLevel({ ...editingLevel, creator: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">GD Level ID</label>
                  <input
                    type="text"
                    value={editingLevel.gd_level_id || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, gd_level_id: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Verifier</label>
                  <input
                    type="text"
                    value={editingLevel.verifier || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, verifier: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Points</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLevel.points || 0}
                    onChange={(e) => setEditingLevel({ ...editingLevel, points: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Verification Video URL</label>
                <input
                  type="url"
                  value={editingLevel.verification_url || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, verification_url: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Manage Victors inside modal */}
              <div className="border-t pt-3 space-y-2">
                <label className="block text-xs font-bold uppercase text-[#007acc]">Manage Victors ({editingLevel.victors?.length || 0})</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {(editingLevel.victors || []).map((vic, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded text-xs">
                      <span>{vic.username} {vic.video_url && `(${vic.video_url})`}</span>
                      <button type="button" onClick={() => removeVictorFromEditingLevel(idx)} className="text-rose-600 font-bold">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Victor Username"
                    value={newVictorName}
                    onChange={(e) => setNewVictorName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    placeholder="Video Proof URL"
                    value={newVictorVideo}
                    onChange={(e) => setNewVictorVideo(e.target.value)}
                    className={inputClass}
                  />
                  <button type="button" onClick={addVictorToEditingLevel} className="bg-emerald-600 text-white font-bold text-xs rounded py-1.5">
                    + Add Victor
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingLevel(null)} className="px-4 py-2 rounded text-xs font-bold bg-gray-300 dark:bg-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded text-xs font-bold bg-[#007acc] text-white">Save Changes</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

```
