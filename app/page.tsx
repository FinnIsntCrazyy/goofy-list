'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ALLOWED_MODS = ['finniscrazyy', 'mrconey', 'paulhsu123']
const DISCORD_INVITE_URL = 'https://discord.gg/ePfDysKQxM'
const BANNED_KEYWORDS = ['badword', 'offensiveword', 'spamword', 'scam', 'hack']

const COUNTRIES = [
  { code: 'af', name: 'Afghanistan', region: 'Asia' },
  { code: 'al', name: 'Albania', region: 'Europe' },
  { code: 'aq', name: 'Antarctica', region: 'Antarctica' },
  { code: 'dz', name: 'Algeria', region: 'Africa' },
  { code: 'ad', name: 'Andorra', region: 'Europe' },
  { code: 'ao', name: 'Angola', region: 'Africa' },
  { code: 'ag', name: 'Antigua and Barbuda', region: 'North America' },
  { code: 'ar', name: 'Argentina', region: 'South America' },
  { code: 'am', name: 'Armenia', region: 'Asia' },
  { code: 'au', name: 'Australia', region: 'Oceania' },
  { code: 'at', name: 'Austria', region: 'Europe' },
  { code: 'az', name: 'Azerbaijan', region: 'Asia' },
  { code: 'bs', name: 'Bahamas', region: 'North America' },
  { code: 'bh', name: 'Bahrain', region: 'Asia' },
  { code: 'bd', name: 'Bangladesh', region: 'Asia' },
  { code: 'bb', name: 'Barbados', region: 'North America' },
  { code: 'by', name: 'Belarus', region: 'Europe' },
  { code: 'be', name: 'Belgium', region: 'Europe' },
  { code: 'bz', name: 'Belize', region: 'North America' },
  { code: 'bj', name: 'Benin', region: 'Africa' },
  { code: 'bt', name: 'Bhutan', region: 'Asia' },
  { code: 'bo', name: 'Bolivia', region: 'South America' },
  { code: 'ba', name: 'Bosnia and Herzegovina', region: 'Europe' },
  { code: 'bw', name: 'Botswana', region: 'Africa' },
  { code: 'br', name: 'Brazil', region: 'South America' },
  { code: 'bn', name: 'Brunei', region: 'Asia' },
  { code: 'bg', name: 'Bulgaria', region: 'Europe' },
  { code: 'bf', name: 'Burkina Faso', region: 'Africa' },
  { code: 'bi', name: 'Burundi', region: 'Africa' },
  { code: 'kh', name: 'Cambodia', region: 'Asia' },
  { code: 'cm', name: 'Cameroon', region: 'Africa' },
  { code: 'ca', name: 'Canada', region: 'North America' },
  { code: 'cv', name: 'Cape Verde', region: 'Africa' },
  { code: 'cf', name: 'Central African Republic', region: 'Africa' },
  { code: 'td', name: 'Chad', region: 'Africa' },
  { code: 'cl', name: 'Chile', region: 'South America' },
  { code: 'cn', name: 'China', region: 'Asia' },
  { code: 'co', name: 'Colombia', region: 'South America' },
  { code: 'km', name: 'Comoros', region: 'Africa' },
  { code: 'cg', name: 'Congo', region: 'Africa' },
  { code: 'cr', name: 'Costa Rica', region: 'North America' },
  { code: 'hr', name: 'Croatia', region: 'Europe' },
  { code: 'cu', name: 'Cuba', region: 'North America' },
  { code: 'cy', name: 'Cyprus', region: 'Europe' },
  { code: 'cz', name: 'Czech Republic', region: 'Europe' },
  { code: 'dk', name: 'Denmark', region: 'Europe' },
  { code: 'dj', name: 'Djibouti', region: 'Africa' },
  { code: 'dm', name: 'Dominica', region: 'North America' },
  { code: 'do', name: 'Dominican Republic', region: 'North America' },
  { code: 'ec', name: 'Ecuador', region: 'South America' },
  { code: 'eg', name: 'Egypt', region: 'Africa' },
  { code: 'sv', name: 'El Salvador', region: 'North America' },
  { code: 'gq', name: 'Equatorial Guinea', region: 'Africa' },
  { code: 'er', name: 'Eritrea', region: 'Africa' },
  { code: 'ee', name: 'Estonia', region: 'Europe' },
  { code: 'sz', name: 'Eswatini', region: 'Africa' },
  { code: 'et', name: 'Ethiopia', region: 'Africa' },
  { code: 'fj', name: 'Fiji', region: 'Oceania' },
  { code: 'fi', name: 'Finland', region: 'Europe' },
  { code: 'fr', name: 'France', region: 'Europe' },
  { code: 'ga', name: 'Gabon', region: 'Africa' },
  { code: 'gm', name: 'Gambia', region: 'Africa' },
  { code: 'ge', name: 'Georgia', region: 'Asia' },
  { code: 'de', name: 'Germany', region: 'Europe' },
  { code: 'gh', name: 'Ghana', region: 'Africa' },
  { code: 'gr', name: 'Greece', region: 'Europe' },
  { code: 'gd', name: 'Grenada', region: 'North America' },
  { code: 'gt', name: 'Guatemala', region: 'North America' },
  { code: 'gn', name: 'Guinea', region: 'Africa' },
  { code: 'gw', name: 'Guinea-Bissau', region: 'Africa' },
  { code: 'gy', name: 'Guyana', region: 'South America' },
  { code: 'ht', name: 'Haiti', region: 'North America' },
  { code: 'hn', name: 'Honduras', region: 'North America' },
  { code: 'hu', name: 'Hungary', region: 'Europe' },
  { code: 'is', name: 'Iceland', region: 'Europe' },
  { code: 'in', name: 'India', region: 'Asia' },
  { code: 'id', name: 'Indonesia', region: 'Asia' },
  { code: 'ir', name: 'Iran', region: 'Asia' },
  { code: 'iq', name: 'Iraq', region: 'Asia' },
  { code: 'ie', name: 'Ireland', region: 'Europe' },
  { code: 'il', name: 'Israel', region: 'Asia' },
  { code: 'it', name: 'Italy', region: 'Europe' },
  { code: 'jm', name: 'Jamaica', region: 'North America' },
  { code: 'jp', name: 'Japan', region: 'Asia' },
  { code: 'jo', name: 'Jordan', region: 'Asia' },
  { code: 'kz', name: 'Kazakhstan', region: 'Asia' },
  { code: 'ke', name: 'Kenya', region: 'Africa' },
  { code: 'ki', name: 'Kiribati', region: 'Oceania' },
  { code: 'kw', name: 'Kuwait', region: 'Asia' },
  { code: 'kg', name: 'Kyrgyzstan', region: 'Asia' },
  { code: 'la', name: 'Laos', region: 'Asia' },
  { code: 'lv', name: 'Latvia', region: 'Europe' },
  { code: 'lb', name: 'Lebanon', region: 'Asia' },
  { code: 'ls', name: 'Lesotho', region: 'Africa' },
  { code: 'lr', name: 'Liberia', region: 'Africa' },
  { code: 'ly', name: 'Libya', region: 'Africa' },
  { code: 'li', name: 'Liechtenstein', region: 'Europe' },
  { code: 'lt', name: 'Lithuania', region: 'Europe' },
  { code: 'lu', name: 'Luxembourg', region: 'Europe' },
  { code: 'mg', name: 'Madagascar', region: 'Africa' },
  { code: 'mw', name: 'Malawi', region: 'Africa' },
  { code: 'my', name: 'Malaysia', region: 'Asia' },
  { code: 'mv', name: 'Maldives', region: 'Asia' },
  { code: 'ml', name: 'Mali', region: 'Africa' },
  { code: 'mt', name: 'Malta', region: 'Europe' },
  { code: 'mh', name: 'Marshall Islands', region: 'Oceania' },
  { code: 'mr', name: 'Mauritania', region: 'Africa' },
  { code: 'mu', name: 'Mauritius', region: 'Africa' },
  { code: 'mx', name: 'Mexico', region: 'North America' },
  { code: 'fm', name: 'Micronesia', region: 'Oceania' },
  { code: 'md', name: 'Moldova', region: 'Europe' },
  { code: 'mc', name: 'Monaco', region: 'Europe' },
  { code: 'mn', name: 'Mongolia', region: 'Asia' },
  { code: 'me', name: 'Montenegro', region: 'Europe' },
  { code: 'ma', name: 'Morocco', region: 'Africa' },
  { code: 'mz', name: 'Mozambique', region: 'Africa' },
  { code: 'mm', name: 'Myanmar', region: 'Asia' },
  { code: 'na', name: 'Namibia', region: 'Africa' },
  { code: 'nr', name: 'Nauru', region: 'Oceania' },
  { code: 'np', name: 'Nepal', region: 'Asia' },
  { code: 'nl', name: 'Netherlands', region: 'Europe' },
  { code: 'nz', name: 'New Zealand', region: 'Oceania' },
  { code: 'ni', name: 'Nicaragua', region: 'North America' },
  { code: 'ne', name: 'Niger', region: 'Africa' },
  { code: 'ng', name: 'Nigeria', region: 'Africa' },
  { code: 'kp', name: 'North Korea', region: 'Asia' },
  { code: 'mk', name: 'North Macedonia', region: 'Europe' },
  { code: 'no', name: 'Norway', region: 'Europe' },
  { code: 'om', name: 'Oman', region: 'Asia' },
  { code: 'pk', name: 'Pakistan', region: 'Asia' },
  { code: 'pw', name: 'Palau', region: 'Oceania' },
  { code: 'ps', name: 'Palestine', region: 'Asia' },
  { code: 'pa', name: 'Panama', region: 'North America' },
  { code: 'pg', name: 'Papua New Guinea', region: 'Oceania' },
  { code: 'py', name: 'Paraguay', region: 'South America' },
  { code: 'pe', name: 'Peru', region: 'South America' },
  { code: 'ph', name: 'Philippines', region: 'Asia' },
  { code: 'pl', name: 'Poland', region: 'Europe' },
  { code: 'pt', name: 'Portugal', region: 'Europe' },
  { code: 'qa', name: 'Qatar', region: 'Asia' },
  { code: 'ro', name: 'Romania', region: 'Europe' },
  { code: 'ru', name: 'Russia', region: 'Europe' },
  { code: 'rw', name: 'Rwanda', region: 'Africa' },
  { code: 'kn', name: 'Saint Kitts and Nevis', region: 'North America' },
  { code: 'lc', name: 'Saint Lucia', region: 'North America' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines', region: 'North America' },
  { code: 'ws', name: 'Samoa', region: 'Oceania' },
  { code: 'sm', name: 'San Marino', region: 'Europe' },
  { code: 'st', name: 'Sao Tome and Principe', region: 'Africa' },
  { code: 'sa', name: 'Saudi Arabia', region: 'Asia' },
  { code: 'sn', name: 'Senegal', region: 'Africa' },
  { code: 'rs', name: 'Serbia', region: 'Europe' },
  { code: 'sc', name: 'Seychelles', region: 'Africa' },
  { code: 'sl', name: 'Sierra Leone', region: 'Africa' },
  { code: 'sg', name: 'Singapore', region: 'Asia' },
  { code: 'sk', name: 'Slovakia', region: 'Europe' },
  { code: 'si', name: 'Slovenia', region: 'Europe' },
  { code: 'sb', name: 'Solomon Islands', region: 'Oceania' },
  { code: 'so', name: 'Somalia', region: 'Africa' },
  { code: 'za', name: 'South Africa', region: 'Africa' },
  { code: 'kr', name: 'South Korea', region: 'Asia' },
  { code: 'ss', name: 'South Sudan', region: 'Africa' },
  { code: 'es', name: 'Spain', region: 'Europe' },
  { code: 'lk', name: 'Sri Lanka', region: 'Asia' },
  { code: 'sd', name: 'Sudan', region: 'Africa' },
  { code: 'sr', name: 'Suriname', region: 'South America' },
  { code: 'se', name: 'Sweden', region: 'Europe' },
  { code: 'ch', name: 'Switzerland', region: 'Europe' },
  { code: 'sy', name: 'Syria', region: 'Asia' },
  { code: 'tw', name: 'Taiwan', region: 'Asia' },
  { code: 'tj', name: 'Tajikistan', region: 'Asia' },
  { code: 'tz', name: 'Tanzania', region: 'Africa' },
  { code: 'th', name: 'Thailand', region: 'Asia' },
  { code: 'tl', name: 'Timor-Leste', region: 'Asia' },
  { code: 'tg', name: 'Togo', region: 'Africa' },
  { code: 'to', name: 'Tonga', region: 'Oceania' },
  { code: 'tt', name: 'Trinidad and Tobago', region: 'North America' },
  { code: 'tn', name: 'Tunisia', region: 'Africa' },
  { code: 'tr', name: 'Turkey', region: 'Asia' },
  { code: 'tm', name: 'Turkmenistan', region: 'Asia' },
  { code: 'tv', name: 'Tuvalu', region: 'Oceania' },
  { code: 'ug', name: 'Uganda', region: 'Africa' },
  { code: 'ua', name: 'Ukraine', region: 'Europe' },
  { code: 'ae', name: 'United Arab Emirates', region: 'Asia' },
  { code: 'gb', name: 'United Kingdom', region: 'Europe' },
  { code: 'us', name: 'United States', region: 'North America' },
  { code: 'uy', name: 'Uruguay', region: 'South America' },
  { code: 'uz', name: 'Uzbekistan', region: 'Asia' },
  { code: 'vu', name: 'Vanuatu', region: 'Oceania' },
  { code: 'va', name: 'Vatican City', region: 'Europe' },
  { code: 've', name: 'Venezuela', region: 'South America' },
  { code: 'vn', name: 'Vietnam', region: 'Asia' },
  { code: 'ye', name: 'Yemen', region: 'Asia' },
  { code: 'zm', name: 'Zambia', region: 'Africa' },
  { code: 'zw', name: 'Zimbabwe', region: 'Africa' },
]

const GACHA_COOLDOWN_MS = 60 * 60 * 1000

type ListCategory = 'classic' | 'platformer' | 'impossible' | 'spam'

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
  description?: string
  password?: string
  level_length?: string
  object_count?: number
  difficulty?: string
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
    'welcome' | 'list' | 'level_detail' | 'leaderboard' | 'staff' | 'minigames' | 'forum' | 'profile' | 'mod' | 'login' | 'register'
  >('welcome')
  const [selectedListMode, setSelectedListMode] = useState<ListCategory>('classic')
  const [listsDropdownOpen, setListsDropdownOpen] = useState(false)

  // Right-side Drawer for Submit Record & Submit Level
  const [rightDrawer, setRightDrawer] = useState<'none' | 'record' | 'level'>('none')

  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(true)
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
  const [recMode, setRecMode] = useState<ListCategory>('classic')
  const [recLevelId, setRecLevelId] = useState<number>(0)
  const [recProgress, setRecProgress] = useState(100)
  const [recVideo, setRecVideo] = useState('')
  const [recEnjoyment, setRecEnjoyment] = useState(8)
  const [recNotes, setRecNotes] = useState('')

  // Submit Level states
  const [lvlMode, setLvlMode] = useState<ListCategory>('classic')
  const [lvlTitle, setLvlTitle] = useState('')
  const [lvlCreator, setLvlCreator] = useState('')
  const [lvlVerifier, setLvlVerifier] = useState('')
  const [lvlGdId, setLvlGdId] = useState('')
  const [lvlVerifyVideo, setLvlVerifyVideo] = useState('')
  const [lvlPoints, setLvlPoints] = useState('250.00')
  const [lvlDesc, setLvlDesc] = useState('')
  const [lvlPassword, setLvlPassword] = useState('Free Copy')
  const [lvlLength, setLvlLength] = useState('1m:45s')
  const [lvlObjects, setLvlObjects] = useState('85000')
  const [lvlDifficulty, setLvlDifficulty] = useState('Extreme Demon')
  const [lvlVersion, setLvlVersion] = useState('2.2')
  const [lvlSongName, setLvlSongName] = useState('')
  const [lvlSongId, setLvlSongId] = useState('')
  const [lvlMinPct, setLvlMinPct] = useState('75')

  // Profile Editor states
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

  // Mod Warning & Staff states
  const [warnTargetUser, setWarnTargetUser] = useState('')
  const [warnReason, setWarnReason] = useState('')
  const [modName, setModName] = useState('')
  const [modClan, setModClan] = useState('')
  const [modCountry, setModCountry] = useState('pl')
  const [modRole, setModRole] = useState<'editor' | 'helper'>('editor')
  const [bulkPointMultiplier, setBulkPointMultiplier] = useState('1.10')

  // Mod Edit Level Modal states
  const [editingLevel, setEditingLevel] = useState<GoofyLevel | null>(null)

  // Full Level Details View (Pointercrate Style)
  const [viewingLevel, setViewingLevel] = useState<GoofyLevel | null>(null)
  const [showHistoryTable, setShowHistoryTable] = useState(true)

  // Dedicated Full Player Page View
  const [viewingPlayer, setViewingPlayer] = useState<PlayerLeaderboardRow | null>(null)

  // Pointercrate Stats Viewer Leaderboard states
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL')
  const [lbSearch, setLbSearch] = useState('')
  const [lbPage, setLbPage] = useState(0)
  const [selectedStatsPlayerId, setSelectedStatsPlayerId] = useState<string>('')

  // Roulette Challenge states
  const [rouletteLevel, setRouletteLevel] = useState<GoofyLevel | null>(null)
  const [rouletteTargetPct, setRouletteTargetPct] = useState<number>(1)
  const [rouletteAchievedPct, setRouletteAchievedPct] = useState<number>(100)
  const [rouletteMessage, setRouletteMessage] = useState<string>('')

  // Gacha Packs
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
        description: lvlDesc.trim(),
        password: lvlPassword.trim() || 'Free Copy',
        level_length: lvlLength.trim() || '1m:30s',
        object_count: parseInt(lvlObjects) || 0,
        difficulty: lvlDifficulty.trim() || 'Extreme Demon',
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
      setLvlDesc('')
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
        description: (editingLevel.description || '').trim(),
        password: (editingLevel.password || 'Free Copy').trim(),
        level_length: (editingLevel.level_length || '1m:30s').trim(),
        object_count: Number(editingLevel.object_count) || 0,
        difficulty: (editingLevel.difficulty || 'Extreme Demon').trim(),
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

  // LEADERBOARD SORTING: STRICTLY BY POINTS DESCENDING (FIRST VICTORS / VERIFIERS FURTHER UP)
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
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      const hardestA = a.hardestLevel ? Number(a.hardestLevel.points || 0) : 0
      const hardestB = b.hardestLevel ? Number(b.hardestLevel.points || 0) : 0
      return hardestB - hardestA
    })

  const filteredLeaderboard = leaderboard.filter((p) => {
    const matchesCountry = selectedCountryFilter === 'ALL' || p.country.toLowerCase() === selectedCountryFilter.toLowerCase()
    const matchesSearch =
      !lbSearch.trim() ||
      p.display_name.toLowerCase().includes(lbSearch.toLowerCase()) ||
      p.username.toLowerCase().includes(lbSearch.toLowerCase())
    return matchesCountry && matchesSearch
  })

  const PAGE_SIZE = 15
  const pagedLeaderboard = filteredLeaderboard.slice(lbPage * PAGE_SIZE, (lbPage + 1) * PAGE_SIZE)
  const activeStatsPlayer =
    filteredLeaderboard.find((p) => p.id === selectedStatsPlayerId) ||
    filteredLeaderboard[0] ||
    null

  const pageBg = darkMode ? 'bg-[#09090b] text-white' : 'bg-[#f8fafc] text-[#111827]'
  const cardClass = darkMode
    ? 'bg-[#121216] border-orange-500/35 text-white shadow-xl'
    : 'bg-white border-orange-300 text-[#111827] shadow-md'
  const inputClass = darkMode
    ? 'w-full border border-orange-500/40 bg-[#18181f] text-white font-bold rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-orange-500 transition'
    : 'w-full border border-orange-300 bg-orange-50/40 text-gray-900 font-bold rounded-xl px-4 py-2.5 text-base focus:outline-none focus:border-orange-500 transition'

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

  function renderAvatar(prof?: { pfp_url?: string; display_name?: string; username?: string }, sizeClass = 'w-10 h-10 text-base') {
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
    platformer: 'Platformer List',
    impossible: 'Impossible List',
    spam: 'Spam List',
  }

  return (
    <div className={`min-h-screen font-bold relative overflow-x-hidden transition-colors duration-300 text-base ${pageBg}`}>
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

      {/* LITERAL LAYERED ORANGE SVG WAVE SIDE TRIMS */}
      {sideDecor && (
        <>
          <div aria-hidden="true" className="fixed left-0 top-0 bottom-0 w-7 sm:w-12 z-40 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 60 800" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L48,0 C62,130 22,260 44,400 C64,540 20,670 46,800 L0,800 Z" fill="#ea580c" opacity="0.35" />
              <path d="M0,0 L36,0 C50,130 14,260 34,400 C52,540 12,670 36,800 L0,800 Z" fill="#f97316" opacity="0.6" />
              <path d="M0,0 L24,0 C38,130 6,260 24,400 C40,540 4,670 24,800 L0,800 Z" fill="#fb923c" opacity="0.85" />
              <path d="M0,0 L12,0 C24,130 0,260 14,400 C26,540 0,670 14,800 L0,800 Z" fill="#fdba74" />
            </svg>
          </div>
          <div aria-hidden="true" className="fixed right-0 top-0 bottom-0 w-7 sm:w-12 z-40 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 60 800" preserveAspectRatio="none" className="w-full h-full">
              <path d="M60,0 L12,0 C-2,130 38,260 16,400 C-4,540 40,670 14,800 L60,800 Z" fill="#ea580c" opacity="0.35" />
              <path d="M60,0 L24,0 C10,130 46,260 26,400 C8,540 48,670 24,800 L60,800 Z" fill="#f97316" opacity="0.6" />
              <path d="M60,0 L36,0 C22,130 54,260 36,400 C20,540 56,670 36,800 L60,800 Z" fill="#fb923c" opacity="0.85" />
              <path d="M60,0 L48,0 C36,130 60,260 46,400 C34,540 60,670 46,800 L60,800 Z" fill="#fdba74" />
            </svg>
          </div>
        </>
      )}

      {/* TOP HEADER (BIGGER PC UI) */}
      <header className={darkMode ? 'bg-[#09090b]/95 border-b border-orange-500/35 sticky top-0 z-40 backdrop-blur' : 'bg-white/95 border-b border-orange-300 sticky top-0 z-40 backdrop-blur'}>
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer select-none group" onClick={() => setActiveTab('welcome')}>
            <span className="fancy-display font-bold text-3xl sm:text-4xl uppercase text-orange-500 group-hover:scale-105 transition-transform">
              GLL<span className="text-lg lowercase text-orange-400">.pl</span>
            </span>
            <span className="hidden md:inline-block text-sm font-bold text-orange-500/85 border-l-2 border-orange-400 pl-4">
              Goofy Levels List
            </span>
          </div>

          <div className="flex items-center space-x-3.5 text-sm font-bold">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="hidden md:inline">Discord</span>
            </a>

            <button
              onClick={handleToggleSideDecor}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition ${
                sideDecor ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-gray-400/40 text-gray-400'
              }`}
            >
              Side Waves: {sideDecor ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={handleToggleTheme}
              className="p-2.5 rounded-xl border border-orange-500/35 hover:bg-orange-500/10 text-orange-500 transition"
              title="Toggle Theme"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {renderAvatar(currentUser, 'w-8 h-8 text-xs')}
                <button
                  onClick={() => {
                    const row = leaderboard.find((p) => p.id === currentUser.id) || { ...currentUser, totalPoints: 0, completedCount: 0, hardestLevel: null, entries: [] }
                    setViewingPlayer(row)
                    setActiveTab('profile')
                  }}
                  className="text-sm bg-orange-500/15 border border-orange-500 text-orange-500 px-3.5 py-2 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition"
                >
                  {currentUser.display_name}
                </button>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('login')} className="hover:text-orange-500 transition">Login</button>
                <button onClick={() => setActiveTab('register')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS WITH LISTS DROPDOWN */}
        <div className={darkMode ? 'bg-[#121216] border-t border-orange-500/25' : 'bg-orange-50/70 border-t border-orange-200'}>
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center text-sm sm:text-base font-bold">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`px-5 py-3.5 border-b-2 transition-all ${
                activeTab === 'welcome' ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
              }`}
            >
              Welcome
            </button>

            {/* DROPDOWN TAB FOR CLASSIC, PLATFORMER, IMPOSSIBLE & SPAM LIST */}
            <div className="relative">
              <button
                onClick={() => setListsDropdownOpen((prev) => !prev)}
                className={`px-5 py-3.5 border-b-2 flex items-center gap-1.5 transition-all ${
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
                  className={`absolute left-0 mt-1 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden ${
                    darkMode ? 'bg-[#18181f] border-orange-500/40 text-white' : 'bg-white border-orange-300 text-gray-900'
                  }`}
                >
                  {(['classic', 'platformer', 'impossible', 'spam'] as ListCategory[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setSelectedListMode(mode)
                        setActiveTab('list')
                        setListsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-orange-500 hover:text-white transition flex items-center justify-between ${
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
              { id: 'leaderboard', label: 'Leaderboard' },
              { id: 'staff', label: 'Staff & Editors' },
              { id: 'minigames', label: 'Minigames' },
              { id: 'forum', label: 'Forum & Bugs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setListsDropdownOpen(false)
                  if (tab.id === 'minigames') startRouletteChallenge()
                  else setActiveTab(tab.id as any)
                }}
                className={`px-5 py-3.5 border-b-2 transition-all ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent hover:text-orange-500'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {isMod && (
              <button
                onClick={() => setActiveTab('mod')}
                className={`px-5 py-3.5 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'mod' ? 'border-orange-500 text-orange-500' : 'border-transparent text-orange-500'
                }`}
              >
                <span>Mod Panel</span>
                {pendingSubs.length + pendingLevels.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingSubs.length + pendingLevels.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* FLOATING RIGHT-SIDE SUBMIT RECORD & SUBMIT LEVEL BUTTONS */}
      {currentUser && (
        <div className="fixed right-4 sm:right-14 bottom-8 z-40 flex flex-col gap-3">
          <button
            onClick={() => setRightDrawer(rightDrawer === 'record' ? 'none' : 'record')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-[0_8px_25px_rgba(249,115,22,0.45)] flex items-center gap-2 transition transform hover:-translate-y-0.5"
          >
            <span>+ Submit Record</span>
          </button>
          <button
            onClick={() => setRightDrawer(rightDrawer === 'level' ? 'none' : 'level')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3.5 rounded-2xl text-sm sm:text-base font-bold shadow-[0_8px_25px_rgba(217,119,6,0.45)] flex items-center gap-2 transition transform hover:-translate-y-0.5"
          >
            <span>+ Submit Level</span>
          </button>
        </div>
      )}

      {/* RIGHT-SIDE SLIDE-OUT DRAWER FOR SUBMIT RECORD / SUBMIT LEVEL */}
      {rightDrawer !== 'none' && currentUser && (
        <div onClick={() => setRightDrawer('none')} className="fixed inset-0 bg-black/65 z-50 flex justify-end">
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg h-full overflow-y-auto p-8 border-l space-y-6 animate-panel ${cardClass}`}
          >
            <div className="flex items-center justify-between border-b border-orange-500/25 pb-4">
              <h2 className="fancy-display text-2xl text-orange-500">
                {rightDrawer === 'record' ? 'Submit Record' : 'Submit New Level'}
              </h2>
              <button
                onClick={() => setRightDrawer('none')}
                className="bg-orange-500/20 text-orange-500 px-3.5 py-1.5 rounded-xl text-sm hover:bg-orange-500 hover:text-white transition"
              >
                Close ✕
              </button>
            </div>

            {rightDrawer === 'record' ? (
              <form onSubmit={handleRecordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5">List Category</label>
                  <select value={recMode} onChange={(e) => setRecMode(e.target.value as ListCategory)} className={inputClass}>
                    <option value="classic">Classic List</option>
                    <option value="platformer">Platformer List</option>
                    <option value="impossible">Impossible List</option>
                    <option value="spam">Spam List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Select Level</label>
                  <select value={recLevelId} onChange={(e) => setRecLevelId(Number(e.target.value))} className={inputClass}>
                    {approvedLevels.filter((l) => (l.mode || 'classic') === recMode).map((l) => (
                      <option key={l.id} value={l.id}>{l.title} ({l.points} pts)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Progress (%)</label>
                  <input type="number" min={1} max={100} value={recProgress} onChange={(e) => setRecProgress(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Video Proof URL (YouTube / Streamable)</label>
                  <input required type="url" placeholder="https://youtube.com/..." value={recVideo} onChange={(e) => setRecVideo(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Enjoyment Rating (1 - 10)</label>
                  <input type="number" min={1} max={10} value={recEnjoyment} onChange={(e) => setRecEnjoyment(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Notes for Moderators</label>
                  <textarea rows={2} value={recNotes} onChange={(e) => setRecNotes(e.target.value)} className={inputClass} placeholder="Raw footage link or FPS info..." />
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-base font-bold transition">
                  Send Record Submission
                </button>
              </form>
            ) : (
              <form onSubmit={handleLevelSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">List Type</label>
                    <select value={lvlMode} onChange={(e) => setLvlMode(e.target.value as ListCategory)} className={inputClass}>
                      <option value="classic">Classic List</option>
                      <option value="platformer">Platformer List</option>
                      <option value="impossible">Impossible List</option>
                      <option value="spam">Spam List</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">GD Level ID</label>
                    <input type="text" placeholder="149992717" value={lvlGdId} onChange={(e) => setLvlGdId(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Level Title</label>
                  <input required type="text" placeholder="e.g. GRIEF" value={lvlTitle} onChange={(e) => setLvlTitle(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Creator(s)</label>
                    <input required type="text" placeholder="Creator name" value={lvlCreator} onChange={(e) => setLvlCreator(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Verifier</label>
                    <input type="text" placeholder="Verifier name" value={lvlVerifier} onChange={(e) => setLvlVerifier(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Verification YouTube URL</label>
                  <input required type="url" placeholder="https://youtube.com/watch?v=..." value={lvlVerifyVideo} onChange={(e) => setLvlVerifyVideo(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Quote / Description</label>
                  <input type="text" placeholder='"The End."' value={lvlDesc} onChange={(e) => setLvlDesc(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Points (100%)</label>
                    <input type="number" step="0.01" value={lvlPoints} onChange={(e) => setLvlPoints(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Min List %</label>
                    <input type="number" min={1} max={100} value={lvlMinPct} onChange={(e) => setLvlMinPct(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Password</label>
                    <input type="text" value={lvlPassword} onChange={(e) => setLvlPassword(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Length</label>
                    <input type="text" value={lvlLength} onChange={(e) => setLvlLength(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Objects</label>
                    <input type="number" value={lvlObjects} onChange={(e) => setLvlObjects(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Version</label>
                    <input type="text" value={lvlVersion} onChange={(e) => setLvlVersion(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Newgrounds Song Name</label>
                    <input type="text" placeholder="KzX - Stalemate" value={lvlSongName} onChange={(e) => setLvlSongName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Newgrounds Song ID</label>
                    <input type="text" placeholder="482872" value={lvlSongId} onChange={(e) => setLvlSongId(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-base font-bold transition">
                  Submit Level for Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {bannerMsg && (
        <div className="max-w-7xl mx-auto px-8 pt-5 animate-panel">
          <div className="bg-orange-500 text-white px-5 py-3.5 rounded-xl text-sm font-bold flex justify-between shadow-lg">
            <span>{bannerMsg}</span>
            <button onClick={() => setBannerMsg('')} className="font-black ml-4">CLOSE</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* EXPANDED WELCOME / LANDING PAGE */}
        {activeTab === 'welcome' && (
          <div className="space-y-8 animate-panel">
            <div className={`p-10 sm:p-14 rounded-2xl border text-center space-y-6 ${cardClass}`}>
              <span className="inline-block bg-orange-500/20 text-orange-500 border border-orange-500/40 px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">
                Official Geometry Dash Community Demonlist
              </span>
              <h1 className="fancy-display text-5xl sm:text-6xl text-orange-500 leading-tight">
                Welcome to Goofy Levels List
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Track top completions across Classic, Platformer, Impossible, and Spam lists. Compete on the global Stats Viewer leaderboard, spin Goofy Roulette, and climb the ranks!
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-3">
                <button
                  onClick={() => {
                    setSelectedListMode('classic')
                    setActiveTab('list')
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl text-base font-bold transition shadow-xl"
                >
                  Browse Classic List
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="bg-orange-500/15 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-2xl text-base font-bold transition"
                >
                  Open Stats Viewer
                </button>
              </div>
            </div>

            {/* LIVE COMMUNITY STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              {[
                { label: 'Ranked Levels', value: approvedLevels.length, sub: 'Across 4 List Categories' },
                { label: 'Registered Players', value: profiles.length, sub: 'Competing Worldwide' },
                { label: 'Verified Records', value: approvedSubs.length, sub: 'With Video Proof' },
                { label: 'List Staff', value: moderators.length, sub: 'Editors & Helpers' },
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-2xl border text-center space-y-1 ${cardClass}`}>
                  <p className="fancy-display text-4xl text-orange-500">{stat.value}</p>
                  <p className="text-base">{stat.label}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POINTERCRATE-STYLE LEVEL DETAILS VIEW (WHEN YOU CLICK ON A LEVEL NAME) */}
        {activeTab === 'level_detail' && viewingLevel && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <button
              onClick={() => setActiveTab('list')}
              className="bg-orange-500/15 border border-orange-500/40 text-orange-500 px-4 py-2 rounded-xl text-sm hover:bg-orange-500 hover:text-white transition"
            >
              ← Back to {listLabels[viewingLevel.mode || 'classic']}
            </button>

            {/* TOP LEVEL HERO CARD */}
            <div className={`p-8 rounded-2xl border space-y-6 ${cardClass}`}>
              <div className="text-center space-y-2 border-b border-orange-500/20 pb-6">
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => {
                      const idx = categoryLevels.findIndex((l) => l.id === viewingLevel.id)
                      if (idx > 0) setViewingLevel(categoryLevels[idx - 1])
                    }}
                    className="text-3xl text-orange-500 hover:scale-125 transition"
                    title="Previous Level"
                  >
                    ‹
                  </button>
                  <h1 className="fancy-display text-4xl sm:text-5xl text-orange-500">{viewingLevel.title}</h1>
                  <button
                    onClick={() => {
                      const idx = categoryLevels.findIndex((l) => l.id === viewingLevel.id)
                      if (idx >= 0 && idx < categoryLevels.length - 1) setViewingLevel(categoryLevels[idx + 1])
                    }}
                    className="text-3xl text-orange-500 hover:scale-125 transition"
                    title="Next Level"
                  >
                    ›
                  </button>
                </div>
                <p className="text-base text-gray-400">
                  by <span className="text-orange-400 underline">{viewingLevel.creator}</span>, verified by{' '}
                  <span className="text-orange-400 underline">{viewingLevel.verifier || 'Unknown'}</span>
                </p>
                {viewingLevel.description && (
                  <p className="text-sm italic text-gray-400 pt-1">"{viewingLevel.description}"</p>
                )}
              </div>

              {/* EMBEDDED YOUTUBE PLAYER / THUMBNAIL */}
              <div className="max-w-2xl mx-auto">
                {getYouTubeId(viewingLevel.verification_url) ? (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-orange-500/40 shadow-2xl">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeId(viewingLevel.verification_url)}`}
                      title={viewingLevel.title}
                      allowFullScreen
                    />
                  </div>
                ) : viewingLevel.verification_url ? (
                  <div className="p-8 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
                    <a
                      href={viewingLevel.verification_url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-orange-500 text-white px-6 py-3 rounded-xl text-base inline-block"
                    >
                      Watch Verification Video
                    </a>
                  </div>
                ) : null}
              </div>

              {/* METADATA GRID (MATCHING SCREENSHOT) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center pt-4 border-t border-orange-500/20">
                <div>
                  <p className="text-sm text-orange-500">Level Password</p>
                  <p className="text-base">{viewingLevel.password || 'Free Copy'}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-500">Level ID</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(viewingLevel.gd_level_id || '')
                      showNotice(`Copied Level ID: ${viewingLevel.gd_level_id}`)
                    }}
                    className="text-base hover:text-orange-400 underline"
                    title="Click to copy ID"
                  >
                    {viewingLevel.gd_level_id || 'N/A'}
                  </button>
                </div>
                <div>
                  <p className="text-sm text-orange-500">Level Length</p>
                  <p className="text-base">{viewingLevel.level_length || '1m:30s'}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-500">Object Count</p>
                  <p className="text-base">{viewingLevel.object_count || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-orange-500">In-Game Difficulty</p>
                  <p className="text-base">{viewingLevel.difficulty || 'Extreme Demon'}</p>
                </div>
              </div>

              <div className="text-center space-y-3 pt-2">
                <div>
                  <p className="text-sm text-orange-500">Created In</p>
                  <p className="text-base">{viewingLevel.game_version || '2.2'}</p>
                </div>

                {viewingLevel.song_name && (
                  <div>
                    <p className="text-sm text-orange-500">Newgrounds Song</p>
                    <a
                      href={viewingLevel.song_id ? `https://www.newgrounds.com/audio/listen/${viewingLevel.song_id}` : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base text-sky-400 hover:underline"
                    >
                      {viewingLevel.song_name} {viewingLevel.song_id ? `(ID ${viewingLevel.song_id})` : ''} ↗
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-2 max-w-lg mx-auto pt-3">
                  <div>
                    <p className="text-sm text-orange-500">Demonlist score (100%)</p>
                    <p className="text-lg">{Number(viewingLevel.points || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-500">Demonlist score ({viewingLevel.min_percent || 75}%)</p>
                    <p className="text-lg">{(Number(viewingLevel.points || 0) * 0.25).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* POSITION HISTORY CARD */}
            <div className={`p-6 rounded-2xl border space-y-4 ${cardClass}`}>
              <div
                onClick={() => setShowHistoryTable(!showHistoryTable)}
                className="flex items-center justify-between cursor-pointer"
              >
                <h3 className="goofy-title text-2xl text-center flex-1 text-orange-500">Position History</h3>
                <span className="text-orange-500">{showHistoryTable ? '▲' : '▼'}</span>
              </div>
              {showHistoryTable && (
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-sm border-collapse">
                    <thead>
                      <tr className="bg-orange-600 text-white">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Change</th>
                        <th className="py-2.5 px-4">New Position</th>
                        <th className="py-2.5 px-4">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingLevel.position_history && viewingLevel.position_history.length > 0
                        ? viewingLevel.position_history
                        : [{ date: '2026-11-21', change: '-', new_position: categoryLevels.findIndex((l) => l.id === viewingLevel.id) + 1, reason: 'Added to list' }]
                      ).map((row, idx) => (
                        <tr key={idx} className="bg-orange-500/15 border-b border-orange-500/20">
                          <td className="py-2.5 px-4">{row.date}</td>
                          <td className="py-2.5 px-4">{row.change}</td>
                          <td className="py-2.5 px-4">{row.new_position}</td>
                          <td className="py-2.5 px-4">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RECORDS CARD */}
            <div className={`p-6 rounded-2xl border space-y-4 text-center ${cardClass}`}>
              <h3 className="goofy-title text-2xl text-orange-500">Records</h3>
              <p className="text-sm text-gray-400 border-b border-orange-500/20 pb-3">
                {viewingLevel.min_percent || 75}% or better required to qualify
              </p>
              {getLevelVictorsAndVerifiers(viewingLevel).length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No records yet! Be the first to achieve one!</p>
              ) : (
                <div className="space-y-2 text-left">
                  {getLevelVictorsAndVerifiers(viewingLevel).map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-orange-500/10 px-4 py-3 rounded-xl text-sm">
                      <div>
                        <span className="font-bold">{v.displayName}</span>{' '}
                        <span className="text-orange-500">({v.role} - {v.progress}%)</span>
                      </div>
                      {v.videoUrl && (
                        <a href={v.videoUrl} target="_blank" rel="noreferrer" className="bg-orange-500 text-white px-3.5 py-1.5 rounded-lg text-xs">
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

        {/* POINTERCRATE STATS VIEWER LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-panel">
            {/* WORLD MAP HEADER BANNER */}
            <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
              <div className="relative bg-gradient-to-b from-orange-500/15 via-amber-500/10 to-transparent p-6">
                {/* STYLIZED WORLD MAP SVG WITH ORANGE HIGHLIGHTS */}
                <svg viewBox="0 0 1000 320" className="w-full h-44 sm:h-56 opacity-80">
                  <g fill={darkMode ? '#27272a' : '#cbd5e1'} stroke={darkMode ? '#3f3f46' : '#ffffff'} strokeWidth="1.5">
                    {/* North America */}
                    <path d="M120,60 L240,55 L275,115 L220,165 L165,175 L130,120 Z" fill="#fb923c" />
                    {/* Greenland */}
                    <path d="M295,25 L365,20 L355,65 L300,70 Z" />
                    {/* South America */}
                    <path d="M245,190 L305,205 L290,295 L255,305 L240,240 Z" fill="#fdba74" />
                    {/* Europe */}
                    <path d="M445,60 L545,50 L565,115 L495,130 L450,115 Z" fill="#f97316" />
                    {/* Africa */}
                    <path d="M455,140 L540,140 L565,220 L515,280 L475,235 Z" />
                    {/* Asia */}
                    <path d="M565,55 L825,60 L845,155 L710,180 L575,140 Z" fill="#fb923c" />
                    {/* Oceania */}
                    <path d="M765,215 L845,215 L850,275 L770,275 Z" fill="#fdba74" />
                  </g>
                </svg>

                {/* STATS VIEWER - COUNTRY SELECTOR DROPDOWN */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <h2 className="fancy-display text-2xl sm:text-3xl text-orange-500">Stats Viewer -</h2>
                  <select
                    value={selectedCountryFilter}
                    onChange={(e) => {
                      setSelectedCountryFilter(e.target.value)
                      setLbPage(0)
                    }}
                    className={`border-b-2 border-orange-500 bg-transparent text-xl sm:text-2xl font-bold px-3 py-1 focus:outline-none ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    <option value="ALL" className={darkMode ? 'bg-[#121216]' : 'bg-white'}>
                      Global (All Countries)
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className={darkMode ? 'bg-[#121216]' : 'bg-white'}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TWO-COLUMN STATS VIEWER BODY (MATCHING SCREENSHOT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-orange-500/25">
                {/* LEFT COLUMN: SEARCH + SCROLLABLE RANKED PLAYER LIST + PREV/NEXT */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-orange-500/25 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter to search..."
                        value={lbSearch}
                        onChange={(e) => {
                          setLbSearch(e.target.value)
                          setLbPage(0)
                        }}
                        className={inputClass}
                      />
                      {lbSearch && (
                        <button
                          onClick={() => setLbSearch('')}
                          className="absolute right-3 top-3 text-xs text-gray-400 hover:text-orange-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="border border-orange-500/30 rounded-xl h-80 overflow-y-auto divide-y divide-orange-500/15">
                      {pagedLeaderboard.length === 0 ? (
                        <p className="p-4 text-sm text-gray-400 text-center">No players found.</p>
                      ) : (
                        pagedLeaderboard.map((player) => {
                          const globalRank = leaderboard.findIndex((p) => p.id === player.id) + 1
                          const isSelected = activeStatsPlayer?.id === player.id
                          return (
                            <button
                              key={player.id}
                              onClick={() => setSelectedStatsPlayerId(player.id)}
                              className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm transition ${
                                isSelected
                                  ? 'bg-orange-500 text-white'
                                  : 'hover:bg-orange-500/15'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className="font-mono w-8">
                                  {player.totalPoints > 0 ? `#${globalRank}` : '-'}
                                </span>
                                <img
                                  src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`}
                                  alt=""
                                  className="w-5 h-3.5 border"
                                />
                                <span className="truncate">{player.display_name}</span>
                              </div>
                              <span className="text-xs opacity-90">{player.totalPoints.toFixed(2)}</span>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-around pt-1 text-sm font-bold uppercase tracking-wider">
                    <button
                      disabled={lbPage === 0}
                      onClick={() => setLbPage((p) => Math.max(0, p - 1))}
                      className="disabled:opacity-35 hover:text-orange-500 transition"
                    >
                      Previous
                    </button>
                    <button
                      disabled={(lbPage + 1) * PAGE_SIZE >= filteredLeaderboard.length}
                      onClick={() => setLbPage((p) => p + 1)}
                      className="disabled:opacity-35 hover:text-orange-500 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: SELECTED PLAYER DETAILED STATS PANEL */}
                <div className="lg:col-span-8 p-8 flex flex-col justify-center">
                  {activeStatsPlayer ? (
                    <div className="space-y-6 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <img
                          src={`https://flagcdn.com/w40/${activeStatsPlayer.country.toLowerCase()}.png`}
                          alt=""
                          className="w-9 h-6 border shadow"
                        />
                        <button
                          onClick={() => {
                            setViewingPlayer(activeStatsPlayer)
                            setActiveTab('profile')
                          }}
                          className="fancy-display text-3xl sm:text-4xl text-orange-500 hover:underline"
                        >
                          {activeStatsPlayer.display_name}
                        </button>
                        <img
                          src={`https://flagcdn.com/w40/${activeStatsPlayer.country.toLowerCase()}.png`}
                          alt=""
                          className="w-9 h-6 border shadow"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
                        <div>
                          <p className="text-sm text-orange-500">Demonlist rank</p>
                          <p className="text-2xl">
                            {activeStatsPlayer.totalPoints > 0
                              ? leaderboard.findIndex((p) => p.id === activeStatsPlayer.id) + 1
                              : 'Unranked'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-500">Demonlist score</p>
                          <p className="text-2xl">{activeStatsPlayer.totalPoints.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-500">Demonlist stats</p>
                          <p className="text-base">{activeStatsPlayer.completedCount} Completed</p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-500">Hardest demon</p>
                          <p className="text-base">{activeStatsPlayer.hardestLevel?.title || 'None'}</p>
                        </div>
                      </div>

                      {/* DEMONS COMPLETED */}
                      <div className="space-y-1.5 pt-2">
                        <p className="text-base text-orange-500">Demons completed</p>
                        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
                          {activeStatsPlayer.entries.filter((e) => e.progress === 100).length > 0
                            ? activeStatsPlayer.entries
                                .filter((e) => e.progress === 100)
                                .map((e) => e.level.title)
                                .join(' - ')
                            : 'None'}
                        </p>
                      </div>

                      {/* DEMONS CREATED & VERIFIED */}
                      <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto pt-2">
                        <div>
                          <p className="text-sm text-orange-500">Demons created</p>
                          <p className="text-sm text-gray-400">
                            {approvedLevels
                              .filter((l) => l.creator.toLowerCase().includes(activeStatsPlayer.display_name.toLowerCase()))
                              .map((l) => l.title)
                              .join(', ') || 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-orange-500">Demons verified</p>
                          <p className="text-sm text-gray-400">
                            {activeStatsPlayer.entries
                              .filter((e) => e.role === 'Verifier')
                              .map((e) => e.level.title)
                              .join(', ') || 'None'}
                          </p>
                        </div>
                      </div>

                      {/* PROGRESS ON */}
                      <div className="pt-2">
                        <p className="text-sm text-orange-500">Progress on</p>
                        <p className="text-sm text-gray-400">
                          {activeStatsPlayer.entries
                            .filter((e) => e.progress < 100)
                            .map((e) => `${e.level.title} (${e.progress}%)`)
                            .join(' - ') || 'None'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-400">Select a player from the left list to inspect stats.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF & EDITORS PUBLIC ROSTER TAB */}
        {activeTab === 'staff' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <div className={`p-8 rounded-2xl border space-y-6 ${cardClass}`}>
              <div className="border-b border-orange-500/25 pb-4">
                <h1 className="fancy-display text-4xl text-orange-500">List Editors & Helpers</h1>
                <p className="text-sm text-gray-400 mt-1">Official GLL staff team managing placements and record verifications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h2 className="goofy-title text-2xl text-orange-500">List Editors ({moderators.filter((m) => m.role === 'editor').length})</h2>
                  {moderators.filter((m) => m.role === 'editor').length === 0 ? (
                    <p className="text-sm text-gray-400">No editors listed yet.</p>
                  ) : (
                    moderators
                      .filter((m) => m.role === 'editor')
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={`https://flagcdn.com/w20/${m.country_code.toLowerCase()}.png`} alt="" className="w-6 h-4 border" />
                            <div>
                              <p className="text-base">{m.clan ? `[${m.clan}] ` : ''}{m.name}</p>
                              <p className="text-xs text-orange-400 uppercase">List Editor</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="space-y-3">
                  <h2 className="goofy-title text-2xl text-orange-500">List Helpers ({moderators.filter((m) => m.role === 'helper').length})</h2>
                  {moderators.filter((m) => m.role === 'helper').length === 0 ? (
                    <p className="text-sm text-gray-400">No helpers listed yet.</p>
                  ) : (
                    moderators
                      .filter((m) => m.role === 'helper')
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            <img src={`https://flagcdn.com/w20/${m.country_code.toLowerCase()}.png`} alt="" className="w-6 h-4 border" />
                            <div>
                              <p className="text-base">{m.clan ? `[${m.clan}] ` : ''}{m.name}</p>
                              <p className="text-xs text-amber-400 uppercase">List Helper</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <div className={`max-w-md mx-auto p-8 rounded-2xl border space-y-5 animate-panel ${cardClass}`}>
            <h2 className="fancy-display text-3xl text-orange-500 border-b border-orange-500/20 pb-3">GLL Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input required type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input required type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">
                LOGIN
              </button>
            </form>
            <p className="text-sm text-center text-gray-400">
              Need an account?{' '}
              <button onClick={() => setActiveTab('register')} className="text-orange-500 underline">Register here</button>
            </p>
          </div>
        )}

        {/* REGISTER TAB */}
        {activeTab === 'register' && (
          <div className={`max-w-md mx-auto p-8 rounded-2xl border space-y-5 animate-panel ${cardClass}`}>
            <h2 className="fancy-display text-3xl text-orange-500 border-b border-orange-500/20 pb-3">GLL Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Username (lowercase, no spaces)</label>
                <input required type="text" placeholder="e.g. finniscrazyy" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-1">Display Name</label>
                <input required type="text" placeholder="e.g. FinnIsntCrazyy" value={regDisplay} onChange={(e) => setRegDisplay(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-1">Country</label>
                <select value={regCountry} onChange={(e) => setRegCountry(e.target.value)} className={inputClass}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input required type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm mb-1">Password (min 6 chars)</label>
                <input required minLength={6} type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition">
                REGISTER
              </button>
            </form>
          </div>
        )}

        {/* PLAYER PROFILE PAGE (NO AI AVATARS) */}
        {activeTab === 'profile' && viewingPlayer && (
          <div className={`max-w-4xl mx-auto rounded-2xl border overflow-hidden space-y-6 animate-panel ${cardClass}`}>
            <div className="relative h-52 sm:h-60 w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 overflow-hidden">
              {viewingPlayer.banner_url ? (
                <img src={viewingPlayer.banner_url} alt="" className="w-full h-full object-cover opacity-85" />
              ) : (
                <div className="absolute inset-0 bg-orange-500/25 flex items-center justify-center">
                  <span className="fancy-display text-4xl text-white/40 uppercase tracking-widest">{viewingPlayer.display_name}</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-sm bg-black/55 text-white px-4 py-2 rounded-xl hover:bg-black/80 backdrop-blur transition"
                >
                  ← Back to Leaderboard
                </button>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-6 -mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    {renderAvatar(viewingPlayer, 'w-24 h-24 text-3xl shadow-xl')}
                    <img
                      src={`https://flagcdn.com/w40/${viewingPlayer.country.toLowerCase()}.png`}
                      alt=""
                      className="absolute -bottom-1 -right-1 w-8 h-5 object-cover border-2 border-white rounded shadow"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="fancy-display text-3xl text-white drop-shadow">{viewingPlayer.display_name}</h2>
                      <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full uppercase font-bold">
                        {viewingPlayer.title_badge || 'Member'}
                      </span>
                    </div>
                    <p className="text-sm text-orange-200">
                      @{viewingPlayer.username} • Rank #{leaderboard.findIndex((p) => p.id === viewingPlayer.id) + 1}
                    </p>
                  </div>
                </div>

                <div className="text-right bg-orange-500/20 backdrop-blur border border-orange-500/40 px-6 py-3.5 rounded-2xl shadow-lg">
                  <p className="fancy-display text-3xl text-orange-400">{viewingPlayer.totalPoints.toFixed(2)} pts</p>
                  <p className="text-sm text-gray-300">{viewingPlayer.completedCount} Completions</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl space-y-2">
                  <p className="goofy-title text-lg text-orange-500">Social Links</p>
                  <p className="text-gray-400">YouTube: {viewingPlayer.youtube || 'None'}</p>
                  <p className="text-gray-400">Discord: {viewingPlayer.discord || 'None'}</p>
                  <p className="text-gray-400">Twitter: {viewingPlayer.twitter || 'None'}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/25 p-5 rounded-2xl space-y-2">
                  <p className="goofy-title text-lg text-orange-500">Player Bio</p>
                  <p className="text-gray-400 italic">{viewingPlayer.bio || 'No bio description provided.'}</p>
                </div>
              </div>

              {currentUser && currentUser.id === viewingPlayer.id && (
                <form onSubmit={handleProfileSave} className="border-t border-orange-500/25 pt-6 space-y-4">
                  <h3 className="fancy-display text-2xl text-orange-500">Edit Your Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Display Name</label>
                      <input type="text" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Country</label>
                      <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)} className={inputClass}>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Title Badge</label>
                      <input type="text" value={editBadge} onChange={(e) => setEditBadge(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Profile Bio</label>
                      <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Custom Avatar URL</label>
                      <input type="url" value={editPfp} onChange={(e) => setEditPfp(e.target.value)} className={inputClass} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Banner Image URL</label>
                      <input type="url" value={editBanner} onChange={(e) => setEditBanner(e.target.value)} className={inputClass} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" placeholder="YouTube Handle" value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Discord Tag" value={editDiscord} onChange={(e) => setEditDiscord(e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Twitter / X" value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} className={inputClass} />
                  </div>
                  <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-3 rounded-xl transition">
                    Save Profile Settings
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MINIGAMES TAB */}
        {activeTab === 'minigames' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <div className={`p-8 rounded-2xl border space-y-5 ${cardClass}`}>
              <h2 className="fancy-display text-3xl text-orange-500 border-b border-orange-500/20 pb-3">Goofy Roulette</h2>
              {rouletteLevel ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {getYouTubeThumbnail(rouletteLevel.verification_url) && (
                    <a href={rouletteLevel.verification_url || '#'} target="_blank" rel="noreferrer" className="shrink-0">
                      <img
                        src={getYouTubeThumbnail(rouletteLevel.verification_url)}
                        alt=""
                        className="w-64 h-36 object-cover rounded-xl border-2 border-orange-400"
                      />
                    </a>
                  )}
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <h3 className="goofy-title text-2xl">{rouletteLevel.title}</h3>
                      <p className="text-sm text-gray-400">By {rouletteLevel.creator} - Verified by {rouletteLevel.verifier || 'Unknown'}</p>
                      <p className="text-base text-orange-500 mt-1">{Number(rouletteLevel.points || 0).toFixed(2)} Points</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl text-sm space-y-2">
                      <p className="text-orange-500">Required Target: At least {rouletteTargetPct}%</p>
                      <div className="flex items-center gap-3">
                        <span>Achieved Percentage:</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={rouletteAchievedPct}
                          onChange={(e) => setRouletteAchievedPct(Number(e.target.value))}
                          className={`w-28 px-3 py-1.5 ${inputClass}`}
                        />
                      </div>
                      <p className="text-gray-400">{rouletteMessage}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleRouletteDone} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm transition">
                        Done (Next Level)
                      </button>
                      <button onClick={startRouletteChallenge} className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm transition">
                        Give Up
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No levels available for roulette.</p>
              )}
            </div>

            <div className={`p-8 rounded-2xl border text-center space-y-6 ${cardClass}`}>
              <h2 className="fancy-display text-3xl text-orange-500 border-b border-orange-500/20 pb-3">Goofy Gacha Packs</h2>
              <div className="flex justify-center gap-3">
                {(['standard', 'premium', 'god'] as const).map((pk) => (
                  <button
                    key={pk}
                    onClick={() => setGachaPack(pk)}
                    className={`px-5 py-2.5 rounded-xl text-sm uppercase font-bold border transition ${
                      gachaPack === pk ? 'bg-orange-500 text-white border-orange-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                    }`}
                  >
                    {pk} Pack
                  </button>
                ))}
              </div>

              <div className="p-8 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex flex-col items-center justify-center min-h-[200px]">
                {gachaAnimating ? (
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-500 border-t-transparent"></div>
                ) : gachaRolledLevel ? (
                  <div className="space-y-3 animate-panel">
                    {getYouTubeThumbnail(gachaRolledLevel.verification_url) && (
                      <img
                        src={getYouTubeThumbnail(gachaRolledLevel.verification_url)}
                        alt=""
                        className="w-56 h-32 object-cover rounded-xl border border-orange-400 mx-auto"
                      />
                    )}
                    <div>
                      <h3 className="goofy-title text-2xl">{gachaRolledLevel.title}</h3>
                      <p className="text-sm text-gray-400">By {gachaRolledLevel.creator} - {gachaRolledLevel.points} pts</p>
                      <span className="inline-block mt-2 bg-orange-500 text-white text-xs px-4 py-1 rounded-full">
                        Saved to Inventory
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-400">
                    {cooldownRemainingMs > 0
                      ? `Cooldown active. Next roll in ${formatCooldown(cooldownRemainingMs)}.`
                      : `Ready to open ${gachaPack} pack.`}
                  </p>
                )}
              </div>

              <button
                onClick={spinGacha}
                disabled={gachaAnimating || cooldownRemainingMs > 0}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-base transition disabled:opacity-50"
              >
                {cooldownRemainingMs > 0 ? `Cooldown: ${formatCooldown(cooldownRemainingMs)}` : `Open ${gachaPack.toUpperCase()} Pack`}
              </button>
            </div>
          </div>
        )}

        {/* FORUM & BUG REPORTS TAB */}
        {activeTab === 'forum' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-panel">
            <div className={`p-8 rounded-2xl border space-y-4 ${cardClass}`}>
              <h2 className="fancy-display text-3xl text-orange-500 border-b border-orange-500/20 pb-3">Community Forum & Bug Reports</h2>
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
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-6 py-3 rounded-xl transition">
                  Submit Post
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {forumPosts.map((post) => (
                <div key={post.id} className={`p-6 rounded-2xl border space-y-2 ${cardClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase px-2.5 py-0.5 rounded bg-orange-500/20 text-orange-500 border border-orange-500/40">
                        {post.category}
                      </span>
                      {post.is_flagged && (
                        <span className="text-xs uppercase px-2.5 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/40">
                          Flagged by Auto-Mod
                        </span>
                      )}
                    </div>
                    {isMod && (
                      <button onClick={() => handleDeleteForumPost(post.id)} className="text-sm text-red-500 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                  <h3 className="goofy-title text-2xl">{post.title}</h3>
                  <p className="text-sm text-gray-400">{post.content}</p>
                  <p className="text-xs text-orange-500">By {post.author_display}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPANDED MODERATOR PANEL */}
        {activeTab === 'mod' && isMod && (
          <div className={`max-w-5xl mx-auto p-8 rounded-2xl border space-y-8 animate-panel ${cardClass}`}>
            <h2 className="fancy-display text-4xl text-orange-500 border-b border-orange-500/25 pb-3">Expanded Moderator Panel</h2>

            {/* PENDING LEVEL APPROVALS */}
            <div className="space-y-3">
              <h3 className="goofy-title text-2xl text-orange-500">Pending Level Approvals ({pendingLevels.length})</h3>
              {pendingLevels.length === 0 ? (
                <p className="text-sm text-gray-400">No pending level submissions.</p>
              ) : (
                pendingLevels.map((lvl) => (
                  <div key={lvl.id} className="p-4 bg-orange-500/10 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="text-base">{lvl.title} by {lvl.creator} <span className="text-orange-400">[{lvl.mode || 'classic'}]</span></p>
                      <p className="text-gray-400">Points: {lvl.points} | GD ID: {lvl.gd_level_id || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lvl.verification_url && (
                        <a href={lvl.verification_url} target="_blank" rel="noreferrer" className="bg-orange-500/20 text-orange-500 border border-orange-500/40 px-3 py-1.5 rounded-lg">
                          Video Proof
                        </a>
                      )}
                      <button onClick={() => handleReviewLevel(lvl.id, 'approved')} className="bg-orange-500 text-white px-4 py-1.5 rounded-lg">Approve</button>
                      <button onClick={() => handleReviewLevel(lvl.id, 'rejected')} className="bg-red-600 text-white px-4 py-1.5 rounded-lg">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PENDING RECORD SUBMISSIONS */}
            <div className="space-y-3 border-t border-orange-500/25 pt-5">
              <h3 className="goofy-title text-2xl text-orange-500">Pending Record Submissions ({pendingSubs.length})</h3>
              {pendingSubs.length === 0 ? (
                <p className="text-sm text-gray-400">No pending record submissions.</p>
              ) : (
                pendingSubs.map((sub) => (
                  <div key={sub.id} className="p-4 bg-orange-500/10 rounded-xl flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="text-base">{sub.player_name} - {sub.progress}% on {sub.level_title}</p>
                      {sub.mod_notes && <p className="text-xs text-gray-400">Note: {sub.mod_notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {sub.video_url && (
                        <a href={sub.video_url} target="_blank" rel="noreferrer" className="bg-orange-500/20 text-orange-500 border border-orange-500/40 px-3 py-1.5 rounded-lg">
                          Video Proof
                        </a>
                      )}
                      <button onClick={() => handleReviewSubmission(sub.id, 'approved')} className="bg-orange-500 text-white px-4 py-1.5 rounded-lg">Approve</button>
                      <button onClick={() => handleReviewSubmission(sub.id, 'rejected')} className="bg-red-600 text-white px-4 py-1.5 rounded-lg">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* BULK LEVEL POINT SCALER */}
            <div className="border-t border-orange-500/25 pt-5 space-y-3">
              <h3 className="goofy-title text-2xl text-orange-500">Global Point Rebalancer</h3>
              <div className="flex items-center gap-3 max-w-md">
                <input
                  type="number"
                  step="0.05"
                  value={bulkPointMultiplier}
                  onChange={(e) => setBulkPointMultiplier(e.target.value)}
                  className={inputClass}
                />
                <button onClick={handleBulkScalePoints} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm shrink-0">
                  Scale All Points
                </button>
              </div>
            </div>

            {/* ISSUE USER WARNING */}
            <div className="border-t border-orange-500/25 pt-5 space-y-3">
              <h3 className="goofy-title text-2xl text-orange-500">Issue User Warning</h3>
              <form onSubmit={handleIssueWarning} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" placeholder="Username" value={warnTargetUser} onChange={(e) => setWarnTargetUser(e.target.value)} className={inputClass} />
                <input type="text" placeholder="Reason" value={warnReason} onChange={(e) => setWarnReason(e.target.value)} className={inputClass} />
                <button type="submit" className="bg-red-600 text-white text-sm rounded-xl py-2.5">Issue Warning</button>
              </form>
            </div>

            {/* MANAGE STAFF MEMBERS (EDITORS & HELPERS) */}
            <div className="border-t border-orange-500/25 pt-5 space-y-3">
              <h3 className="goofy-title text-2xl text-orange-500">Manage Staff Members (Editors & Helpers)</h3>
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
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
                <button type="submit" className="sm:col-span-6 bg-orange-500 text-white text-sm py-3 rounded-xl">Add Staff Member</button>
              </form>

              <div className="space-y-2 pt-2">
                {moderators.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-orange-500/10 px-4 py-2.5 rounded-xl text-sm">
                    <span>{m.clan ? `[${m.clan}] ` : ''}{m.name} ({m.role})</span>
                    <button onClick={() => handleRemoveStaff(m.id)} className="text-red-500 hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LEVEL LIST VIEW (CLASSIC / PLATFORMER / IMPOSSIBLE / SPAM) */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="fancy-display text-4xl sm:text-5xl text-orange-500">{listLabels[selectedListMode]}</h1>
                <p className="text-sm text-gray-400">Click any level card to open full stats, song info, and position history.</p>
              </div>
              <input
                type="text"
                placeholder="Search level, creator, or GD ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} w-72`}
              />
            </div>

            <div className="space-y-4">
              {shownLevels.length === 0 ? (
                <div className={`p-10 rounded-2xl border text-center text-gray-400 ${cardClass}`}>
                  No levels in {listLabels[selectedListMode]} yet.
                </div>
              ) : (
                shownLevels.map((lvl, index) => {
                  const thumb = lvl.thumbnail || getYouTubeThumbnail(lvl.verification_url)
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        setViewingLevel(lvl)
                        setActiveTab('level_detail')
                      }}
                      className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-5 cursor-pointer hover:border-orange-500 transition ${cardClass}`}
                    >
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <span className="fancy-display text-3xl text-orange-500 w-12">#{index + 1}</span>
                        {thumb && (
                          <img src={thumb} alt="" className="w-40 h-24 object-cover rounded-xl border border-orange-400" />
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="goofy-title text-2xl hover:text-orange-500 transition">{lvl.title}</h3>
                            {lvl.gd_level_id && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs bg-orange-500/15 text-orange-500 px-2.5 py-0.5 rounded-lg font-mono">
                                  ID: {lvl.gd_level_id}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(lvl.gd_level_id || '')
                                    showNotice(`Copied GD ID: ${lvl.gd_level_id}`)
                                  }}
                                  className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-lg hover:bg-orange-600"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">By {lvl.creator} • Verified by {lvl.verifier || 'Unknown'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="fancy-display text-2xl sm:text-3xl text-orange-500">{Number(lvl.points || 0).toFixed(2)}</span>
                          <span className="text-xs text-gray-400 block">points</span>
                        </div>
                        {isMod && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setEditingLevel(lvl)} className="bg-orange-500 text-white text-sm px-4 py-2 rounded-xl">Edit</button>
                            <button onClick={() => handleDeleteLevel(lvl.id, lvl.title)} className="bg-red-600 text-white text-sm px-4 py-2 rounded-xl">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* LEVEL EDIT MODAL */}
        {editingLevel && isMod && (
          <div onClick={() => setEditingLevel(null)} className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <form onClick={(e) => e.stopPropagation()} onSubmit={handleSaveEditedLevel} className={`max-w-lg w-full p-7 rounded-2xl border space-y-4 animate-panel ${cardClass}`}>
              <div className="flex justify-between items-center border-b border-orange-500/25 pb-3">
                <h3 className="fancy-display text-2xl text-orange-500">Edit Level Details</h3>
                <button type="button" onClick={() => setEditingLevel(null)} className="text-sm bg-orange-500/15 text-orange-500 px-3 py-1 rounded-xl">Cancel</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Title</label>
                  <input required type="text" value={editingLevel.title} onChange={(e) => setEditingLevel({ ...editingLevel, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">List Category</label>
                  <select value={editingLevel.mode || 'classic'} onChange={(e) => setEditingLevel({ ...editingLevel, mode: e.target.value as ListCategory })} className={inputClass}>
                    <option value="classic">Classic List</option>
                    <option value="platformer">Platformer List</option>
                    <option value="impossible">Impossible List</option>
                    <option value="spam">Spam List</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Creator</label>
                  <input required type="text" value={editingLevel.creator} onChange={(e) => setEditingLevel({ ...editingLevel, creator: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Verifier</label>
                  <input type="text" value={editingLevel.verifier || ''} onChange={(e) => setEditingLevel({ ...editingLevel, verifier: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">GD Level ID</label>
                  <input type="text" value={editingLevel.gd_level_id || ''} onChange={(e) => setEditingLevel({ ...editingLevel, gd_level_id: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Points</label>
                  <input type="number" step="0.01" value={editingLevel.points || 0} onChange={(e) => setEditingLevel({ ...editingLevel, points: Number(e.target.value) })} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1">Verification Video URL</label>
                <input type="url" value={editingLevel.verification_url || ''} onChange={(e) => setEditingLevel({ ...editingLevel, verification_url: e.target.value })} className={inputClass} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs mb-1">Password</label>
                  <input type="text" value={editingLevel.password || 'Free Copy'} onChange={(e) => setEditingLevel({ ...editingLevel, password: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Length</label>
                  <input type="text" value={editingLevel.level_length || '1m:30s'} onChange={(e) => setEditingLevel({ ...editingLevel, level_length: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Objects</label>
                  <input type="number" value={editingLevel.object_count || 0} onChange={(e) => setEditingLevel({ ...editingLevel, object_count: Number(e.target.value) })} className={inputClass} />
                </div>
              </div>

              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-3 rounded-xl transition">
                Save Level Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
