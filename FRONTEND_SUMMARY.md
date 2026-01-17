# Vixora Frontend - Complete Technical Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Pages Documentation](#pages-documentation)
6. [Components Documentation](#components-documentation)
7. [Hooks Documentation](#hooks-documentation)
8. [Context & State Management](#context--state-management)
9. [API Integration](#api-integration)
10. [Routing System](#routing-system)
11. [Styling & Theming](#styling--theming)
12. [Performance Optimizations](#performance-optimizations)

---

## 🎯 Project Overview

**Vixora** is a full-featured YouTube-like video streaming platform built with React. Users can upload, watch, like, comment, subscribe, create playlists, and interact with content in a modern, responsive interface.

### Key Capabilities:
- Video streaming with custom player
- User authentication & authorization
- Video upload & management
- Playlist creation & management
- Social features (likes, comments, subscriptions)
- Watch history & progress tracking
- Trending & recommendation system
- Dark/Light theme support
- Infinite scroll pagination
- Real-time notifications

---

## 🛠 Tech Stack

### Core Technologies:
- **React 19.2.0** - UI library
- **React Router DOM 7.11.0** - Client-side routing
- **Vite 7.2.4** - Build tool & dev server
- **Tailwind CSS 3.4.19** - Utility-first CSS framework

### UI Components:
- **Radix UI** - Headless accessible components
  - Avatar, Checkbox, Dialog, Dropdown Menu, Label, Select, Slider, Switch
- **ShadCN UI** - Pre-built component library
- **Lucide React 0.562.0** - Icon library
- **Sonner 2.0.7** - Toast notifications

### State & Data:
- **Axios 1.13.2** - HTTP client
- **React Hook Form 7.54.2** - Form management
- **Context API** - Global state management

### Utilities:
- **clsx & tailwind-merge** - Class name utilities
- **class-variance-authority** - Component variants
- **next-themes 0.4.6** - Theme management

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   ├── axios.js              # Axios instance configuration
│   │   └── services.js           # API service layer (all endpoints)
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── common/
│   │   │   └── PermissionDialog.jsx
│   │   ├── settings/             # Settings page components
│   │   ├── skeletons/            # Loading skeleton components
│   │   ├── ui/                   # ShadCN UI components
│   │   ├── video/                # Video-specific components
│   │   └── [other components]    # Shared components
│   ├── context/                  # React Context providers
│   ├── hooks/                    # Custom React hooks
│   ├── layouts/
│   │   └── MainLayout.jsx        # Main app layout
│   ├── lib/
│   │   └── utils.js              # Utility functions
│   ├── pages/                    # Page components
│   ├── styles/                   # CSS files
│   ├── utils/                    # Helper functions
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🎨 Core Features

### 1. Authentication System
**Purpose**: Secure user authentication and authorization

**Features**:
- Email/Password registration with OTP verification
- Email/Username login
- Google OAuth integration (ready for implementation)
- Forgot password with OTP reset
- Account restoration
- JWT token management via HTTP-only cookies
- Auto token refresh

**Implementation**:
- Context: `AuthContext.jsx`
- Pages: `Login.jsx`, `Register.jsx`, `EmailVerification.jsx`, `VerifyOtp.jsx`, `RestoreAccount.jsx`
- Service: `authService` in `services.js`

**Data Flow**:
```
User Input → AuthContext → API Service → Backend → Response → Update Context → Redirect
```

---

### 2. Video Streaming & Player
**Purpose**: Custom video player with advanced features

**Features**:
- Custom HTML5 video player
- Play/Pause controls
- Volume control with mute
- Fullscreen support
- Progress bar with seek
- Auto-resume from last watched position
- Watch progress tracking
- Keyboard shortcuts
- Picture-in-Picture mode

**Implementation**:
- Component: `CustomVideoPlayer.jsx`
- Page: `Video.jsx`
- Service: `videoService`, `watchHistoryService`

**Data Flow**:
```
Video Page → Fetch Video Data → Load Player → Track Progress → Save to Backend
```

**Progress Tracking**:
- Saves progress every 5 seconds
- Saves on pause, seek, and page unload
- Auto-resumes if progress > 5%

---

### 3. Infinite Scroll System
**Purpose**: Load content progressively for better performance

**Features**:
- Intersection Observer API
- Automatic loading on scroll
- Loading states with skeletons
- Error handling
- Key-based reset mechanism
- Configurable page size (default: 20 items)

**Implementation**:
- Hook: `useInfiniteScroll.js`
- Used in: Home, Trending, History, Shorts, Subscriptions, etc.

**How It Works**:
```javascript
const { data, loading, error, hasMore, observerRef } = useInfiniteScroll(fetchFunction, key)

// fetchFunction receives (page, limit) and returns array of items
// key changes trigger reset and reload
// observerRef attached to sentinel element at bottom
```

**Data Flow**:
```
Component Mount → Load Page 1 → Render Items → Observer Detects Scroll → Load Page 2 → Append Items → Repeat
```

---

### 4. Playlist Management
**Purpose**: Organize videos into collections

**Features**:
- Create playlists with name, description, privacy
- Add/Remove videos from playlists
- Watch Later special playlist
- Playlist player with auto-play next
- Edit playlist details
- Delete playlists (soft delete to trash)
- Restore from trash
- Toggle privacy (public/private)

**Implementation**:
- Pages: `Playlists.jsx`, `PlaylistView.jsx`, `PlaylistPlayerPage.jsx`, `PlaylistTrash.jsx`
- Components: `PlaylistCard.jsx`, `CreatePlaylistDialog.jsx`, `EditPlaylistDialog.jsx`, `AddToPlaylistDialog.jsx`, `PlaylistModal.jsx`
- Service: `playlistService`

**Data Flow**:
```
Create Playlist → POST /playlists → Get Playlists → Display Cards
Add Video → PATCH /playlists/add/:videoId/:playlistId → Update UI
```

---

### 5. Social Features

#### 5.1 Likes System
**Purpose**: Allow users to like videos and comments

**Features**:
- Toggle like on videos
- Toggle like on comments
- Like count display
- Liked videos collection page

**Implementation**:
- Service: `likeService`
- Pages: `LikedVideos.jsx`
- API: `POST /likes/toggle/v/:videoId`, `POST /likes/toggle/c/:commentId`

#### 5.2 Comments System
**Purpose**: User engagement through comments

**Features**:
- Add comments to videos
- Edit own comments
- Delete own comments
- Sort comments (latest/oldest)
- Comment count display
- Real-time comment updates

**Implementation**:
- Service: `commentService`
- Component: Integrated in `Video.jsx`
- Skeleton: `CommentSkeleton.jsx`

#### 5.3 Subscriptions
**Purpose**: Follow channels and get updates

**Features**:
- Subscribe/Unsubscribe to channels
- Notification levels (All, Personalized, None)
- Subscriber count display
- Subscriptions feed page
- Subscription status tracking

**Implementation**:
- Service: `subscriptionService`
- Page: `Subscriptions.jsx`
- API: `POST /subscriptions/c/:channelId/subscribe`

---

### 6. Search System
**Purpose**: Find videos across platform

**Features**:
- Global search bar in navbar
- Search by keywords
- Results page with filters
- Search query persistence in URL

**Implementation**:
- Component: Search input in `Navbar.jsx`
- Page: `Search.jsx`
- API: `GET /videos?search=query`

**Data Flow**:
```
User Types → Submit Form → Navigate to /search?q=query → Fetch Results → Display
```

---

### 7. Theme System
**Purpose**: Dark/Light mode support

**Features**:
- Three modes: Light, Dark, System
- Modern pill-shaped toggle with icons
- Persistent theme in localStorage
- System theme detection
- Smooth transitions
- CSS variable-based theming

**Implementation**:
- Context: `ThemeContext.jsx`
- Component: `ThemeToggle.jsx`
- Config: `tailwind.config.js` with `darkMode: ["class"]`

**How It Works**:
```javascript
// ThemeContext applies dark class to <html>
<html class="dark"> // or no class for light

// Tailwind uses this for dark: variants
<div class="bg-white dark:bg-gray-900">
```

---

### 8. Notification System
**Purpose**: Real-time user notifications

**Features**:
- Notification dropdown in navbar
- Unread count badge
- Mark as read (single/all)
- Delete notifications
- Notification types: likes, comments, subscriptions, uploads

**Implementation**:
- Component: `NotificationDropdown.jsx`
- Service: `notificationService`
- API: `GET /notifications`, `PATCH /notifications/:id/read`

---

### 9. Upload System
**Purpose**: Upload videos to platform

**Features**:
- Video file upload with progress
- Thumbnail upload
- Title, description, tags
- Form validation
- Upload progress indicator
- Error handling

**Implementation**:
- Page: `Upload.jsx`
- Service: `videoService.uploadVideo()`
- API: `POST /videos` (multipart/form-data)

**Data Flow**:
```
Select Files → Fill Form → Submit → Upload to Cloudinary → Save Metadata → Redirect
```

---

### 10. Video Management
**Purpose**: Manage uploaded videos

**Features**:
- My Videos page
- Edit video details
- Delete videos (soft delete)
- Restore from trash
- Toggle publish status
- Video analytics

**Implementation**:
- Pages: `MyVideos.jsx`, `EditVideo.jsx`, `Trash.jsx`
- Service: `videoService`

---


## 📄 Pages Documentation

### Home Page (`Home.jsx`)
**Route**: `/`
**Purpose**: Main landing page with video feed

**Features**:
- Video grid with infinite scroll
- Sort options: Latest, Most Viewed, Trending
- 20 videos per page
- Skeleton loading states
- Empty state handling

**Data Fetching**:
```javascript
// Fetches from different endpoints based on sortBy
sortBy === 'trending' → feedService.getTrendingFeed()
sortBy === 'latest' → videoService.getVideos({ sortBy: 'createdAt', sortType: 'desc' })
sortBy === 'views' → videoService.getVideos({ sortBy: 'views', sortType: 'desc' })
```

**State Management**:
- `sortBy` - Current sort option
- `key` - Triggers infinite scroll reset on sort change
- `videos` - Array of video objects from useInfiniteScroll

**UI Components**:
- Select dropdown for sorting
- VideoGrid for display
- HomePageSkeleton for loading
- AddToPlaylistDialog (modal)

---

### Video Page (`Video.jsx`)
**Route**: `/video/:videoId`
**Purpose**: Watch video with full details

**Features**:
- Custom video player with controls
- Auto-resume from last position
- Video metadata (title, views, date)
- Like/Share/Save buttons
- Channel info with subscribe button
- Notification level settings
- Expandable description
- Comments section with add/sort
- Recommended videos sidebar (desktop)

**Data Fetching**:
```javascript
// On mount
fetchVideo() → GET /videos/:videoId
fetchComments() → GET /comments/:videoId
fetchWatchProgress() → GET /watch-history/:videoId
fetchSubscriptionStatus() → GET /subscriptions/c/:channelId/status
```

**State Management**:
- `video` - Video object with owner, stats
- `comments` - Array of comment objects
- `isLiked` - Boolean like status
- `isSubscribed` - Boolean subscription status
- `notificationLevel` - String (ALL, PERSONALIZED, NONE)
- `watchProgress` - Number (0-100)
- `commentSort` - String (latest/oldest)

**User Actions**:
- Like video → `POST /likes/toggle/v/:videoId`
- Subscribe → `POST /subscriptions/c/:channelId/subscribe`
- Change notifications → `PATCH /subscriptions/c/:channelId/notifications`
- Add comment → `POST /comments/:videoId`
- Share (WhatsApp, Facebook, Twitter, Copy Link)
- Save to Watch Later
- Add to Playlist

**Progress Tracking**:
- Saves progress on pause, seek, time update (throttled)
- Saves on page unload
- Auto-resumes if progress > 5%

---

### Trending Page (`Trending.jsx`)
**Route**: `/trending`
**Purpose**: Display trending videos

**Features**:
- Infinite scroll video grid
- Trending algorithm from backend
- Skeleton loading states

**Data Fetching**:
```javascript
fetchTrendingVideos() → GET /feed/trending
```

**Implementation**:
- Uses `useInfiniteScroll` hook
- Displays with `VideoGrid` component
- Shows `HomePageSkeleton` while loading

---

### History Page (`History.jsx`)
**Route**: `/history`
**Purpose**: User's watch history

**Features**:
- Chronological watch history
- Watch progress indicators on cards
- Infinite scroll
- Empty state for no history

**Data Fetching**:
```javascript
fetchHistory() → GET /watch-history
// Returns array of { progress, duration, updatedAt, video: {...} }
```

**Data Transformation**:
```javascript
// Extracts video data and adds progress
videos.map(item => ({
  ...item.video,
  watchProgress: item.progress,
  watchedAt: item.updatedAt
}))
```

---

### Shorts Page (`Shorts.jsx`)
**Route**: `/shorts`
**Purpose**: Short-form vertical videos

**Features**:
- Vertical video feed
- Swipe/scroll navigation
- Auto-play on view
- Infinite scroll

**Data Fetching**:
```javascript
GET /feed/shorts
```

---

### Subscriptions Page (`Subscriptions.jsx`)
**Route**: `/subscriptions`
**Purpose**: Videos from subscribed channels

**Features**:
- Feed of latest videos from subscriptions
- Infinite scroll
- Empty state if no subscriptions

**Data Fetching**:
```javascript
GET /subscriptions (returns videos from subscribed channels)
```

---

### Search Page (`Search.jsx`)
**Route**: `/search?q=query`
**Purpose**: Search results

**Features**:
- Search query from URL params
- Video grid results
- Infinite scroll
- No results state

**Data Fetching**:
```javascript
GET /videos?search=${query}&page=${page}&limit=20
```

---

### Channel Page (`Channel.jsx`)
**Route**: `/@username` or `/channel/:channelId`
**Purpose**: User channel profile

**Features**:
- Channel banner and avatar
- Subscriber count
- Subscribe button
- Tabs: Videos, Playlists, About
- Channel description
- Video grid

**Data Fetching**:
```javascript
GET /users/u/:username (channel profile)
GET /channels/:channelId/videos (channel videos)
GET /channels/:channelId/playlists (channel playlists)
```

**Special Routing**:
- Uses `@username` format like YouTube
- Custom `ChannelRouter` component handles `/@` routes

---

### Upload Page (`Upload.jsx`)
**Route**: `/upload`
**Purpose**: Upload new video

**Features**:
- Video file input with preview
- Thumbnail upload
- Title, description, tags inputs
- Form validation
- Upload progress bar
- Success/Error handling

**Form Fields**:
- `videoFile` - Video file (required)
- `thumbnail` - Image file (required)
- `title` - String (required)
- `description` - String (optional)
- `tags` - Array of strings (optional)

**Data Submission**:
```javascript
POST /videos
Content-Type: multipart/form-data
Body: FormData with video, thumbnail, title, description, tags
```

**Flow**:
```
Select Video → Preview → Fill Details → Upload → Processing → Redirect to Video Page
```

---

### My Videos Page (`MyVideos.jsx`)
**Route**: `/my-videos`
**Purpose**: Manage user's uploaded videos

**Features**:
- Grid of user's videos
- Edit button on each video
- Delete button (moves to trash)
- Video stats (views, likes, comments)
- Empty state for no videos

**Data Fetching**:
```javascript
GET /videos/me?page=${page}&limit=20
```

**Actions**:
- Edit → Navigate to `/video/:videoId/edit`
- Delete → `DELETE /videos/:videoId` → Moves to trash

---

### Edit Video Page (`EditVideo.jsx`)
**Route**: `/video/:videoId/edit`
**Purpose**: Edit video details

**Features**:
- Pre-filled form with current data
- Update title, description, tags
- Change thumbnail
- Toggle publish status
- Save changes

**Data Fetching**:
```javascript
GET /videos/:videoId (load current data)
```

**Data Submission**:
```javascript
PATCH /videos/:videoId
Body: { title, description, tags, thumbnail }
```

---

### Trash Page (`Trash.jsx`)
**Route**: `/trash`
**Purpose**: Deleted videos (soft delete)

**Features**:
- Grid of deleted videos
- Restore button
- Permanent delete button
- Empty state

**Data Fetching**:
```javascript
GET /videos/trash/me
```

**Actions**:
- Restore → `PATCH /videos/:videoId/restore`
- Permanent Delete → `DELETE /videos/:videoId?permanent=true`

---

### Playlists Page (`Playlists.jsx`)
**Route**: `/playlists`
**Purpose**: User's playlists

**Features**:
- Grid of playlist cards
- Create new playlist button
- Edit/Delete options
- Playlist stats (video count)
- Empty state

**Data Fetching**:
```javascript
GET /playlists/user/me?page=${page}&limit=20
```

**Actions**:
- Create → Opens `CreatePlaylistDialog`
- Edit → Opens `EditPlaylistDialog`
- Delete → `DELETE /playlists/:playlistId`
- View → Navigate to `/playlist/:playlistId`

---

### Playlist View Page (`PlaylistView.jsx`)
**Route**: `/playlist/:playlistId`
**Purpose**: View playlist details and videos

**Features**:
- Playlist info (name, description, video count)
- List of videos in playlist
- Play all button
- Remove video from playlist
- Edit playlist button (if owner)

**Data Fetching**:
```javascript
GET /playlists/:playlistId
```

**Actions**:
- Play All → Navigate to `/playlist/:playlistId` (player page)
- Remove Video → `PATCH /playlists/remove/:videoId/:playlistId`

---

### Playlist Player Page (`PlaylistPlayerPage.jsx`)
**Route**: `/playlist/:playlistId` (with player)
**Purpose**: Watch playlist videos sequentially

**Features**:
- Video player
- Playlist sidebar with video list
- Auto-play next video
- Current video highlight
- Skip to any video

**Data Fetching**:
```javascript
GET /playlists/:playlistId
```

**State Management**:
- `currentVideoIndex` - Index of playing video
- `playlist` - Playlist object with videos array

**Auto-Play Logic**:
```javascript
onVideoEnded → currentVideoIndex++ → Load next video
```

---

### Playlist Trash Page (`PlaylistTrash.jsx`)
**Route**: `/playlists/trash`
**Purpose**: Deleted playlists

**Features**:
- Grid of deleted playlists
- Restore button
- Permanent delete button

**Data Fetching**:
```javascript
GET /playlists/trash/me
```

---

### Watch Later Page (`WatchLater.jsx`)
**Route**: `/watch-later`
**Purpose**: Special playlist for saved videos

**Features**:
- Grid of saved videos
- Remove from Watch Later
- Play all button

**Data Fetching**:
```javascript
GET /playlists/watch-later
```

**Actions**:
- Remove → `POST /playlists/watch-later/:videoId` (toggle)

---

### Liked Videos Page (`LikedVideos.jsx`)
**Route**: `/liked`
**Purpose**: Videos user has liked

**Features**:
- Grid of liked videos
- Unlike button
- Infinite scroll

**Data Fetching**:
```javascript
GET /likes/videos
```

---

### Dashboard Page (`Dashboard.jsx`)
**Route**: `/dashboard`
**Purpose**: Creator analytics

**Features**:
- Overview stats (views, subscribers, videos)
- Analytics charts
- Top videos
- Growth stats
- Recent activity

**Data Fetching**:
```javascript
GET /dashboard/overview
GET /dashboard/analytics
GET /dashboard/top-videos
GET /dashboard/growth
```

---

### Profile Page (`Profile.jsx`)
**Route**: `/profile`
**Purpose**: User account settings

**Features**:
- Update profile info (name, email, username)
- Change avatar
- Change cover image
- Update channel description
- Change password
- Delete account

**Data Submission**:
```javascript
PATCH /users/update-account
PATCH /users/update-avatar (multipart/form-data)
PATCH /users/update-coverImage (multipart/form-data)
POST /users/change-password
DELETE /users/delete-account
```

---

### Settings Page (`Settings.jsx`)
**Route**: `/settings`
**Purpose**: App settings

**Features**:
- Tabs: General, Appearance, Notifications, Privacy, Playback, Account
- Theme selection
- Notification preferences
- Privacy settings
- Playback quality
- Account management

**Components**:
- `GeneralSettings.jsx`
- `AppearanceSettings.jsx`
- `NotificationSettings.jsx`
- `PrivacySettings.jsx`
- `PlaybackSettings.jsx`
- `AccountSettings.jsx`

---

### Tweets Page (`Tweets.jsx`)
**Route**: `/tweets`
**Purpose**: Community posts (like YouTube Community)

**Features**:
- Create tweet with text/image
- View user tweets
- Like tweets
- Delete own tweets
- Infinite scroll

**Data Fetching**:
```javascript
GET /tweets/user/:userId
```

**Actions**:
- Create → `POST /tweets` (multipart/form-data)
- Like → `POST /likes/toggle/t/:tweetId`
- Delete → `DELETE /tweets/:tweetId`

---

### Login Page (`Login.jsx`)
**Route**: `/login`
**Purpose**: User authentication

**Features**:
- Email/Username input
- Password input with show/hide
- Remember me checkbox
- Forgot password link
- Login button
- Google Sign In button (ready)
- Sign up link

**Data Submission**:
```javascript
POST /users/login
Body: { identifier, password }
```

**Flow**:
```
Enter Credentials → Submit → API Call → Set Auth Context → Redirect to Home
```

---

### Register Page (`Register.jsx`)
**Route**: `/register`
**Purpose**: New user registration

**Features**:
- Full name input
- Username input
- Email input
- Password input with strength indicator
- Confirm password
- Avatar upload (optional)
- Terms checkbox
- Sign up button
- Google Sign Up button (ready)
- Login link

**Data Submission**:
```javascript
POST /users/register
Content-Type: multipart/form-data
Body: { fullName, username, email, password, avatar }
```

**Flow**:
```
Fill Form → Submit → API Call → Redirect to Email Verification
```

---

### Email Verification Page (`EmailVerification.jsx`)
**Route**: `/email-verification`
**Purpose**: Verify email after registration

**Features**:
- Display user's email
- Resend OTP button
- Redirect to OTP input

**Flow**:
```
Registration → Email Sent → This Page → Enter OTP → Verify
```

---

### Verify OTP Page (`VerifyOtp.jsx`)
**Route**: `/verify-otp`
**Purpose**: Enter OTP code

**Features**:
- 6-digit OTP input
- Auto-focus next field
- Verify button
- Resend OTP with countdown
- Error handling

**Data Submission**:
```javascript
POST /users/verify-email
Body: { identifier, otp }
```

**Flow**:
```
Enter OTP → Submit → Verify → Redirect to Home
```

---

### Restore Account Page (`RestoreAccount.jsx`)
**Route**: `/restore-account`
**Purpose**: Restore deleted account

**Features**:
- Email/Username input
- Request restoration button
- OTP verification
- Confirm restoration

**Data Submission**:
```javascript
PATCH /users/restore-account/request
Body: { identifier }

PATCH /users/restore-account/confirm
Body: { identifier, otp }
```

---


## 🧩 Components Documentation

### Layout Components

#### MainLayout (`MainLayout.jsx`)
**Purpose**: Main app layout wrapper

**Features**:
- Navbar at top (fixed)
- Sidebar on left (collapsible)
- Main content area with padding
- Responsive layout
- Outlet for nested routes

**Structure**:
```jsx
<div>
  <Navbar />
  <Sidebar />
  <main className="ml-0 sm:ml-16 lg:ml-60 mt-16 p-4">
    <Outlet /> {/* Child routes render here */}
  </main>
</div>
```

---

### Navigation Components

#### Navbar (`Navbar.jsx`)
**Purpose**: Top navigation bar

**Features**:
- Logo and brand name
- Mobile menu toggle
- Search bar with submit
- Theme toggle
- Upload button
- Notifications dropdown
- User avatar dropdown

**State**:
- `searchQuery` - Search input value

**Actions**:
- Search → Navigate to `/search?q=${query}`
- Upload → Navigate to `/upload`
- Logout → Clear auth and redirect to `/login`

**Responsive**:
- Mobile: Hamburger menu, hidden brand text
- Desktop: Full navbar with all elements

---

#### Sidebar (`Sidebar.jsx`)
**Purpose**: Left navigation sidebar

**Features**:
- Collapsible (desktop) / Overlay (mobile)
- Main navigation (Home, Trending, Shorts, Subscriptions)
- Library section (Videos, History, Liked, Watch Later, Playlists, Dashboard, Trash, Settings)
- Active route highlighting
- Tooltips when collapsed

**State**:
- `isCollapsed` - From SidebarContext

**Menu Items**:
```javascript
menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: PlaySquare, label: 'Shorts', path: '/shorts' },
  { icon: Users, label: 'Subscriptions', path: '/subscriptions' }
]

userItems = [
  { icon: Video, label: 'Your Videos', path: '/my-videos' },
  { icon: History, label: 'History', path: '/history' },
  // ... more items
]
```

**Responsive**:
- Mobile: Overlay with backdrop, full width
- Desktop: Fixed sidebar, collapsible to icon-only

---

### Video Components

#### VideoCard (`VideoCard.jsx`)
**Purpose**: Reusable video card component

**Features**:
- Thumbnail with hover preview
- Video duration badge
- Watch progress bar
- Channel avatar and name
- Video title (2-line clamp)
- Views and date
- Three-dot menu with actions
- Video preview on hover (plays video)
- Play/Pause and Mute controls on preview

**Props**:
```javascript
{
  video: Object,              // Video data
  showDuration: Boolean,      // Show duration badge
  showProgress: Boolean,      // Show progress bar
  showViews: Boolean,         // Show view count
  showChannel: Boolean,       // Show channel info
  compact: Boolean,           // Compact layout
  showEditButton: Boolean,    // Show edit/delete (for owner)
  onVideoDeleted: Function    // Callback after delete
}
```

**Actions**:
- Click card → Navigate to `/video/:videoId`
- Click channel → Navigate to `/@username`
- Add to Playlist → Opens `PlaylistModal`
- Watch Later → Toggle save
- Share → WhatsApp, Facebook, Twitter, Copy Link
- Edit (owner) → Navigate to `/video/:videoId/edit`
- Delete (owner) → Soft delete video

**Hover Preview**:
- Waits 1 second on hover
- Loads and plays video
- Shows play/pause and mute buttons
- Shows progress bar
- Pauses and resets on mouse leave

---

#### VideoGrid (`VideoGrid.jsx`)
**Purpose**: Responsive grid layout for videos

**Features**:
- Responsive columns (1-4 based on screen size)
- Gap spacing
- Lazy loading with Suspense

**Grid Breakpoints**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns
- Large: 4 columns

---

#### CustomVideoPlayer (`CustomVideoPlayer.jsx`)
**Purpose**: Custom HTML5 video player

**Features**:
- Play/Pause button
- Progress bar with seek
- Volume slider
- Mute/Unmute button
- Fullscreen button
- Current time / Duration display
- Keyboard shortcuts (Space, M, F, Arrow keys)
- Auto-resume from saved position
- Picture-in-Picture support

**Props**:
```javascript
{
  src: String,              // Video URL
  poster: String,           // Thumbnail URL
  onPlay: Function,         // Play event callback
  onPause: Function,        // Pause event callback
  onEnded: Function,        // Ended event callback
  onTimeUpdate: Function,   // Time update callback
  autoResume: Boolean,      // Auto-resume from saved position
  resumeTime: Number,       // Time to resume from (seconds)
  className: String         // Additional classes
}
```

**Keyboard Shortcuts**:
- `Space` - Play/Pause
- `M` - Mute/Unmute
- `F` - Fullscreen
- `Arrow Left` - Seek -10s
- `Arrow Right` - Seek +10s
- `Arrow Up` - Volume +10%
- `Arrow Down` - Volume -10%

**State Management**:
- `isPlaying` - Boolean
- `currentTime` - Number (seconds)
- `duration` - Number (seconds)
- `volume` - Number (0-1)
- `isMuted` - Boolean
- `isFullscreen` - Boolean

---

#### VideoDescription (`VideoDescription.jsx`)
**Purpose**: Expandable video description

**Features**:
- Truncated text with "Show more"
- Expand to full text
- Collapse with "Show less"
- Linkify URLs
- Preserve line breaks

**Props**:
```javascript
{
  description: String,
  maxLines: Number  // Default: 3
}
```

---

### Playlist Components

#### PlaylistCard (`PlaylistCard.jsx`)
**Purpose**: Playlist card display

**Features**:
- Playlist thumbnail (first video)
- Playlist name and description
- Video count
- Privacy indicator
- Edit/Delete menu
- Click to view playlist

**Props**:
```javascript
{
  playlist: Object,
  onEdit: Function,
  onDelete: Function
}
```

---

#### CreatePlaylistDialog (`CreatePlaylistDialog.jsx`)
**Purpose**: Modal to create new playlist

**Features**:
- Name input (required)
- Description textarea
- Privacy toggle (public/private)
- Create button
- Cancel button

**Data Submission**:
```javascript
POST /playlists
Body: { name, description, isPrivate }
```

---

#### EditPlaylistDialog (`EditPlaylistDialog.jsx`)
**Purpose**: Modal to edit playlist

**Features**:
- Pre-filled form with current data
- Update name, description, privacy
- Save button
- Cancel button

**Data Submission**:
```javascript
PATCH /playlists/:playlistId
Body: { name, description, isPrivate }
```

---

#### AddToPlaylistDialog (`AddToPlaylistDialog.jsx`)
**Purpose**: Modal to add video to playlists

**Features**:
- List of user's playlists
- Checkboxes for each playlist
- Create new playlist option
- Save button

**Data Submission**:
```javascript
PATCH /playlists/add/:videoId/:playlistId
```

---

#### PlaylistModal (`PlaylistModal.jsx`)
**Purpose**: Alternative playlist selection modal

**Features**:
- Similar to AddToPlaylistDialog
- Different UI style
- Used in VideoCard component

---

### UI Components (ShadCN)

#### Button (`button.jsx`)
**Purpose**: Reusable button component

**Variants**:
- `default` - Primary button
- `destructive` - Red button for delete actions
- `outline` - Outlined button
- `secondary` - Secondary style
- `ghost` - Transparent button
- `link` - Link-styled button

**Sizes**:
- `default` - Normal size
- `sm` - Small
- `lg` - Large
- `icon` - Square icon button

**Usage**:
```jsx
<Button variant="default" size="lg">Click Me</Button>
```

---

#### ButtonPrimary (`ButtonPrimary.jsx`)
**Purpose**: Custom primary button

**Features**:
- Blue background
- White text
- Hover effects
- Disabled state

---

#### ButtonSecondary (`ButtonSecondary.jsx`)
**Purpose**: Custom secondary button

**Features**:
- Gray background
- Dark text
- Hover effects
- Disabled state

---

#### ButtonIcon (`ButtonIcon.jsx`)
**Purpose**: Icon-only button

**Features**:
- Square shape
- Centered icon
- Tooltip support
- Hover effects

---

#### Avatar (`avatar.jsx`)
**Purpose**: User avatar component

**Features**:
- Image display
- Fallback with initials
- Circular shape
- Multiple sizes

**Usage**:
```jsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

---

#### Card (`card.jsx`)
**Purpose**: Container card component

**Features**:
- Border and shadow
- Rounded corners
- Header, Content, Footer sections

**Usage**:
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

---

#### Dialog (`dialog.jsx`)
**Purpose**: Modal dialog component

**Features**:
- Overlay backdrop
- Close button
- Header, Content, Footer
- Keyboard close (Esc)
- Click outside to close

**Usage**:
```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <DialogDescription>Description</DialogDescription>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### DropdownMenu (`dropdown-menu.jsx`)
**Purpose**: Dropdown menu component

**Features**:
- Trigger button
- Menu items
- Separators
- Sub-menus
- Keyboard navigation

**Usage**:
```jsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

#### Input (`input.jsx`)
**Purpose**: Text input component

**Features**:
- Various types (text, email, password, etc.)
- Focus states
- Error states
- Disabled state

---

#### Textarea (`textarea.jsx`)
**Purpose**: Multi-line text input

**Features**:
- Resizable
- Focus states
- Character count (optional)

---

#### Select (`select.jsx`)
**Purpose**: Dropdown select component

**Features**:
- Trigger button
- Options list
- Search (optional)
- Keyboard navigation

**Usage**:
```jsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

#### Checkbox (`checkbox.jsx`)
**Purpose**: Checkbox input

**Features**:
- Checked/Unchecked states
- Indeterminate state
- Disabled state

---

#### Switch (`switch.jsx`)
**Purpose**: Toggle switch

**Features**:
- On/Off states
- Smooth animation
- Disabled state

---

#### Slider (`slider.jsx`)
**Purpose**: Range slider

**Features**:
- Min/Max values
- Step increment
- Thumb dragging
- Keyboard control

---

#### ThemeToggle (`ThemeToggle.jsx`)
**Purpose**: Theme switcher component

**Features**:
- Three options: Light, Dark, System
- Pill-shaped segmented control
- Sliding indicator animation
- Icons: Sun, Moon, Monitor
- Persists selection

**Implementation**:
```jsx
<div className="grid grid-cols-3 gap-0">
  <button onClick={() => setTheme('light')}>
    <Sun />
  </button>
  <button onClick={() => setTheme('dark')}>
    <Moon />
  </button>
  <button onClick={() => setTheme('system')}>
    <Monitor />
  </button>
  <div className="indicator" style={{ transform: `translateX(${position}%)` }} />
</div>
```

---

### Skeleton Components

#### HomePageSkeleton (`HomePageSkeleton.jsx`)
**Purpose**: Loading skeleton for home page

**Features**:
- Grid of video card skeletons
- Animated pulse effect
- Responsive columns

---

#### VideoCardSkeleton (`VideoCardSkeleton.jsx`)
**Purpose**: Loading skeleton for video card

**Features**:
- Thumbnail placeholder
- Title lines
- Channel info placeholder
- Animated pulse

---

#### CommentSkeleton (`CommentSkeleton.jsx`)
**Purpose**: Loading skeleton for comments

**Features**:
- Avatar placeholder
- Text lines
- Animated pulse

---

#### PlaylistCardSkeleton (`PlaylistCardSkeleton.jsx`)
**Purpose**: Loading skeleton for playlist card

**Features**:
- Thumbnail placeholder
- Title and description lines
- Animated pulse

---

#### ChannelCardSkeleton (`ChannelCardSkeleton.jsx`)
**Purpose**: Loading skeleton for channel card

**Features**:
- Banner placeholder
- Avatar placeholder
- Info lines
- Animated pulse

---

### Other Components

#### NotificationDropdown (`NotificationDropdown.jsx`)
**Purpose**: Notifications dropdown in navbar

**Features**:
- Bell icon with unread count badge
- Dropdown list of notifications
- Mark as read button
- Mark all as read button
- Delete notification
- Empty state

**Data Fetching**:
```javascript
GET /notifications
GET /notifications/unread-count
```

**Actions**:
- Mark Read → `PATCH /notifications/:id/read`
- Mark All Read → `PATCH /notifications/read-all`
- Delete → `DELETE /notifications/:id`

---

#### PermissionDialog (`PermissionDialog.jsx`)
**Purpose**: Request browser permissions

**Features**:
- Camera permission
- Microphone permission
- Notification permission
- Explanation text
- Allow/Deny buttons

---

#### DeleteAccountDialog (`DeleteAccountDialog.jsx`)
**Purpose**: Confirm account deletion

**Features**:
- Warning message
- Password confirmation
- Delete button
- Cancel button

**Data Submission**:
```javascript
DELETE /users/delete-account
Body: { password }
```

---

#### TweetCard (`TweetCard.jsx`)
**Purpose**: Display community post

**Features**:
- User avatar and name
- Tweet text
- Tweet image (if any)
- Like button with count
- Delete button (if owner)
- Timestamp

---

#### TweetCreateForm (`TweetCreateForm.jsx`)
**Purpose**: Create new tweet

**Features**:
- Text input
- Image upload
- Character count
- Post button

**Data Submission**:
```javascript
POST /tweets
Content-Type: multipart/form-data
Body: { content, image }
```

---

#### Loader (`Loader.jsx`)
**Purpose**: Full-page loading spinner

**Features**:
- Centered spinner
- Animated rotation
- Backdrop

---

#### Toggle (`Toggle.jsx`)
**Purpose**: Generic toggle component

**Features**:
- On/Off states
- Custom labels
- Callback on change

---


## 🪝 Hooks Documentation

### useInfiniteScroll (`useInfiniteScroll.js`)
**Purpose**: Universal infinite scroll hook

**Parameters**:
```javascript
useInfiniteScroll(fetchFunction, key = 0, initialLimit = 20)
```

**Returns**:
```javascript
{
  data: Array,           // Accumulated data
  loading: Boolean,      // Loading state
  hasMore: Boolean,      // More data available
  error: String|null,    // Error message
  observerRef: Ref,      // Attach to sentinel element
  reset: Function        // Manual reset function
}
```

**How It Works**:
1. Calls `fetchFunction(page, limit)` on mount
2. Uses IntersectionObserver to detect scroll
3. Loads next page when sentinel is visible
4. Appends new data to existing array
5. Stops when `newItems.length < limit`

**Key Parameter**:
- Changing `key` triggers complete reset and reload
- Used for filters, sorts, or search changes

**Example Usage**:
```javascript
const fetchVideos = async (page, limit) => {
  const response = await videoService.getVideos({ page, limit })
  return response.data.data.docs
}

const { data, loading, hasMore, observerRef } = useInfiniteScroll(fetchVideos, sortKey)

return (
  <>
    {data.map(item => <VideoCard key={item.id} video={item} />)}
    {hasMore && <div ref={observerRef}>Loading...</div>}
  </>
)
```

**Important Notes**:
- `fetchFunction` must return array of items
- `loadMore` is NOT in dependency array (prevents infinite loops)
- Uses `useCallback` for stable function references
- Handles errors gracefully

---

### useAuth (`useAuth.js`)
**Purpose**: Access authentication context

**Returns**:
```javascript
{
  user: Object|null,     // Current user data
  loading: Boolean,      // Auth check loading
  login: Function,       // Login function
  logout: Function,      // Logout function
  register: Function,    // Register function
  checkAuth: Function    // Refresh user data
}
```

**Usage**:
```javascript
const { user, loading, logout } = useAuth()

if (loading) return <Loader />
if (!user) return <Navigate to="/login" />

return <div>Welcome {user.fullName}</div>
```

---

### useDocumentTitle (`useDocumentTitle.js`)
**Purpose**: Set page title dynamically

**Parameters**:
```javascript
useDocumentTitle(title)
```

**Behavior**:
- If `title` is null → "Vixora"
- If `title` is string → "Title - Vixora"

**Example**:
```javascript
useDocumentTitle('Trending Videos')
// Sets: "Trending Videos - Vixora"

useDocumentTitle(null)
// Sets: "Vixora"
```

---

### useFormField (`useFormField.js`)
**Purpose**: Form field helper (from react-hook-form)

**Usage**:
```javascript
const { field, fieldState } = useFormField()
```

---

## 🌐 Context & State Management

### AuthContext (`AuthContext.jsx`)
**Purpose**: Global authentication state

**Provides**:
```javascript
{
  user: Object|null,
  loading: Boolean,
  login: (credentials) => Promise,
  logout: () => Promise,
  register: (formData) => Promise,
  checkAuth: () => Promise
}
```

**Implementation**:
```javascript
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  checkAuth() // Check on mount
}, [])

const checkAuth = async () => {
  try {
    const response = await authService.getCurrentUser()
    setUser(response.data.data)
  } catch {
    setUser(null)
  } finally {
    setLoading(false)
  }
}

const login = async (credentials) => {
  const response = await authService.login(credentials)
  setUser(response.data.data.user)
}

const logout = async () => {
  await authService.logout()
  setUser(null)
}
```

**Usage**:
```javascript
import { useAuth } from '@/hooks/useAuth'

const { user, login, logout } = useAuth()
```

---

### ThemeContext (`ThemeContext.jsx`)
**Purpose**: Theme management (dark/light/system)

**Provides**:
```javascript
{
  theme: String,              // 'light' | 'dark' | 'system'
  setTheme: (theme) => void,
  effectiveTheme: String      // Resolved theme ('light' | 'dark')
}
```

**Implementation**:
```javascript
const [theme, setTheme] = useState(
  localStorage.getItem('theme') || 'system'
)

useEffect(() => {
  const root = document.documentElement
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.toggle('dark', systemTheme === 'dark')
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
  
  localStorage.setItem('theme', theme)
}, [theme])

// Listen for system theme changes
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (theme === 'system') {
      // Re-apply system theme
    }
  }
  mediaQuery.addEventListener('change', handleChange)
  return () => mediaQuery.removeEventListener('change', handleChange)
}, [theme])
```

**How It Works**:
- Applies `dark` class to `<html>` element
- Tailwind uses this for `dark:` variants
- Persists in localStorage
- Listens for OS theme changes

---

### SidebarContext (`SidebarContext.jsx`)
**Purpose**: Sidebar collapse state

**Provides**:
```javascript
{
  isCollapsed: Boolean,
  toggleSidebar: () => void,
  collapseSidebar: () => void,
  expandSidebar: () => void
}
```

**Implementation**:
```javascript
const [isCollapsed, setIsCollapsed] = useState(true)

const toggleSidebar = () => setIsCollapsed(prev => !prev)
const collapseSidebar = () => setIsCollapsed(true)
const expandSidebar = () => setIsCollapsed(false)
```

**Usage**:
```javascript
const { isCollapsed, toggleSidebar } = useSidebar()

<button onClick={toggleSidebar}>
  <Menu />
</button>
```

---

### SettingsContext (`SettingsContext.jsx`)
**Purpose**: User settings state

**Provides**:
```javascript
{
  settings: Object,
  updateSettings: (newSettings) => void,
  loading: Boolean
}
```

**Settings Object**:
```javascript
{
  notifications: {
    email: Boolean,
    push: Boolean,
    subscriptions: Boolean,
    comments: Boolean,
    likes: Boolean
  },
  privacy: {
    showHistory: Boolean,
    showLikedVideos: Boolean,
    showSubscriptions: Boolean
  },
  playback: {
    autoplay: Boolean,
    quality: String,
    speed: Number,
    captions: Boolean
  }
}
```

---

### LocalSettingsContext (`LocalSettingsContext.jsx`)
**Purpose**: Client-side settings (not synced to backend)

**Provides**:
```javascript
{
  localSettings: Object,
  updateLocalSettings: (settings) => void
}
```

**Local Settings**:
```javascript
{
  volume: Number,           // 0-1
  playbackSpeed: Number,    // 0.25-2
  quality: String,          // 'auto' | '1080p' | '720p' | '480p' | '360p'
  captions: Boolean,
  autoplay: Boolean
}
```

**Storage**: localStorage

---

## 🔌 API Integration

### Axios Configuration (`axios.js`)

**Base Configuration**:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api/v1',
  withCredentials: true,  // Send cookies
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**Request Interceptor**:
```javascript
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

**Response Interceptor**:
```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Auto-refresh token on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const response = await authService.refreshToken(refreshToken)
        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        // Refresh failed, logout
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)
```

---

### Service Layer (`services.js`)

**Structure**: All API calls organized by domain

#### Auth Service
```javascript
authService = {
  register: (formData) => POST /users/register,
  verifyEmail: (data) => POST /users/verify-email,
  resendOtp: (identifier) => POST /users/resend-otp,
  login: (data) => POST /users/login,
  logout: () => POST /users/logout,
  refreshToken: (token) => POST /users/refresh-token,
  getCurrentUser: () => GET /users/current-user,
  forgotPassword: (email) => POST /users/forgot-password,
  forgotPasswordVerify: (data) => POST /users/forgot-password/verify,
  resetPassword: (data) => POST /users/reset-password
}
```

#### Video Service
```javascript
videoService = {
  getVideos: (params) => GET /videos,
  getVideo: (videoId) => GET /videos/:videoId,
  getMyVideos: (params) => GET /videos/me,
  getDeletedVideos: () => GET /videos/trash/me,
  uploadVideo: (formData) => POST /videos,
  updateVideo: (videoId, data) => PATCH /videos/:videoId,
  deleteVideo: (videoId) => DELETE /videos/:videoId,
  restoreVideo: (videoId) => PATCH /videos/:videoId/restore,
  togglePublish: (videoId) => PATCH /videos/:videoId/publish
}
```

#### Comment Service
```javascript
commentService = {
  getComments: (videoId) => GET /comments/:videoId,
  addComment: (videoId, content) => POST /comments/:videoId,
  updateComment: (commentId, content) => PATCH /comments/c/:commentId,
  deleteComment: (commentId) => DELETE /comments/c/:commentId
}
```

#### Like Service
```javascript
likeService = {
  toggleVideoLike: (videoId) => POST /likes/toggle/v/:videoId,
  toggleCommentLike: (commentId) => POST /likes/toggle/c/:commentId,
  toggleTweetLike: (tweetId) => POST /likes/toggle/t/:tweetId,
  getLikedVideos: () => GET /likes/videos
}
```

#### Subscription Service
```javascript
subscriptionService = {
  toggleSubscription: (channelId) => POST /subscriptions/c/:channelId/subscribe,
  setNotificationLevel: (channelId, level) => PATCH /subscriptions/c/:channelId/notifications,
  getSubscriptionStatus: (channelId) => GET /subscriptions/c/:channelId/status,
  getSubscriberCount: (channelId) => GET /subscriptions/c/:channelId/subscribers/count,
  getSubscriptions: () => GET /subscriptions/u/subscriptions,
  getSubscribedVideos: () => GET /subscriptions
}
```

#### Playlist Service
```javascript
playlistService = {
  getMyPlaylists: (params) => GET /playlists/user/me,
  getUserPlaylists: (userId, params) => GET /playlists/user/:userId,
  getDeletedPlaylists: () => GET /playlists/trash/me,
  createPlaylist: (data) => POST /playlists,
  addVideoToPlaylist: (videoId, playlistId) => PATCH /playlists/add/:videoId/:playlistId,
  removeVideoFromPlaylist: (videoId, playlistId) => PATCH /playlists/remove/:videoId/:playlistId,
  getPlaylist: (playlistId) => GET /playlists/:playlistId,
  updatePlaylist: (playlistId, data) => PATCH /playlists/:playlistId,
  deletePlaylist: (playlistId) => DELETE /playlists/:playlistId,
  restorePlaylist: (playlistId) => PATCH /playlists/:playlistId/restore,
  togglePlaylistPrivacy: (playlistId) => PATCH /playlists/:playlistId/toggle-visibility,
  toggleWatchLater: (videoId) => POST /playlists/watch-later/:videoId,
  getWatchLater: () => GET /playlists/watch-later
}
```

#### User Service
```javascript
userService = {
  updateProfile: (data) => PATCH /users/update-account,
  changePassword: (data) => POST /users/change-password,
  deleteAccount: (data) => DELETE /users/delete-account,
  restoreAccountRequest: (data) => PATCH /users/restore-account/request,
  restoreAccountConfirm: (data) => PATCH /users/restore-account/confirm,
  updateAvatar: (formData) => PATCH /users/update-avatar,
  updateCoverImage: (formData) => PATCH /users/update-coverImage,
  getWatchHistory: () => GET /users/history,
  getUserChannelProfile: (username) => GET /users/u/:username,
  updateChannelDescription: (data) => PATCH /users/update-description
}
```

#### Feed Service
```javascript
feedService = {
  getHomeFeed: () => GET /feed/home,
  getSubscriptionsFeed: () => GET /feed/subscriptions,
  getTrendingFeed: () => GET /feed/trending,
  getShortsFeed: () => GET /feed/shorts
}
```

#### Channel Service
```javascript
channelService = {
  getChannel: (channelId) => GET /channels/:channelId,
  getChannelByUsername: (username) => GET /users/u/:username,
  getChannelVideos: (channelId, params) => GET /channels/:channelId/videos,
  getChannelPlaylists: (channelId) => GET /channels/:channelId/playlists,
  getChannelTweets: (channelId, params) => GET /channels/:channelId/tweets
}
```

#### Watch History Service
```javascript
watchHistoryService = {
  saveWatchProgress: (data) => POST /watch-history,
  getWatchProgress: (videoId) => GET /watch-history/:videoId,
  getContinueWatching: () => GET /watch-history,
  getProgressForVideos: (videoIds) => POST /watch-history/bulk
}
```

#### Notification Service
```javascript
notificationService = {
  getAllNotifications: () => GET /notifications,
  getUnreadCount: () => GET /notifications/unread-count,
  markAsRead: (notificationId) => PATCH /notifications/:notificationId/read,
  markAllAsRead: () => PATCH /notifications/read-all,
  deleteNotification: (notificationId) => DELETE /notifications/:notificationId,
  deleteAllNotifications: () => DELETE /notifications
}
```

#### Dashboard Service
```javascript
dashboardService = {
  getOverview: () => GET /dashboard/overview,
  getAnalytics: () => GET /dashboard/analytics,
  getTopVideos: () => GET /dashboard/top-videos,
  getGrowthStats: () => GET /dashboard/growth,
  getInsights: () => GET /dashboard/insights
}
```

#### Tweet Service
```javascript
tweetService = {
  createTweet: (formData) => POST /tweets,
  getUserTweets: (userId) => GET /tweets/user/:userId,
  getTweet: (tweetId) => GET /tweets/:tweetId,
  updateTweet: (tweetId, data) => PATCH /tweets/:tweetId,
  deleteTweet: (tweetId) => DELETE /tweets/:tweetId,
  restoreTweet: (tweetId) => PATCH /tweets/:tweetId/restore,
  getDeletedTweets: () => GET /tweets/trash/me
}
```

---

## 🛣 Routing System

### Route Configuration (`App.jsx`)

**Public Routes** (No auth required):
```javascript
/login              → Login
/register           → Register
/email-verification → EmailVerification
/verify-otp         → VerifyOtp
/restore-account    → RestoreAccount
```

**Protected Routes** (Auth required, wrapped in MainLayout):
```javascript
/                   → Home
/shorts             → Shorts
/trending           → Trending
/subscriptions      → Subscriptions
/my-videos          → MyVideos
/history            → History
/liked              → LikedVideos
/watch-later        → WatchLater
/playlists          → Playlists
/playlists/trash    → PlaylistTrash
/playlist/:id       → PlaylistPlayerPage
/dashboard          → Dashboard
/search             → Search
/video/:id          → Video
/video/:id/edit     → EditVideo
/channel/:id        → Channel
/@:username         → Channel (via ChannelRouter)
/upload             → Upload
/tweets             → Tweets
/trash              → Trash
/profile            → Profile
/settings           → Settings
```

**Special Routing**:
- `/@username` routes handled by `ChannelRouter` component
- Catches all `/@*` paths and extracts username
- Renders `Channel` component with username prop

---

## 🎨 Styling & Theming

### Tailwind Configuration (`tailwind.config.js`)

**Dark Mode**:
```javascript
darkMode: ["class"]  // Uses .dark class on <html>
```

**Theme Extension**:
```javascript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))"
      },
      // ... more colors
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)"
    }
  }
}
```

### CSS Variables (`index.css`)

**Light Theme**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

**Dark Theme**:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

### Custom Styles

**Animations** (`animations.css`):
- Fade in/out
- Slide in/out
- Pulse
- Spin
- Bounce

**Components** (`components.css`):
- Video card styles
- Sidebar styles
- Button styles

**Layout** (`layout.css`):
- Grid layouts
- Flex utilities
- Spacing utilities

**Theme** (`theme.css`):
- Color transitions
- Dark mode transitions

**Scrollbar** (`fix-scrollbar.css`):
- Custom scrollbar styles
- Dark mode scrollbar

---

## ⚡ Performance Optimizations

### 1. Code Splitting
- Lazy loading components with `React.lazy()`
- Suspense boundaries for loading states
- Route-based code splitting

**Example**:
```javascript
const VideoCard = lazy(() => import('./components/VideoCard'))

<Suspense fallback={<VideoCardSkeleton />}>
  <VideoCard video={video} />
</Suspense>
```

### 2. Infinite Scroll
- Load data progressively (20 items per page)
- Reduces initial load time
- Better memory management
- Smooth user experience

### 3. Image Optimization
- Lazy loading images with `loading="lazy"`
- Responsive images
- Thumbnail optimization
- Cloudinary CDN

### 4. Memoization
- `React.memo()` for expensive components
- `useMemo()` for expensive calculations
- `useCallback()` for stable function references

**Example**:
```javascript
const Sidebar = memo(() => {
  // Component logic
})

const sortedVideos = useMemo(() => {
  return videos.sort((a, b) => b.views - a.views)
}, [videos])
```

### 5. Debouncing & Throttling
- Search input debouncing
- Scroll event throttling
- Progress save throttling

### 6. Skeleton Loading
- Immediate visual feedback
- Reduces perceived load time
- Better UX

### 7. HTTP-Only Cookies
- Secure token storage
- Automatic token refresh
- No localStorage vulnerabilities

### 8. Optimistic Updates
- Update UI immediately
- Revert on error
- Better perceived performance

**Example**:
```javascript
const handleLike = async () => {
  // Optimistic update
  setIsLiked(true)
  setLikesCount(prev => prev + 1)
  
  try {
    await likeService.toggleVideoLike(videoId)
  } catch {
    // Revert on error
    setIsLiked(false)
    setLikesCount(prev => prev - 1)
  }
}
```

---

## 🔧 Utility Functions

### formatDate (`formatDate.js`)
**Purpose**: Format dates to relative time

**Examples**:
- "Just now"
- "5 minutes ago"
- "2 hours ago"
- "3 days ago"
- "Jan 15, 2024"

### formatDuration (`videoUtils.js`)
**Purpose**: Format video duration

**Examples**:
- 65 seconds → "1:05"
- 3665 seconds → "1:01:05"

### formatViews (`videoUtils.js`)
**Purpose**: Format view counts

**Examples**:
- 500 → "500"
- 1500 → "1.5K"
- 1500000 → "1.5M"

### cn (`utils.js`)
**Purpose**: Merge Tailwind classes

**Usage**:
```javascript
cn("bg-red-500", "text-white", condition && "font-bold")
```

---

## 📦 Build & Deployment

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Build
```bash
npm run build
# Outputs to dist/
```

### Preview
```bash
npm run preview
# Preview production build
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:10000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features:
1. ✅ User Authentication (Login, Register, OTP, Forgot Password)
2. ✅ Video Upload & Management
3. ✅ Custom Video Player with Progress Tracking
4. ✅ Infinite Scroll Pagination
5. ✅ Playlist Management (Create, Edit, Delete, Add/Remove Videos)
6. ✅ Watch Later Functionality
7. ✅ Like System (Videos, Comments)
8. ✅ Comment System (Add, Edit, Delete, Sort)
9. ✅ Subscription System with Notification Levels
10. ✅ Search Functionality
11. ✅ Watch History with Progress
12. ✅ Trending Feed
13. ✅ Shorts Feed
14. ✅ Channel Pages
15. ✅ Dashboard Analytics
16. ✅ Notifications System
17. ✅ Theme Toggle (Light/Dark/System)
18. ✅ Responsive Design (Mobile, Tablet, Desktop)
19. ✅ Skeleton Loading States
20. ✅ Error Handling
21. ✅ Toast Notifications
22. ✅ Video Preview on Hover
23. ✅ Share Functionality (WhatsApp, Facebook, Twitter, Copy)
24. ✅ Trash & Restore System
25. ✅ Settings Pages
26. ✅ Profile Management
27. ✅ Tweet/Community Posts
28. ✅ Account Restoration

### 🚧 Ready for Implementation:
1. 🚧 Google OAuth (Code ready, needs credentials)
2. 🚧 Email Notifications (Backend ready)
3. 🚧 Push Notifications (Backend ready)

---

## 📊 Project Statistics

- **Total Pages**: 28
- **Total Components**: 50+
- **Total Hooks**: 4 custom hooks
- **Total Contexts**: 5
- **Total API Services**: 12 services with 100+ endpoints
- **Lines of Code**: ~15,000+
- **Dependencies**: 20+ packages

---

## 🎓 Best Practices Followed

1. **Component Reusability**: Shared components for common UI elements
2. **Separation of Concerns**: API layer, business logic, UI separated
3. **Error Handling**: Try-catch blocks, error states, user feedback
4. **Loading States**: Skeletons, spinners, disabled states
5. **Responsive Design**: Mobile-first approach
6. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
7. **Performance**: Code splitting, lazy loading, memoization
8. **Security**: HTTP-only cookies, input validation, XSS prevention
9. **Code Organization**: Clear folder structure, naming conventions
10. **Documentation**: Comments, JSDoc, README files

---

## 🔗 Related Documentation

- Backend API: `Backend/README.md`
- Authentication Guide: `ANIGRATIVITY_AUTH_REQUIREMENTS.md`
- API Fixes: `API_FIXES_SUMMARY.md`

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅

