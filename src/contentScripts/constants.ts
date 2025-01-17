// src/contentScripts/constants.ts
export const SELECTORS = {
  activity: {
    container: '.js-yearly-contributions',
    graph: '.js-calendar-graph-svg',
    activityOverview: '.js-activity-overview',
  },
  repositories: {
    pinnedRepos: '.js-pinned-items-reorder-container',
    popularRepos: '.js-profile-repositories-section',
  },
  organizations: {
    container: '.border-top.color-border-muted.pt-3.mt-3.clearfix.hide-sm.hide-md',
    items: '.avatar-group-item',
  },
  contributions: {
    calendar: '.js-calendar-graph',
    activityListing: '.contribution-activity-listing',
  },
  sponsors: {
    section: '.js-profile-sponsors-section',
  },
  achievements: {
    section: '.js-profile-achievements',
  },
};