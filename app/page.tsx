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
        email: editEmail.trim(),
        country: editCountry,
        youtube: editYoutube.trim(),
        discord: editDiscord.trim(),
        twitter: editTwitter.trim(),
      }
      setCurrentUser(updated)
      setEditPassword('')
      refreshAll()
      showNotice('Profile settings & socials saved!')
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

  // LEADERBOARD CALCULATION (Approved Submissions + Manual Victors + Verifier Points)
  const approvedLevels = levels.filter((l) => (l.status || 'approved') === 'approved')
  const pendingLevels = levels.filter((l) => l.status === 'pending')
  const approvedSubs = submissions.filter((s) => s.status === 'approved')
  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  const leaderboard: PlayerLeaderboardRow[] = profiles
    .map((prof) => {
      const uLower = prof.username.trim().toLowerCase()
      const dLower = prof.display_name.trim().toLowerCase()
      const seenLevelIds = new Set<number>()
      const entries: PlayerLeaderboardRow['entries'] = []

      // 1. Check Verifications on approved levels
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

      // 2. Check Approved Record Submissions
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

      // 3. Check Manual Victors added via Edit Level modal
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

        {/* LEADERBOARD TAB (CLICKABLE ACCOUNTS + VERIFIER POINTS) */}
        {activeTab === 'leaderboard' && (
          <div className={`max-w-3xl mx-auto p-6 rounded border shadow space-y-4 ${cardClass}`}>
            <h2 className="text-2xl font-bold border-b pb-2">Goofy Levels Leaderboard</h2>
            <p className="text-xs text-gray-500">
              Click on any player account to view their stats, completions, and verifications.
            </p>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No registered players on the leaderboard yet.</p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard.map((player, idx) => (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    className="w-full text-left py-3 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base w-8 text-gray-400">#{idx + 1}</span>
                      <img
                        src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`}
                        alt={player.country}
                        className="w-5 h-3.5 object-cover border border-gray-300"
                      />
                      <div>
                        <p className="font-bold text-sm hover:text-[#007acc] transition">{player.display_name}</p>
                        <div className="flex gap-3 text-[11px] text-gray-400">
                          {player.youtube && <span>YT: {player.youtube}</span>}
                          {player.discord && <span>Discord: {player.discord}</span>}
                          {player.twitter && <span>X: {player.twitter}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#007acc]">{player.totalPoints.toFixed(2)} pts</p>
                      <p className="text-[11px] text-gray-400">{player.completedCount} levels</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROULETTE TAB */}
        {activeTab === 'roulette' && (
          <div className={`max-w-xl mx-auto p-8 rounded border shadow text-center space-y-4 ${cardClass}`}>
            <h2 className="text-2xl font-bold">Goofy Levels Roulette</h2>
            {rouletteLevel ? (
              <div className="p-4 border rounded space-y-2">
                <img
                  src={getYouTubeThumbnail(rouletteLevel.verification_url || rouletteLevel.thumbnail, rouletteLevel.title)}
                  alt={rouletteLevel.title}
                  className="w-64 h-36 object-cover mx-auto rounded"
                />
                <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {rouletteLevel.mode || 'classic'}
                </span>
                <h3 className="text-2xl font-black text-[#007acc]">{rouletteLevel.title}</h3>
                <p className="text-xs text-gray-500">
                  Creator: {rouletteLevel.creator} {rouletteLevel.gd_level_id ? `• ID: ${rouletteLevel.gd_level_id}` : ''}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No approved levels yet to spin.</p>
            )}
            <button onClick={spinRoulette} className="bg-[#007acc] text-white font-bold px-6 py-2.5 rounded">Spin Again</button>
          </div>
        )}

        {/* PROFILE EDITOR & PENDING/WARNINGS TAB */}
        {activeTab === 'profile' && currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-6 rounded border shadow space-y-4 ${cardClass}`}>
              <h2 className="text-xl font-bold border-b pb-2">Profile Editor ({currentUser.username})</h2>
              <form onSubmit={handleProfileSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="Min 6 characters" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Country</label>
                  <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
{COUNTRIES.map((c) => (
  <option key={c.code} value={c.code}>{c.name}</option>
))}
                  </select>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs font-bold mb-2">Social Links</p>
                  <div className="space-y-2">
                    <input type="text" placeholder="YouTube Handle / URL" value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Discord Username" value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Twitter / X Handle" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#007acc] text-white font-bold py-2 rounded">Save Profile</button>
              </form>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className={`p-6 rounded border shadow ${cardClass}`}>
                <h3 className="text-lg font-bold border-b pb-2 mb-3 text-rose-600">
                  Account Warnings ({currentUser.warnings?.length || 0})
                </h3>
                {!currentUser.warnings || currentUser.warnings.length === 0 ? (
                  <p className="text-xs text-gray-500">Clean record! You have 0 warnings.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {currentUser.warnings.map((w, i) => (
                      <li key={i} className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`p-6 rounded border shadow space-y-4 ${cardClass}`}>
                <h3 className="text-lg font-bold border-b pb-2">My Pending Submissions</h3>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending Records</p>
                  {pendingSubs.filter((s) => s.player_username === currentUser.username).length === 0 ? (
                    <p className="text-xs text-gray-500">No pending records.</p>
                  ) : (
                    pendingSubs
                      .filter((s) => s.player_username === currentUser.username)
                      .map((s) => (
                        <div key={s.id} className="text-xs py-1.5 border-b flex justify-between">
                          <span><strong>{s.level_title}</strong> ({s.mode}) — {s.progress}%</span>
                          <span className="text-amber-600 font-bold">Pending</span>
                        </div>
                      ))
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pending Levels</p>
                  {pendingLevels.filter((l) => l.submitted_by === currentUser.username).length === 0 ? (
                    <p className="text-xs text-gray-500">No pending levels.</p>
                  ) : (
                    pendingLevels
                      .filter((l) => l.submitted_by === currentUser.username)
                      .map((l) => (
                        <div key={l.id} className="text-xs py-1.5 border-b flex justify-between">
                          <span><strong>{l.title}</strong> ({l.mode})</span>
                          <span className="text-amber-600 font-bold">Pending</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MOD PANEL */}
        {activeTab === 'mod' && isMod && (
          <div className="space-y-6">
            {/* 1. Pending Goofy Levels */}
            <div className={`p-6 rounded border shadow ${cardClass}`}>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Pending Goofy Levels ({pendingLevels.length})</h2>
              {pendingLevels.length === 0 ? (
                <p className="text-sm text-gray-500">No pending levels waiting for review.</p>
              ) : (
                pendingLevels.map((lvl) => (
                  <div key={lvl.id} className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getYouTubeThumbnail(lvl.verification_url || lvl.thumbnail, lvl.title)}
                        alt={lvl.title}
                        className="w-28 h-16 object-cover rounded bg-black"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{lvl.title}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {lvl.mode || 'classic'}
                          </span>
                          {lvl.gd_level_id && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 text-gray-800">
                              ID: {lvl.gd_level_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Creator: {lvl.creator} | Verifier: {lvl.verifier} | {Number(lvl.points).toFixed(2)} pts
                        </p>
                        {lvl.verification_url && (
                          <a href={lvl.verification_url} target="_blank" rel="noreferrer" className="text-xs text-[#007acc] underline">
                            Watch Verification Video
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={async () => {
                          await supabase.from('demons').update({ status: 'approved' }).eq('id', lvl.id)
                          refreshAll()
                        }}
                        className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded"
                      >
                        Approve Level
                      </button>
                      <button
                        onClick={async () => {
                          await supabase.from('demons').delete().eq('id', lvl.id)
                          refreshAll()
                        }}
                        className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. Pending Record Submissions */}
            <div className={`p-6 rounded border shadow ${cardClass}`}>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Pending Record Submissions ({pendingSubs.length})</h2>
              {pendingSubs.length === 0 ? (
                <p className="text-sm text-gray-500">No pending records.</p>
              ) : (
                pendingSubs.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center border-b py-3">
                    <div>
                      <p className="font-bold">
                        {sub.player_name} ({sub.player_username}) — {sub.level_title} [{sub.mode.toUpperCase()}] ({sub.progress}%)
                      </p>
                      <p className="text-xs text-gray-500">
                        Video: <a href={sub.video_url} target="_blank" rel="noreferrer" className="underline text-[#007acc]">{sub.video_url}</a> | Enjoyment: {sub.enjoyment}/10
                      </p>
                      {sub.mod_notes && <p className="text-xs italic text-amber-600 mt-1">Notes: {sub.mod_notes}</p>}
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={async () => {
                          await supabase.from('submissions').update({ status: 'approved' }).eq('id', sub.id)
                          refreshAll()
                        }}
                        className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          await supabase.from('submissions').delete().eq('id', sub.id)
                          refreshAll()
                        }}
                        className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. Issue Player Warning */}
            <div className={`p-6 rounded border shadow ${cardClass}`}>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Issue Player Warning</h2>
              <form onSubmit={handleIssueWarning} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <input required type="text" placeholder="Target username *" value={warnTargetUser} onChange={(e) => setWarnTargetUser(e.target.value)} className={`sm:col-span-4 ${inputClass}`} />
                <input required type="text" placeholder="Warning reason *" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} className={`sm:col-span-6 ${inputClass}`} />
                <button type="submit" className="sm:col-span-2 bg-rose-600 text-white font-bold text-xs py-2 rounded">Send Warning</button>
              </form>
            </div>

            {/* 4. Manage Public Staff Sidebar */}
            <div className={`p-6 rounded border shadow ${cardClass}`}>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Manage Sidebar Staff</h2>
              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!modName.trim()) return
                await supabase.from('moderators').insert([{
                  name: modName.trim(),
                  clan: modClan.trim().toUpperCase(),
                  country_code: modCountry.toLowerCase(),
                  role: modRole,
                }])
                setModName('')
                setModClan('')
                refreshAll()
              }} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
                <input type="text" placeholder="Clan" value={modClan} onChange={(e) => setModClan(e.target.value)} className={`sm:col-span-2 ${inputClass}`} />
                <input required type="text" placeholder="Username *" value={modName} onChange={(e) => setModName(e.target.value)} className={`sm:col-span-4 ${inputClass}`} />
                <select value={modCountry} onChange={(e) => setModCountry(e.target.value)} className={`sm:col-span-2 ${inputClass}`}>
{COUNTRIES.map((c) => (
  <option key={c.code} value={c.code}>{c.name} ({c.code.toUpperCase()})</option>
))}
                </select>
                <select value={modRole} onChange={(e) => setModRole(e.target.value as 'editor' | 'helper')} className={`sm:col-span-2 ${inputClass}`}>
                  <option value="editor">List Editor</option>
                  <option value="helper">List Helper</option>
                </select>
                <button type="submit" className="sm:col-span-2 bg-[#007acc] text-white font-bold text-xs py-2 rounded">Add Staff</button>
              </form>

              {moderators.map((m) => (
                <div key={m.id} className="flex justify-between items-center py-2 border-t text-xs">
                  <div className="flex items-center gap-2">
                    <img src={`https://flagcdn.com/w20/${m.country_code}.png`} alt="" className="w-4 h-3 object-cover" />
                    <span className="font-bold">{m.clan ? `[${m.clan}] ` : ''}{m.name}</span>
                    <span className="text-gray-400 uppercase">({m.role})</span>
                  </div>
                  <button
                    onClick={async () => { await supabase.from('moderators').delete().eq('id', m.id); refreshAll() }}
                    className="text-rose-500 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLASSIC & PLATFORMER GOOFY LEVELS LISTS + RIGHT SIDEBAR */}
        {(activeTab === 'classic' || activeTab === 'platformer') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLS: GOOFY LEVELS */}
            <div className="lg:col-span-8 space-y-4">
              <div className={`p-6 rounded border shadow ${cardClass}`}>
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1">
                  {activeTab === 'platformer' ? 'Platformer Goofy Levels List' : 'Classic Goofy Levels List'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 text-center mb-4">
                  Ranked {activeTab} Goofy Levels with automatic verification video thumbnails.
                </p>
                <input
                  type="text"
                  placeholder="Filter by level name, creator, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={inputClass}
                />
              </div>

              {shownLevels.length === 0 ? (
                <div className={`p-8 rounded border shadow text-center text-sm text-gray-500 ${cardClass}`}>
                  No approved {activeTab} Goofy Levels yet. Use <strong>Submit Level</strong> on the right sidebar to suggest one!
                </div>
              ) : (
                shownLevels.map((lvl, idx) => {
                  const ytThumb = getYouTubeThumbnail(lvl.verification_url || lvl.thumbnail, lvl.title)
                  return (
                    <div key={lvl.id} className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded border shadow ${cardClass}`}>
                      <a
                        href={lvl.verification_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-44 h-24 bg-black rounded overflow-hidden shrink-0 block"
                      >
                        <img src={ytThumb} alt={lvl.title} className="w-full h-full object-cover" />
                      </a>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h2 className="text-lg font-bold">
                            #{idx + 1} — {lvl.title}
                          </h2>
                          {lvl.gd_level_id && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                              ID: {lvl.gd_level_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          published by <strong>{lvl.creator}</strong>, verified by <strong>{lvl.verifier || lvl.creator}</strong>
                        </p>
                        <p className="text-xs text-gray-400 italic mt-1">
                          {Number(lvl.points || 250).toFixed(2)} (100%) points
                        </p>

                        {/* Victors List */}
                        {lvl.victors && lvl.victors.length > 0 && (
                          <div className="mt-1.5 text-xs text-gray-500">
                            <span className="font-semibold">Victors: </span>
                            {lvl.victors.map((v, vIdx) => (
                              <span key={vIdx}>
                                {v.video_url ? (
                                  <a
                                    href={v.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#007acc] hover:underline font-medium"
                                  >
                                    {v.username}
                                  </a>
                                ) : (
                                  <span className="font-medium">{v.username}</span>
                                )}
                                {vIdx < lvl.victors!.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* MOD EDIT & DELETE BUTTONS */}
                      {isMod && (
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          <button
                            onClick={() => setEditingLevel({ ...lvl, victors: lvl.victors || [] })}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(lvl.id, lvl.title)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* RIGHT 4 COLS: SIDEBAR */}
            <aside className="lg:col-span-4 space-y-5">
              {/* Submit Record Sidebar Box */}
              <div className={`p-5 rounded border border-dashed shadow text-center ${cardClass}`}>
                <h3 className="text-lg font-bold border-b pb-2 mb-2">Submit Record</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Submit a Classic or Platformer completion with video proof and enjoyment rating.
                </p>
                <button
                  onClick={() => setSidebarForm(sidebarForm === 'record' ? 'none' : 'record')}
                  className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white font-semibold text-sm py-2 rounded transition"
                >
                  {sidebarForm === 'record' ? 'Close Form' : 'Open Submit Record'}
                </button>

                {sidebarForm === 'record' && (
                  <form onSubmit={handleRecordSubmit} className="mt-4 pt-4 border-t text-left space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Category</label>
                      <select
                        value={recMode}
                        onChange={(e) => setRecMode(e.target.value as 'classic' | 'platformer')}
                        className={inputClass}
                      >
                        <option value="classic">Classic Goofy Level</option>
                        <option value="platformer">Platformer Goofy Level</option>
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
                            <option key={l.id} value={l.id}>{l.title}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Progress (%)</label>
                      <input type="number" min="1" max="100" value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">YouTube Video Link *</label>
                      <input required type="url" placeholder="https://youtube.com/watch?v=..." value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Enjoyment: {recEnjoyment}/10</label>
                      <input type="range" min="1" max="10" value={recEnjoyment} onChange={(e) => setRecEnjoyment(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Mod Notes (Optional)</label>
                      <textarea value={recNotes} onChange={(e) => setRecNotes(e.target.value)} className={`${inputClass} h-16`} />
                    </div>
                    <button type="submit" className="w-full bg-[#007acc] text-white font-bold text-xs py-2.5 rounded">
                      Submit Record
                    </button>
                  </form>
                )}
              </div>

              {/* Submit Level Sidebar Box */}
              <div className={`p-5 rounded border border-dashed shadow text-center ${cardClass}`}>
                <h3 className="text-lg font-bold border-b pb-2 mb-2">Submit Level</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Suggest a new Classic or Platformer Goofy Level for list placement.
                </p>
                <button
                  onClick={() => setSidebarForm(sidebarForm === 'level' ? 'none' : 'level')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded transition"
                >
                  {sidebarForm === 'level' ? 'Close Form' : 'Open Submit Level'}
                </button>

                {sidebarForm === 'level' && (
                  <form onSubmit={handleLevelSubmit} className="mt-4 pt-4 border-t text-left space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Category</label>
                      <select
                        value={lvlMode}
                        onChange={(e) => setLvlMode(e.target.value as 'classic' | 'platformer')}
                        className={inputClass}
                      >
                        <option value="classic">Classic Goofy Level</option>
                        <option value="platformer">Platformer Goofy Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Level Title *</label>
                      <input required type="text" placeholder="e.g. Goofy Circles" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Level ID (GD)</label>
                      <input type="text" placeholder="e.g. 94821044" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Creator *</label>
                      <input required type="text" placeholder="Creator name" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Verifier *</label>
                      <input required type="text" placeholder="Verifier username" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Verification YouTube URL *</label>
                      <input required type="url" placeholder="https://youtube.com/watch?v=..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Suggested Points</label>
                      <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 rounded">
                      Send Level for Approval
                    </button>
                  </form>
                )}
              </div>

              {/* Discord Panel */}
              <div className={`p-5 rounded border shadow ${cardClass}`}>
                <h3 className="font-bold border-b pb-2 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                  </svg>
                  <span>Discord Community</span>
                </h3>
                <ul className="space-y-2 text-xs font-semibold">
                  <li className="text-[#007acc] cursor-pointer hover:underline">#link — Join Community Server</li>
                  <li className="text-[#007acc] cursor-pointer hover:underline">#change-logs — Latest Updates</li>
                </ul>
              </div>

              {/* Staff List */}
              <div className={`p-5 rounded border shadow ${cardClass}`}>
                <h3 className="font-bold border-b pb-2 mb-2">List Editors</h3>
                <ul className="text-xs font-bold space-y-1.5 mb-4">
                  {moderators.filter((m) => m.role === 'editor').map((ed) => (
                    <li key={ed.id} className="flex items-center gap-2">
                      <img src={`https://flagcdn.com/w20/${ed.country_code}.png`} className="w-4 h-3 object-cover border border-gray-300" alt="" />
                      <span>{ed.clan ? `[${ed.clan}] ` : ''}{ed.name}</span>
                    </li>
                  ))}
                  {moderators.filter((m) => m.role === 'editor').length === 0 && <li className="text-gray-400 font-normal">None added yet</li>}
                </ul>

                <h3 className="font-bold border-b pb-2 mb-2">List Helpers</h3>
                <ul className="text-xs font-bold space-y-1.5">
                  {moderators.filter((m) => m.role === 'helper').map((hp) => (
                    <li key={hp.id} className="flex items-center gap-2">
                      <img src={`https://flagcdn.com/w20/${hp.country_code}.png`} className="w-4 h-3 object-cover border border-gray-300" alt="" />
                      <span>{hp.clan ? `[${hp.clan}] ` : ''}{hp.name}</span>
                    </li>
                  ))}
                  {moderators.filter((m) => m.role === 'helper').length === 0 && <li className="text-gray-400 font-normal">None added yet</li>}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* MOD EDIT LEVEL MODAL */}
      {editingLevel && isMod && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          onClick={() => setEditingLevel(null)}
        >
          <div
            className={`max-w-lg w-full p-6 rounded-lg border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto ${cardClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-bold">Edit Level — {editingLevel.title}</h2>
              <button onClick={() => setEditingLevel(null)} className="text-gray-400 hover:text-rose-500 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveEditedLevel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Level Title</label>
                <input
                  required
                  type="text"
                  value={editingLevel.title}
                  onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Creator</label>
                  <input
                    required
                    type="text"
                    value={editingLevel.creator}
                    onChange={(e) => setEditingLevel({ ...editingLevel, creator: e.target.value })}
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
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Points</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingLevel.points || 0}
                    onChange={(e) => setEditingLevel({ ...editingLevel, points: parseFloat(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Level ID (GD)</label>
                  <input
                    type="text"
                    placeholder="e.g. 94821044"
                    value={editingLevel.gd_level_id || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, gd_level_id: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Mode</label>
                  <select
                    value={editingLevel.mode || 'classic'}
                    onChange={(e) => setEditingLevel({ ...editingLevel, mode: e.target.value as 'classic' | 'platformer' })}
                    className={inputClass}
                  >
                    <option value="classic">Classic</option>
                    <option value="platformer">Platformer</option>
                  </select>
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

              {/* Manage Victors Section */}
              <div className="border-t pt-3 space-y-2">
                <label className="block text-xs font-bold">Victors List</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Victor username"
                    value={newVictorName}
                    onChange={(e) => setNewVictorName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    placeholder="Video URL (optional)"
                    value={newVictorVideo}
                    onChange={(e) => setNewVictorVideo(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={addVictorToEditingLevel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 rounded text-sm shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {(editingLevel.victors || []).length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 pt-1">
                    {(editingLevel.victors || []).map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs px-2.5 py-1.5 rounded bg-black/10 dark:bg-white/10">
                        <span>
                          <strong>{v.username}</strong> {v.video_url ? `(${v.video_url})` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVictorFromEditingLevel(i)}
                          className="text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="px-4 py-2 rounded border text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#007acc] text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEADERBOARD PLAYER STATS MODAL */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className={`max-w-lg w-full p-6 rounded-lg border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto ${cardClass}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={`https://flagcdn.com/w20/${selectedPlayer.country.toLowerCase()}.png`}
                  alt={selectedPlayer.country}
                  className="w-6 h-4 object-cover border border-gray-300"
                />
                <div>
                  <h2 className="text-xl font-bold">{selectedPlayer.display_name}</h2>
                  <p className="text-xs text-gray-400">@{selectedPlayer.username}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="text-gray-400 hover:text-rose-500 font-bold text-xl">
                ✕
              </button>
            </div>

            {/* Social Links */}
            {(selectedPlayer.youtube || selectedPlayer.discord || selectedPlayer.twitter) && (
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {selectedPlayer.youtube && <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5">YouTube: <strong>{selectedPlayer.youtube}</strong></span>}
                {selectedPlayer.discord && <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5">Discord: <strong>{selectedPlayer.discord}</strong></span>}
                {selectedPlayer.twitter && <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/5">X: <strong>{selectedPlayer.twitter}</strong></span>}
              </div>
            )}

            {/* Summary Stat Boxes */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-[11px] uppercase font-bold text-gray-400">Total Points</p>
                <p className="text-xl font-black text-[#007acc]">{selectedPlayer.totalPoints.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-[11px] uppercase font-bold text-gray-400">Levels Beaten / Verified</p>
                <p className="text-xl font-black">{selectedPlayer.completedCount}</p>
              </div>
            </div>

            {/* Hardest Level */}
            <div className="p-3 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-[11px] uppercase font-bold text-gray-400">Hardest Completion</p>
              {selectedPlayer.hardestLevel ? (
                <p className="font-bold text-sm text-amber-500 mt-0.5">
                  {selectedPlayer.hardestLevel.title} ({Number(selectedPlayer.hardestLevel.points || 0).toFixed(2)} pts)
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">No 100% completions yet.</p>
              )}
            </div>

            {/* Completed & Verified Levels List */}
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-2">
                Levels Breakdown ({selectedPlayer.entries.length})
              </p>
              {selectedPlayer.entries.length === 0 ? (
                <p className="text-xs text-gray-500">No approved records or verifications yet.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {selectedPlayer.entries.map((entry, i) => (
                    <div
                      key={i}
                      className="text-xs px-3 py-2 rounded border border-gray-200 dark:border-gray-700 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        {entry.videoUrl ? (
                          <a href={entry.videoUrl} target="_blank" rel="noreferrer" className="font-bold text-[#007acc] hover:underline">
                            {entry.level.title}
                          </a>
                        ) : (
                          <span className="font-bold">{entry.level.title}</span>
                        )}
                        {entry.role === 'Verifier' && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                            Verifier
                          </span>
                        )}
                        {entry.role === 'Progress' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-800">
                            {entry.progress}%
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-gray-500">
                        +{entry.pointsEarned.toFixed(2)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
