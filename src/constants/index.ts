// constants/index.ts
import {
  UserIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  HashtagIcon,
  MapIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import type { ProfileSection, Theme, KeyboardShortcut, Settings } from '@/types';

export const EXTENSION_ID = 'github-profile-customizer'
export const EXTENSION_AUTHOR = 'mralaminahamed'
export const GITHUB_ISSUES_URL = `https://github.com/${EXTENSION_AUTHOR}/${EXTENSION_ID}/issues`;

export const TABS = [
  { id: 'profile', name: 'Profile', icon: UserIcon },
  { id: 'activity', name: 'Activity', icon: ChartBarIcon },
  { id: 'organizations', name: 'Organizations', icon: UserGroupIcon },
  { id: 'settings', name: 'Settings', icon: CogIcon },
]

export const PROFILE_SECTIONS: ProfileSection[] = [
  // Repository Sections
  {
    id: 'pinnedRepos',
    title: 'Pinned Repositories',
    description: 'Showcase repositories on your profile',
    icon: BookOpenIcon,
    setting: 'hidePinnedRepos',
  },
  {
    id: 'popularRepos',
    title: 'Popular Repositories',
    description: 'Most starred and forked repositories',
    icon: SparklesIcon,
    setting: 'hidePopularRepos',
  },
  {
    id: 'languageStats',
    title: 'Language Statistics',
    description: 'Programming languages breakdown',
    icon: HashtagIcon,
    setting: 'hideLanguageStats',
  },
  {
    id: 'contributors',
    title: 'Contributors Section',
    description: 'Repository contributors list',
    icon: UserGroupIcon,
    setting: 'hideContributorsSection',
  },

  // Profile Info
  {
    id: 'status',
    title: 'Status',
    description: 'Your current status message',
    icon: ChatBubbleLeftRightIcon,
    setting: 'hideStatus',
  },
  {
    id: 'followers',
    title: 'Followers',
    description: 'People following you',
    icon: UserGroupIcon,
    setting: 'hideFollowers',
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Your geographical location',
    icon: MapIcon,
    setting: 'hideLocation',
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Contact email address',
    icon: EnvelopeIcon,
    setting: 'hideEmail',
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Your workplace or organization',
    icon: BuildingOfficeIcon,
    setting: 'hideCompany',
  },
  {
    id: 'website',
    title: 'Website',
    description: 'Personal or company website',
    icon: GlobeAltIcon,
    setting: 'hideWebsite',
  },

  // Additional Features
  {
    id: 'readme',
    title: 'Profile README',
    description: 'Your profile description',
    icon: DocumentTextIcon,
    setting: 'hideReadme',
  },
  {
    id: 'packages',
    title: 'Packages',
    description: 'Published packages',
    icon: ArchiveBoxIcon,
    setting: 'hidePackages',
  },
  {
    id: 'discussions',
    title: 'Discussions',
    description: 'GitHub Discussions activity',
    icon: ChatBubbleBottomCenterTextIcon,
    setting: 'hideDiscussions',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Project boards',
    icon: RectangleStackIcon,
    setting: 'hideProjects',
  },
]

export const THEMES: Theme[] = [
  {
    name: 'Default Light',
    accentColor: '#0969da',
    background: '#ffffff',
    text: '#1f2328',
    border: '#d0d7de',
  },
  {
    name: 'Default Dark',
    accentColor: '#2f81f7',
    background: '#0d1117',
    text: '#e6edf3',
    border: '#30363d',
  },
  {
    name: 'GitHub Dark Dimmed',
    accentColor: '#539bf5',
    background: '#22272e',
    text: '#adbac7',
    border: '#444c56',
  },
  {
    name: 'High Contrast',
    accentColor: '#409eff',
    background: '#010409',
    text: '#f0f3f6',
    border: '#6e7681',
  },
]

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: '⌘/Ctrl + S',
    description: 'Save changes',
    action: () => {}, // Defined in component
  },
  {
    key: '⌘/Ctrl + R',
    description: 'Reset settings',
    action: () => {},
  },
  {
    key: '⌘/Ctrl + F',
    description: 'Search organizations',
    action: () => {},
  },
  {
    key: '⌘/Ctrl + D',
    description: 'Toggle dark mode',
    action: () => {},
  },
  {
    key: '⌘/Ctrl + M',
    description: 'Toggle compact mode',
    action: () => {},
  },
]

export const DEFAULT_SETTINGS: Settings = {
  // Profile Features
  hideActivity: false,
  hideRepositories: false,
  hideContributions: false,
  hideAllOrgs: false,
  hiddenOrgs: [],
  hideSponsors: false,
  hideAchievements: false,

  // Repository Settings
  hidePinnedRepos: false,
  hidePopularRepos: false,
  hideLanguageStats: false,
  hideContributorsSection: false,
  hideRepoDescription: false,

  // Activity Settings
  hideActivityGraph: false,
  hideActivityOverview: false,
  hideContributionStreak: false,
  hidePrivateContributions: false,

  // Profile Info
  hideStatus: false,
  hideFollowers: false,
  hideFollowing: false,
  hideLocation: false,
  hideBio: false,
  hideEmail: false,
  hideCompany: false,
  hideWebsite: false,
  hideTwitter: false,

  // Theme Settings
  enableDarkMode: false,
  customAccentColor: null,
  compactMode: false,

  // Additional Features
  hideReadme: false,
  hidePackages: false,
  hideHighlights: false,
  hideDiscussions: false,
  hideProjects: false,

  // Organization Preferences
  orgViewMode: 'grid',
  orgSortOrder: 'name',
  orgGrouping: 'none',
}