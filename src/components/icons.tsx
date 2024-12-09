import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircuitBoardIcon,
  CircleMinus,
  Command,
  CreditCard,
  ArrowDownToLine,
  File,
  Facebook,
  FileText,
  HelpCircle,
  Image,
  Instagram,
  Laptop,
  LayoutDashboardIcon,
  Loader2,
  LogIn,
  LucideIcon,
  LucideProps,
  Moon,
  MoreVertical,
  Pizza,
  Plus,
  Settings,
  SunMedium,
  Trash,
  Twitter,
  User,
  User2Icon,
  UserX2Icon,
  X,
  Percent,
  UserCog,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  dashboard: LayoutDashboardIcon,
  logo: Command,
  login: LogIn,
  close: X,
  profile: User2Icon,
  spinner: Loader2,
  kanban: CircuitBoardIcon,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  circleMinus: CircleMinus,
  document: FileText,
  arrowDownToLine: ArrowDownToLine,
  trash: Trash,
  employee: UserX2Icon,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  x: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="x"
      role="img"
      // stroke="currentColor"
      // fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
        fill="#ffffff"
      ></path>
    </svg>
  ),
  globe: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 3C10.6568 3 11.4068 3.59025 12.0218 4.90814C12.2393 5.37419 12.4283 5.90978 12.5806 6.5H7.41936C7.57172 5.90978 7.76073 5.37419 7.97822 4.90814C8.59323 3.59025 9.34315 3 10 3ZM7.07203 4.48526C6.79564 5.07753 6.56498 5.75696 6.38931 6.5H3.93648C4.77295 5.05399 6.11182 3.93497 7.71442 3.38163C7.47297 3.71222 7.25828 4.08617 7.07203 4.48526ZM6.19265 7.5C6.06723 8.28832 6 9.12934 6 10C6 10.8707 6.06723 11.7117 6.19265 12.5H3.45963C3.16268 11.7236 3 10.8808 3 10C3 9.1192 3.16268 8.2764 3.45963 7.5H6.19265ZM6.38931 13.5C6.56498 14.243 6.79564 14.9225 7.07203 15.5147C7.25828 15.9138 7.47297 16.2878 7.71442 16.6184C6.11182 16.065 4.77295 14.946 3.93648 13.5H6.38931ZM7.41936 13.5H12.5806C12.4283 14.0902 12.2393 14.6258 12.0218 15.0919C11.4068 16.4097 10.6568 17 10 17C9.34315 17 8.59323 16.4097 7.97822 15.0919C7.76073 14.6258 7.57172 14.0902 7.41936 13.5ZM12.7938 12.5H7.20617C7.07345 11.7253 7 10.8833 7 10C7 9.11669 7.07345 8.27472 7.20617 7.5H12.7938C12.9266 8.27472 13 9.11669 13 10C13 10.8833 12.9266 11.7253 12.7938 12.5ZM13.6107 13.5H16.0635C15.2271 14.946 13.8882 16.065 12.2856 16.6184C12.527 16.2878 12.7417 15.9138 12.928 15.5147C13.2044 14.9225 13.435 14.243 13.6107 13.5ZM16.5404 12.5H13.8074C13.9328 11.7117 14 10.8707 14 10C14 9.12934 13.9328 8.28832 13.8074 7.5H16.5404C16.8373 8.2764 17 9.1192 17 10C17 10.8808 16.8373 11.7236 16.5404 12.5ZM12.2856 3.38163C13.8882 3.93497 15.2271 5.05399 16.0635 6.5H13.6107C13.435 5.75696 13.2044 5.07753 12.928 4.48526C12.7417 4.08617 12.527 3.71222 12.2856 3.38163Z"
        fill="#212121"
      />
    </svg>
  ),
  send: ({
    className,
    width,
    height,
    color,
    ...props
  }: LucideProps & { width?: number; height?: number; color?: string }) => (
    <svg
      className={className}
      width={width || 20}
      height={height || 20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.1958 1.14244L3.04812 6.19948C2.40741 6.4 1.8813 6.79341 1.52321 7.30425C1.16515 7.81413 0.974169 8.4434 1.00282 9.11369C1.03146 9.78591 1.27686 10.3951 1.67694 10.8725C2.07798 11.35 2.63658 11.6975 3.29161 11.8417L10.2639 13.3828L14.3297 9.31701C14.4271 9.21962 14.5856 9.21962 14.683 9.31701C14.7804 9.41441 14.7804 9.57292 14.683 9.67031L10.6172 13.7361L12.1583 20.7084C12.3034 21.3634 12.65 21.922 13.1275 22.3231C13.6049 22.7241 14.215 22.9685 14.8854 22.9972C15.5566 23.0258 16.1859 22.8349 16.6958 22.4768C17.2056 22.1187 17.599 21.5926 17.7996 20.9519L22.8566 4.8042C23.0237 4.27044 23.0409 3.73286 22.9177 3.2306C22.7945 2.7293 22.5301 2.26045 22.1338 1.86421C21.7385 1.4689 21.2687 1.20346 20.7684 1.08028C20.2661 0.957104 19.7285 0.974293 19.1947 1.14139L19.1958 1.14244Z"
        fill={color || "#000000"}
      />
    </svg>
  ),
  import: ({
    className,
    width,
    height,
    color,
    ...props
  }: LucideProps & { width?: number; height?: number; color?: string }) => (
    <svg
      className={className}
      width={width || 20}
      height={height || 20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1C18.071 1 23 5.92895 23 12C23 18.071 18.071 23 12 23C5.92991 23 1 18.071 1 12C1 5.92895 5.92991 1 12 1ZM12.2636 11.5342V6.19081C12.2636 5.9337 12.055 5.72503 11.7979 5.72503C11.5408 5.72503 11.3321 5.9337 11.3321 6.19081V11.5342H5.98865C5.73154 11.5342 5.52287 11.7429 5.52287 12C5.52287 12.2571 5.73154 12.4658 5.98865 12.4658H11.3321V17.8092C11.3321 18.0663 11.5408 18.275 11.7979 18.275C12.055 18.275 12.2636 18.0663 12.2636 17.8092V12.4658H17.6071C17.8642 12.4658 18.0729 12.2571 18.0729 12C18.0729 11.7429 17.8642 11.5342 17.6071 11.5342H12.2636Z"
        fill={color || "#000000"}
      />
    </svg>
  ),
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  check: Check,
  percent: Percent,
  userCog: UserCog,
};
