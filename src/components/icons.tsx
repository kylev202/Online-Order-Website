import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Icon({ size = 24, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MenuCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10.25" />
    <path d="M7.5 8.75h9M7.5 12h9M7.5 15.25h9" />
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M4.6 7.5h14.8M4.6 16.5h14.8" />
    <path d="M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3z" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5.5 19.5c1.1-3.1 3.6-4.9 6.5-4.9s5.4 1.8 6.5 4.9" />
  </Icon>
);

/** Solid grey person, used in the desktop "Login" button. */
export const UserSolidIcon = (p: IconProps) => (
  <Icon {...p} stroke="none">
    <circle cx="12" cy="7.5" r="4.5" fill="#a6a6a6" />
    <path d="M3.5 21.5c.8-4.6 4.2-7.5 8.5-7.5s7.7 2.9 8.5 7.5z" fill="#a6a6a6" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.2}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 4.5 4.5" />
  </Icon>
);

export const SlidersIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M6 4v4M4 10h4M6 12v8M12 4v10M10 16h4M12 18v2M18 4v2M16 8h4M18 10v10" />
  </Icon>
);

export const CartIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.4}>
    <path d="M2.5 4h2.2l2.3 10.5a1.6 1.6 0 0 0 1.6 1.25h8.4a1.6 1.6 0 0 0 1.55-1.2L20.5 8H6" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </Icon>
);

export const MapPinIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={1.8}>
    <path d="M12 21s-6.5-5.7-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15.3 12 21 12 21z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </Icon>
);

export const TruckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 6.5h11v10h-11zM13.5 9.5h4l3 3.2v3.8h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" fill="#fff" />
    <circle cx="17" cy="17.5" r="1.8" fill="#fff" />
  </Icon>
);

export const CreditCardIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="M2.5 9.5h19M6 15h4" />
  </Icon>
);

export const WalletIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 5H17M3 6.5A1.5 1.5 0 0 1 4.5 5M3 6.5V18a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4.5A1.5 1.5 0 0 1 3 6.5z" />
    <circle cx="16" cy="13.5" r="1.2" fill="currentColor" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.5}>
    <path d="m5.5 12.5 4 4 9-9.5" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2.2}>
    <path d="M20 12H4.5M10.5 5.5 4 12l6.5 6.5" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const CloseCircleIcon = (p: IconProps) => (
  <Icon {...p} stroke="none">
    <circle cx="12" cy="12" r="11" fill="currentColor" />
    <path d="m8.5 8.5 7 7m0-7-7 7" stroke="#fff" strokeWidth={2.2} />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MinusIcon = (p: IconProps) => (
  <Icon {...p} strokeWidth={2}>
    <path d="M5 12h14" />
  </Icon>
);

export const CheckCircleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m7.5 12.5 3 3 6-6.5" />
  </Icon>
);
