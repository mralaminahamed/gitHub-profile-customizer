export interface Settings {
  hideActivity: boolean
  hideRepositories: boolean
  hideContributions: boolean
  hideAllOrgs: boolean
  hiddenOrgs: string[]
  hideSponsors: boolean
  hideAchievements: boolean
}

export interface Organization {
  name: string
  avatar: string
  url: string
  organizations: string[]
}
