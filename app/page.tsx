'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'dhavvin_09', 'lopikpl']
const DISCORD_INVITE_URL = 'https://discord.gg/ePfDysKQxM'

const COUNTRIES = [
  { code: 'pl', name: 'Poland', region: 'Europe' },
  { code: 'us', name: 'United States', region: 'North America' },
  { code: 'gb', name: 'United Kingdom', region: 'Europe' },
  { code: 'ca', name: 'Canada', region: 'North America' },
  { code: 'au', name: 'Australia', region: 'Oceania' },
  { code: 'de', name: 'Germany', region: 'Europe' },
  { code: 'fr', name: 'France', region: 'Europe' },
  { code: 'es', name: 'Spain', region: 'Europe' },
  { code: 'it', name: 'Italy', region: 'Europe' },
  { code: 'nl', name: 'Netherlands', region: 'Europe' },
  { code: 'be', name: 'Belgium', region: 'Europe' },
  { code: 'se', name: 'Sweden', region: 'Europe' },
  { code: 'no', name: 'Norway', region: 'Europe' },
  { code: 'fi', name: 'Finland', region: 'Europe' },
  { code: 'dk', name: 'Denmark', region: 'Europe' },
  { code: 'ch', name: 'Switzerland', region: 'Europe' },
  { code: 'at', name: 'Austria', region: 'Europe' },
  { code: 'cz', name: 'Czech Republic', region: 'Europe' },
  { code: 'sk', name: 'Slovakia', region: 'Europe' },
  { code: 'hu', name: 'Hungary', region: 'Europe' },
  { code: 'ro', name: 'Romania', region: 'Europe' },
  { code: 'bg', name: 'Bulgaria', region: 'Europe' },
  { code: 'ua', name: 'Ukraine', region: 'Europe' },
  { code: 'lt', name: 'Lithuania', region: 'Europe' },
  { code: 'lv', name: 'Latvia', region: 'Europe' },
  { code: 'ee', name: 'Estonia', region: 'Europe' },
  { code: 'pt', name: 'Portugal', region: 'Europe' },
  { code: 'ie', name: 'Ireland', region: 'Europe' },
  { code: 'gr', name: 'Greece', region: 'Europe' },
  { code: 'hr', name: 'Croatia', region: 'Europe' },
  { code: 'rs', name: 'Serbia', region: 'Europe' },
  { code: 'tr', name: 'Turkey', region: 'Asia' },
  { code: 'ru', name: 'Russia', region: 'Europe' },
  { code: 'br', name: 'Brazil', region: 'South America' },
  { code: 'mx', name: 'Mexico', region: 'North America' },
  { code: 'ar', name: 'Argentina', region: 'South America' },
  { code: 'cl', name: 'Chile', region: 'South America' },
  { code: 'co', name: 'Colombia', region: 'South America' },
  { code: 'pe', name: 'Peru', region: 'South America' },
  { code: 've', name: 'Venezuela', region: 'South America' },
  { code: 'jp', name: 'Japan', region: 'Asia' },
  { code: 'kr', name: 'South Korea', region: 'Asia' },
  { code: 'cn', name: 'China', region: 'Asia' },
  { code: 'tw', name: 'Taiwan', region: 'Asia' },
  { code: 'ph', name: 'Philippines', region: 'Asia' },
  { code: 'id', name: 'Indonesia', region: 'Asia' },
  { code: 'my', name: 'Malaysia', region: 'Asia' },
  { code: 'sg', name: 'Singapore', region: 'Asia' },
  { code: 'th', name: 'Thailand', region: 'Asia' },
  { code: 'vn', name: 'Vietnam', region: 'Asia' },
  { code: 'in', name: 'India', region: 'Asia' },
  { code: 'ae', name: 'United Arab Emirates', region: 'Asia' },
  { code: 'sa', name: 'Saudi Arabia', region: 'Asia' },
  { code: 'il', name: 'Israel', region: 'Asia' },
  { code: 'eg', name: 'Egypt', region: 'Africa' },
  { code: 'za', name: 'South Africa', region: 'Africa' },
  { code: 'nz', name: 'New Zealand', region: 'Oceania' },
]

const GACHA_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour cooldown

interface VictorEntry {
  username: string
  video_url?: string
  enjoyment?: number
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

interface ForumPost {
  id: number
  author_username: string
  author_display: string
  category: 'forum' | 'bug'
  title: string
  content: string
  created_at: string
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
  inventory?: number[]
  last_gacha_roll?: string | null
  theme_mode?: 'light' | 'dark'
  side_decor?: boolean
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
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])

  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'classic' | 'platformer' | 'leaderboard' | 'roulette' | 'gacha' | 'forum' | 'profile' | 'mod' | 'login' | 'register'>('classic')
  const [sidebarForm, setSidebarForm] = useState<'none' | 'record' | 'level'>('none')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sideDecor, setSideDecor] = useState(true)
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
  const [newVictorEnjoyment, setNewVictorEnjoyment] = useState(8)

  // Level Details Modal (Victors + Enjoyment)
  const [viewingLevel, setViewingLevel] = useState<GoofyLevel | null>(null)

  // Leaderboard Country Map Filter & Player Modal
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerLeaderboardRow | null>(null)

  // Roulette Challenge states
  const [rouletteLevel, setRouletteLevel] = useState<GoofyLevel | null>(null)
  const [rouletteTargetPct, setRouletteTargetPct] = useState<number>(1)
  const [rouletteRolledPct, setRouletteRolledPct] = useState<number | null>(null)
  const [rouletteMessage, setRouletteMessage] = useState<string>('')

  // Gacha & Cooldown states
  const [gachaRolledLevel, setGachaRolledLevel] = useState<GoofyLevel | null>(null)
  const [gachaAnimating, setGachaAnimating] = useState(false)
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0)

  // Forum & Bug Report states
  const [postCategory, setPostCategory] = useState<'forum' | 'bug'>('forum')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')

  const isMod = currentUser ? ALLOWED_MODS.includes(currentUser.username.toLowerCase()) : false

  useEffect(() => {
    const savedTheme = localStorage.getItem('gll_theme')
    const savedDecor = localStorage.getItem('gll_side_decor')
    if (savedTheme === 'dark') setDarkMode(true)
    if (savedDecor !== null) setSideDecor(savedDecor === 'true')

    refreshAll()
    restoreSession()
  }, [])

  // Live Cooldown Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser?.last_gacha_roll) {
        setCooldownRemainingMs(0)
        return
      }
      const lastTime = new Date(currentUser.last_gacha_roll).getTime()
      const diff = GACHA_COOLDOWN_MS - (Date.now() - lastTime)
      setCooldownRemainingMs(diff > 0 ? diff : 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [currentUser?.last_gacha_roll])

  async function restoreSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) {
        setCurrentUser(prof)
        syncProfileEditor(prof)
        if (prof.theme_mode) setDarkMode(prof.theme_mode === 'dark')
        if (typeof prof.side_decor === 'boolean') setSideDecor(prof.side_decor)
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
    const [lvlRes, subRes, profRes, modRes, forumRes] = await Promise.all([
      supabase.from('demons').select('*').order('points', { ascending: false }),
      supabase.from('submissions').select('*').order('id', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('moderators').select('*').order('id', { ascending: true }),
      supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
    ])
    if (lvlRes.data) setLevels(lvlRes.data)
    if (subRes.data) setSubmissions(subRes.data)
    if (profRes.data) setProfiles(profRes.data)
    if (modRes.data) setModerators(modRes.data)
    if (forumRes.data) setForumPosts(forumRes.data)
  }

  function showNotice(msg: string) {
    setBannerMsg(msg)
    setTimeout(() => setBannerMsg(''), 6000)
  }

  async function handleToggleTheme() {
    const nextDark = !darkMode
    setDarkMode(nextDark)
    localStorage.setItem('gll_theme', nextDark ? 'dark' : 'light')
    if (currentUser) {
      await supabase.from('profiles').update({ theme_mode: nextDark ? 'dark' : 'light' }).eq('id', currentUser.id)
      setCurrentUser({ ...currentUser, theme_mode: nextDark ? 'dark' : 'light' })
    }
  }

  async function handleToggleSideDecor() {
    const nextDecor = !sideDecor
    setSideDecor(nextDecor)
    localStorage.setItem('gll_side_decor', String(nextDecor))
    if (currentUser) {
      await supabase.from('profiles').update({ side_decor: nextDecor }).eq('id', currentUser.id)
      setCurrentUser({ ...currentUser, side_decor: nextDecor })
    }
  }

  // AUTH: REGISTER (Auto-signs in immediately without email confirmation requirement)
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
          inventory: [],
          theme_mode: darkMode ? 'dark' : 'light',
          side_decor: sideDecor,
        },
      ])

      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPass,
      })
      if (loginData.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', loginData.user.id).single()
        if (prof) {
          setCurrentUser(prof)
          syncProfileEditor(prof)
        }
      }
    }

    setRegPass('')
    setActiveTab('classic')
    refreshAll()
    showNotice('Account registered and logged in successfully.')
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
        if (prof.theme_mode) setDarkMode(prof.theme_mode === 'dark')
        if (typeof prof.side_decor === 'boolean') setSideDecor(prof.side_decor)
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

  async function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in first to submit a record.')
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
      showNotice('Record submitted for moderator review.')
    }
  }

  async function handleLevelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in first to submit a level.')
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
      showNotice('Level sent to moderators for review.')
    }
  }

  async function handleCreateForumPost(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in to post on the forum or submit a bug report.')
      setActiveTab('login')
      return
    }
    if (!postTitle.trim() || !postContent.trim()) return

    const { error } = await supabase.from('forum_posts').insert([
      {
        author_username: currentUser.username,
        author_display: currentUser.display_name,
        category: postCategory,
        title: postTitle.trim(),
        content: postContent.trim(),
      },
    ])

    if (error) {
      alert('Error creating post: ' + error.message)
    } else {
      setPostTitle('')
      setPostContent('')
      refreshAll()
      showNotice(postCategory === 'bug' ? 'Bug report submitted.' : 'Forum post published.')
    }
  }

  async function handleDeleteForumPost(postId: number) {
    if (!isMod) return
    await supabase.from('forum_posts').delete().eq('id', postId)
    refreshAll()
    showNotice('Post removed.')
  }

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
      showNotice('Level updated.')
    }
  }

  function addVictorToEditingLevel() {
    if (!editingLevel || !newVictorName.trim()) return
    const nextVictors = [
      ...(editingLevel.victors || []),
      {
        username: newVictorName.trim(),
        video_url: newVictorVideo.trim(),
        enjoyment: Number(newVictorEnjoyment) || 8,
      },
    ]
    setEditingLevel({ ...editingLevel, victors: nextVictors })
    setNewVictorName('')
    setNewVictorVideo('')
    setNewVictorEnjoyment(8)
  }

  function removeVictorFromEditingLevel(index: number) {
    if (!editingLevel) return
    const nextVictors = (editingLevel.victors || []).filter((_, i) => i !== index)
    setEditingLevel({ ...editingLevel, victors: nextVictors })
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return

    const trimmedDisplay = editDisplayName.trim()
    if (!trimmedDisplay) {
      alert('Display name cannot be empty.')
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
      showNotice('Profile settings saved.')
    }
  }

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

  async function handleReviewSubmission(subId: number, status: 'approved' | 'rejected') {
    if (!isMod) return
    const sub = submissions.find((s) => s.id === subId)
    if (!sub) return

    const { error } = await supabase.from('submissions').update({ status }).eq('id', subId)
    if (error) {
      alert('Error updating submission: ' + error.message)
      return
    }

    if (status === 'approved' && sub.progress === 100) {
      const targetLevel = levels.find((l) => l.id === sub.level_id)
      if (targetLevel) {
        const existingVictors = targetLevel.victors || []
        const alreadyExists = existingVictors.some((v) => v.username.toLowerCase() === sub.player_username.toLowerCase())
        if (!alreadyExists) {
          const updatedVictors = [
            ...existingVictors,
            {
              username: sub.player_username,
              video_url: sub.video_url,
              enjoyment: sub.enjoyment,
            },
          ]
          await supabase.from('demons').update({ victors: updatedVictors }).eq('id', targetLevel.id)
        }
      }
    }

    refreshAll()
    showNotice(`Submission ${status}.`)
  }

  async function handleReviewLevel(lvlId: number, status: 'approved' | 'rejected') {
    if (!isMod) return
    if (status === 'rejected') {
      await supabase.from('demons').delete().eq('id', lvlId)
      showNotice('Level rejected and removed.')
    } else {
      await supabase.from('demons').update({ status: 'approved' }).eq('id', lvlId)
      showNotice('Level approved to the list.')
    }
    refreshAll()
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    if (!isMod || !modName.trim()) return

    const { error } = await supabase.from('moderators').insert([
      {
        name: modName.trim(),
        clan: modClan.trim(),
        country_code: modCountry,
        role: modRole,
      },
    ])

    if (error) {
      alert('Error adding staff: ' + error.message)
    } else {
      setModName('')
      setModClan('')
      refreshAll()
      showNotice('Staff member added.')
    }
  }

  async function handleRemoveStaff(staffId: number) {
    if (!isMod) return
    if (!confirm('Are you sure you want to remove this staff member?')) return
    const { error } = await supabase.from('moderators').delete().eq('id', staffId)
    if (!error) {
      refreshAll()
      showNotice('Staff member removed.')
    }
  }

  function startRouletteChallenge() {
    if (approvedLevels.length === 0) return
    const randomLvl = approvedLevels[Math.floor(Math.random() * approvedLevels.length)]
    setRouletteLevel(randomLvl)
    setRouletteTargetPct(1)
    setRouletteRolledPct(null)
    setRouletteMessage('Spin to roll your required percentage.')
    setActiveTab('roulette')
  }

  function spinRouletteProgress() {
    const rolled = Math.floor(Math.random() * 100) + 1
    setRouletteRolledPct(rolled)
    if (rolled >= rouletteTargetPct) {
      const nextTarget = Math.min(100, rolled + 1)
      setRouletteTargetPct(nextTarget)
      setRouletteMessage(`Success. You rolled ${rolled}%. Next round requires at least ${nextTarget}%.`)
    } else {
      setRouletteMessage(`Challenge ended. You rolled ${rolled}%, but needed at least ${rouletteTargetPct}%.`)
    }
  }

  async function spinGacha() {
    if (approvedLevels.length === 0) return
    if (!currentUser) {
      alert('Please log in to use the Level Gacha and save to your inventory.')
      setActiveTab('login')
      return
    }
    if (cooldownRemainingMs > 0) return

    setGachaAnimating(true)
    setTimeout(async () => {
      const randomLvl = approvedLevels[Math.floor(Math.random() * approvedLevels.length)]
      setGachaRolledLevel(randomLvl)
      setGachaAnimating(false)

      const nowIso = new Date().toISOString()
      const currentInv = currentUser.inventory || []
      const newInv = currentInv.includes(randomLvl.id) ? currentInv : [...currentInv, randomLvl.id]

      await supabase
        .from('profiles')
        .update({ inventory: newInv, last_gacha_roll: nowIso })
        .eq('id', currentUser.id)

      setCurrentUser({ ...currentUser, inventory: newInv, last_gacha_roll: nowIso })
      setCooldownRemainingMs(GACHA_COOLDOWN_MS)
      refreshAll()
    }, 900)
  }

  function formatCooldown(ms: number) {
    const totalSecs = Math.ceil(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const approvedLevels = levels.filter((l) => (l.status || 'approved') === 'approved')
  const pendingLevels = levels.filter((l) => l.status === 'pending')
  const approvedSubs = submissions.filter((s) => s.status === 'approved')
  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  // LEADERBOARD CALCULATION: Includes ALL registered profiles (even 0 points & unranked)
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

  const activeCountryStats = COUNTRIES.map((c) => {
    const countryPlayers = leaderboard.filter((p) => p.country.toLowerCase() === c.code.toLowerCase())
    const totalCountryPts = countryPlayers.reduce((sum, p) => sum + p.totalPoints, 0)
    return {
      ...c,
      playerCount: countryPlayers.length,
      totalCountryPts,
    }
  }).filter((c) => c.playerCount > 0)

  const filteredLeaderboard =
    selectedCountryFilter === 'ALL'
      ? leaderboard
      : leaderboard.filter((p) => p.country.toLowerCase() === selectedCountryFilter.toLowerCase())

  const pageBg = darkMode ? 'bg-[#09090b] text-white' : 'bg-[#ffffff] text-[#111827]'
  const cardClass = darkMode
    ? 'bg-[#121215] border-orange-500/30 text-white'
    : 'bg-white border-orange-200 text-[#111827] shadow-sm'
  const inputClass = darkMode
    ? 'w-full border border-orange-500/40 bg-[#18181b] text-white font-bold rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition'
    : 'w-full border border-orange-300 bg-orange-50/30 text-gray-900 font-bold rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition'

  const shownLevels = approvedLevels.filter(
    (l) =>
      (l.mode || 'classic') === (activeTab === 'platformer' ? 'platformer' : 'classic') &&
      (l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.creator.toLowerCase().includes(search.toLowerCase()) ||
        (l.gd_level_id || '').includes(search.trim()))
  )

  function getLevelVictorDetails(lvl: GoofyLevel) {
    const list: { username: string; displayName: string; videoUrl?: string; enjoyment?: number }[] = []
    const seen = new Set<string>()

    ;(lvl.victors || []).forEach((v) => {
      const key = v.username.toLowerCase()
      seen.add(key)
      const matchedProf = profiles.find((p) => p.username.toLowerCase() === key || p.display_name.toLowerCase() === key)
      const matchedSub = approvedSubs.find((s) => s.level_id === lvl.id && s.player_username.toLowerCase() === key)
      list.push({
        username: v.username,
        displayName: matchedProf?.display_name || v.username,
        videoUrl: v.video_url || matchedSub?.video_url,
        enjoyment: v.enjoyment ?? matchedSub?.enjoyment,
      })
    })

    approvedSubs
      .filter((s) => s.level_id === lvl.id && s.progress === 100)
      .forEach((s) => {
        const key = s.player_username.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          list.push({
            username: s.player_username,
            displayName: s.player_name || s.player_username,
            videoUrl: s.video_url,
            enjoyment: s.enjoyment,
          })
        }
      })

    return list
  }

  return (
    <div className={`min-h-screen font-bold relative overflow-x-hidden transition-colors duration-300 ${pageBg}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        .goofy-title {
          font-family: 'Fredoka', 'Comic Sans MS', cursive, sans-serif;
          letter-spacing: -0.02em;
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-panel {
          animation: fadeSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {sideDecor && (
        <>
          <div
            aria-hidden="true"
            className="fixed left-0 top-0 bottom-0 w-3 sm:w-5 z-50 pointer-events-none bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.45)]"
          />
          <div
            aria-hidden="true"
            className="fixed right-0 top-0 bottom-0 w-3 sm:w-5 z-50 pointer-events-none bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.45)]"
          />
        </>
      )}

      <header className={darkMode ? 'bg-[#09090b]/95 border-b border-orange-500/30 sticky top-0 z-40 backdrop-blur' : 'bg-white/95 border-b border-orange-200 sticky top-0 z-40 backdrop-blur'}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => setActiveTab('classic')}>
            <span className="goofy-title font-bold text-2xl uppercase text-orange-500 group-hover:scale-105 transition-transform">
              GLL<span className="text-sm lowercase text-orange-400">.pl</span>
            </span>
            <span className="hidden sm:inline-block text-xs font-bold text-orange-500/80 border-l border-orange-300 pl-3">
              Goofy Levels List
            </span>
          </div>

          <div className="flex items-center space-x-3 text-sm font-bold">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              title="Join the GLL Discord Server"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="hidden md:inline">Discord</span>
            </a>

            <button
              onClick={handleToggleSideDecor}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                sideDecor
                  ? 'bg-orange-500/15 border-orange-500 text-orange-500'
                  : 'border-gray-400/40 text-gray-400 hover:border-orange-500'
              }`}
              title="Toggle Orange Side Decoration"
            >
              Side Trim: {sideDecor ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 text-orange-500 transition"
              title="Toggle White/Orange or Black/Orange Theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <img
                  src={`https://flagcdn.com/w20/${currentUser.country.toLowerCase()}.png`}
                  alt={currentUser.country}
                  className="w-5 h-3.5 object-cover border border-orange-400"
                />
                <button
                  onClick={() => setActiveTab('profile')}
                  className="text-xs bg-orange-500/15 border border-orange-500 text-orange-500 px-2.5 py-1.5 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition"
                >
                  {currentUser.display_name}
                </button>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-orange-500 transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('login')} className="hover:text-orange-500 transition">Login</button>
                <button onClick={() => setActiveTab('register')} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={darkMode ? 'bg-[#121215] border-t border-orange-500/20' : 'bg-orange-50/60 border-t border-orange-200'}>
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center text-xs sm:text-sm font-bold">
            {[
              { id: 'classic', label: 'Classic List' },
              { id: 'platformer', label: 'Platformer List' },
              { id: 'leaderboard', label: 'Leaderboard' },
              { id: 'roulette', label: 'Roulette' },
              { id: 'gacha', label: 'Level Gacha' },
              { id: 'forum', label: 'Forum & Bugs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => (tab.id === 'roulette' ? startRouletteChallenge() : setActiveTab(tab.id as any))}
                className={`px-4 py-2.5 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent hover:text-orange-500'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'profile' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
                }`}
              >
                <span>My Profile</span>
                {(currentUser.warnings?.length || 0) > 0 && (
                  <span className="bg-orange-600 text-white text-[10px] px-1.5 rounded-full">{currentUser.warnings.length}</span>
                )}
              </button>
            )}

            {isMod && (
              <button
                onClick={() => setActiveTab('mod')}
                className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'mod' ? 'border-orange-500 text-orange-500' : 'border-transparent text-orange-500'
                }`}
              >
                <span>Mod Panel</span>
                {pendingSubs.length + pendingLevels.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">
                    {pendingSubs.length + pendingLevels.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {bannerMsg && (
        <div className="max-w-6xl mx-auto px-6 pt-4 animate-panel">
          <div className="bg-orange-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex justify-between shadow">
            <span>{bannerMsg}</span>
            <button onClick={() => setBannerMsg('')} className="font-bold ml-4">CLOSE</button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'login' && (
          <div className={`max-w-md mx-auto p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">GLL Login</h2>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Email</label>
                <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Password</label>
                <input required type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition">
                LOGIN
              </button>
            </form>
            <p className="text-xs text-center text-gray-400">
              Need an account?{' '}
              <button onClick={() => setActiveTab('register')} className="text-orange-500 underline">Register here</button>
            </p>
          </div>
        )}

        {activeTab === 'register' && (
          <div className={`max-w-md mx-auto p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">GLL Register</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Username (lowercase, no spaces)</label>
                <input required type="text" placeholder="e.g. finniscrazyy" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Display Name</label>
                <input required type="text" placeholder="e.g. FinnIsntCrazyy" value={regDisplay} onChange={(e) => setRegDisplay(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Country</label>
                <select value={regCountry} onChange={(e) => setRegCountry(e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Email</label>
                <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs mb-1">Password (min 6 chars)</label>
                <input required minLength={6} type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg transition">
                REGISTER
              </button>
            </form>
          </div>
        )}

        {activeTab === 'profile' && currentUser && (
          <div className={`max-w-2xl mx-auto p-6 rounded-xl border space-y-6 animate-panel ${cardClass}`}>
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-4">
              <div>
                <h2 className="goofy-title text-3xl text-orange-500 flex items-center gap-2">
                  <span>{currentUser.display_name}</span>
                  <img
                    src={`https://flagcdn.com/w20/${currentUser.country.toLowerCase()}.png`}
                    alt={currentUser.country}
                    className="w-6 h-4 object-cover border border-orange-400"
                  />
                </h2>
                <p className="text-xs text-gray-400">@{currentUser.username}</p>
              </div>
              {isMod && <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg">Staff / Mod</span>}
            </div>

            {(currentUser.warnings?.length || 0) > 0 && (
              <div className="bg-orange-500/15 border border-orange-500 text-orange-500 p-4 rounded-lg text-xs space-y-1">
                <p>Moderator Warnings ({currentUser.warnings.length}):</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {currentUser.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3 border-b border-orange-500/20 pb-4">
              <h3 className="goofy-title text-xl text-orange-500">
                My Gacha Inventory ({currentUser.inventory?.length || 0} levels)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto">
                {(!currentUser.inventory || currentUser.inventory.length === 0) ? (
                  <p className="text-xs text-gray-400">Your gacha inventory is empty. Roll levels in the Level Gacha tab.</p>
                ) : (
                  currentUser.inventory.map((lvlId) => {
                    const invLvl = levels.find((l) => l.id === lvlId)
                    if (!invLvl) return null
                    return (
                      <div
                        key={lvlId}
                        onClick={() => setViewingLevel(invLvl)}
                        className="flex items-center gap-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 p-2 rounded-lg text-xs cursor-pointer transition"
                      >
                        <img src={invLvl.thumbnail || getYouTubeThumbnail(invLvl.verification_url, invLvl.title)} alt="" className="w-14 h-9 object-cover rounded border border-orange-400" />
                        <div>
                          <p className="text-orange-500">{invLvl.title}</p>
                          <p className="text-[11px] text-gray-400">{invLvl.points} pts - {invLvl.mode || 'classic'}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <h3 className="goofy-title text-xl text-orange-500">Edit Profile Settings</h3>

              <div>
                <label className="block text-xs mb-1">Display Name</label>
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
                  <label className="block text-xs mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">New Password (leave blank to keep current)</label>
                  <input type="password" placeholder="min 6 chars" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Country</label>
                <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">YouTube Handle</label>
                  <input type="text" placeholder="@handle" value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Discord Tag</label>
                  <input type="text" placeholder="username" value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">X / Twitter</label>
                  <input type="text" placeholder="@handle" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-500/20 pb-3">
                <div>
                  <h2 className="goofy-title text-3xl text-orange-500">Global Country Map</h2>
                  <p className="text-xs text-gray-400">Click any active country on the map grid to filter top players from that nation.</p>
                </div>
                {selectedCountryFilter !== 'ALL' && (
                  <button
                    onClick={() => setSelectedCountryFilter('ALL')}
                    className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 transition"
                  >
                    Show All Countries
                  </button>
                )}
              </div>

              <div className={`relative rounded-xl border border-orange-500/30 p-4 overflow-hidden ${darkMode ? 'bg-[#09090b]' : 'bg-orange-50/40'}`}>
                <svg viewBox="0 0 800 320" className="w-full h-36 sm:h-44 opacity-25 text-orange-500 fill-current pointer-events-none">
                  <path d="M90,45 L180,35 L230,85 L200,145 L155,155 L130,130 Z" />
                  <path d="M185,165 L245,175 L265,235 L220,300 L195,285 L180,215 Z" />
                  <path d="M355,40 L450,35 L465,95 L410,110 L360,95 Z" />
                  <path d="M360,120 L445,120 L475,185 L435,270 L395,260 L355,180 Z" />
                  <path d="M475,40 L670,45 L700,125 L620,165 L520,150 L475,105 Z" />
                  <path d="M625,205 L710,205 L720,265 L640,275 Z" />
                </svg>

                <div className="relative z-10 -mt-28 sm:-mt-36 flex flex-wrap gap-2 justify-center">
                  {activeCountryStats.length === 0 ? (
                    <p className="text-xs text-gray-400 py-8">No player countries registered yet.</p>
                  ) : (
                    activeCountryStats.map((c) => {
                      const isSelected = selectedCountryFilter.toLowerCase() === c.code.toLowerCase()
                      return (
                        <button
                          key={c.code}
                          onClick={() => setSelectedCountryFilter(isSelected ? 'ALL' : c.code)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition transform hover:-translate-y-0.5 ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                              : darkMode
                              ? 'bg-[#18181b]/90 border-orange-500/40 hover:border-orange-500 text-white'
                              : 'bg-white/95 border-orange-300 hover:border-orange-500 text-gray-900'
                          }`}
                        >
                          <img
                            src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                            alt={c.name}
                            className="w-5 h-3.5 object-cover border border-black/20"
                          />
                          <span>{c.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-orange-500/15 text-orange-500'}`}>
                            {c.playerCount}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
                <h2 className="goofy-title text-3xl text-orange-500">
                  {selectedCountryFilter === 'ALL'
                    ? 'Global Player Leaderboard'
                    : `Top Players: ${COUNTRIES.find((c) => c.code === selectedCountryFilter)?.name || selectedCountryFilter.toUpperCase()}`}
                </h2>
                <span className="text-xs text-gray-400">{filteredLeaderboard.length} registered players</span>
              </div>

              {filteredLeaderboard.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No players found for this selection.</p>
              ) : (
                <div className="divide-y divide-orange-500/15">
                  {filteredLeaderboard.map((player, idx) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayer(player)}
                      className="w-full text-left py-3.5 px-3 rounded-lg hover:bg-orange-500/10 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`goofy-title text-xl w-9 ${player.totalPoints > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {player.totalPoints > 0 ? `#${idx + 1}` : '-'}
                        </span>
                        <img
                          src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`}
                          alt={player.country}
                          className="w-5 h-3.5 object-cover border border-orange-400"
                        />
                        <div>
                          <p className="text-sm hover:text-orange-500 transition">{player.display_name}</p>
                          <div className="flex gap-3 text-[11px] text-gray-400">
                            {player.youtube && <span>YT: {player.youtube}</span>}
                            {player.discord && <span>Discord: {player.discord}</span>}
                            {player.twitter && <span>X: {player.twitter}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${player.totalPoints > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {player.totalPoints > 0 ? `${player.totalPoints.toFixed(2)} pts` : 'Unranked'}
                        </p>
                        <p className="text-[11px] text-gray-400">{player.completedCount} levels</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roulette' && (
          <div className={`max-w-md mx-auto p-6 rounded-xl border text-center space-y-6 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Goofy Roulette</h2>
            {rouletteLevel ? (
              <div className="space-y-4">
                <a href={rouletteLevel.verification_url || '#'} target="_blank" rel="noreferrer">
                  <img
                    src={rouletteLevel.thumbnail || getYouTubeThumbnail(rouletteLevel.verification_url, rouletteLevel.title)}
                    alt={rouletteLevel.title}
                    className="w-full h-44 object-cover rounded-lg border border-orange-400 hover:opacity-95 transition"
                  />
                </a>
                <div>
                  <h3 className="goofy-title text-2xl">{rouletteLevel.title}</h3>
                  <p className="text-xs text-gray-400">By {rouletteLevel.creator} - Verified by {rouletteLevel.verifier || 'Unknown'}</p>
                  <p className="text-sm text-orange-500 mt-1">{Number(rouletteLevel.points || 0).toFixed(2)} Points ({rouletteLevel.mode || 'classic'})</p>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-orange-500">Required Target: At least {rouletteTargetPct}%</p>
                  {rouletteRolledPct !== null && (
                    <p className="text-xs">You rolled: {rouletteRolledPct}%</p>
                  )}
                  <p className="text-xs text-gray-400">{rouletteMessage}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No levels available for roulette.</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={spinRouletteProgress}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm transition"
              >
                Roll Percentage (%)
              </button>
              <button
                onClick={startRouletteChallenge}
                className="bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white py-2.5 px-4 rounded-lg text-sm transition"
              >
                New Level
              </button>
            </div>
          </div>
        )}

        {activeTab === 'gacha' && (
          <div className={`max-w-md mx-auto p-6 rounded-xl border text-center space-y-6 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Goofy Level Gacha</h2>
            <p className="text-xs text-gray-400">
              Roll the gacha machine once per hour to add random levels permanently to your profile inventory.
            </p>

            <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl flex flex-col items-center justify-center min-h-[190px]">
              {gachaAnimating ? (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              ) : gachaRolledLevel ? (
                <div className="space-y-3 animate-panel">
                  <img
                    src={gachaRolledLevel.thumbnail || getYouTubeThumbnail(gachaRolledLevel.verification_url, gachaRolledLevel.title)}
                    alt=""
                    className="w-48 h-28 object-cover rounded-lg border border-orange-400 mx-auto"
                  />
                  <div>
                    <h3 className="goofy-title text-xl">{gachaRolledLevel.title}</h3>
                    <p className="text-xs text-gray-400">By {gachaRolledLevel.creator}</p>
                    <span className="inline-block mt-1.5 bg-orange-500 text-white text-xs px-3 py-0.5 rounded-full">
                      Saved to Inventory
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {cooldownRemainingMs > 0
                    ? `Cooldown active. Next roll available in ${formatCooldown(cooldownRemainingMs)}.`
                    : 'Ready to roll a random level.'}
                </p>
              )}
            </div>

            <button
              onClick={spinGacha}
              disabled={gachaAnimating || cooldownRemainingMs > 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gachaAnimating
                ? 'Rolling...'
                : cooldownRemainingMs > 0
                ? `Cooldown: ${formatCooldown(cooldownRemainingMs)}`
                : 'Roll Level'}
            </button>
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-panel">
            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">
                Community Forum & Bug Reports
              </h2>
              <form onSubmit={handleCreateForumPost} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Post Type</label>
                    <select value={postCategory} onChange={(e) => setPostCategory(e.target.value as any)} className={inputClass}>
                      <option value="forum">Forum Discussion</option>
                      <option value="bug">Bug Report</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs mb-1">Title</label>
                    <input
                      required
                      type="text"
                      placeholder={postCategory === 'bug' ? 'Describe the bug briefly...' : 'Discussion topic title...'}
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write your message or steps to reproduce the bug..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                  {postCategory === 'bug' ? 'Submit Bug Report' : 'Publish Forum Post'}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {forumPosts.length === 0 ? (
                <div className={`p-6 rounded-xl border text-center text-xs text-gray-400 ${cardClass}`}>
                  No forum posts or bug reports yet.
                </div>
              ) : (
                forumPosts.map((post) => (
                  <div key={post.id} className={`p-5 rounded-xl border space-y-2 ${cardClass}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded ${
                            post.category === 'bug'
                              ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                              : 'bg-orange-500/20 text-orange-500 border border-orange-500/40'
                          }`}
                        >
                          {post.category === 'bug' ? 'Bug Report' : 'Forum'}
                        </span>
                        <h3 className="goofy-title text-xl">{post.title}</h3>
                      </div>
                      {isMod && (
                        <button
                          onClick={() => handleDeleteForumPost(post.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-pre-wrap">{post.content}</p>
                    <p className="text-[11px] text-orange-500/80 pt-1">
                      Posted by {post.author_display} (@{post.author_username})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'mod' && isMod && (
          <div className={`max-w-4xl mx-auto p-6 rounded-xl border space-y-6 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Moderator Control Panel</h2>

            <div className="space-y-3">
              <h3 className="goofy-title text-xl text-orange-500">Pending Level Approvals ({pendingLevels.length})</h3>
              {pendingLevels.length === 0 ? (
                <p className="text-xs text-gray-400">No pending level submissions right now.</p>
              ) : (
                <div className="space-y-2">
                  {pendingLevels.map((lvl) => (
                    <div key={lvl.id} className="p-3 bg-orange-500/10 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="text-sm">{lvl.title} <span className="text-gray-400">by {lvl.creator}</span></p>
                        <p className="text-gray-400">Points: {lvl.points} | Mode: {lvl.mode || 'classic'} | Submitted by: @{lvl.submitted_by}</p>
                        {lvl.verification_url && (
                          <a href={lvl.verification_url} target="_blank" rel="noreferrer" className="text-orange-500 underline">Watch Proof</a>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReviewLevel(lvl.id, 'approved')} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg">Approve</button>
                        <button onClick={() => handleReviewLevel(lvl.id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-orange-500/20 pt-4">
              <h3 className="goofy-title text-xl text-orange-500">Pending Record Submissions ({pendingSubs.length})</h3>
              {pendingSubs.length === 0 ? (
                <p className="text-xs text-gray-400">No pending record submissions right now.</p>
              ) : (
                <div className="space-y-2">
                  {pendingSubs.map((sub) => (
                    <div key={sub.id} className="p-3 bg-orange-500/10 rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="text-sm">{sub.player_name} (@{sub.player_username}) - {sub.progress}% on {sub.level_title}</p>
                        <p className="text-gray-400">Enjoyment: {sub.enjoyment}/10 | Notes: {sub.mod_notes || 'None'}</p>
                        <a href={sub.video_url} target="_blank" rel="noreferrer" className="text-orange-500 underline">Watch Video Proof</a>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReviewSubmission(sub.id, 'approved')} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg">
                          Approve {sub.progress === 100 && '(Auto-adds Victor)'}
                        </button>
                        <button onClick={() => handleReviewSubmission(sub.id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-orange-500/20 pt-4 space-y-3">
              <h3 className="goofy-title text-xl text-orange-500">Issue User Warning</h3>
              <form onSubmit={handleIssueWarning} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={warnTargetUser}
                  onChange={(e) => setWarnTargetUser(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Reason for warning"
                  value={warnReason}
                  onChange={(e) => setWarnReason(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" className="bg-red-600 text-white text-xs rounded-lg py-2">
                  Issue Warning
                </button>
              </form>
            </div>

            <div className="border-t border-orange-500/20 pt-4 space-y-3">
              <h3 className="goofy-title text-xl text-orange-500">Manage Staff Section</h3>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <input
                  type="text"
                  placeholder="Staff Name"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className={`sm:col-span-2 ${inputClass}`}
                />
                <input
                  type="text"
                  placeholder="Clan (optional)"
                  value={modClan}
                  onChange={(e) => setModClan(e.target.value)}
                  className={inputClass}
                />
                <select value={modCountry} onChange={(e) => setModCountry(e.target.value)} className={`sm:col-span-2 ${inputClass}`}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <select value={modRole} onChange={(e) => setModRole(e.target.value as any)} className={inputClass}>
                  <option value="editor">Editor</option>
                  <option value="helper">Helper</option>
                </select>
                <button type="submit" className="sm:col-span-6 bg-orange-500 text-white text-xs py-2 rounded-lg">
                  Add Staff Member
                </button>
              </form>

              <div className="space-y-1 pt-2">
                {moderators.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-orange-500/10 px-3 py-2 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <img src={`https://flagcdn.com/w20/${m.country_code.toLowerCase()}.png`} alt={m.country_code} className="w-4 h-3 border" />
                      <span>{m.name}</span>
                      {m.clan && <span className="text-gray-400">[{m.clan}]</span>}
                      <span className="bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded text-[10px] uppercase">{m.role}</span>
                    </div>
                    <button onClick={() => handleRemoveStaff(m.id)} className="text-red-500 hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'classic' || activeTab === 'platformer') && (
          <div className="space-y-6 animate-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="goofy-title text-4xl text-orange-500">
                  {activeTab === 'platformer' ? 'Platformer Goofy Levels' : 'Classic Goofy Levels'}
                </h1>
                <p className="text-xs text-gray-400">Click any level card to inspect victors and enjoyment ratings.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search level or GD ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} w-56`}
                />
                {currentUser && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSidebarForm(sidebarForm === 'record' ? 'none' : 'record')}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3.5 py-2 rounded-lg whitespace-nowrap transition"
                    >
                      {sidebarForm === 'record' ? 'Close Form' : 'Submit Record'}
                    </button>
                    <button
                      onClick={() => setSidebarForm(sidebarForm === 'level' ? 'none' : 'level')}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3.5 py-2 rounded-lg whitespace-nowrap transition"
                    >
                      {sidebarForm === 'level' ? 'Close Form' : 'Submit Level'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {sidebarForm === 'record' && currentUser && (
              <form onSubmit={handleRecordSubmit} className={`p-5 rounded-xl border space-y-3 animate-panel ${cardClass}`}>
                <h3 className="goofy-title text-xl text-orange-500">Submit Record / Completion</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Category</label>
                    <select value={recMode} onChange={(e) => setRecMode(e.target.value as any)} className={inputClass}>
                      <option value="classic">Classic</option>
                      <option value="platformer">Platformer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Level</label>
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
                    <label className="block text-xs mb-1">Progress (%)</label>
                    <input type="number" min={1} max={100} value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Video Proof URL</label>
                    <input required type="url" placeholder="https://youtube.com/..." value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Enjoyment Rating (1-10)</label>
                    <input type="number" min={1} max={10} value={recEnjoyment} onChange={(e) => setRecEnjoyment(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                  Send Record for Review
                </button>
              </form>
            )}

            {sidebarForm === 'level' && currentUser && (
              <form onSubmit={handleLevelSubmit} className={`p-5 rounded-xl border space-y-3 animate-panel ${cardClass}`}>
                <h3 className="goofy-title text-xl text-orange-500">Submit New Goofy Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Category</label>
                    <select value={lvlMode} onChange={(e) => setLvlMode(e.target.value as any)} className={inputClass}>
                      <option value="classic">Classic</option>
                      <option value="platformer">Platformer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Level Title</label>
                    <input required type="text" placeholder="Level Name" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Creator</label>
                    <input required type="text" placeholder="Creator Name" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs mb-1">GD Level ID</label>
                    <input type="text" placeholder="12345678" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Verifier</label>
                    <input type="text" placeholder="Verifier (default: you)" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Verification Video URL</label>
                    <input required type="url" placeholder="https://youtube.com/..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Points</label>
                    <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                  Submit Level for Approval
                </button>
              </form>
            )}

            {shownLevels.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${cardClass}`}>
                <p className="text-sm text-gray-400">No approved levels found in this category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shownLevels.map((lvl, index) => (
                  <div
                    key={lvl.id}
                    onClick={() => setViewingLevel(lvl)}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-orange-500 hover:-translate-y-0.5 transition-all duration-200 ${cardClass}`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <span className="goofy-title text-2xl text-orange-500 w-10">#{index + 1}</span>
                      <a
                        href={lvl.verification_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      >
                        <img
                          src={lvl.thumbnail || getYouTubeThumbnail(lvl.verification_url, lvl.title)}
                          alt={lvl.title}
                          className="w-32 h-18 object-cover rounded-lg border border-orange-400 hover:opacity-90 transition"
                        />
                      </a>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="goofy-title text-xl hover:text-orange-500 transition">{lvl.title}</h3>
                          {lvl.gd_level_id && (
                            <span className="text-[10px] bg-orange-500/15 text-orange-500 px-2 py-0.5 rounded font-mono">
                              ID: {lvl.gd_level_id}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          By <span>{lvl.creator}</span> | Verified by <span className="text-orange-500">{lvl.verifier || 'Unknown'}</span>
                        </p>
                        <p className="text-[11px] text-orange-500/80 mt-1">
                          Victors: {getLevelVictorDetails(lvl).length} (Click to view victors & enjoyment scores)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-orange-500/20 pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="goofy-title text-2xl text-orange-500">{Number(lvl.points || 0).toFixed(2)}</span>
                        <span className="text-xs text-gray-400 block">points</span>
                      </div>
                      {isMod && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingLevel(lvl)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(lvl.id, lvl.title)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
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

        {viewingLevel && (
          <div
            onClick={() => setViewingLevel(null)}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`max-w-lg w-full p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}
            >
              <div className="flex justify-between items-start border-b border-orange-500/20 pb-3">
                <div>
                  <h3 className="goofy-title text-3xl text-orange-500">{viewingLevel.title}</h3>
                  <p className="text-xs text-gray-400">
                    By {viewingLevel.creator} | Verifier: {viewingLevel.verifier || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => setViewingLevel(null)}
                  className="text-xs bg-orange-500/15 text-orange-500 px-2.5 py-1 rounded-lg hover:bg-orange-500 hover:text-white transition"
                >
                  CLOSE
                </button>
              </div>

              {(() => {
                const victorList = getLevelVictorDetails(viewingLevel)
                const ratedVictors = victorList.filter((v) => typeof v.enjoyment === 'number')
                const avgEnjoyment =
                  ratedVictors.length > 0
                    ? (ratedVictors.reduce((sum, v) => sum + (v.enjoyment || 0), 0) / ratedVictors.length).toFixed(1)
                    : 'N/A'

                return (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Points</p>
                        <p className="goofy-title text-xl text-orange-500">{Number(viewingLevel.points || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Victors</p>
                        <p className="goofy-title text-xl">{victorList.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Avg Enjoyment</p>
                        <p className="goofy-title text-xl text-orange-500">{avgEnjoyment} / 10</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="goofy-title text-lg text-orange-500">Victors & Enjoyment Ratings</h4>
                      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                        {victorList.length === 0 ? (
                          <p className="text-xs text-gray-400 py-3">No victors recorded for this level yet.</p>
                        ) : (
                          victorList.map((v, i) => (
                            <div key={i} className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-lg text-xs">
                              <div>
                                <p>{v.displayName}</p>
                                <p className="text-[11px] text-orange-500">
                                  Enjoyment: {typeof v.enjoyment === 'number' ? `${v.enjoyment} / 10` : 'Not rated'}
                                </p>
                              </div>
                              {v.videoUrl && (
                                <a
                                  href={v.videoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-orange-500 text-white px-2.5 py-1 rounded text-[11px] hover:bg-orange-600 transition"
                                >
                                  Video Proof
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {editingLevel && isMod && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={handleSaveEditedLevel} className={`max-w-xl w-full p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}>
              <div className="flex justify-between items-center border-b border-orange-500/20 pb-2">
                <h3 className="goofy-title text-2xl text-orange-500">Edit Level: {editingLevel.title}</h3>
                <button type="button" onClick={() => setEditingLevel(null)} className="text-xs text-gray-400">CLOSE</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Title</label>
                  <input
                    type="text"
                    value={editingLevel.title}
                    onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Creator</label>
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
                  <label className="block text-xs mb-1">GD Level ID</label>
                  <input
                    type="text"
                    value={editingLevel.gd_level_id || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, gd_level_id: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Verifier</label>
                  <input
                    type="text"
                    value={editingLevel.verifier || ''}
                    onChange={(e) => setEditingLevel({ ...editingLevel, verifier: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Points</label>
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
                <label className="block text-xs mb-1">Verification Video URL</label>
                <input
                  type="url"
                  value={editingLevel.verification_url || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, verification_url: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="border-t border-orange-500/20 pt-3 space-y-2">
                <label className="block text-xs text-orange-500">Manage Victors & Enjoyment ({editingLevel.victors?.length || 0})</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {(editingLevel.victors || []).map((vic, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-orange-500/10 px-3 py-1.5 rounded-lg text-xs">
                      <span>{vic.username} (Enjoyment: {vic.enjoyment ?? 'N/A'}/10)</span>
                      <button type="button" onClick={() => removeVictorFromEditingLevel(idx)} className="text-red-500">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Victor Username"
                    value={newVictorName}
                    onChange={(e) => setNewVictorName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    placeholder="Video URL"
                    value={newVictorVideo}
                    onChange={(e) => setNewVictorVideo(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="Enjoyment"
                    value={newVictorEnjoyment}
                    onChange={(e) => setNewVictorEnjoyment(Number(e.target.value))}
                    className={inputClass}
                  />
                  <button type="button" onClick={addVictorToEditingLevel} className="bg-orange-500 text-white text-xs rounded-lg py-1.5">
                    Add Victor
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingLevel(null)} className="px-4 py-2 rounded-lg text-xs bg-gray-500/20">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-xs bg-orange-500 text-white">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {selectedPlayer && (
          <div
            onClick={() => setSelectedPlayer(null)}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`max-w-lg w-full p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}
            >
              <div className="flex justify-between items-center border-b border-orange-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <img src={`https://flagcdn.com/w20/${selectedPlayer.country.toLowerCase()}.png`} alt={selectedPlayer.country} className="w-5 h-3.5 border border-orange-400" />
                  <h3 className="goofy-title text-2xl text-orange-500">{selectedPlayer.display_name}</h3>
                </div>
                <button onClick={() => setSelectedPlayer(null)} className="text-xs text-gray-400">CLOSE</button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Total Points</p>
                  <p className="goofy-title text-xl text-orange-500">{selectedPlayer.totalPoints.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Completions</p>
                  <p className="goofy-title text-xl">{selectedPlayer.completedCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase">Hardest</p>
                  <p className="text-xs truncate">{selectedPlayer.hardestLevel ? selectedPlayer.hardestLevel.title : 'None'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="goofy-title text-lg text-orange-500">Completed Levels & Verifications</h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {selectedPlayer.entries.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No completed levels or verifications recorded yet.</p>
                  ) : (
                    selectedPlayer.entries.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between bg-orange-500/10 p-2.5 rounded-lg text-xs">
                        <div>
                          <p>{entry.level.title}</p>
                          <p className="text-[10px] text-gray-400">
                            {entry.role} {entry.progress < 100 ? `(${entry.progress}%)` : ''} - +{entry.pointsEarned.toFixed(2)} pts
                          </p>
                        </div>
                        {entry.videoUrl && (
                          <a href={entry.videoUrl} target="_blank" rel="noreferrer" className="text-orange-500 underline text-[11px]">
                            Video Proof
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setSelectedPlayer(null)} className="px-4 py-2 rounded-lg text-xs bg-orange-500 text-white">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
