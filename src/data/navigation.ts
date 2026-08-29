import React, { ReactNode } from 'react';
import {
  Home,
  Car,
  Grid,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Heart,
  MessageSquare,
  FileText,
  Bell,
  Package,
  Store,
  Shield,
  TrendingUp,
  Plus,
  Mail,
  Calendar,
  Phone,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                TYPE DEFINITIONS                            */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: ('CUSTOMER' | 'DEALER' | 'ADMIN')[];
}

export interface UserMenuOption {
  label: string;
  href: string;
  icon?: ReactNode;
  onClick?: () => void;
  requiresAuth?: boolean;
  roles?: ('CUSTOMER' | 'DEALER' | 'ADMIN')[];
  divider?: boolean;
}

// Helper to safely instantiate Lucide icons in .ts files
const createIcon = (IconComponent: React.ComponentType<{ className?: string }>) =>
  React.createElement(IconComponent, { className: 'h-4 w-4' });

/* -------------------------------------------------------------------------- */
/*                           MAIN NAVIGATION                                  */
/* -------------------------------------------------------------------------- */

export const mainNavItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: createIcon(Home),
  },
  {
    label: 'Vehicles',
    href: '/vehicles',
    icon: createIcon(Car),
  },
  {
    label: 'Collections',
    href: '/collections',
    icon: createIcon(Grid),
  },
  {
    label: 'Sell / Trade',
    href: '/sell-trade',
    icon: createIcon(TrendingUp),
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: createIcon(Phone),
  },
];

/* -------------------------------------------------------------------------- */
/*                           USER MENU ITEMS                                  */
/* -------------------------------------------------------------------------- */

export const userMenuItems: UserMenuOption[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: createIcon(Home),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'Saved Vehicles',
    href: '/dashboard/saved',
    icon: createIcon(Heart),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'My Enquiries',
    href: '/dashboard/enquiries',
    icon: createIcon(MessageSquare),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'Messages',
    href: '/dashboard/messages',
    icon: createIcon(Mail),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: createIcon(User),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: createIcon(Settings),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
  },
  {
    label: 'Logout',
    href: '#',
    icon: createIcon(LogOut),
    requiresAuth: true,
    roles: ['CUSTOMER', 'DEALER', 'ADMIN'],
    onClick: () => {
      console.log('Logging out...');
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                           DEALER MENU ITEMS                                */
/* -------------------------------------------------------------------------- */

export const dealerMenuItems: UserMenuOption[] = [
  {
    label: 'Dealer Dashboard',
    href: '/dealer',
    icon: createIcon(Home),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Inventory',
    href: '/dealer/inventory',
    icon: createIcon(Package),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Add Vehicle',
    href: '/dealer/vehicles/new',
    icon: createIcon(Plus),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Enquiries',
    href: '/dealer/enquiries',
    icon: createIcon(MessageSquare),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Analytics',
    href: '/dealer/analytics',
    icon: createIcon(BarChart3),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Verification',
    href: '/dealer/verification',
    icon: createIcon(Shield),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
  },
  {
    label: 'Logout',
    href: '#',
    icon: createIcon(LogOut),
    requiresAuth: true,
    roles: ['DEALER', 'ADMIN'],
    onClick: () => {
      console.log('Logging out...');
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                           ADMIN MENU ITEMS                                 */
/* -------------------------------------------------------------------------- */

export const adminMenuItems: UserMenuOption[] = [
  {
    label: 'Admin Dashboard',
    href: '/admin',
    icon: createIcon(Home),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Vehicles',
    href: '/admin/vehicles',
    icon: createIcon(Car),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Dealers',
    href: '/admin/dealers',
    icon: createIcon(Store),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: createIcon(Users),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Verification',
    href: '/admin/verification',
    icon: createIcon(Shield),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Enquiries',
    href: '/admin/enquiries',
    icon: createIcon(FileText),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: createIcon(BarChart3),
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    label: 'Logout',
    href: '#',
    icon: createIcon(LogOut),
    requiresAuth: true,
    roles: ['ADMIN'],
    onClick: () => {
      console.log('Logging out...');
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                           UTILITY NAVIGATION                               */
/* -------------------------------------------------------------------------- */

export const utilityNavItems: NavItem[] = [
  {
    label: 'Help & Support',
    href: '/help',
    icon: createIcon(HelpCircle),
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: createIcon(Bell),
    requiresAuth: true,
  },
  {
    label: 'Book Test Drive',
    href: '/test-drive',
    icon: createIcon(Calendar),
    requiresAuth: true,
  },
];

/* -------------------------------------------------------------------------- */
/*                           FOOTER NAVIGATION                                */
/* -------------------------------------------------------------------------- */

export const footerNavItems: NavItem[] = [
  {
    label: 'Privacy Policy',
    href: '/privacy',
  },
  {
    label: 'Terms of Service',
    href: '/terms',
  },
  {
    label: 'Cookie Policy',
    href: '/cookies',
  },
  {
    label: 'Contact Support',
    href: '/support',
    icon: createIcon(Phone),
  },
  {
    label: 'About Us',
    href: '/about',
  },
  {
    label: 'Careers',
    href: '/careers',
  },
];

/* -------------------------------------------------------------------------- */
/*                           HELPER FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */

export const getMenuItemsByRole = (
  role: 'CUSTOMER' | 'DEALER' | 'ADMIN' | null
): UserMenuOption[] => {
  if (!role) return userMenuItems;

  const filterByRole = (items: UserMenuOption[]): UserMenuOption[] => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    });
  };

  const allItems = [...userMenuItems, ...dealerMenuItems, ...adminMenuItems];
  const uniqueItems = allItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.href === item.href)
  );

  return filterByRole(uniqueItems);
};

export const getMainNavItems = (isAuthenticated: boolean): NavItem[] => {
  return mainNavItems.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });
};

/* -------------------------------------------------------------------------- */
/*                           DEFAULT EXPORT                                   */
/* -------------------------------------------------------------------------- */

const navigationData = {
  mainNavItems,
  userMenuItems,
  dealerMenuItems,
  adminMenuItems,
  utilityNavItems,
  footerNavItems,
  getMenuItemsByRole,
  getMainNavItems,
};

export default navigationData;