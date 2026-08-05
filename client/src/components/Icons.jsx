function Icon({ children, className = 'h-4 w-4', strokeWidth = 1.7 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {typeof children === 'function' ? children(strokeWidth) : children}
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={sw} />
          <path d="M16.5 16.5 20.5 20.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Icon>
  );
}

export function CartIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M4 5h2l1.2 10.2a2 2 0 0 0 2 1.8h7.5a2 2 0 0 0 2-1.6L20 8H7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="20" r="1.2" fill="currentColor" />
          <circle cx="17" cy="20" r="1.2" fill="currentColor" />
        </>
      )}
    </Icon>
  );
}

export function BoardIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <rect x="4" y="5" width="7" height="14" rx="1" stroke="currentColor" strokeWidth={sw} />
          <rect x="13" y="5" width="7" height="9" rx="1" stroke="currentColor" strokeWidth={sw} />
        </>
      )}
    </Icon>
  );
}

export function HomeIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      )}
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth={sw} />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
          <path d="M14 12H21M18 8l4 4-4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Icon>
  );
}

export function LoginIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
          <path d="M10 12H3M7 8l-4 4 4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Icon>
  );
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />}
    </Icon>
  );
}

export function TrashIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M5 8h14M10 11v6M14 11v6M8 8l1-3h6l1 3M7 8l1 12h8l1-12" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </Icon>
  );
}

export function EditIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <path d="M4 20h4l11-11-4-4L4 16v4ZM13 6l4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />}
    </Icon>
  );
}

export function SendIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M4 11.5 20 4l-5.5 16-3-6.5L4 11.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />}
    </Icon>
  );
}

export function CompareIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <rect x="3.5" y="5" width="7" height="14" rx="1" stroke="currentColor" strokeWidth={sw} />
          <rect x="13.5" y="5" width="7" height="14" rx="1" stroke="currentColor" strokeWidth={sw} />
        </>
      )}
    </Icon>
  );
}

export function PackageIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Zm0 18V12m0 0 7.5-4.5M12 12 4.5 7.5" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      )}
    </Icon>
  );
}

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M12 4 3.5 19h17L12 4Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
          <path d="M12 10v4M12 16.5h.01" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Icon>
  );
}

export function OrdersIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M7 4h10v16H7z" stroke="currentColor" strokeWidth={sw} />
          <path d="M10 8h4M10 12h4M10 16h3" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Icon>
  );
}

export function InventoryIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <>
          <path d="M4 8h16v11H4zM4 8l2-4h12l2 4" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
          <path d="M9 12h6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />
        </>
      )}
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M5 12h14M14 6l6 6-6 6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
    </Icon>
  );
}

export function SaveIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => (
        <path d="M5 4h11l3 3v13H5V4Zm3 0v5h7V4M8 20v-6h8v6" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
      )}
    </Icon>
  );
}

export function MenuIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />}
    </Icon>
  );
}

export function SparkIcon(props) {
  return (
    <Icon {...props}>
      {(sw) => <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" />}
    </Icon>
  );
}

/** Compact button content helper */
export function WithIcon({ icon: IconCmp, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {IconCmp ? <IconCmp className="h-4 w-4 shrink-0" /> : null}
      <span>{children}</span>
    </span>
  );
}
