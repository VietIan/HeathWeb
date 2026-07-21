import './globals.css';
import '@/lib/fontawesome';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = {
    title: 'HealWeb - Emotional Productivity',
    description: 'Ứng dụng quản lý công việc kết hợp theo dõi cảm xúc và năng suất',
    keywords: ['productivity', 'emotional wellness', 'task management', 'mood tracker'],
    manifest: '/manifest.json',
    themeColor: '#FF7A45',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'HealWeb',
    },
    icons: {
        icon: '/icons/icon-512x512.png',
        apple: '/icons/icon-512x512.png',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#FF7A45',
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <head>
                <meta name="application-name" content="HealWeb" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="HealWeb" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-TileColor" content="#FF7A45" />
                <meta name="theme-color" content="#FF7A45" />
                <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
