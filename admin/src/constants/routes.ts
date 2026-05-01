import {
  BarChart3,
  BookOpen,
  Database,
  Eye,
  FileText,
  Film,
  Headphones,
  History,
  Image,
  LayoutDashboard,
  LucideIcon,
  Mic,
  Music,
  PenTool,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Video,
  Volume2,
  Wrench,
  Globe,
  Award,
  Crown,
  Tag,
  Map,
  GraduationCap,
} from "lucide-react";

export interface ISidebarRoute {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface ISidebarRouteGroup {
  title: string;
  subItems: ISidebarRoute[];
  icon: LucideIcon;
}

const ROUTES_PATH = {
  // Dashboard
  DASHBOARD: '/',
  OVERVIEW: '/',
  REPORTS: '/dashboard/reports',
  ANALYTICS: '/dashboard/analytics',

  // Learning Management
  ROADMAP: '/roadmap',
  // Support
  SUPPORT: '/support',

  // User Management
  USER_LIST: '/user/list',
  USER_SCORES: '/user/scores',
  ROLES_PERMISSIONS: '/user/roles',

  // Content Library
  GRAMMAR: '/content/grammar',
  VOCABULARY: '/content/vocabulary',
  IPA: '/content/ipa',
  LISTENING: '/content/listening',
  SPEAKING: '/content/speaking',
  READING: '/content/reading',
  WRITING: '/content/writing',

  // Entertainment
  MOVIES: '/entertainment/movie',
  MUSIC: '/entertainment/music',
  PODCAST: '/entertainment/podcast',

  // AI & Technology
  TEXT_GENERATION: '/ai/text',
  IMAGE_GENERATION: '/ai/image',
  AUDIO_GENERATION: '/ai/audio',

  // Media Management
  IMAGES: '/media/image',
  AUDIO: '/media/audio',
  VIDEOS: '/media/video',

  // Communications
  EMAIL_TEMPLATES: '/communications/email',
  PUSH_NOTIFICATIONS: '/communications/push',
  GENERAL_NOTIFICATIONS: '/communications/general',
  COMMUNICATION_HISTORY: '/communications/history',

  // Leaderboard & Tasks
  LEADERBOARD: '/leaderboard',
  LEADERBOARD_RANKS: '/leaderboard/ranks',
  LEADERBOARD_TASKS: '/leaderboard/tasks',
  LEADERBOARD_SETTINGS: '/leaderboard/settings',
  LEADERBOARD_ANALYTICS: '/leaderboard/analytics',

  // Center Management
  CLASSES: '/center-management/classes',
  DOCUMENTS: '/center-management/documents',
  HOMEWORK: '/center-management/homework',

  // System & Settings
  GENERAL_SETTINGS: '/system/settings',
  SECURITY: '/system/security',
  SYSTEM_LOGS: '/system/logs',
  BACKUP_RESTORE: '/system/backup',
  MAINTENANCE: '/system/maintenance',
  LOCALIZATION: '/system/localization',

  // Billing
  BILLING_PLANS: '/billing/plans',
  BILLING_PAYMENTS: '/billing/payments',
  BILLING_COUPONS: '/billing/coupons',
}

const ROUTES_NAME = {
  // Dashboard
  '/dashboard': "Bảng điều khiển",
  '/': "Tổng quan",
  '/dashboard/activities': "Lịch sử hoạt động",
  '/dashboard/reports': "Báo cáo",
  '/dashboard/analytics': "Phân tích",

  // Learning Management
  '/roadmap': "Lộ trình học",

  // User Management
  '/user/list': "Danh sách người dùng",
  '/user/scores': "Quản lý điểm số",
  '/user/roles': "Vai trò & Phân quyền",

  // Content Library
  '/content/grammar': "Ngữ pháp",
  '/content/vocabulary': "Từ vựng",
  '/content/ipa': "Phiên âm IPA",
  '/content/listening': "Luyện nghe",
  '/content/speaking': "Luyện nói",
  '/content/reading': "Luyện đọc",
  '/content/writing': "Luyện viết",

  // Entertainment
  '/entertainment/movie': "Phim",
  '/entertainment/music': "Âm nhạc",
  '/entertainment/podcast': "Podcast",

  // AI & Technology
  '/ai/text': "Tạo văn bản",
  '/ai/image': "Tạo hình ảnh",
  '/ai/audio': "Tạo âm thanh",

  // Media Management
  '/media/image': "Hình ảnh",
  '/media/audio': "Âm thanh",
  '/media/video': "Video",

  // Communications
  '/communications/email': "Mẫu email",
  '/communications/push': "Thông báo đẩy",
  '/communications/general': "Thông báo chung",
  '/communications/history': "Lịch sử thông báo",

  // Leaderboard & Tasks
  '/leaderboard': "Bảng xếp hạng & Nhiệm vụ",
  '/leaderboard/ranks': "Quản lý Rank",
  '/leaderboard/tasks': "Quản lý Nhiệm vụ",
  '/leaderboard/settings': "Cài đặt Hệ thống",
  '/leaderboard/analytics': "Thống kê & Báo cáo",

  // Center Management
  '/center-management/classes': "Quản lý lớp",
  '/center-management/documents': "Quản lý văn bản",
  '/center-management/homework': "Quản lý bài tập",

  // System & Settings
  '/system/settings': "Cài đặt chung",
  '/system/security': "Bảo mật",
  '/system/logs': "Nhật ký hệ thống",
  '/system/backup': "Sao lưu & Khôi phục",
  '/system/maintenance': "Bảo trì",
  '/system/localization': "Đa ngôn ngữ",

  // Billing
  '/billing/plans': 'Gói nâng cấp',
  '/billing/payments': 'Thanh toán',
  '/billing/coupons': 'Mã giảm giá',
}

const SIDEBAR_ROUTES: ISidebarRouteGroup[] = [
  {
    title: 'Bảng điều khiển',
    icon: LayoutDashboard,
    subItems: [
      {
        title: "Tổng quan",
        href: ROUTES_PATH.OVERVIEW,
        icon: BarChart3,
      },
      {
        title: "Báo cáo",
        href: ROUTES_PATH.REPORTS,
        icon: FileText,
      },
      {
        title: "Phân tích",
        href: ROUTES_PATH.ANALYTICS,
        icon: TrendingUp,
      }
    ],
  },
  // {
  //   title: 'Hỗ trợ',
  //   icon: Headphones,
  //   subItems: [
  //     {
  //       title: 'Hỗ trợ học viên',
  //       href: ROUTES_PATH.SUPPORT,
  //       icon: Headphones,
  //     },
  //   ],
  // },
  {
    title: 'Quản lý người dùng',
    icon: Users,
    subItems: [
      {
        title: "Danh sách người dùng",
        href: ROUTES_PATH.USER_LIST,
        icon: Users,
      },
      {
        title: "Quản lý điểm số",
        href: ROUTES_PATH.USER_SCORES,
        icon: Award,
      },
      {
        title: "Vai trò & Phân quyền",
        href: ROUTES_PATH.ROLES_PERMISSIONS,
        icon: Shield,
      },
    ],
  },
  {
    title: 'Quản lý lộ trình học',
    icon: Map,
    subItems: [
      {
        title: "Lộ trình học",
        href: ROUTES_PATH.ROADMAP,
        icon: Map,
      },
    ],
  },
  {
    title: 'Thư viện nội dung',
    icon: BookOpen,
    subItems: [
      {
        title: "Ngữ pháp",
        href: ROUTES_PATH.GRAMMAR,
        icon: FileText,
      },
      {
        title: "Từ vựng",
        href: ROUTES_PATH.VOCABULARY,
        icon: BookOpen,
      },
      {
        title: "Phiên âm IPA",
        href: ROUTES_PATH.IPA,
        icon: Volume2,
      },
      {
        title: "Luyện nghe",
        href: ROUTES_PATH.LISTENING,
        icon: Headphones,
      },
      {
        title: "Luyện nói",
        href: ROUTES_PATH.SPEAKING,
        icon: Mic,
      },
      {
        title: "Luyện đọc",
        href: ROUTES_PATH.READING,
        icon: Eye,
      },
      {
        title: "Luyện viết",
        href: ROUTES_PATH.WRITING,
        icon: PenTool,
      },
    ],
  },
  {
    title: 'Giải trí',
    icon: Film,
    subItems: [
      {
        title: "Phim",
        href: ROUTES_PATH.MOVIES,
        icon: Video,
      },
      {
        title: "Âm nhạc",
        href: ROUTES_PATH.MUSIC,
        icon: Music,
      },
      {
        title: "Podcast",
        href: ROUTES_PATH.PODCAST,
        icon: Mic,
      },
    ],
  },
  {
    title: 'Quản lý media',
    icon: Image,
    subItems: [
      {
        title: "Hình ảnh",
        href: ROUTES_PATH.IMAGES,
        icon: Image,
      },
      {
        title: "Âm thanh",
        href: ROUTES_PATH.AUDIO,
        icon: Music,
      },
      {
        title: "Video",
        href: ROUTES_PATH.VIDEOS,
        icon: Video,
      },
    ],
  },
  // {
  //   title: 'Truyền thông',
  //   icon: Mail,
  //   subItems: [
  //     {
  //       title: "Mẫu email",
  //       href: ROUTES_PATH.EMAIL_TEMPLATES,
  //       icon: Mail,
  //     },
  //     {
  //       title: "Thông báo đẩy",
  //       href: ROUTES_PATH.PUSH_NOTIFICATIONS,
  //       icon: Bell,
  //     },
  //     {
  //       title: "Thông báo chung",
  //       href: ROUTES_PATH.GENERAL_NOTIFICATIONS,
  //       icon: Megaphone,
  //     },
  //     {
  //       title: "Lịch sử thông báo",
  //       href: ROUTES_PATH.COMMUNICATION_HISTORY,
  //       icon: History,
  //     },
  //   ],
  // },
  {
    title: 'Thanh toán & Gói nâng cấp',
    icon: TrendingUp,
    subItems: [
      {
        title: 'Gói nâng cấp',
        href: ROUTES_PATH.BILLING_PLANS,
        icon: Crown,
      },
      {
        title: 'Thanh toán',
        href: ROUTES_PATH.BILLING_PAYMENTS,
        icon: History,
      },
      {
        title: 'Mã giảm giá',
        href: ROUTES_PATH.BILLING_COUPONS,
        icon: Tag,
      },
    ],
  },
  // Center Management
  {
    title: 'Trung tâm Đào tạo',
    icon: GraduationCap,
    subItems: [
      {
        title: "Quản lý Lớp học",
        href: ROUTES_PATH.CLASSES,
        icon: Users,
      },
      {
        title: "Kho Tài liệu",
        href: ROUTES_PATH.DOCUMENTS,
        icon: BookOpen,
      },
      {
        title: "Chấm bài tập",
        href: ROUTES_PATH.HOMEWORK,
        icon: FileText,
      },
    ],
  },
  {
    title: 'Hệ thống & Cài đặt',
    icon: Settings,
    subItems: [
      {
        title: "Cài đặt chung",
        href: ROUTES_PATH.GENERAL_SETTINGS,
        icon: Settings,
      },
      {
        title: "Bảo mật",
        href: ROUTES_PATH.SECURITY,
        icon: Shield,
      },
      {
        title: "Nhật ký hệ thống",
        href: ROUTES_PATH.SYSTEM_LOGS,
        icon: FileText,
      },
      {
        title: "Sao lưu & Khôi phục",
        href: ROUTES_PATH.BACKUP_RESTORE,
        icon: Database,
      },
      {
        title: "Bảo trì",
        href: ROUTES_PATH.MAINTENANCE,
        icon: Wrench,
      },
      {
        title: "Đa ngôn ngữ",
        href: ROUTES_PATH.LOCALIZATION,
        icon: Globe,
      },
    ],
  }
]

export const ROUTES = { SIDEBAR_ROUTES, ROUTES_PATH, ROUTES_NAME }