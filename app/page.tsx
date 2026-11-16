'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'dhavvin_09', 'lopikpl']

interface GoofyLevel {
  id: number
  title: string
  creator: string
  verifier?: string
  verification_url?: string
  thumbnail?: string
  points?: number
  mode?: 'classic' | 'platformer'
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

  // AUTH: REGISTER (Sends real confirmation email, then requires login)
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
    setRegPasswordClear()
    setActiveTab('login')
    showNotice('Confirmation email sent to ' + regEmail + '! Please confirm your email in your inbox, then log in.')
  }

  function setRegPasswordClear() {
    setRegPass('')
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

  // SUBMIT RECORD (Classic or Platformer)
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

  // SUBMIT NEW LEVEL (Goes to Mod Panel for approval, thumbnail from YouTube verification video)
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
        verification_url: lvlVerifyVideo.trim(),
        thumbnail: autoThumb,
        points: parseFloat(lvlPoints) || 200,
        mode: lvlMode,
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
      setLvlVerifyVideo('')
      setSidebarForm('none')
      refreshAll()
      showNotice('Goofy Level sent to admins for review! Check pending status in your Profile.')
    }
  }

  // UPDATE PROFILE (Password, Email, Country, Socials)
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

  // MODERATOR: ISSUE WARNING TO USER
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

  const leaderboard = profiles
    .map((prof) => {
      const userSubs = approvedSubs.filter((s) => s.player_username === prof.username)
      const totalPoints = userSubs.reduce((sum, sub) => {
        const lvl = approvedLevels.find((l) => l.id === sub.level_id)
        const basePts = Number(lvl?.points || 0)
        const earned = sub.progress === 100 ? basePts : basePts * (sub.progress / 100) * 0.25
        return sum + earned
      }, 0)
      return { ...prof, totalPoints, completedCount: userSubs.length }
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
      (l.title.toLowerCase().includes(search.toLowerCase()) || l.creator.toLowerCase().includes(search.toLowerCase()))
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

        {/* NAVIGATION TABS (Classic, Platformer, Leaderboard, Roulette, Profile, and Mod Panel ONLY for the 4 staff) */}
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
            <p className="text-xs text-gray-500">Make sure you clicked the confirmation link in your email before logging in.</p>
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
                  <option value="pl">Poland</option>
                  <option value="us">United States</option>
                  <option value="gb">United Kingdom</option>
                  <option value="de">Germany</option>
                  <option value="es">Spain</option>
                  <option value="fr">France</option>
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
              <button type="submit" className="w-full bg-[#007acc] text-white font-bold py-2 rounded">REGISTER & SEND EMAIL</button>
            </form>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className={`max-w-3xl mx-auto p-6 rounded border shadow space-y-4 ${cardClass}`}>
            <h2 className="text-2xl font-bold border-b pb-2">Goofy Levels Leaderboard</h2>
            <p className="text-xs text-gray-500">Players ranked by total points earned from approved Classic & Platformer completions.</p>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No registered players on the leaderboard yet.</p>
            ) : (
              <div className="divide-y divide-gray-200">
                {leaderboard.map((player, idx) => (
                  <div key={player.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base w-8 text-gray-400">#{idx + 1}</span>
                      <img
                        src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`}
                        alt={player.country}
                        className="w-5 h-3.5 object-cover border border-gray-300"
                      />
                      <div>
                        <p className="font-bold text-sm">{player.display_name}</p>
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
                  </div>
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
                <p className="text-xs text-gray-500">Creator: {rouletteLevel.creator}</p>
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
            {/* Left: Profile Settings & Socials */}
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
                    <option value="pl">Poland</option>
                    <option value="us">United States</option>
                    <option value="gb">United Kingdom</option>
                    <option value="de">Germany</option>
                    <option value="es">Spain</option>
                    <option value="fr">France</option>
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

            {/* Right: Pending Items & Account Warnings */}
            <div className="lg:col-span-6 space-y-6">
              {/* Warnings */}
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

              {/* Pending Levels & Records */}
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

        {/* MOD PANEL (STRICTLY FOR finniscrazyy, mrconey, dhavvin_09, lopikpl) */}
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
                  <option value="pl">Poland (PL)</option>
                  <option value="us">USA (US)</option>
                  <option value="gb">UK (GB)</option>
                  <option value="de">Germany (DE)</option>
                  <option value="es">Spain (ES)</option>
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
                  placeholder="Filter shown goofy levels..."
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
                        <h2 className="text-lg font-bold">
                          #{idx + 1} - {lvl.title}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          published by <strong>{lvl.creator}</strong>, verified by <strong>{lvl.verifier || lvl.creator}</strong>
                        </p>
                        <p className="text-xs text-gray-400 italic mt-1">
                          {Number(lvl.points || 250).toFixed(2)} (100%) points
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* RIGHT 4 COLS: SIDEBAR (Submit Record, Submit Level, Discord, Staff) */}
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
                    <button type="submit" className="w-full bg-emerald-600 text-white font-bold text-xs py-2.5 rounded">
                      Send Record to Mods
                    </button>
                  </form>
                )}
              </div>

              {/* Submit Level Sidebar Box */}
              <div className={`p-5 rounded border border-dashed shadow text-center ${cardClass}`}>
                <h3 className="text-lg font-bold border-b pb-2 mb-2">Submit Goofy Level</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Suggest a new Classic or Platformer level. Thumbnail is grabbed automatically from the YouTube verification video.
                </p>
                <button
                  onClick={() => setSidebarForm(sidebarForm === 'level' ? 'none' : 'level')}
                  className="w-full bg-[#007acc] hover:bg-[#0062a3] text-white font-semibold text-sm py-2 rounded transition"
                >
                  {sidebarForm === 'level' ? 'Close Form' : 'Open Submit Level'}
                </button>

                {sidebarForm === 'level' && (
                  <form onSubmit={handleLevelSubmit} className="mt-4 pt-4 border-t text-left space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Level Type</label>
                      <select
                        value={lvlMode}
                        onChange={(e) => setLvlMode(e.target.value as 'classic' | 'platformer')}
                        className={inputClass}
                      >
                        <option value="classic">Classic Level</option>
                        <option value="platformer">Platformer Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Level Name *</label>
                      <input required type="text" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Creator *</label>
                        <input required type="text" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Verifier *</label>
                        <input required type="text" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Verification YouTube URL *</label>
                      <input required type="url" placeholder="https://youtu.be/..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
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
    </div>
  )
}