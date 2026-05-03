import { Baby, BarChart3, BookOpen, Briefcase, Eye, FileText, Film, Flame, GraduationCap, Headphones, Layers, LayoutDashboardIcon, LucideIcon, Map, Mic, Music, PenTool, PlayCircle, Radio, Rocket, Sparkles, Target, Trophy, Users, Volume2, Zap } from "lucide-react";

export interface ISidebarRoute {
  title: string;
  url: string;
  icon: LucideIcon;
  gradient: string;
}

export interface ISidebarRouteGroup {
  title: string;
  items: ISidebarRoute[];
  icon: LucideIcon;
}

const ROUTES_PATH = {
  HOME: '/',
  LOGIN: '/login',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  LEADERBOARD: '/leaderboard',
  ROADMAP: '/roadmap',
  VOCABULARY: '/study/vocabulary',
  GRAMMAR: '/study/grammar',
  IPA: '/study/ipa',
  LISTENING: '/skills/listening',
  SPEAKING: '/skills/speaking',
  READING: '/skills/reading',
  WRITING: '/skills/writing',
  MOVIE: '/entertainment/movies',
  MUSIC: '/entertainment/musics',
  PODCAST: '/entertainment/podcasts',
  CATELOGY_KIDS: '/catelogy/kids',
  CATELOGY_TEENAGER: '/catelogy/teenager',
  CATELOGY_ADULT: '/catelogy/adult',
  PROFILE: '/profile',
  SETTINGS: '/settings',
}

const ROUTES_NAME = {
  '/dashboard': "Dashboard",
  '/leaderboard': "Bảng xếp hạng",
  '/roadmap': "Lộ trình học",
  '/study/vocabulary': "Từ vựng",
  '/study/grammar': "Ngữ pháp",
  '/study/ipa': "Phiên âm IPA",
  '/skills/listening': "Luyện nghe",
  '/skills/speaking': "Luyện nói",
  '/skills/reading': "Luyện đọc",
  '/skills/writing': "Luyện viết",
  '/entertainment/movies': "Phim & Video",
  '/entertainment/music': "Âm nhạc",
  '/entertainment/podcasts': "Podcast",
  '/catelogies/kids': "Danh mục trẻ em",
  '/catelogies/teenager': "Danh mục thiếu niên",
  '/catelogies/adult': "Danh mục người lớn",
  '/profile': "Hồ sơ",
  '/settings': "Cài đặt",
}

const SIDEBAR_ROUTES: ISidebarRouteGroup[] = [
  {
    title: 'main',
    icon: Zap,
    items: [
      {
        title: "Dashboard",
        url: ROUTES_PATH.DASHBOARD,
        icon: LayoutDashboardIcon,
        gradient: "from-blue-500 to-blue-600",
      },
      // {
      //   title: "Bảng xếp hạng",
      //   url: ROUTES_PATH.LEADERBOARD,
      //   icon: Trophy,
      //   gradient: "from-yellow-500 to-yellow-600",
      // },
      {
        title: "Lộ trình học",
        url: ROUTES_PATH.ROADMAP,
        icon: Map,
        gradient: "from-emerald-500 to-emerald-700",
      },
    ],
  },
  {
    title: 'study',
    icon: BookOpen,
    items: [
      {
        title: "Từ vựng",
        url: ROUTES_PATH.VOCABULARY,
        icon: BookOpen,
        gradient: "from-orange-500 to-red-500",
      },
      {
        title: "Ngữ pháp",
        url: ROUTES_PATH.GRAMMAR,
        icon: FileText,
        gradient: "from-pink-500 to-rose-500",
      },
      {
        title: "Phiên âm IPA",
        url: ROUTES_PATH.IPA,
        icon: Volume2,
        gradient: "from-violet-500 to-purple-500",
      },
    ],
  },
  {
    title: 'skills',
    icon: Trophy,
    items: [
      {
        title: "Luyện nghe",
        url: ROUTES_PATH.LISTENING,
        icon: Headphones,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        title: "Luyện nói",
        url: ROUTES_PATH.SPEAKING,
        icon: Mic,
        gradient: "from-green-500 to-emerald-500",
      },
      {
        title: "Luyện đọc",
        url: ROUTES_PATH.READING,
        icon: Eye,
        gradient: "from-indigo-500 to-blue-600",
      },
      {
        title: "Luyện viết",
        url: ROUTES_PATH.WRITING,
        icon: PenTool,
        gradient: "from-amber-500 to-orange-500",
      },
    ],
  },
  {
    title: 'entertainment',
    icon: Sparkles,
    items: [
      {
        title: "Phim & Video",
        url: ROUTES_PATH.MOVIE,
        icon: Film,
        gradient: "from-red-500 to-pink-500",
      },
      {
        title: "Âm nhạc",
        url: ROUTES_PATH.MUSIC,
        icon: Music,
        gradient: "from-purple-500 to-indigo-500",
      },
      {
        title: "Podcast",
        url: ROUTES_PATH.PODCAST,
        icon: Radio,
        gradient: "from-teal-500 to-cyan-500",
      },
    ],
  },
  {
    title: "catelogies",
    icon: Layers,
    items: [
      {
        title: "Danh mục trẻ em",
        url: ROUTES_PATH.CATELOGY_KIDS,
        icon: Baby,
        gradient: "from-amber-400 to-orange-500",
      },
      {
        title: "Danh mục thiếu niên",
        url: ROUTES_PATH.CATELOGY_TEENAGER,
        icon: GraduationCap,
        gradient: "from-sky-400 to-indigo-600",
      },
      {
        title: "Danh mục người lớn",
        url: ROUTES_PATH.CATELOGY_ADULT,
        icon: Briefcase,
        gradient: "from-red-400 to-red-600",
      }
    ],
  }
]

export interface IQuickAction {
  title: string;
  description: string;
  Icon: LucideIcon;
  color: string;
  href: string;
  progress?: number;
  isCompleted?: boolean;
}
const QUICK_ACTIONS: IQuickAction[] = [
  {
    title: "Tiếp tục học",
    description: "Từ vựng - Business English",
    Icon: PlayCircle,
    color: "from-green-500 to-emerald-500",
    href: ROUTES_PATH.ROADMAP,
    isCompleted: false,
  },
  {
    title: "Luyện kỹ năng",
    description: "Luyện nghe - chép chính tả",
    Icon: Target,
    color: "from-blue-500 to-cyan-500",
    href: ROUTES_PATH.LISTENING,
    isCompleted: false,
  },
  {
    title: "Học từ vựng",
    description: "Từ vựng - Business English",
    Icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    href: ROUTES_PATH.VOCABULARY,
    isCompleted: false,
  },
  {
    title: "Giải trí",
    description: "Phim & Video",
    Icon: Users,
    color: "from-orange-500 to-red-500",
    href: ROUTES_PATH.MOVIE,
    isCompleted: false,
  },
]

export interface IRecentActivity {
  title: string;
  subtitle: string;
  time: string;
  Icon: LucideIcon;
  color: string;
}

const RECENT_ACTIVITIES: IRecentActivity[] = [
  {
    title: "Hoàn thành bài học Từ vựng",
    subtitle: "Business English - Lesson 12",
    time: "2 giờ trước",
    Icon: BookOpen,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Luyện nghe Advanced",
    subtitle: "Podcast: Technology Trends",
    time: "5 giờ trước",
    Icon: Target,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Đạt chuỗi 15 ngày",
    subtitle: "Chúc mừng! Tiếp tục phát huy",
    time: "1 ngày trước",
    Icon: Flame,
    color: "from-red-500 to-pink-500",
  },
]

export const ROUTES = { SIDEBAR_ROUTES, ROUTES_PATH, ROUTES_NAME, QUICK_ACTIONS, RECENT_ACTIVITIES }