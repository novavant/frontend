// components/Navigation.js
import { useRouter } from 'next/router';

// Navigation items array
const navItems = [
    {
        label: 'Bonus',
        icon: 'fa-solid fa-clipboard-list',
        href: '/bonus',
        key: 'bonus'
    },
    {
        label: 'Komisi',
        icon: 'fa-solid fa-user-group',
        href: '/komisi',
        key: 'komisi'
    },
    {
        label: 'Investasi',
        icon: 'fa-solid fa-house-circle-check',
        href: '/dashboard',
        key: 'dashboard'
    },
    {
        label: 'Testimoni',
        icon: 'fa-solid fa-money-check-dollar',
        href: '/testimoni',
        key: 'testimoni'
    },
    {
        label: 'Profil',
        icon: 'fa-solid fa-id-card',
        href: '/profile',
        key: 'profile'
    },
    {
        label: 'Spin',
        icon: 'fa-solid fa-gift',
        href: '/spin-wheel',
        key: 'spin'
    }
];

export default function Navigation() {
    const router = useRouter();

    return (
        <>
            {/* Bottom Navigation */}
            <div style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(229, 231, 235, 0.8)',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
                zIndex: '100'
            }}>
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                        <div
                            key={item.key}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                color: isActive ? '#fe7d17' : '#9ca3af',
                                cursor: 'pointer',
                                padding: '5px 10px',
                                minWidth: '60px',
                                transition: 'color 0.2s'
                            }}
                            onClick={() => router.push(item.href)}
                        >
                            <i className={item.icon} style={{fontSize: '20px'}}></i>
                            <span style={{fontSize: '11px', marginTop: '5px', fontWeight: isActive ? '600' : '400'}}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Add Font Awesome */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
            />
        </>
    );
}