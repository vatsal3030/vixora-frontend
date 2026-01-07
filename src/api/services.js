import api from './axios'

// Auth Service
export const authService = {
  register: (formData) => api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyEmail: (data) => api.post('/users/verify-email', data),
  resendOtp: (identifier) => api.post('/users/resend-otp', { identifier }),
  login: (data) => api.post('/users/login', data),
  logout: () => api.post('/users/logout'),
  refreshToken: (refreshToken) => api.post('/users/refresh-token', { refreshToken }),
  getCurrentUser: () => api.get('/users/current-user'),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  forgotPasswordVerify: (data) => api.post('/users/forgot-password/verify', data),
  resetPassword: (data) => api.post('/users/reset-password', data)
}

// Video Service
export const videoService = {
  getVideos: (params = {}) => api.get('/videos', { params }),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  getMyVideos: (params = {}) => api.get('/videos/me', { params }),
  getDeletedVideos: () => api.get('/videos/trash/me'),
  uploadVideo: (formData) => api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateVideo: (videoId, data) => api.patch(`/videos/${videoId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  restoreVideo: (videoId) => api.patch(`/videos/${videoId}/restore`),
  togglePublish: (videoId) => api.patch(`/videos/${videoId}/publish`)
}

// Comment Service
export const commentService = {
  getComments: (videoId) => api.get(`/comments/${videoId}`),
  addComment: (videoId, content) => api.post(`/comments/${videoId}`, { content }),
  updateComment: (commentId, content) => api.patch(`/comments/c/${commentId}`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/c/${commentId}`)
}

// Like Service
export const likeService = {
  toggleVideoLike: (videoId) => api.post(`/likes/toggle/v/${videoId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/toggle/c/${commentId}`),
  toggleTweetLike: (tweetId) => api.post(`/likes/toggle/t/${tweetId}`),
  getLikedVideos: () => api.get('/likes/videos')
}

// Subscription Service
export const subscriptionService = {
  toggleSubscription: (channelId) => api.post(`/subscriptions/c/${channelId}/subscribe`),
  setNotificationLevel: (channelId, level) => api.patch(`/subscriptions/c/${channelId}/notifications`, { level }),
  getSubscriptionStatus: (channelId) => api.get(`/subscriptions/c/${channelId}/status`),
  getSubscriberCount: (channelId) => api.get(`/subscriptions/c/${channelId}/subscribers/count`),
  getSubscriptions: () => api.get('/subscriptions/u/subscriptions'),
  getSubscribedVideos: () => api.get('/subscriptions')
}

// Channel Service
export const channelService = {
  getChannel: (channelId) => api.get(`/channels/${channelId}`),
  getChannelByUsername: (username) => api.get(`/users/u/${username}`),
  getChannelVideos: (channelId, params = {}) => api.get(`/channels/${channelId}/videos`, { params }),
  getChannelPlaylists: (channelId) => api.get(`/channels/${channelId}/playlists`),
  getChannelTweets: (channelId, params = {}) => api.get(`/channels/${channelId}/tweets`, { params })
}

// User Service
export const userService = {
  updateProfile: (data) => api.patch('/users/update-account', data),
  changePassword: (data) => api.post('/users/change-password', data),
  deleteAccount: (data) => api.delete('/users/delete-account', { data }),
  restoreAccountRequest: (data) => api.patch('/users/restore-account/request', data),
  restoreAccountConfirm: (data) => api.patch('/users/restore-account/confirm', data),
  updateAvatar: (formData) => api.patch('/users/update-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCoverImage: (formData) => api.patch('/users/update-coverImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getWatchHistory: () => api.get('/users/history'),
  getUserChannelProfile: (username) => api.get(`/users/u/${username}`),
  updateChannelDescription: (data) => api.patch('/users/update-description', data)
}

// Feed Service
export const feedService = {
  getHomeFeed: () => api.get('/feed/home'),
  getSubscriptionsFeed: () => api.get('/feed/subscriptions'),
  getTrendingFeed: () => api.get('/feed/trending'),
  getShortsFeed: () => api.get('/feed/shorts')
}

// Playlist Service
export const playlistService = {
  getMyPlaylists: (params = {}) => api.get('/playlists/user/me', { params }),
  getUserPlaylists: (userId, params = {}) => api.get(`/playlists/user/${userId}`, { params }),
  createPlaylist: (data) => api.post('/playlists', data),
  addVideoToPlaylist: (videoId, playlistId) => api.patch(`/playlists/add/${videoId}/${playlistId}`),
  removeVideoFromPlaylist: (videoId, playlistId) => api.patch(`/playlists/remove/${videoId}/${playlistId}`),
  getPlaylist: (playlistId) => api.get(`/playlists/${playlistId}`),
  updatePlaylist: (playlistId, data) => api.patch(`/playlists/${playlistId}`, data),
  deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`),
  togglePlaylistVisibility: (playlistId) => api.patch(`/playlists/${playlistId}/toggle-visibility`)
}

// Tweet Service
export const tweetService = {
  createTweet: (formData) => api.post('/tweets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserTweets: (userId) => api.get(`/tweets/user/${userId}`),
  getTweet: (tweetId) => api.get(`/tweets/${tweetId}`),
  updateTweet: (tweetId, data) => api.patch(`/tweets/${tweetId}`, data),
  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
  restoreTweet: (tweetId) => api.patch(`/tweets/${tweetId}/restore`),
  getDeletedTweets: () => api.get('/tweets/trash/me')
}

// Notification Service
export const notificationService = {
  getAllNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: () => api.delete('/notifications')
}

// Watch History Service
export const watchHistoryService = {
  saveWatchProgress: (data) => api.post('/watch-history', data),
  getWatchProgress: (videoId) => api.get(`/watch-history/${videoId}`),
  getContinueWatching: () => api.get('/watch-history'),
  getProgressForVideos: (videoIds) => api.post('/watch-history/bulk', { videoIds })
}

// Dashboard Service
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getTopVideos: () => api.get('/dashboard/top-videos'),
  getGrowthStats: () => api.get('/dashboard/growth'),
  getInsights: () => api.get('/dashboard/insights')
}

// Watch Service (for video streaming)
export const watchService = {
  watchVideo: (videoId) => api.get(`/watch/${videoId}`)
}

// Settings Service
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),
  resetSettings: () => api.post('/settings/reset')
}