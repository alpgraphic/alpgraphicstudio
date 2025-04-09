'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: 'Firmalar', path: '/admin/firmalar', icon: '🏢' },
    { name: 'PDF Dokümanlar', path: '/admin/dokumanlar', icon: '📄' },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? '' : styles.collapsed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              className={styles.logoImage} 
              width={100}
              height={40}
            />
          </div>
        </div>
        
        <nav className={styles.navigation}>
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className={styles.navText}>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.breadcrumb}>
            <span>Admin</span>
            {pathname !== '/admin' && (
              <>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span>{pathname.split('/').pop()}</span>
              </>
            )}
          </div>
        </header>
        
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}