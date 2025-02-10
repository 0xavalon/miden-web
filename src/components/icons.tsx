import {
  CircleMinus,
  ArrowDownToLine,
  LucideIcon,
  LucideProps,
  X,
  CircleArrowOutDownLeft,
  CircleFadingPlus,
  RefreshCcwDot,
  ArrowLeft
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  close: X,
  arrowLeft: ArrowLeft,
  circleMinus: CircleMinus,
  addCustomAsset: CircleFadingPlus,
  arrowDownToLine: ArrowDownToLine,
  findAvailableAsset: RefreshCcwDot,
  addDefaultAsset: CircleArrowOutDownLeft,
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
};
