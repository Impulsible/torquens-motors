export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: ('CUSTOMER' | 'DEALER' | 'ADMIN')[];
}

export interface UserMenuOption {
  label: string;
  href: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  requiresAuth?: boolean;
  roles?: ('CUSTOMER' | 'DEALER' | 'ADMIN')[];
  divider?: boolean;
}