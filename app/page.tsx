'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'dhavvin_09', 'lopikpl']
const DISCORD_INVITE_URL = 'https://discord.gg/DYHV4BMgw'

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
  bio?: string
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
  const [activeTab, setActiveTab] = useState<'welcome' | 'classic' | 'platformer' | 'leaderboard' | 'minigames' | 'forum' | 'profile' | 'mod' | 'login' | 'register'>('welcome')
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
  const [editBio, setEditBio] = useState('')

  // Mod Warning & Staff states
  const [warnTargetUser, setWarnTargetUser] = useState('')
  const [warnReason, setWarnReason] = useState('')
  const [modName, setModName] = useState('')
  const [modClan, setModClan] = useState('')
  const [modCountry, setModCountry] = useState('pl')
  const [modRole, setModRole] = useState<'editor' | 'helper'>('editor')

  // Mod Edit Level Modal states
  const [editingLevel, setEditingLevel] = useState<GoofyLevel | null>(null)

  // Level Details Modal (Victors + Enjoyment)
  const [viewingLevel, setViewingLevel] = useState<GoofyLevel | null>(null)

  // Dedicated Full Player Page View
  const [viewingPlayer, setViewingPlayer] = useState<PlayerLeaderboardRow | null>(null)

  // Leaderboard Country Map Filter
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL')

  // Roulette Challenge states (Horizontal)
  const [rouletteLevel, setRouletteLevel] = useState<GoofyLevel | null>(null)
  const [rouletteTargetPct, setRouletteTargetPct] = useState<number>(1)
  const [rouletteAchievedPct, setRouletteAchievedPct] = useState<number>(100)
  const [rouletteMessage, setRouletteMessage] = useState<string>('')

  // Gacha & Cooldown states with Packs / Upgrades
  const [gachaPack, setGachaPack] = useState<'standard' | 'premium' | 'god'>('standard')
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
    setEditBio(prof.bio || '')
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
          bio: '',
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
    setActiveTab('welcome')
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
      showNotice(postCategory === 'bug' ? 'Bug report submitted successfully.' : 'Forum post published successfully.')
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
        bio: editBio.trim(),
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
        bio: editBio.trim(),
      }
      setCurrentUser(updated)
      setEditPassword('')
      refreshAll()
      showNotice('Profile settings and bio saved.')
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

  // DELETE WARNING (Staff / Mod / Owner Only)
  async function handleDeleteWarning(userId: string, warningIndex: number) {
    if (!isMod) return
    const target = profiles.find((p) => p.id === userId)
    if (!target) return

    const nextWarnings = [...(target.warnings || [])]
    nextWarnings.splice(warningIndex, 1)

    const { error } = await supabase.from('profiles').update({ warnings: nextWarnings }).eq('id', userId)
    if (!error) {
      refreshAll()
      showNotice('Warning removed.')
    }
  }

  async function handleReviewSubmission(subId: number, status: 'approved' | 'rejected') {
    if (!isMod) return
    const { error } = await supabase.from('submissions').update({ status }).eq('id', subId)
    if (error) {
      alert('Error updating submission: ' + error.message)
      return
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

  // HORIZONTAL ROULETTE LOGIC
  function startRouletteChallenge() {
    if (approvedLevels.length === 0) return
    const randomLvl = approvedLevels[Math.floor(Math.random() * approvedLevels.length)]
    setRouletteLevel(randomLvl)
    setRouletteTargetPct(Math.floor(Math.random() * 90) + 1)
    setRouletteAchievedPct(100)
    setRouletteMessage('Attempt the level and enter your achieved percentage below.')
    setActiveTab('minigames')
  }

  function handleRouletteDone() {
    if (!rouletteLevel) return
    const matched = approvedLevels.find((l) => Number(l.points || 0) <= (rouletteLevel.points || 0) && l.id !== rouletteLevel.id) || approvedLevels[0]
    setRouletteLevel(matched)
    setRouletteTargetPct(Math.floor(Math.random() * 90) + 1)
    setRouletteMessage(`Great job! Moved to next level based on your ${rouletteAchievedPct}% progress.`)
  }

  // GACHA PACKS & UPGRADES
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
      let candidatePool = approvedLevels
      if (gachaPack === 'premium') candidatePool = approvedLevels.filter((l) => Number(l.points || 0) >= 200)
      if (gachaPack === 'god') candidatePool = approvedLevels.filter((l) => Number(l.points || 0) >= 400)
      if (candidatePool.length === 0) candidatePool = approvedLevels

      const randomLvl = candidatePool[Math.floor(Math.random() * candidatePool.length)]
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

  // LEADERBOARD CALCULATION (Automatic Verifiers & Approved 100% Victors Only)
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

  function getLevelVictorsAndVerifiers(lvl: GoofyLevel) {
    const list: { username: string; displayName: string; videoUrl?: string; enjoyment?: number; role: string }[] = []
    const seen = new Set<string>()

    if (lvl.verifier) {
      const vKey = lvl.verifier.trim().toLowerCase()
      seen.add(vKey)
      const matchedProf = profiles.find((p) => p.username.toLowerCase() === vKey || p.display_name.toLowerCase() === vKey)
      list.push({
        username: lvl.verifier,
        displayName: matchedProf?.display_name || lvl.verifier,
        videoUrl: lvl.verification_url,
        role: 'Verifier',
      })
    }

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
            role: 'Victor',
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
        @keyframes waveFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        .animated-wave-trim {
          background: linear-gradient(180deg, #f97316, #fb923c, #ea580c, #f97316);
          background-size: 100% 300%;
          animation: waveFlow 6s ease infinite;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-panel {
          animation: fadeSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* ANIMATED WAVE SIDE TRIM BARS */}
      {sideDecor && (
        <>
          <div
            aria-hidden="true"
            className="fixed left-0 top-0 bottom-0 w-3.5 sm:w-6 z-50 pointer-events-none animated-wave-trim shadow-[0_0_25px_rgba(249,115,22,0.55)] border-r border-orange-300/40"
          />
          <div
            aria-hidden="true"
            className="fixed right-0 top-0 bottom-0 w-3.5 sm:w-6 z-50 pointer-events-none animated-wave-trim shadow-[0_0_25px_rgba(249,115,22,0.55)] border-l border-orange-300/40"
          />
        </>
      )}

      {/* TOP HEADER */}
      <header className={darkMode ? 'bg-[#09090b]/95 border-b border-orange-500/30 sticky top-0 z-40 backdrop-blur' : 'bg-white/95 border-b border-orange-200 sticky top-0 z-40 backdrop-blur'}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => setActiveTab('welcome')}>
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
              title="Join Discord"
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
                sideDecor ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-gray-400/40 text-gray-400'
              }`}
              title="Toggle Side Trim"
            >
              Side Waves: {sideDecor ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-lg border border-orange-500/30 hover:bg-orange-500/10 text-orange-500 transition"
              title="Toggle Theme"
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
                  alt=""
                  className="w-5 h-3.5 object-cover border border-orange-400"
                />
                <button
                  onClick={() => {
                    const row = leaderboard.find((p) => p.id === currentUser.id) || { ...currentUser, totalPoints: 0, completedCount: 0, hardestLevel: null, entries: [] }
                    setViewingPlayer(row)
                    setActiveTab('profile')
                  }}
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

        {/* NAVIGATION TABS */}
        <div className={darkMode ? 'bg-[#121215] border-t border-orange-500/20' : 'bg-orange-50/60 border-t border-orange-200'}>
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center text-xs sm:text-sm font-bold">
            {[
              { id: 'welcome', label: 'Welcome' },
              { id: 'classic', label: 'Classic List' },
              { id: 'platformer', label: 'Platformer List' },
              { id: 'leaderboard', label: 'Leaderboard' },
              { id: 'minigames', label: 'Minigames' },
              { id: 'forum', label: 'Forum & Bugs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'minigames') startRouletteChallenge()
                  else setActiveTab(tab.id as any)
                }}
                className={`px-4 py-2.5 border-b-2 transition-all ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
                }`}
              >
                {tab.label}
              </button>
            ))}

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
        {/* WELCOME / LANDING PAGE TAB */}
        {activeTab === 'welcome' && (
          <div className={`max-w-3xl mx-auto p-8 rounded-xl border text-center space-y-6 animate-panel ${cardClass}`}>
            <h1 className="goofy-title text-5xl text-orange-500">Welcome to Goofy Levels List</h1>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              The premier community-driven Geometry Dash difficulty list featuring custom demon list progression, interactive world leaderboards, level gacha packs, and minigame challenges.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => setActiveTab('classic')}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg"
              >
                Explore Classic List
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-xl text-sm font-bold transition"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        )}

        {/* LOGIN TAB */}
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

        {/* REGISTER TAB */}
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

        {/* DEDICATED FULL PLAYER PROFILE PAGE */}
        {activeTab === 'profile' && viewingPlayer && (
          <div className={`max-w-3xl mx-auto p-6 rounded-xl border space-y-6 animate-panel ${cardClass}`}>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="text-xs bg-orange-500/15 text-orange-500 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition"
            >
              Back to Leaderboard
            </button>

            {/* TOP HEADER INFO */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-orange-500/20 pb-6">
              <div className="flex items-center gap-4">
                <img
                  src={`https://flagcdn.com/w40/${viewingPlayer.country.toLowerCase()}.png`}
                  alt={viewingPlayer.country}
                  className="w-12 h-8 object-cover border border-orange-500 rounded"
                />
                <div>
                  <h2 className="goofy-title text-3xl text-orange-500">{viewingPlayer.display_name}</h2>
                  <p className="text-xs text-gray-400">@{viewingPlayer.username} - Global Rank #{leaderboard.findIndex((p) => p.id === viewingPlayer.id) + 1}</p>
                </div>
              </div>

              <div className="text-right bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-xl">
                <p className="goofy-title text-2xl text-orange-500">{viewingPlayer.totalPoints.toFixed(2)} pts</p>
                <p className="text-xs text-gray-400">{viewingPlayer.completedCount} Completions</p>
              </div>
            </div>

            {/* SOCIAL LINKS & BIO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-2">
                <p className="text-orange-500">Social Links</p>
                <p className="text-gray-400">YouTube: {viewingPlayer.youtube || 'None'}</p>
                <p className="text-gray-400">Discord: {viewingPlayer.discord || 'None'}</p>
                <p className="text-gray-400">Twitter: {viewingPlayer.twitter || 'None'}</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl space-y-2">
                <p className="text-orange-500">Player Bio / Description</p>
                <p className="text-gray-400 italic">{viewingPlayer.bio || 'No description provided.'}</p>
              </div>
            </div>

            {/* WARNINGS & MOD CONTROLS */}
            {(viewingPlayer.warnings?.length || 0) > 0 && (
              <div className="bg-orange-500/15 border border-orange-500 text-orange-500 p-4 rounded-xl text-xs space-y-2">
                <p>Moderator Warnings ({viewingPlayer.warnings.length}):</p>
                <div className="space-y-1">
                  {viewingPlayer.warnings.map((w, i) => (
                    <div key={i} className="flex items-center justify-between bg-black/20 px-3 py-1.5 rounded">
                      <span>{w}</span>
                      {isMod && (
                        <button
                          onClick={() => handleDeleteWarning(viewingPlayer.id, i)}
                          className="text-red-400 hover:underline text-[11px]"
                        >
                          Delete Warning
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDIT PROFILE FORM (IF LOGGED IN AS THIS USER) */}
            {currentUser && currentUser.id === viewingPlayer.id && (
              <form onSubmit={handleProfileSave} className="border-t border-orange-500/20 pt-6 space-y-4">
                <h3 className="goofy-title text-xl text-orange-500">Edit Your Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Display Name</label>
                    <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Country</label>
                    <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Profile Bio / Description</label>
                  <textarea rows={2} value={editBio} onChange={(e) => setEditBio(e.target.value)} className={inputClass} placeholder="Tell everyone about yourself..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="YouTube Handle" value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Discord Tag" value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Twitter / X" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                  Save Profile
                </button>
              </form>
            )}

            {/* COMPLETIONS & VERIFICATIONS LIST */}
            <div className="space-y-3 border-t border-orange-500/20 pt-6">
              <h3 className="goofy-title text-xl text-orange-500">Completions & Verifications ({viewingPlayer.entries.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {viewingPlayer.entries.length === 0 ? (
                  <p className="text-xs text-gray-400">No completions or verifications recorded yet.</p>
                ) : (
                  viewingPlayer.entries.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg text-xs">
                      <div>
                        <p className="text-sm">{entry.level.title}</p>
                        <p className="text-gray-400">{entry.role} {entry.progress < 100 ? `(${entry.progress}%)` : ''} - +{entry.pointsEarned.toFixed(2)} pts</p>
                      </div>
                      {entry.videoUrl && (
                        <a href={entry.videoUrl} target="_blank" rel="noreferrer" className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition">
                          Video Proof
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-500/20 pb-3">
                <div>
                  <h2 className="goofy-title text-3xl text-orange-500">Global Country Map</h2>
                  <p className="text-xs text-gray-400">Click any country to filter top players.</p>
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

              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {activeCountryStats.map((c) => {
                  const isSelected = selectedCountryFilter.toLowerCase() === c.code.toLowerCase()
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCountryFilter(isSelected ? 'ALL' : c.code)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition ${
                        isSelected ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                      }`}
                    >
                      <img src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`} alt="" className="w-4 h-3 border" />
                      <span>{c.name} ({c.playerCount})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Leaderboard</h2>
              <div className="divide-y divide-orange-500/15">
                {filteredLeaderboard.map((player, idx) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setViewingPlayer(player)
                      setActiveTab('profile')
                    }}
                    className="w-full text-left py-3 px-3 rounded-lg hover:bg-orange-500/10 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="goofy-title text-xl w-9 text-orange-500">#{idx + 1}</span>
                      <img src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} alt="" className="w-5 h-3.5 border" />
                      <div>
                        <p className="text-sm hover:text-orange-500 transition">{player.display_name}</p>
                        <p className="text-[11px] text-gray-400">{player.completedCount} completions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-orange-500">{player.totalPoints.toFixed(2)} pts</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MINIGAMES TAB: HORIZONTAL ROULETTE & GACHA PACKS */}
        {activeTab === 'minigames' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            {/* HORIZONTAL ROULETTE */}
            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Goofy Roulette (Horizontal)</h2>
              {rouletteLevel ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <a href={rouletteLevel.verification_url || '#'} target="_blank" rel="noreferrer" className="shrink-0">
                    <img
                      src={rouletteLevel.thumbnail || getYouTubeThumbnail(rouletteLevel.verification_url, rouletteLevel.title)}
                      alt=""
                      className="w-56 h-32 object-cover rounded-lg border border-orange-400"
                    />
                  </a>
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <h3 className="goofy-title text-2xl">{rouletteLevel.title}</h3>
                      <p className="text-xs text-gray-400">By {rouletteLevel.creator} - Verified by {rouletteLevel.verifier || 'Unknown'}</p>
                      <p className="text-sm text-orange-500 mt-1">{Number(rouletteLevel.points || 0).toFixed(2)} Points</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg text-xs space-y-2">
                      <p className="text-orange-500">Required Target: At least {rouletteTargetPct}%</p>
                      <div className="flex items-center gap-2">
                        <span>Achieved Percentage:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={rouletteAchievedPct}
                          onChange={(e) => setRouletteAchievedPct(Number(e.target.value))}
                          className={`w-24 px-2 py-1 ${inputClass}`}
                        />
                      </div>
                      <p className="text-gray-400">{rouletteMessage}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleRouletteDone} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-xs transition">
                        Done (Next Level)
                      </button>
                      <button onClick={startRouletteChallenge} className="bg-red-600 text-white px-5 py-2 rounded-lg text-xs transition">
                        Give Up
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No levels available for roulette.</p>
              )}
            </div>

            {/* GACHA PACKS & UPGRADES */}
            <div className={`p-6 rounded-xl border text-center space-y-6 ${cardClass}`}>
              <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Goofy Gacha Packs</h2>
              <div className="flex justify-center gap-3">
                {(['standard', 'premium', 'god'] as const).map((pk) => (
                  <button
                    key={pk}
                    onClick={() => setGachaPack(pk)}
                    className={`px-4 py-2 rounded-lg text-xs uppercase font-bold border transition ${
                      gachaPack === pk ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                    }`}
                  >
                    {pk} Pack
                  </button>
                ))}
              </div>

              <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl flex flex-col items-center justify-center min-h-[180px]">
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
                      <p className="text-xs text-gray-400">By {gachaRolledLevel.creator} - {gachaRolledLevel.points} pts</p>
                      <span className="inline-block mt-1.5 bg-orange-500 text-white text-xs px-3 py-0.5 rounded-full">
                        Saved to Inventory
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {cooldownRemainingMs > 0
                      ? `Cooldown active. Next roll in ${formatCooldown(cooldownRemainingMs)}.`
                      : `Ready to open ${gachaPack} pack.`}
                  </p>
                )}
              </div>

              <button
                onClick={spinGacha}
                disabled={gachaAnimating || cooldownRemainingMs > 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {cooldownRemainingMs > 0 ? `Cooldown: ${formatCooldown(cooldownRemainingMs)}` : `Open ${gachaPack.toUpperCase()} Pack`}
              </button>
            </div>
          </div>
        )}

        {/* FORUM & BUG REPORTS TAB */}
        {activeTab === 'forum' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-panel">
            <div className={`p-6 rounded-xl border space-y-4 ${cardClass}`}>
              <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Community Forum & Bug Reports</h2>
              <form onSubmit={handleCreateForumPost} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={postCategory} onChange={(e) => setPostCategory(e.target.value as any)} className={inputClass}>
                    <option value="forum">Forum Discussion</option>
                    <option value="bug">Bug Report</option>
                  </select>
                  <input
                    required
                    type="text"
                    placeholder="Title..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className={`sm:col-span-2 ${inputClass}`}
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your message or bug description..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className={inputClass}
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2.5 rounded-lg transition">
                  Submit Post
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {forumPosts.map((post) => (
                <div key={post.id} className={`p-5 rounded-xl border space-y-2 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 border border-orange-500/40">
                      {post.category}
                    </span>
                    {isMod && (
                      <button onClick={() => handleDeleteForumPost(post.id)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                  <h3 className="goofy-title text-xl">{post.title}</h3>
                  <p className="text-xs text-gray-400">{post.content}</p>
                  <p className="text-[11px] text-orange-500">By {post.author_display}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MOD PANEL TAB */}
        {activeTab === 'mod' && isMod && (
          <div className={`max-w-4xl mx-auto p-6 rounded-xl border space-y-6 animate-panel ${cardClass}`}>
            <h2 className="goofy-title text-3xl text-orange-500 border-b border-orange-500/20 pb-2">Moderator Panel</h2>
            <div className="space-y-3">
              <h3 className="goofy-title text-xl text-orange-500">Pending Level Approvals ({pendingLevels.length})</h3>
              {pendingLevels.map((lvl) => (
                <div key={lvl.id} className="p-3 bg-orange-500/10 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="text-sm">{lvl.title} by {lvl.creator}</p>
                    <p className="text-gray-400">Points: {lvl.points}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReviewLevel(lvl.id, 'approved')} className="bg-orange-500 text-white px-3 py-1 rounded">Approve</button>
                    <button onClick={() => handleReviewLevel(lvl.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLASSIC / PLATFORMER LIST VIEW */}
        {(activeTab === 'classic' || activeTab === 'platformer') && (
          <div className="space-y-6 animate-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="goofy-title text-4xl text-orange-500">
                {activeTab === 'platformer' ? 'Platformer Goofy Levels' : 'Classic Goofy Levels'}
              </h1>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search level or GD ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} w-56`}
                />
                {currentUser && (
                  <div className="flex gap-2">
                    <button onClick={() => setSidebarForm(sidebarForm === 'record' ? 'none' : 'record')} className="bg-orange-500 text-white text-xs px-3.5 py-2 rounded-lg">
                      Submit Record
                    </button>
                    <button onClick={() => setSidebarForm(sidebarForm === 'level' ? 'none' : 'level')} className="bg-orange-600 text-white text-xs px-3.5 py-2 rounded-lg">
                      Submit Level
                    </button>
                  </div>
                )}
              </div>
            </div>

            {sidebarForm === 'record' && currentUser && (
              <form onSubmit={handleRecordSubmit} className={`p-5 rounded-xl border space-y-3 animate-panel ${cardClass}`}>
                <h3 className="goofy-title text-xl text-orange-500">Submit Record</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={recMode} onChange={(e) => setRecMode(e.target.value as any)} className={inputClass}>
                    <option value="classic">Classic</option>
                    <option value="platformer">Platformer</option>
                  </select>
                  <select value={recLevelId} onChange={(e) => setRecLevelId(Number(e.target.value))} className={inputClass}>
                    {approvedLevels.filter((l) => (l.mode || 'classic') === recMode).map((l) => (
                      <option key={l.id} value={l.id}>{l.title} ({l.points} pts)</option>
                    ))}
                  </select>
                  <input type="number" min={1} max={100} value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required type="url" placeholder="Video Proof URL" value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                  <input type="number" min={1} max={10} value={recEnjoyment} onChange={(e) => setRecEnjoyment(Number(e.target.value))} className={inputClass} />
                </div>
                <button type="submit" className="bg-orange-500 text-white text-xs px-5 py-2.5 rounded-lg">Send Record</button>
              </form>
            )}

            {sidebarForm === 'level' && currentUser && (
              <form onSubmit={handleLevelSubmit} className={`p-5 rounded-xl border space-y-3 animate-panel ${cardClass}`}>
                <h3 className="goofy-title text-xl text-orange-500">Submit New Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={lvlMode} onChange={(e) => setLvlMode(e.target.value as any)} className={inputClass}>
                    <option value="classic">Classic</option>
                    <option value="platformer">Platformer</option>
                  </select>
                  <input required type="text" placeholder="Title" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                  <input required type="text" placeholder="Creator" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input type="text" placeholder="GD Level ID" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Verifier" value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                  <input required type="url" placeholder="Video URL" value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                  <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" className="bg-orange-500 text-white text-xs px-5 py-2.5 rounded-lg">Submit Level</button>
              </form>
            )}

            <div className="space-y-4">
              {shownLevels.map((lvl, index) => (
                <div
                  key={lvl.id}
                  onClick={() => setViewingLevel(lvl)}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-orange-500 transition ${cardClass}`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className="goofy-title text-2xl text-orange-500 w-10">#{index + 1}</span>
                    <img src={lvl.thumbnail || getYouTubeThumbnail(lvl.verification_url, lvl.title)} alt="" className="w-32 h-18 object-cover rounded-lg border border-orange-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="goofy-title text-xl">{lvl.title}</h3>
                        {lvl.gd_level_id && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] bg-orange-500/15 text-orange-500 px-2 py-0.5 rounded font-mono">
                              ID: {lvl.gd_level_id}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(lvl.gd_level_id || '')
                                showNotice(`Copied GD ID: ${lvl.gd_level_id}`)
                              }}
                              className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded hover:bg-orange-600"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">By {lvl.creator} | Verified by {lvl.verifier || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="goofy-title text-2xl text-orange-500">{Number(lvl.points || 0).toFixed(2)}</span>
                      <span className="text-xs text-gray-400 block">points</span>
                    </div>
                    {isMod && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEditingLevel(lvl)} className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteLevel(lvl.id, lvl.title)} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg">Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEVEL DETAILS MODAL */}
        {viewingLevel && (
          <div onClick={() => setViewingLevel(null)} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div onClick={(e) => e.stopPropagation()} className={`max-w-lg w-full p-6 rounded-xl border space-y-4 animate-panel ${cardClass}`}>
              <div className="flex justify-between items-start border-b border-orange-500/20 pb-3">
                <div>
                  <h3 className="goofy-title text-3xl text-orange-500">{viewingLevel.title}</h3>
                  <p className="text-xs text-gray-400">By {viewingLevel.creator}</p>
                </div>
                <button onClick={() => setViewingLevel(null)} className="text-xs bg-orange-500/15 text-orange-500 px-2.5 py-1 rounded-lg">CLOSE</button>
              </div>

              <div className="space-y-2">
                <h4 className="goofy-title text-lg text-orange-500">Verifiers & Victors</h4>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {getLevelVictorsAndVerifiers(viewingLevel).map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-orange-500/10 p-2.5 rounded-lg text-xs">
                      <div>
                        <p>{v.displayName} <span className="text-orange-500">({v.role})</span></p>
                      </div>
                      {v.videoUrl && (
                        <a href={v.videoUrl} target="_blank" rel="noreferrer" className="bg-orange-500 text-white px-2.5 py-1 rounded text-[11px]">
                          Video Proof
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
