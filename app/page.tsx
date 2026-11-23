'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'paulhsu123', 'dhavvin_09', 'lopikpl']
const DISCORD_INVITE_URL = 'https://discord.gg/ePfDysKQxM'
const BANNED_KEYWORDS = ['badword', 'offensiveword', 'spamword', 'scam', 'hack']

const COUNTRIES = [
  { code: 'af', name: 'Afghanistan', region: 'Asia' },
  { code: 'al', name: 'Albania', region: 'Europe' },
  { code: 'dz', name: 'Algeria', region: 'Africa' },
  { code: 'ad', name: 'Andorra', region: 'Europe' },
  { code: 'ao', name: 'Angola', region: 'Africa' },
  { code: 'ar', name: 'Argentina', region: 'South America' },
  { code: 'am', name: 'Armenia', region: 'Asia' },
  { code: 'au', name: 'Australia', region: 'Oceania' },
  { code: 'at', name: 'Austria', region: 'Europe' },
  { code: 'az', name: 'Azerbaijan', region: 'Asia' },
  { code: 'bs', name: 'Bahamas', region: 'North America' },
  { code: 'bh', name: 'Bahrain', region: 'Asia' },
  { code: 'bd', name: 'Bangladesh', region: 'Asia' },
  { code: 'by', name: 'Belarus', region: 'Europe' },
  { code: 'be', name: 'Belgium', region: 'Europe' },
  { code: 'br', name: 'Brazil', region: 'South America' },
  { code: 'ca', name: 'Canada', region: 'North America' },
  { code: 'cl', name: 'Chile', region: 'South America' },
  { code: 'cn', name: 'China', region: 'Asia' },
  { code: 'co', name: 'Colombia', region: 'South America' },
  { code: 'hr', name: 'Croatia', region: 'Europe' },
  { code: 'cz', name: 'Czech Republic', region: 'Europe' },
  { code: 'dk', name: 'Denmark', region: 'Europe' },
  { code: 'eg', name: 'Egypt', region: 'Africa' },
  { code: 'fi', name: 'Finland', region: 'Europe' },
  { code: 'fr', name: 'France', region: 'Europe' },
  { code: 'de', name: 'Germany', region: 'Europe' },
  { code: 'gr', name: 'Greece', region: 'Europe' },
  { code: 'gl', name: 'Greenland', region: 'North America' },
  { code: 'hu', name: 'Hungary', region: 'Europe' },
  { code: 'in', name: 'India', region: 'Asia' },
  { code: 'id', name: 'Indonesia', region: 'Asia' },
  { code: 'ir', name: 'Iran', region: 'Asia' },
  { code: 'iq', name: 'Iraq', region: 'Asia' },
  { code: 'ie', name: 'Ireland', region: 'Europe' },
  { code: 'il', name: 'Israel', region: 'Asia' },
  { code: 'it', name: 'Italy', region: 'Europe' },
  { code: 'jp', name: 'Japan', region: 'Asia' },
  { code: 'mx', name: 'Mexico', region: 'North America' },
  { code: 'nl', name: 'Netherlands', region: 'Europe' },
  { code: 'nz', name: 'New Zealand', region: 'Oceania' },
  { code: 'no', name: 'Norway', region: 'Europe' },
  { code: 'pk', name: 'Pakistan', region: 'Asia' },
  { code: 'ph', name: 'Philippines', region: 'Asia' },
  { code: 'pl', name: 'Poland', region: 'Europe' },
  { code: 'pt', name: 'Portugal', region: 'Europe' },
  { code: 'ro', name: 'Romania', region: 'Europe' },
  { code: 'ru', name: 'Russia', region: 'Europe' },
  { code: 'sa', name: 'Saudi Arabia', region: 'Asia' },
  { code: 'sg', name: 'Singapore', region: 'Asia' },
  { code: 'za', name: 'South Africa', region: 'Africa' },
  { code: 'kr', name: 'South Korea', region: 'Asia' },
  { code: 'es', name: 'Spain', region: 'Europe' },
  { code: 'se', name: 'Sweden', region: 'Europe' },
  { code: 'ch', name: 'Switzerland', region: 'Europe' },
  { code: 'tw', name: 'Taiwan', region: 'Asia' },
  { code: 'th', name: 'Thailand', region: 'Asia' },
  { code: 'tr', name: 'Turkey', region: 'Asia' },
  { code: 'ua', name: 'Ukraine', region: 'Europe' },
  { code: 'ae', name: 'United Arab Emirates', region: 'Asia' },
  { code: 'gb', name: 'United Kingdom', region: 'Europe' },
  { code: 'us', name: 'United States', region: 'North America' },
  { code: 'vn', name: 'Vietnam', region: 'Asia' },
]

const GACHA_COOLDOWN_MS = 60 * 60 * 1000

type ListCategory = 'classic' | 'impossible' | 'spam'

interface PositionHistoryEntry {
  date: string
  change: string
  new_position: number
  reason: string
}

interface GoofyLevel {
  id: number
  title: string
  creator: string
  verifier?: string
  verification_url?: string
  thumbnail?: string
  points?: number
  mode?: ListCategory
  gd_level_id?: string
  submitted_by?: string
  status?: string
  password?: string
  level_length?: string
  object_count?: number
  game_version?: string
  song_name?: string
  song_id?: string
  min_percent?: number
  position_history?: PositionHistoryEntry[]
}

interface Submission {
  id: number
  level_id: number
  level_title?: string
  mode: ListCategory
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
  is_flagged?: boolean
  moderation_reason?: string
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
  banner_url?: string
  pfp_url?: string
  title_badge?: string
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
  createdLevels: GoofyLevel[]
  verifiedLevels: GoofyLevel[]
  publishedLevels: GoofyLevel[]
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/)
  return match && match[1] ? match[1] : null
}

function getYouTubeThumbnail(url?: string): string {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  if (url && url.startsWith('http') && /\.(jpg|jpeg|png|webp|gif)$/i.test(url)) return url
  return ''
}

export default function Home() {
  const [levels, setLevels] = useState<GoofyLevel[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [moderators, setModerators] = useState<Moderator[]>([])
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])

  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<
    'welcome' | 'list' | 'level_detail' | 'leaderboard' | 'gacha' | 'minigames' | 'forum' | 'profile' | 'mod' | 'login' | 'register'
  >('welcome')
  const [selectedListMode, setSelectedListMode] = useState<ListCategory>('classic')
  const [listsDropdownOpen, setListsDropdownOpen] = useState(false)

  const [rightDrawer, setRightDrawer] = useState<'none' | 'record' | 'level'>('none')

  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [sideDecor, setSideDecor] = useState(true)
  const [bannerMsg, setBannerMsg] = useState('')

  const [regUsername, setRegUsername] = useState('')
  const [regDisplay, setRegDisplay] = useState('')
  const [regCountry, setRegCountry] = useState('pl')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  const [recMode, setRecMode] = useState<ListCategory>('classic')
  const [recLevelId, setRecLevelId] = useState<number>(0)
  const [recProgress, setRecProgress] = useState(100)
  const [recVideo, setRecVideo] = useState('')
  const [recEnjoyment, setRecEnjoyment] = useState(8)
  const [recNotes, setRecNotes] = useState('')

  const [lvlMode, setLvlMode] = useState<ListCategory>('classic')
  const [lvlTitle, setLvlTitle] = useState('')
  const [lvlCreator, setLvlCreator] = useState('')
  const [lvlVerifier, setLvlVerifier] = useState('')
  const [lvlVerifyVideo, setLvlVerifyVideo] = useState('')
  const [lvlPoints, setLvlPoints] = useState('250.00')
  const [lvlIntro, setLvlIntro] = useState('')
  const [lvlPassword, setLvlPassword] = useState('Free Copy')
  const [lvlGdId, setLvlGdId] = useState('')
  const [lvlLength, setLvlLength] = useState('1m:45s')
  const [lvlObjects, setLvlObjects] = useState('85000')
  const [lvlVersion, setLvlVersion] = useState('2.2')
  const [lvlSongName, setLvlSongName] = useState('')
  const [lvlSongId, setLvlSongId] = useState('')
  const [lvlMinPct, setLvlMinPct] = useState('75')

  const [editDisplayName, setEditDisplayName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editCountry, setEditCountry] = useState('pl')
  const [editYoutube, setEditYoutube] = useState('')
  const [editDiscord, setEditDiscord] = useState('')
  const [editTwitter, setEditTwitter] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editBanner, setEditBanner] = useState('')
  const [editPfp, setEditPfp] = useState('')
  const [editBadge, setEditBadge] = useState('Member')

  const [warnTargetUser, setWarnTargetUser] = useState('')
  const [warnReason, setWarnReason] = useState('')
  const [modName, setModName] = useState('')
  const [modClan, setModClan] = useState('')
  const [modCountry, setModCountry] = useState('pl')
  const [modRole, setModRole] = useState<'editor' | 'helper'>('editor')
  const [bulkPointMultiplier, setBulkPointMultiplier] = useState('1.10')

  const [editingLevel, setEditingLevel] = useState<GoofyLevel | null>(null)
  const [viewingLevel, setViewingLevel] = useState<GoofyLevel | null>(null)
  const [viewingPlayer, setViewingPlayer] = useState<PlayerLeaderboardRow | null>(null)

  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL')
  const [lbSearch, setLbSearch] = useState('')
  const [lbPage, setLbPage] = useState(0)
  const [selectedStatsPlayerId, setSelectedStatsPlayerId] = useState<string>('')

  const [rouletteLevel, setRouletteLevel] = useState<GoofyLevel | null>(null)
  const [rouletteTargetPct, setRouletteTargetPct] = useState<number>(1)
  const [rouletteAchievedPct, setRouletteAchievedPct] = useState<number>(100)
  const [rouletteMessage, setRouletteMessage] = useState<string>('')

  const [gachaAnimating, setGachaAnimating] = useState(false)
  const [gachaRolledLevel, setGachaRolledLevel] = useState<GoofyLevel | null>(null)
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0)

  const [postCategory, setPostCategory] = useState<'forum' | 'bug'>('forum')
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')

  const isMod = currentUser ? ALLOWED_MODS.includes(currentUser.username.toLowerCase()) : false

  useEffect(() => {
    const savedTheme = localStorage.getItem('gll_theme')
    const savedDecor = localStorage.getItem('gll_side_decor')
    if (savedTheme) setDarkMode(savedTheme === 'dark')
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
    setEditBanner(prof.banner_url || '')
    setEditPfp(prof.pfp_url || '')
    setEditBadge(prof.title_badge || 'Member')
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
          banner_url: '',
          pfp_url: '',
          title_badge: 'Newcomer',
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
    setActiveTab('list')
    refreshAll()
    showNotice('Account registered and logged in successfully!')
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
      setActiveTab('list')
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
    const modeLevels = approvedLevels.filter((l) => (l.mode || 'classic') === recMode)
    const chosen = modeLevels.find((l) => l.id === recLevelId) || modeLevels[0]
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
      setRightDrawer('none')
      refreshAll()
      showNotice('Record submitted for moderator review!')
    }
  }

  async function handleLevelSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) {
      alert('Please log in first to submit a level.')
      setActiveTab('login')
      return
    }

    const autoThumb = getYouTubeThumbnail(lvlVerifyVideo)
    const todayStr = new Date().toISOString().slice(0, 10)

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
        password: lvlPassword.trim() || 'Free Copy',
        level_length: lvlLength.trim() || '1m:30s',
        object_count: parseInt(lvlObjects) || 0,
        game_version: lvlVersion.trim() || '2.2',
        song_name: lvlSongName.trim(),
        song_id: lvlSongId.trim(),
        min_percent: parseInt(lvlMinPct) || 75,
        position_history: [{ date: todayStr, change: '-', new_position: 1, reason: 'Added to list' }],
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
      setLvlIntro('')
      setRightDrawer('none')
      refreshAll()
      showNotice('Level sent to moderators for review!')
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

    const combinedText = `${postTitle} ${postContent}`.toLowerCase()
    const foundKeyword = BANNED_KEYWORDS.find((kw) => combinedText.includes(kw))
    const isFlagged = Boolean(foundKeyword)
    const modReason = foundKeyword ? `Auto-moderation flagged keyword: "${foundKeyword}"` : ''

    const { error } = await supabase.from('forum_posts').insert([
      {
        author_username: currentUser.username,
        author_display: currentUser.display_name,
        category: postCategory,
        title: postTitle.trim(),
        content: postContent.trim(),
        is_flagged: isFlagged,
        moderation_reason: modReason,
      },
    ])

    if (error) {
      alert('Error creating post: ' + error.message)
    } else {
      setPostTitle('')
      setPostContent('')
      refreshAll()
      showNotice(isFlagged ? 'Post submitted, but flagged by auto-moderation.' : 'Post published!')
    }
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

    const updatedThumb = getYouTubeThumbnail(editingLevel.verification_url)

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
        password: (editingLevel.password || 'Free Copy').trim(),
        level_length: (editingLevel.level_length || '1m:30s').trim(),
        object_count: Number(editingLevel.object_count) || 0,
        game_version: (editingLevel.game_version || '2.2').trim(),
        song_name: (editingLevel.song_name || '').trim(),
        song_id: (editingLevel.song_id || '').trim(),
        min_percent: Number(editingLevel.min_percent) || 75,
      })
      .eq('id', editingLevel.id)

    if (error) {
      alert('Error updating level: ' + error.message)
    } else {
      setEditingLevel(null)
      refreshAll()
      showNotice('Level updated successfully!')
    }
  }

  async function handleBulkScalePoints() {
    if (!isMod) return
    const mult = parseFloat(bulkPointMultiplier)
    if (isNaN(mult) || mult <= 0) return
    if (!confirm(`Multiply all level points by ${mult}x?`)) return

    for (const lvl of approvedLevels) {
      const nextPts = Number((Number(lvl.points || 0) * mult).toFixed(2))
      await supabase.from('demons').update({ points: nextPts }).eq('id', lvl.id)
    }
    refreshAll()
    showNotice(`Scaled all level points by ${mult}x!`)
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
        banner_url: editBanner.trim(),
        pfp_url: editPfp.trim(),
        title_badge: editBadge.trim(),
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
        banner_url: editBanner.trim(),
        pfp_url: editPfp.trim(),
        title_badge: editBadge.trim(),
      }
      setCurrentUser(updated)
      setEditPassword('')
      refreshAll()
      showNotice('Profile settings saved!')
    }
  }

  async function handleRollGacha() {
    if (!currentUser) {
      alert('Please log in to roll Goofy Gacha!')
      setActiveTab('login')
      return
    }
    if (cooldownRemainingMs > 0) {
      alert('Gacha is on cooldown!')
      return
    }
    if (approvedLevels.length === 0) {
      alert('No approved levels available to roll.')
      return
    }

    setGachaAnimating(true)
    setTimeout(async () => {
      const randomLvl = approvedLevels[Math.floor(Math.random() * approvedLevels.length)]
      setGachaRolledLevel(randomLvl)
      setGachaAnimating(false)

      const nowIso = new Date().toISOString()
      const nextInv = [...(currentUser.inventory || []), randomLvl.id]
      await supabase
        .from('profiles')
        .update({ last_gacha_roll: nowIso, inventory: nextInv })
        .eq('id', currentUser.id)

      setCurrentUser({ ...currentUser, last_gacha_roll: nowIso, inventory: nextInv })
      refreshAll()
    }, 1500)
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
      showNotice('Level approved to the list!')
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
      showNotice('Staff member added!')
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

  const approvedLevels = levels.filter((l) => (l.status || 'approved') === 'approved')
  const pendingLevels = levels.filter((l) => l.status === 'pending')
  const approvedSubs = submissions.filter((s) => s.status === 'approved')
  const pendingSubs = submissions.filter((s) => s.status === 'pending')

  function getLeaderboardForMode(mode: ListCategory): PlayerLeaderboardRow[] {
    const modeLevels = approvedLevels.filter((l) => (l.mode || 'classic') === mode)
    return profiles
      .map((prof) => {
        const uLower = prof.username.trim().toLowerCase()
        const dLower = (prof.display_name || prof.username).trim().toLowerCase()
        const seenLevelIds = new Set<number>()
        const entries: PlayerLeaderboardRow['entries'] = []
        const createdLevels: GoofyLevel[] = []
        const verifiedLevels: GoofyLevel[] = []
        const publishedLevels: GoofyLevel[] = []

        modeLevels.forEach((lvl) => {
          const verLower = (lvl.verifier || '').trim().toLowerCase()
          if (verLower && (verLower === uLower || verLower === dLower)) {
            verifiedLevels.push(lvl)
            if (!seenLevelIds.has(lvl.id)) {
              seenLevelIds.add(lvl.id)
              entries.push({
                level: lvl,
                progress: 100,
                pointsEarned: Number(lvl.points || 0),
                role: 'Verifier',
                videoUrl: lvl.verification_url,
              })
            }
          }

          const creatorLower = (lvl.creator || '').trim().toLowerCase()
          if (creatorLower.includes(uLower) || creatorLower.includes(dLower)) {
            createdLevels.push(lvl)
          }

          const subByLower = (lvl.submitted_by || '').trim().toLowerCase()
          if (subByLower === uLower) {
            publishedLevels.push(lvl)
          }
        })

        approvedSubs
          .filter((s) => s.player_username.trim().toLowerCase() === uLower && (s.mode || 'classic') === mode)
          .forEach((sub) => {
            const lvl = modeLevels.find((l) => l.id === sub.level_id)
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
          createdLevels,
          verifiedLevels,
          publishedLevels,
        }
      })
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints
        }
        const hardestA = a.hardestLevel ? Number(a.hardestLevel.points || 0) : 0
        const hardestB = b.hardestLevel ? Number(b.hardestLevel.points || 0) : 0
        return hardestB - hardestA
      })
  }

  const activeLeaderboard = getLeaderboardForMode(selectedListMode)

  const filteredLeaderboard = activeLeaderboard.filter((p) => {
    const matchesCountry = selectedCountryFilter === 'ALL' || p.country.toLowerCase() === selectedCountryFilter.toLowerCase()
    const matchesSearch =
      !lbSearch.trim() ||
      p.display_name.toLowerCase().includes(lbSearch.toLowerCase()) ||
      p.username.toLowerCase().includes(lbSearch.toLowerCase())
    return matchesCountry && matchesSearch
  })

  // Calculate player count per country for map heatmap
  const countryPlayerCounts = profiles.reduce((acc, p) => {
    const code = (p.country || 'pl').toLowerCase()
    acc[code] = (acc[code] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  function getCountryColor(code: string) {
    const count = countryPlayerCounts[code] || 0
    if (count === 0) return darkMode ? '#27272a' : '#cbd5e1'
    if (count === 1) return '#fb923c'
    if (count <= 3) return '#f97316'
    return '#ea580c'
  }

  const PAGE_SIZE = 15
  const pagedLeaderboard = filteredLeaderboard.slice(lbPage * PAGE_SIZE, (lbPage + 1) * PAGE_SIZE)
  const activeStatsPlayer =
    filteredLeaderboard.find((p) => p.id === selectedStatsPlayerId) ||
    filteredLeaderboard[0] ||
    null

  const pageBg = darkMode ? 'bg-[#09090b] text-white' : 'bg-[#f8fafc] text-[#111827]'
  const cardClass = darkMode
    ? 'bg-[#121216] border-orange-500/35 text-white shadow-2xl'
    : 'bg-white border-orange-300 text-[#111827] shadow-xl'
  const inputClass = darkMode
    ? 'w-full border border-orange-500/40 bg-[#18181f] text-white font-bold rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 transition'
    : 'w-full border border-orange-300 bg-orange-50/40 text-gray-900 font-bold rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 transition'

  const categoryLevels = approvedLevels.filter((l) => (l.mode || 'classic') === selectedListMode)
  const shownLevels = categoryLevels.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.creator.toLowerCase().includes(search.toLowerCase()) ||
      (l.gd_level_id || '').includes(search.trim())
  )

  function getLevelVictorsAndVerifiers(lvl: GoofyLevel) {
    const list: { username: string; displayName: string; videoUrl?: string; enjoyment?: number; progress: number; role: string }[] = []
    const seen = new Set<string>()

    if (lvl.verifier) {
      const vKey = lvl.verifier.trim().toLowerCase()
      seen.add(vKey)
      const matchedProf = profiles.find((p) => p.username.toLowerCase() === vKey || p.display_name.toLowerCase() === vKey)
      list.push({
        username: lvl.verifier,
        displayName: matchedProf?.display_name || lvl.verifier,
        videoUrl: lvl.verification_url,
        progress: 100,
        role: 'Verifier',
      })
    }

    approvedSubs
      .filter((s) => s.level_id === lvl.id)
      .forEach((s) => {
        const key = s.player_username.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          list.push({
            username: s.player_username,
            displayName: s.player_name || s.player_username,
            videoUrl: s.video_url,
            enjoyment: s.enjoyment,
            progress: s.progress,
            role: s.progress === 100 ? 'Victor' : 'Progress',
          })
        }
      })

    return list
  }

  function renderAvatar(prof?: { pfp_url?: string; display_name?: string; username?: string }, sizeClass = 'w-12 h-12 text-lg') {
    const label = (prof?.display_name || prof?.username || '?').slice(0, 2).toUpperCase()
    if (prof?.pfp_url) {
      return <img src={prof.pfp_url} alt="" className={`${sizeClass} rounded-full object-cover border-2 border-orange-500`} />
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black border-2 border-orange-300 shadow`}>
        {label}
      </div>
    )
  }

  const listLabels: Record<ListCategory, string> = {
    classic: 'Classic List',
    impossible: 'Impossible List',
    spam: 'Spam List',
  }

  return (
    <div className={`min-h-screen font-bold relative overflow-x-hidden transition-colors duration-300 text-lg ${pageBg}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Fredoka:wght@600;700&family=Space+Grotesk:wght@600;700&display=swap');
        body {
          font-family: 'Space Grotesk', sans-serif;
        }
        .goofy-title {
          font-family: 'Fredoka', 'Bungee', cursive, sans-serif;
          letter-spacing: -0.01em;
        }
        .fancy-display {
          font-family: 'Bungee', 'Fredoka', cursive, sans-serif;
          letter-spacing: 0.02em;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-panel {
          animation: fadeSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* VERY SMALL AND THIN SIDE WAVES */}
      {sideDecor && (
        <>
          <div aria-hidden="true" className="fixed left-0 top-0 bottom-0 w-3 z-40 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 12 800" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L9,0 C12,130 3,260 8,400 C12,540 2,670 9,800 L0,800 Z" fill="#ea580c" opacity="0.4" />
              <path d="M0,0 L5,0 C8,130 1,260 4,400 C7,540 1,670 5,800 L0,800 Z" fill="#f97316" opacity="0.8" />
            </svg>
          </div>
          <div aria-hidden="true" className="fixed right-0 top-0 bottom-0 w-3 z-40 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 12 800" preserveAspectRatio="none" className="w-full h-full">
              <path d="M12,0 L3,0 C0,130 9,260 4,400 C0,540 10,670 3,800 L12,800 Z" fill="#ea580c" opacity="0.4" />
              <path d="M12,0 L7,0 C4,130 11,260 8,400 C5,540 11,670 7,800 L12,800 Z" fill="#f97316" opacity="0.8" />
            </svg>
          </div>
        </>
      )}

      {/* TOP HEADER */}
      <header className={darkMode ? 'bg-[#09090b]/95 border-b border-orange-500/35 sticky top-0 z-40 backdrop-blur' : 'bg-white/95 border-b border-orange-300 sticky top-0 z-40 backdrop-blur'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer select-none group" onClick={() => setActiveTab('welcome')}>
            <span className="fancy-display font-bold text-3xl sm:text-5xl uppercase text-orange-500 group-hover:scale-105 transition-transform">
              GLL<span className="text-xl lowercase text-orange-400">.pl</span>
            </span>
            <span className="hidden md:inline-block text-base font-bold text-orange-500/85 border-l-2 border-orange-400 pl-4">
              Goofy Levels List
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-base font-bold">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-base font-bold transition shadow"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="hidden md:inline">Discord</span>
            </a>

            <button
              onClick={handleToggleSideDecor}
              className={`px-4 py-2.5 rounded-2xl text-base font-bold border transition ${
                sideDecor ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-gray-400/40 text-gray-400'
              }`}
            >
              Side Waves: {sideDecor ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleToggleTheme}
              className="p-3 rounded-2xl border border-orange-500/35 hover:bg-orange-500/10 text-orange-500 transition"
              title="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {renderAvatar(currentUser, 'w-10 h-10 text-sm')}
                <button
                  onClick={() => {
                    const row = getLeaderboardForMode('classic').find((p) => p.id === currentUser.id) || {
                      ...currentUser,
                      totalPoints: 0,
                      completedCount: 0,
                      hardestLevel: null,
                      entries: [],
                      createdLevels: [],
                      verifiedLevels: [],
                      publishedLevels: [],
                    }
                    setViewingPlayer(row)
                    setActiveTab('profile')
                  }}
                  className="text-base bg-orange-500/15 border border-orange-500 text-orange-500 px-4 py-2.5 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition"
                >
                  {currentUser.display_name}
                </button>
                <button onClick={handleLogout} className="text-base text-gray-400 hover:text-orange-500 transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('login')} className="hover:text-orange-500 transition">Login</button>
                <button onClick={() => setActiveTab('register')} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-base font-bold transition">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className={darkMode ? 'bg-[#121216] border-t border-orange-500/25' : 'bg-orange-50/70 border-t border-orange-200'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center items-center text-base sm:text-lg font-bold">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`px-5 py-4 border-b-2 transition-all ${
                activeTab === 'welcome' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
              }`}
            >
              Welcome
            </button>

            <div className="relative">
              <button
                onClick={() => setListsDropdownOpen((prev) => !prev)}
                className={`px-5 py-4 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'list' || activeTab === 'level_detail'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent hover:text-orange-500'
                }`}
              >
                <span>Lists ({listLabels[selectedListMode]})</span>
                <span className="text-xs">▼</span>
              </button>

              {listsDropdownOpen && (
                <div
                  onMouseLeave={() => setListsDropdownOpen(false)}
                  className={`absolute left-0 mt-1 w-64 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                    darkMode ? 'bg-[#18181f] border-orange-500/40 text-white' : 'bg-white border-orange-300 text-gray-900'
                  }`}
                >
                  {(['classic', 'impossible', 'spam'] as ListCategory[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSelectedListMode(mode)
                        setActiveTab('list')
                        setListsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-5 py-3.5 text-base font-bold hover:bg-orange-500 hover:text-white transition flex items-center justify-between ${
                        selectedListMode === mode && activeTab === 'list' ? 'bg-orange-500/20 text-orange-500' : ''
                      }`}
                    >
                      <span>{listLabels[mode]}</span>
                      <span className="text-xs opacity-75">
                        {approvedLevels.filter((l) => (l.mode || 'classic') === mode).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {[
              { id: 'leaderboard', label: `Leaderboard (${listLabels[selectedListMode]})` },
              { id: 'gacha', label: 'Goofy Gacha' },
              { id: 'minigames', label: 'Roulette' },
              { id: 'forum', label: 'Forum & Bugs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setListsDropdownOpen(false)
                  if (tab.id === 'minigames') startRouletteChallenge()
                  else setActiveTab(tab.id as any)
                }}
                className={`px-5 py-4 border-b-2 transition-all ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {isMod && (
              <button
                onClick={() => setActiveTab('mod')}
                className={`px-5 py-4 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'mod' ? 'border-orange-500 text-orange-500' : 'border-transparent text-orange-500'
                }`}
              >
                <span>Mod Panel</span>
                {pendingSubs.length + pendingLevels.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full">
                    {pendingSubs.length + pendingLevels.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* FLOATING SUBMIT BUTTONS */}
      {currentUser && (
        <div className="fixed right-4 sm:right-10 bottom-8 z-40 flex flex-col gap-3.5">
          <button
            onClick={() => setRightDrawer(rightDrawer === 'record' ? 'none' : 'record')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-3xl text-base sm:text-lg font-bold shadow-[0_10px_30px_rgba(249,115,22,0.5)] flex items-center gap-3 transition transform hover:-translate-y-1"
          >
            <span>+ Submit Record</span>
          </button>
          <button
            onClick={() => setRightDrawer(rightDrawer === 'level' ? 'none' : 'level')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-4 rounded-3xl text-base sm:text-lg font-bold shadow-[0_10px_30px_rgba(217,119,6,0.5)] flex items-center gap-3 transition transform hover:-translate-y-1"
          >
            <span>+ Submit Level</span>
          </button>
        </div>
      )}

      {/* RIGHT-SIDE SLIDE DRAWER */}
      {rightDrawer !== 'none' && currentUser && (
        <div onClick={() => setRightDrawer('none')} className="fixed inset-0 bg-black/75 z-50 flex justify-end">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl h-full overflow-y-auto p-8 sm:p-10 border-l space-y-6 animate-panel ${cardClass}`}
          >
            <div className="flex items-center justify-between border-b border-orange-500/25 pb-4">
              <h2 className="fancy-display text-2xl sm:text-3xl text-orange-500">
                {rightDrawer === 'record' ? 'Submit Record' : 'Submit New Level'}
              </h2>
              <button
                onClick={() => setRightDrawer('none')}
                className="bg-orange-500/20 text-orange-500 px-4 py-2 rounded-2xl text-base hover:bg-orange-500 hover:text-white transition"
              >
                Close ✕
              </button>
            </div>

            {rightDrawer === 'record' ? (
              <form onSubmit={handleRecordSubmit} className="space-y-5">
                <div>
                  <label className="block text-base mb-2">List Category</label>
                  <select value={recMode} onChange={(e) => setRecMode(e.target.value as ListCategory)} className={inputClass}>
                    <option value="classic">Classic List</option>
                    <option value="impossible">Impossible List</option>
                    <option value="spam">Spam List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base mb-2">Select Level</label>
                  <select value={recLevelId} onChange={(e) => setRecLevelId(Number(e.target.value))} className={inputClass}>
                    {approvedLevels.filter((l) => (l.mode || 'classic') === recMode).map((l) => (
                      <option key={l.id} value={l.id}>{l.title} ({l.points} pts)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base mb-2">Progress (%)</label>
                  <input type="number" min={1} max={100} value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-base mb-2">Video Proof URL</label>
                  <input required type="url" placeholder="https://youtube.com/..." value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-base">Enjoyment Rating</label>
                    <span className="text-orange-500 font-bold text-xl">{recEnjoyment} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={recEnjoyment}
                    onChange={(e) => setRecEnjoyment(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-3 bg-orange-500/20 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-base mb-2">Mod Notes</label>
                  <input type="text" placeholder="Raw footage link..." value={recNotes} onChange={(e) => setRecNotes(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl text-lg font-bold transition shadow-xl">
                  Send Record Submission
                </button>
              </form>
            ) : (
              <form onSubmit={handleLevelSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base mb-1">List Type</label>
                    <select value={lvlMode} onChange={(e) => setLvlMode(e.target.value as ListCategory)} className={inputClass}>
                      <option value="classic">Classic List</option>
                      <option value="impossible">Impossible List</option>
                      <option value="spam">Spam List</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base mb-1">GD Level ID</label>
                    <input type="text" placeholder="149992717" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-base mb-1">Level Title</label>
                  <input required type="text" placeholder="e.g. GRIEF" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base mb-1">Creator(s)</label>
                    <input required type="text" placeholder="Creator name" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-base mb-1">Verifier</label>
                    <input type="text" placeholder="Verifier name" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-base mb-1">Verification YouTube URL</label>
                  <input required type="url" placeholder="https://youtube.com/watch?v=..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Points</label>
                    <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Min List %</label>
                    <input type="number" min={1} max={100} value={lvlMinPct} onChange={(e) => setLvlMinPct(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input type="text" value={lvlPassword} onChange={(e) => setLvlPassword(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Level Length</label>
                    <input type="text" value={lvlLength} onChange={(e) => setLvlLength(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Object Count</label>
                    <input type="number" value={lvlObjects} onChange={(e) => setLvlObjects(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl text-lg font-bold transition shadow-xl">
                  Submit Level for Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {bannerMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 animate-panel">
          <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl text-base font-bold flex justify-between shadow-2xl">
            <span>{bannerMsg}</span>
            <button onClick={() => setBannerMsg('')} className="font-black ml-4">CLOSE</button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR: STAFF & EDITORS */}
        <aside className="lg:col-span-3 space-y-6">
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardClass}`}>
            <h3 className="goofy-title text-2xl text-orange-500 border-b border-orange-500/20 pb-4">List Staff & Editors</h3>
            
            <div className="space-y-6 text-base">
              <div>
                <p className="text-sm uppercase text-orange-400 font-bold mb-3">Editors ({moderators.filter((m) => m.role === 'editor').length})</p>
                {moderators.filter((m) => m.role === 'editor').length === 0 ? (
                  <p className="text-sm text-gray-400">No editors listed.</p>
                ) : (
                  <div className="space-y-2.5">
                    {moderators
                      .filter((m) => m.role === 'editor')
                      .map((m) => (
                        <div key={m.id} className="flex items-center gap-3 bg-orange-500/10 px-4 py-3 rounded-2xl border border-orange-500/20">
                          <img src={`https://flagcdn.com/w20/${m.country_code.toLowerCase()}.png`} alt="" className="w-6 h-4 border" />
                          <span className="truncate">{m.clan ? `[${m.clan}] ` : ''}{m.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm uppercase text-amber-400 font-bold mb-3">Helpers ({moderators.filter((m) => m.role === 'helper').length})</p>
                {moderators.filter((m) => m.role === 'helper').length === 0 ? (
                  <p className="text-sm text-gray-400">No helpers listed.</p>
                ) : (
                  <div className="space-y-2.5">
                    {moderators
                      .filter((m) => m.role === 'helper')
                      .map((m) => (
                        <div key={m.id} className="flex items-center gap-3 bg-orange-500/10 px-4 py-3 rounded-2xl border border-orange-500/20">
                          <img src={`https://flagcdn.com/w20/${m.country_code.toLowerCase()}.png`} alt="" className="w-6 h-4 border" />
                          <span className="truncate">{m.clan ? `[${m.clan}] ` : ''}{m.name}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="lg:col-span-9 space-y-8">
          {/* WELCOME PAGE */}
          {activeTab === 'welcome' && (
            <div className="space-y-8 animate-panel">
              <div className={`p-10 sm:p-14 rounded-3xl border text-center space-y-6 ${cardClass}`}>
                <span className="inline-block bg-orange-500/20 text-orange-500 border border-orange-500/40 px-5 py-2 rounded-full text-base uppercase tracking-wider">
                  Official Geometry Dash Community Demonlist
                </span>
                <h1 className="fancy-display text-4xl sm:text-6xl text-orange-500 leading-tight">
                  Welcome to Goofy Levels List
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Track top completions across Classic, Impossible, and Spam lists. Spin Goofy Gacha, challenge Goofy Roulette, and climb the international leaderboard!
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setSelectedListMode('classic')
                      setActiveTab('list')
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-9 py-4 rounded-3xl text-lg font-bold transition shadow-2xl"
                  >
                    Browse Classic List
                  </button>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="bg-orange-500/15 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-9 py-4 rounded-3xl text-lg font-bold transition"
                  >
                    Open Stats Viewer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Ranked Levels', value: approvedLevels.length, sub: 'Across All Lists' },
                  { label: 'Registered Players', value: profiles.length, sub: 'Competing Worldwide' },
                  { label: 'Verified Records', value: approvedSubs.length, sub: 'With Video Proof' },
                ].map((stat, i) => (
                  <div key={i} className={`p-8 rounded-3xl border text-center space-y-2 ${cardClass}`}>
                    <p className="fancy-display text-5xl text-orange-500">{stat.value}</p>
                    <p className="text-lg">{stat.label}</p>
                    <p className="text-sm text-gray-400">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL DETAILS VIEW */}
          {activeTab === 'level_detail' && viewingLevel && (
            <div className="space-y-6 animate-panel">
              <button
                onClick={() => setActiveTab('list')}
                className="bg-orange-500/15 border border-orange-500/40 text-orange-500 px-5 py-2.5 rounded-2xl text-base hover:bg-orange-500 hover:text-white transition"
              >
                ← Back to {listLabels[viewingLevel.mode || 'classic']}
              </button>

              <div className={`p-8 sm:p-12 rounded-3xl border space-y-8 ${cardClass}`}>
                <div className="text-center space-y-3 border-b border-orange-500/20 pb-8">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => {
                        const idx = categoryLevels.findIndex((l) => l.id === viewingLevel.id)
                        if (idx > 0) setViewingLevel(categoryLevels[idx - 1])
                      }}
                      className="text-4xl text-orange-500 hover:scale-125 transition"
                    >
                      ‹
                    </button>
                    <h1 className="fancy-display text-4xl sm:text-6xl text-orange-500">{viewingLevel.title}</h1>
                    <button
                      onClick={() => {
                        const idx = categoryLevels.findIndex((l) => l.id === viewingLevel.id)
                        if (idx >= 0 && idx < categoryLevels.length - 1) setViewingLevel(categoryLevels[idx + 1])
                      }}
                      className="text-4xl text-orange-500 hover:scale-125 transition"
                    >
                      ›
                    </button>
                  </div>
                  <p className="text-lg text-gray-400">
                    by <span className="text-orange-400 underline">{viewingLevel.creator}</span>, verified by{' '}
                    <span className="text-orange-400 underline">{viewingLevel.verifier || 'Unknown'}</span>
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  {getYouTubeId(viewingLevel.verification_url) ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeId(viewingLevel.verification_url)}`}
                        title={viewingLevel.title}
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center pt-4 border-t border-orange-500/20">
                  <div>
                    <p className="text-base text-orange-500">Level Password</p>
                    <p className="text-lg">{viewingLevel.password || 'Free Copy'}</p>
                  </div>
                  <div>
                    <p className="text-base text-orange-500">Level ID</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewingLevel.gd_level_id || '')
                        showNotice(`Copied ID: ${viewingLevel.gd_level_id}`)
                      }}
                      className="text-lg hover:text-orange-400 underline"
                    >
                      {viewingLevel.gd_level_id || 'N/A'}
                    </button>
                  </div>
                  <div>
                    <p className="text-base text-orange-500">Level Length</p>
                    <p className="text-lg">{viewingLevel.level_length || '1m:30s'}</p>
                  </div>
                  <div>
                    <p className="text-base text-orange-500">Object Count</p>
                    <p className="text-lg">{viewingLevel.object_count || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* RECORDS */}
              <div className={`p-8 rounded-3xl border space-y-4 text-center ${cardClass}`}>
                <h3 className="goofy-title text-3xl text-orange-500">Records</h3>
                <p className="text-base text-gray-400 border-b border-orange-500/20 pb-4">
                  {viewingLevel.min_percent || 75}% or better required to qualify
                </p>
                {getLevelVictorsAndVerifiers(viewingLevel).length === 0 ? (
                  <p className="text-base text-gray-400 py-6">No records yet! Be the first to achieve one!</p>
                ) : (
                  <div className="space-y-3 text-left">
                    {getLevelVictorsAndVerifiers(viewingLevel).map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-orange-500/10 px-6 py-4 rounded-2xl text-base">
                        <div>
                          <span className="font-bold text-lg">{v.displayName}</span>{' '}
                          <span className="text-orange-500">({v.role} - {v.progress}%)</span>
                        </div>
                        {v.videoUrl && (
                          <a href={v.videoUrl} target="_blank" rel="noreferrer" className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm">
                            Video Proof ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WORLD MAP HEATMAP & LEADERBOARD STATS VIEWER */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6 animate-panel">
              <div className={`rounded-3xl border overflow-hidden ${cardClass}`}>
                <div className="relative bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-transparent p-8 text-center space-y-4">
                  
                  {/* DETAILED CLICKABLE COUNTRIES WORLD MAP WITH HEATMAP SHADING */}
                  <div className="max-w-3xl mx-auto p-4 bg-[#09090b]/80 rounded-3xl border border-orange-500/30">
                    <p className="text-sm uppercase tracking-wider text-orange-400 mb-2">Click an Individual Country on the Map to Filter</p>
                    <svg viewBox="0 0 1000 500" className="w-full h-64 sm:h-80">
                      <g stroke={darkMode ? '#333b48' : '#ffffff'} strokeWidth="1">
                        {/* United States */}
                        <path
                          d="M130,120 Q170,90 220,110 T260,160 Q240,210 180,230 T120,190 Z"
                          fill={getCountryColor('us')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('us'); setLbPage(0); }}
                        >
                          <title>United States ({countryPlayerCounts['us'] || 0} players)</title>
                        </path>

                        {/* Canada */}
                        <path
                          d="M110,65 Q180,35 260,65 T290,115 Q200,120 110,65 Z"
                          fill={getCountryColor('ca')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('ca'); setLbPage(0); }}
                        >
                          <title>Canada ({countryPlayerCounts['ca'] || 0} players)</title>
                        </path>

                        {/* Brazil */}
                        <path
                          d="M240,270 Q280,280 300,340 T270,420 Q230,440 215,360 T240,270 Z"
                          fill={getCountryColor('br')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('br'); setLbPage(0); }}
                        >
                          <title>Brazil ({countryPlayerCounts['br'] || 0} players)</title>
                        </path>

                        {/* United Kingdom */}
                        <path
                          d="M450,95 Q465,90 470,115 T450,125 Z"
                          fill={getCountryColor('gb')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('gb'); setLbPage(0); }}
                        >
                          <title>United Kingdom ({countryPlayerCounts['gb'] || 0} players)</title>
                        </path>

                        {/* France */}
                        <path
                          d="M475,125 Q495,120 500,145 T475,155 Z"
                          fill={getCountryColor('fr')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('fr'); setLbPage(0); }}
                        >
                          <title>France ({countryPlayerCounts['fr'] || 0} players)</title>
                        </path>

                        {/* Germany */}
                        <path
                          d="M505,115 Q525,110 530,135 T505,145 Z"
                          fill={getCountryColor('de')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('de'); setLbPage(0); }}
                        >
                          <title>Germany ({countryPlayerCounts['de'] || 0} players)</title>
                        </path>

                        {/* Poland */}
                        <path
                          d="M535,110 Q555,105 560,130 T535,140 Z"
                          fill={getCountryColor('pl')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('pl'); setLbPage(0); }}
                        >
                          <title>Poland ({countryPlayerCounts['pl'] || 0} players)</title>
                        </path>

                        {/* Spain */}
                        <path
                          d="M455,155 Q475,150 480,175 T455,185 Z"
                          fill={getCountryColor('es')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('es'); setLbPage(0); }}
                        >
                          <title>Spain ({countryPlayerCounts['es'] || 0} players)</title>
                        </path>

                        {/* Italy */}
                        <path
                          d="M515,150 Q530,145 535,175 T515,190 Z"
                          fill={getCountryColor('it')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('it'); setLbPage(0); }}
                        >
                          <title>Italy ({countryPlayerCounts['it'] || 0} players)</title>
                        </path>

                        {/* Japan */}
                        <path
                          d="M890,140 Q910,135 915,165 T890,175 Z"
                          fill={getCountryColor('jp')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('jp'); setLbPage(0); }}
                        >
                          <title>Japan ({countryPlayerCounts['jp'] || 0} players)</title>
                        </path>

                        {/* Australia */}
                        <path
                          d="M790,320 Q850,315 880,355 T815,435 Q770,405 790,320 Z"
                          fill={getCountryColor('au')}
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => { setSelectedCountryFilter('au'); setLbPage(0); }}
                        >
                          <title>Australia ({countryPlayerCounts['au'] || 0} players)</title>
                        </path>
                      </g>
                    </svg>
                  </div>

                  <h2 className="fancy-display text-3xl sm:text-4xl text-orange-500">
                    Leaderboard ({listLabels[selectedListMode]}) -
                  </h2>
                  <div className="flex flex-wrap justify-center items-center gap-3">
                    <select
                      value={selectedListMode}
                      onChange={(e) => {
                        setSelectedListMode(e.target.value as ListCategory)
                        setLbPage(0)
                      }}
                      className={`border-2 border-orange-500 rounded-2xl bg-orange-500/15 text-xl font-bold px-4 py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <option value="classic" className={darkMode ? 'bg-[#121216]' : 'bg-white'}>Classic List Leaderboard</option>
                      <option value="impossible" className={darkMode ? 'bg-[#121216]' : 'bg-white'}>Impossible List Leaderboard</option>
                      <option value="spam" className={darkMode ? 'bg-[#121216]' : 'bg-white'}>Spam List Leaderboard</option>
                    </select>

                    <select
                      value={selectedCountryFilter}
                      onChange={(e) => {
                        setSelectedCountryFilter(e.target.value)
                        setLbPage(0)
                      }}
                      className={`border-2 border-orange-500 rounded-2xl bg-orange-500/15 text-xl font-bold px-4 py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <option value="ALL" className={darkMode ? 'bg-[#121216]' : 'bg-white'}>Global (All Countries)</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code} className={darkMode ? 'bg-[#121216]' : 'bg-white'}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-orange-500/25">
                  <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-orange-500/25 p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Search player..."
                        value={lbSearch}
                        onChange={(e) => {
                          setLbSearch(e.target.value)
                          setLbPage(0)
                        }}
                        className={inputClass}
                      />
                      <div className="border border-orange-500/30 rounded-2xl h-96 overflow-y-auto divide-y divide-orange-500/15">
                        {pagedLeaderboard.map((player) => {
                          const globalRank = activeLeaderboard.findIndex((p) => p.id === player.id) + 1
                          const isSelected = activeStatsPlayer?.id === player.id
                          const rankDisplay = player.totalPoints > 0 ? `#${globalRank}` : '-'
                          return (
                            <button
                              key={player.id}
                              onClick={() => setSelectedStatsPlayerId(player.id)}
                              className={`w-full text-left px-5 py-4 flex items-center justify-between text-base transition ${
                                isSelected ? 'bg-orange-500 text-white font-bold' : 'hover:bg-orange-500/15'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 truncate">
                                <span className="font-mono w-10 text-lg">{rankDisplay}</span>
                                <img src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} alt="" className="w-6 h-4 border" />
                                <span className="truncate text-lg">{player.display_name}</span>
                              </div>
                              <span className="text-base opacity-90">{player.totalPoints.toFixed(2)} pts</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-around pt-2 text-base font-bold uppercase">
                      <button disabled={lbPage === 0} onClick={() => setLbPage((p) => Math.max(0, p - 1))} className="disabled:opacity-35">Previous</button>
                      <button disabled={(lbPage + 1) * PAGE_SIZE >= filteredLeaderboard.length} onClick={() => setLbPage((p) => p + 1)} className="disabled:opacity-35">Next</button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 p-10 flex flex-col justify-center">
                    {activeStatsPlayer && (
                      <div className="space-y-6 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            onClick={() => {
                              setViewingPlayer(activeStatsPlayer)
                              setActiveTab('profile')
                            }}
                            className="fancy-display text-4xl text-orange-500 hover:underline"
                          >
                            {activeStatsPlayer.display_name}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                          <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20">
                            <p className="text-base text-orange-500">List Rank</p>
                            <p className="text-3xl font-mono mt-1">
                              {activeStatsPlayer.totalPoints > 0 ? `#${activeLeaderboard.findIndex((p) => p.id === activeStatsPlayer.id) + 1}` : '-'}
                            </p>
                          </div>
                          <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20">
                            <p className="text-base text-orange-500">List Score</p>
                            <p className="text-3xl font-mono mt-1">{activeStatsPlayer.totalPoints.toFixed(2)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setViewingPlayer(activeStatsPlayer)
                            setActiveTab('profile')
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl text-base font-bold transition shadow-xl"
                        >
                          View Full Profile ↗
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GOOFY GACHA TAB */}
          {activeTab === 'gacha' && (
            <div className={`p-10 rounded-3xl border text-center space-y-8 animate-panel ${cardClass}`}>
              <div className="space-y-3">
                <span className="bg-orange-500/20 text-orange-500 px-5 py-2 rounded-full text-base">Goofy Gacha Minigame</span>
                <h2 className="fancy-display text-4xl text-orange-500">Spin the Demon Gacha!</h2>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  Roll once every hour to unlock random demons and collect them in your player inventory profile!
                </p>
              </div>

              <div className="max-w-md mx-auto p-8 rounded-3xl bg-black/30 border border-orange-500/40 space-y-6 shadow-2xl">
                {gachaAnimating ? (
                  <div className="py-16 space-y-4">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xl font-bold animate-pulse text-orange-400">Rolling Demon Pack...</p>
                  </div>
                ) : gachaRolledLevel ? (
                  <div className="space-y-4 animate-panel">
                    <p className="text-sm uppercase text-orange-400 font-bold">You Unlocked!</p>
                    <h3 className="goofy-title text-3xl text-white">{gachaRolledLevel.title}</h3>
                    <p className="text-base text-orange-400">By {gachaRolledLevel.creator} ({gachaRolledLevel.points} Points)</p>
                    {getYouTubeThumbnail(gachaRolledLevel.verification_url) && (
                      <img src={getYouTubeThumbnail(gachaRolledLevel.verification_url)} alt="" className="w-full h-48 object-cover rounded-2xl border border-orange-500/40" />
                    )}
                    <button onClick={() => setGachaRolledLevel(null)} className="w-full bg-orange-500 text-white py-3.5 rounded-2xl font-bold">
                      Roll Again / Close
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 py-6">
                    <div className="text-6xl">🎁</div>
                    <div>
                      <p className="text-xl font-bold">Standard Demon Pack</p>
                      <p className="text-base text-gray-400 mt-1">
                        {cooldownRemainingMs > 0
                          ? `Cooldown: ${Math.floor(cooldownRemainingMs / 60000)}m ${Math.floor((cooldownRemainingMs % 60000) / 1000)}s remaining`
                          : 'Ready to Roll!'}
                      </p>
                    </div>
                    <button
                      disabled={cooldownRemainingMs > 0}
                      onClick={handleRollGacha}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-2xl text-lg font-bold shadow-xl transition"
                    >
                      {cooldownRemainingMs > 0 ? 'On Cooldown' : 'Open Gacha Pack (1 Roll)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE PAGE WITH STRICTLY ROUND AVATAR & POINTERCRATE LAYOUT */}
          {activeTab === 'profile' && viewingPlayer && (
            <div className={`max-w-4xl mx-auto rounded-3xl border overflow-hidden space-y-8 animate-panel ${cardClass}`}>
              <div className="relative h-64 sm:h-72 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 overflow-hidden">
                {viewingPlayer.banner_url ? (
                  <img src={viewingPlayer.banner_url} alt="" className="w-full h-full object-cover opacity-85" />
                ) : (
                  <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                    <span className="fancy-display text-5xl text-white/40 uppercase tracking-widest">{viewingPlayer.display_name}</span>
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="text-base bg-black/55 text-white px-5 py-2.5 rounded-2xl hover:bg-black/80 backdrop-blur transition"
                  >
                    ← Back to Leaderboard
                  </button>
                </div>
              </div>

              <div className="px-8 sm:px-12 pb-12 space-y-8 -mt-20 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                  <div className="flex items-end gap-5">
                    <div className="relative">
                      {renderAvatar(viewingPlayer, 'w-28 h-28 text-4xl shadow-2xl rounded-full')}
                      <img
                        src={`https://flagcdn.com/w40/${viewingPlayer.country.toLowerCase()}.png`}
                        alt=""
                        className="absolute -bottom-1 -right-1 w-9 h-6 object-cover border-2 border-white rounded shadow"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="fancy-display text-3xl sm:text-4xl text-white drop-shadow">{viewingPlayer.display_name}</h2>
                        <span className="bg-orange-500 text-white text-sm px-3.5 py-1 rounded-full uppercase font-bold">
                          {viewingPlayer.title_badge || 'Member'}
                        </span>
                      </div>
                      <p className="text-base text-orange-200 mt-1">
                        @{viewingPlayer.username} • Rank {viewingPlayer.totalPoints > 0 ? `#${getLeaderboardForMode('classic').findIndex((p) => p.id === viewingPlayer.id) + 1}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right bg-orange-500/20 backdrop-blur border border-orange-500/40 px-8 py-5 rounded-3xl shadow-2xl">
                    <p className="fancy-display text-4xl text-orange-400">{viewingPlayer.totalPoints.toFixed(2)} pts</p>
                    <p className="text-base text-gray-300 mt-1">{viewingPlayer.completedCount} Completions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
                  <div className="bg-orange-500/10 border border-orange-500/25 p-7 rounded-3xl space-y-3">
                    <p className="goofy-title text-xl text-orange-500">Social Links</p>
                    <p className="text-gray-300">YouTube: {viewingPlayer.youtube || 'None'}</p>
                    <p className="text-gray-300">Discord: {viewingPlayer.discord || 'None'}</p>
                    <p className="text-gray-300">Twitter: {viewingPlayer.twitter || 'None'}</p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/25 p-7 rounded-3xl space-y-3">
                    <p className="goofy-title text-xl text-orange-500">Player Bio</p>
                    <p className="text-gray-300 italic leading-relaxed">{viewingPlayer.bio || 'No bio description provided.'}</p>
                  </div>
                </div>

                {/* DEMONS COMPLETED, CREATED, PUBLISHED, VERIFIED */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl">
                    <p className="text-sm uppercase text-orange-400 font-bold mb-2">Demons completed</p>
                    <p className="text-base font-normal">
                      {viewingPlayer.entries.length > 0
                        ? viewingPlayer.entries.map((e) => e.level.title).join(' • ')
                        : 'None'}
                    </p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl">
                    <p className="text-sm uppercase text-orange-400 font-bold mb-2">Demons created</p>
                    <p className="text-base font-normal">
                      {viewingPlayer.createdLevels.length > 0
                        ? viewingPlayer.createdLevels.map((l) => l.title).join(' • ')
                        : 'None'}
                    </p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl">
                    <p className="text-sm uppercase text-orange-400 font-bold mb-2">Demons published</p>
                    <p className="text-base font-normal">
                      {viewingPlayer.publishedLevels.length > 0
                        ? viewingPlayer.publishedLevels.map((l) => l.title).join(' • ')
                        : 'None'}
                    </p>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl">
                    <p className="text-sm uppercase text-orange-400 font-bold mb-2">Demons verified</p>
                    <p className="text-base font-normal">
                      {viewingPlayer.verifiedLevels.length > 0
                        ? viewingPlayer.verifiedLevels.map((l) => l.title).join(' • ')
                        : 'None'}
                    </p>
                  </div>
                </div>

                {/* GACHA INVENTORY COLLECTION */}
                <div className="bg-orange-500/10 border border-orange-500/25 p-7 rounded-3xl space-y-4">
                  <p className="goofy-title text-xl text-orange-500">Goofy Gacha Inventory Collection ({viewingPlayer.inventory?.length || 0})</p>
                  {(!viewingPlayer.inventory || viewingPlayer.inventory.length === 0) ? (
                    <p className="text-base text-gray-400">No demons rolled in Gacha yet!</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {viewingPlayer.inventory.map((lvlId, idx) => {
                        const lvl = approvedLevels.find((l) => l.id === lvlId)
                        if (!lvl) return null
                        return (
                          <div key={idx} className="bg-black/30 border border-orange-500/30 p-4 rounded-2xl text-center space-y-2">
                            <p className="font-bold truncate text-base">{lvl.title}</p>
                            <p className="text-sm text-orange-400">{lvl.points} pts</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {currentUser && currentUser.id === viewingPlayer.id && (
                  <form onSubmit={handleProfileSave} className="border-t border-orange-500/25 pt-8 space-y-6">
                    <h3 className="fancy-display text-3xl text-orange-500">Edit Your Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-base mb-2">Display Name</label>
                        <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-base mb-2">Country / Territory</label>
                        <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-base mb-2">Title Badge</label>
                        <input type="text" value={editBadge} onChange={(e) => setEditBadge(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-base mb-2">Profile Bio</label>
                        <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-base mb-2">Custom Avatar URL</label>
                        <input type="url" value={editPfp} onChange={(e) => setEditPfp(e.target.value)} className={inputClass} placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-base mb-2">Banner Image URL</label>
                        <input type="url" value={editBanner} onChange={(e) => setEditBanner(e.target.value)} className={inputClass} placeholder="https://..." />
                      </div>
                    </div>
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-base px-8 py-4 rounded-2xl transition shadow-xl font-bold">
                      Save Profile Settings
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* MINIGAMES TAB */}
          {activeTab === 'minigames' && (
            <div className="space-y-6 animate-panel">
              <div className={`p-10 rounded-3xl border space-y-6 ${cardClass}`}>
                <h2 className="fancy-display text-4xl text-orange-500 border-b border-orange-500/20 pb-4">Goofy Roulette</h2>
                {rouletteLevel ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {getYouTubeThumbnail(rouletteLevel.verification_url) && (
                      <img src={getYouTubeThumbnail(rouletteLevel.verification_url)} alt="" className="w-72 h-40 object-cover rounded-2xl border" />
                    )}
                    <div className="flex-1 space-y-4 w-full">
                      <h3 className="goofy-title text-3xl">{rouletteLevel.title}</h3>
                      <p className="text-lg text-orange-500">{rouletteLevel.points} Points</p>
                      <p className="text-base text-gray-400">{rouletteMessage}</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={rouletteAchievedPct}
                          onChange={(e) => setRouletteAchievedPct(Number(e.target.value))}
                          className={`w-32 ${inputClass}`}
                        />
                        <button onClick={handleRouletteDone} className="bg-orange-500 text-white px-8 py-3.5 rounded-2xl text-base font-bold shadow-xl">
                          Next Level ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* FORUM TAB */}
          {activeTab === 'forum' && (
            <div className="space-y-8 animate-panel">
              <div className={`p-10 rounded-3xl border space-y-6 ${cardClass}`}>
                <h2 className="fancy-display text-4xl text-orange-500 border-b border-orange-500/20 pb-4">Forum & Bug Reports</h2>
                <form onSubmit={handleCreateForumPost} className="space-y-4">
                  <select value={postCategory} onChange={(e) => setPostCategory(e.target.value as any)} className={inputClass}>
                    <option value="forum">Forum Discussion</option>
                    <option value="bug">Bug Report</option>
                  </select>
                  <input required type="text" placeholder="Title..." value={postTitle} onChange={(e) => setPostTitle(e.target.value)} className={inputClass} />
                  <textarea required rows={4} placeholder="Message..." value={postContent} onChange={(e) => setPostContent(e.target.value)} className={inputClass} />
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-base px-8 py-4 rounded-2xl font-bold shadow-xl">
                    Submit Post
                  </button>
                </form>
              </div>

              {/* LIVE FORUM FEED */}
              <div className="space-y-4">
                <h3 className="goofy-title text-2xl text-orange-500">Recent Community Posts</h3>
                {forumPosts.length === 0 ? (
                  <p className="text-base text-gray-400">No forum posts yet. Be the first to start a discussion!</p>
                ) : (
                  forumPosts.map((post) => (
                    <div key={post.id} className={`p-8 rounded-3xl border space-y-3 ${cardClass}`}>
                      <div className="flex items-center justify-between">
                        <span className="bg-orange-500/20 text-orange-500 text-sm px-4 py-1.5 rounded-full uppercase font-bold">
                          {post.category}
                        </span>
                        <span className="text-sm text-gray-400">By {post.author_display} (@{post.author_username})</span>
                      </div>
                      <h4 className="goofy-title text-2xl">{post.title}</h4>
                      <p className="text-base text-gray-300 leading-relaxed">{post.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* EXPANDED MOD PANEL */}
          {activeTab === 'mod' && isMod && (
            <div className={`p-10 rounded-3xl border space-y-8 animate-panel ${cardClass}`}>
              <h2 className="fancy-display text-4xl text-orange-500 border-b border-orange-500/25 pb-4">Expanded Moderator Panel</h2>

              {/* PENDING LEVEL APPROVALS */}
              <div className="space-y-4">
                <h3 className="goofy-title text-2xl text-orange-500">Pending Levels ({pendingLevels.length})</h3>
                {pendingLevels.length === 0 ? (
                  <p className="text-base text-gray-400">No pending level submissions.</p>
                ) : (
                  pendingLevels.map((lvl) => (
                    <div key={lvl.id} className="p-5 bg-orange-500/10 rounded-2xl flex flex-col sm:flex-row justify-between text-base items-start sm:items-center gap-3">
                      <div>
                        <span>{lvl.title} by {lvl.creator}</span>
                        {lvl.verification_url && (
                          <a href={lvl.verification_url} target="_blank" rel="noreferrer" className="block text-sm text-orange-400 underline mt-1">
                            Watch Video Proof ↗
                          </a>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleReviewLevel(lvl.id, 'approved')} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold">Approve</button>
                        <button onClick={() => handleReviewLevel(lvl.id, 'rejected')} className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PENDING RECORD SUBMISSIONS */}
              <div className="space-y-4 border-t border-orange-500/25 pt-6">
                <h3 className="goofy-title text-2xl text-orange-500">Pending Record Submissions ({pendingSubs.length})</h3>
                {pendingSubs.length === 0 ? (
                  <p className="text-base text-gray-400">No pending record submissions.</p>
                ) : (
                  pendingSubs.map((sub) => (
                    <div key={sub.id} className="p-5 bg-orange-500/10 rounded-2xl flex flex-col sm:flex-row justify-between text-base items-start sm:items-center gap-3">
                      <div>
                        <span>{sub.player_name} - {sub.progress}% on {sub.level_title}</span>
                        {sub.video_url && (
                          <a href={sub.video_url} target="_blank" rel="noreferrer" className="block text-sm text-orange-400 underline mt-1">
                            Watch Video Proof ↗
                          </a>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleReviewSubmission(sub.id, 'approved')} className="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-bold">Approve</button>
                        <button onClick={() => handleReviewSubmission(sub.id, 'rejected')} className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BULK LEVEL POINT SCALER */}
              <div className="border-t border-orange-500/25 pt-6 space-y-4">
                <h3 className="goofy-title text-2xl text-orange-500">Global Point Rebalancer</h3>
                <div className="flex items-center gap-4 max-w-lg">
                  <input
                    type="number"
                    step="0.05"
                    value={bulkPointMultiplier}
                    onChange={(e) => setBulkPointMultiplier(e.target.value)}
                    className={inputClass}
                  />
                  <button onClick={handleBulkScalePoints} className="bg-orange-500 text-white px-6 py-3.5 rounded-2xl text-base font-bold shrink-0">
                    Scale Points
                  </button>
                </div>
              </div>

              {/* ISSUE USER WARNING */}
              <div className="border-t border-orange-500/25 pt-6 space-y-4">
                <h3 className="goofy-title text-2xl text-orange-500">Issue User Warning</h3>
                <form onSubmit={handleIssueWarning} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Username" value={warnTargetUser} onChange={(e) => setWarnTargetUser(e.target.value)} className={inputClass} />
                  <input type="text" placeholder="Reason" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} className={inputClass} />
                  <button type="submit" className="bg-red-600 text-white text-base rounded-2xl py-3.5 font-bold">Issue Warning</button>
                </form>
              </div>

              {/* MANAGE STAFF MEMBERS */}
              <div className="border-t border-orange-500/25 pt-6 space-y-4">
                <h3 className="goofy-title text-2xl text-orange-500">Manage Staff Members</h3>
                <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <input required type="text" placeholder="Name" value={modName} onChange={(e) => setModName(e.target.value)} className={`sm:col-span-2 ${inputClass}`} />
                  <input type="text" placeholder="Clan" value={modClan} onChange={(e) => setModClan(e.target.value)} className={inputClass} />
                  <select value={modCountry} onChange={(e) => setModCountry(e.target.value)} className={`sm:col-span-2 ${inputClass}`}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <select value={modRole} onChange={(e) => setModRole(e.target.value as any)} className={inputClass}>
                    <option value="editor">Editor</option>
                    <option value="helper">Helper</option>
                  </select>
                  <button type="submit" className="sm:col-span-6 bg-orange-500 text-white text-base py-4 rounded-2xl font-bold">Add Staff Member</button>
                </form>

                <div className="space-y-3 pt-3">
                  {moderators.map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-orange-500/10 px-5 py-3.5 rounded-2xl text-base">
                      <span>{m.clan ? `[${m.clan}] ` : ''}{m.name} ({m.role})</span>
                      <button onClick={() => handleRemoveStaff(m.id)} className="text-red-500 hover:underline font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LEVEL LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-6 animate-panel">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="fancy-display text-4xl sm:text-5xl text-orange-500">{listLabels[selectedListMode]}</h1>
                  <p className="text-base text-gray-400 mt-1">Click any level card to open full stats and records.</p>
                </div>
                <input
                  type="text"
                  placeholder="Search level..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass} w-80`}
                />
              </div>

              <div className="space-y-5">
                {shownLevels.map((lvl, index) => {
                  const thumb = lvl.thumbnail || getYouTubeThumbnail(lvl.verification_url)
                  const victorsCount = getLevelVictorsAndVerifiers(lvl).filter(v => v.progress === 100).length
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        setViewingLevel(lvl)
                        setActiveTab('level_detail')
                      }}
                      className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer hover:border-orange-500 transition ${cardClass}`}
                    >
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <span className="fancy-display text-4xl text-orange-500 w-14">#{index + 1}</span>
                        {thumb && <img src={thumb} alt="" className="w-48 h-28 object-cover rounded-2xl border-2 border-orange-400 shadow" />}
                        <div className="space-y-1.5">
                          <h3 className="goofy-title text-2xl sm:text-3xl hover:text-orange-500 transition">{lvl.title}</h3>
                          <p className="text-base text-gray-400">By {lvl.creator} • Verified by {lvl.verifier || 'Unknown'}</p>
                          <p className="text-sm text-orange-400 font-bold">{victorsCount} Victors</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="fancy-display text-3xl sm:text-4xl text-orange-500">{Number(lvl.points || 0).toFixed(2)}</span>
                          <span className="text-sm text-gray-400 block">points</span>
                        </div>
                        {isMod && (
                          <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setEditingLevel(lvl)} className="bg-orange-500 text-white text-base px-5 py-2.5 rounded-2xl font-bold">Edit</button>
                            <button onClick={() => handleDeleteLevel(lvl.id, lvl.title)} className="bg-red-600 text-white text-base px-5 py-2.5 rounded-2xl font-bold">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* LEVEL EDIT MODAL */}
          {editingLevel && isMod && (
            <div onClick={() => setEditingLevel(null)} className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <form onClick={(e) => e.stopPropagation()} onSubmit={handleSaveEditedLevel} className={`max-w-xl w-full p-8 sm:p-10 rounded-3xl border space-y-5 animate-panel ${cardClass}`}>
                <div className="flex justify-between items-center border-b border-orange-500/25 pb-4">
                  <h3 className="fancy-display text-3xl text-orange-500">Edit Level Details</h3>
                  <button type="button" onClick={() => setEditingLevel(null)} className="text-base bg-orange-500/15 text-orange-500 px-4 py-2 rounded-2xl font-bold">Cancel</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input required type="text" value={editingLevel.title} onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">List Category</label>
                    <select value={editingLevel.mode || 'classic'} onChange={(e) => setEditingLevel({ ...editingLevel, mode: e.target.value as ListCategory })} className={inputClass}>
                      <option value="classic">Classic List</option>
                      <option value="impossible">Impossible List</option>
                      <option value="spam">Spam List</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Creator</label>
                    <input required type="text" value={editingLevel.creator} onChange={(e) => setEditingLevel({ ...editingLevel, creator: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Verifier</label>
                    <input type="text" value={editingLevel.verifier || ''} onChange={(e) => setEditingLevel({ ...editingLevel, verifier: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">GD Level ID</label>
                    <input type="text" value={editingLevel.gd_level_id || ''} onChange={(e) => setEditingLevel({ ...editingLevel, gd_level_id: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input type="text" value={editingLevel.password || 'Free Copy'} onChange={(e) => setEditingLevel({ ...editingLevel, password: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Points</label>
                    <input type="number" step="0.01" value={editingLevel.points || 0} onChange={(e) => setEditingLevel({ ...editingLevel, points: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Level Length</label>
                    <input type="text" value={editingLevel.level_length || '1m:30s'} onChange={(e) => setEditingLevel({ ...editingLevel, level_length: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Object Count</label>
                    <input type="number" value={editingLevel.object_count || 0} onChange={(e) => setEditingLevel({ ...editingLevel, object_count: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Verification Video URL</label>
                  <input type="url" value={editingLevel.verification_url || ''} onChange={(e) => setEditingLevel({ ...editingLevel, verification_url: e.target.value })} className={inputClass} />
                </div>

                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base py-4 rounded-2xl transition font-bold shadow-xl">
                  Save Level Changes
                </button>
              </form>
            </div>
          )}

          {/* AUTHENTICATION TABS */}
          {activeTab === 'login' && (
            <div className={`max-w-md mx-auto p-10 rounded-3xl border space-y-6 animate-panel ${cardClass}`}>
              <h2 className="fancy-display text-3xl text-orange-500 text-center">Login to GLL</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-base mb-2">Email</label>
                  <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-base mb-2">Password</label>
                  <input required type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-xl">
                  Login
                </button>
              </form>
            </div>
          )}

          {activeTab === 'register' && (
            <div className={`max-w-md mx-auto p-10 rounded-3xl border space-y-6 animate-panel ${cardClass}`}>
              <h2 className="fancy-display text-3xl text-orange-500 text-center">Register Account</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-base mb-1">Username</label>
                  <input required type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-base mb-1">Display Name</label>
                  <input type="text" value={regDisplay} onChange={(e) => setRegDisplay(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-base mb-1">Email</label>
                  <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-base mb-1">Password</label>
                  <input required type="password" minLength={6} value={regPass} onChange={(e) => setRegPass(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-xl">
                  Create Account
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
