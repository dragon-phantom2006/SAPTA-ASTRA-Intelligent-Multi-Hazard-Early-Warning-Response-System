import { Link, useLocation } from 'react-router-dom';
import {Bell,Map,Radio,ShieldAlert,LogOut,MapPinned,Flame,Thermometer,Wind,Mountain,Droplets,Factory,Menu,X,LayoutDashboard,ChevronRight,ChevronDown} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const hazards = [
    ['/forest-fire', 'Parjanya Astra', Flame],
    ['/temperature', 'Surya Astra', Thermometer],
    ['/air-pollution', 'Vayu Astra', Wind],
    ['/landslide', 'Bhumi Astra', Mountain],
    ['/water-quality', 'Jal Astra', Droplets],
    ['/industrial-emission', 'Dhum Astra', Factory]
];

export default function Layout({ children, admin = false }) {
    const { user, logout } = useAuth();
    const loc = useLocation();

    const [open, setOpen] = useState(false);

    /*
     * Flood Command submenu state.
     *
     * It automatically opens when:
     * /admin
     * /admin/sensors
     * /admin/safe-locations
     * /admin/warnings
     *
     * is active.
     */
    const floodChildPaths = [
        '/admin',
        '/admin/sensors',
        '/admin/safe-locations',
        '/admin/warnings'
    ];

    const floodIsActive =
        admin &&
        floodChildPaths.some(path => loc.pathname === path);

    const [floodExpanded, setFloodExpanded] = useState(floodIsActive);

    const base = admin ? '/admin' : '/member';

    const closeMobileSidebar = () => {
        setOpen(false);
    };

    const handleFloodCommandClick = () => {
        if (admin) {
            setFloodExpanded(prev => !prev);
        }
    };

    const isActive = (to) => loc.pathname === to;

    return (
        <div className="app-shell">

            {/* Mobile backdrop */}
            <div
                className={
                    open
                        ? 'sidebar-backdrop show'
                        : 'sidebar-backdrop'
                }
                onClick={closeMobileSidebar}
            />

            {/* =========================
                SIDEBAR
            ========================= */}
            <aside className={open ? 'mobile-open' : ''}>

                {/* Brand */}
                <div className="brand">
                    <span className="brand-mark">
                        <img src="/SaptaAstra.jpeg" alt="Sapta Astra"className="brand-logo"/>
                    </span>

                    <div>
                        <b>SAPTA ASTRA</b>
                        <small>7-HAZARD RESPONSE GRID</small>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={closeMobileSidebar}
                        aria-label="Close navigation"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="nav-section-title">
                    COMMAND SYSTEM
                </div>

                <nav>

                    {/* =========================================
                        1. FLOOD COMMAND
                        ========================================= */}
                    {admin ? (
                        <div className="nav-group">

                            <div
                                className={
                                    floodIsActive
                                        ? 'nav-main active'
                                        : 'nav-main'
                                }
                                onClick={handleFloodCommandClick}
                            >
                                <div className="nav-main-left">
                                    <Radio size={18} />

                                    <span>
                                        Varun Astra
                                    </span>
                                </div>

                                {floodExpanded ? (
                                    <ChevronDown
                                        size={16}
                                        className="nav-chevron"
                                    />
                                ) : (
                                    <ChevronRight
                                        size={16}
                                        className="nav-chevron"
                                    />
                                )}
                            </div>

                            {/* FloodGuard existing controls */}
                            {floodExpanded && (
                                <div className="nav-submenu">

                                    <Link
                                        to="/admin"
                                        className={
                                            isActive('/admin')
                                                ? 'nav-sub active-sub'
                                                : 'nav-sub'
                                        }
                                        onClick={closeMobileSidebar}
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>Flood Dashboard</span>
                                    </Link>

                                    <Link
                                        to="/admin/sensors"
                                        className={
                                            isActive('/admin/sensors')
                                                ? 'nav-sub active-sub'
                                                : 'nav-sub'
                                        }
                                        onClick={closeMobileSidebar}
                                    >
                                        <MapPinned size={16} />
                                        <span>Sensors</span>
                                    </Link>

                                    <Link
                                        to="/admin/safe-locations"
                                        className={
                                            isActive('/admin/safe-locations')
                                                ? 'nav-sub active-sub'
                                                : 'nav-sub'
                                        }
                                        onClick={closeMobileSidebar}
                                    >
                                        <Map size={16} />
                                        <span>Safe Locations</span>
                                    </Link>

                                    <Link
                                        to="/admin/warnings"
                                        className={
                                            isActive('/admin/warnings')
                                                ? 'nav-sub active-sub'
                                                : 'nav-sub'
                                        }
                                        onClick={closeMobileSidebar}
                                    >
                                        <ShieldAlert size={16} />
                                        <span>Direct Warning</span>
                                    </Link>

                                </div>
                            )}

                        </div>
                    ) : (

                        /* =========================================
                           MEMBER FLOOD HEADING
                           ========================================= */
                        <Link
                            to="/member"
                            className={
                                isActive('/member')
                                    ? 'active'
                                    : ''
                            }
                            onClick={closeMobileSidebar}
                        >
                            <LayoutDashboard size={18} />
                            <span>Flood</span>

                            {isActive('/member') && (
                                <ChevronRight
                                    size={14}
                                    className="nav-arrow"
                                />
                            )}
                        </Link>
                    )}

                    {/* =========================================
                        2-7. SIX OTHER HAZARDS
                        ========================================= */}
                    {hazards.map(
                        ([path, label, Icon]) => {

                            const destination =
                                `${base}${path}`;

                            const active =
                                loc.pathname === destination;

                            return (
                                <Link
                                    key={destination}
                                    to={destination}
                                    className={
                                        active
                                            ? 'active'
                                            : ''
                                    }
                                    onClick={closeMobileSidebar}
                                >
                                    <Icon size={18} />

                                    <span>
                                        {label}
                                    </span>

                                    {active && (
                                        <ChevronRight
                                            size={14}
                                            className="nav-arrow"
                                        />
                                    )}
                                </Link>
                            );
                        }
                    )}

                </nav>

                {/* =========================
                    SIDEBAR BOTTOM
                ========================= */}
                <div className="side-bottom">

                    <div className="system-summary">
                        <span className="live-dot" />

                        <div>
                            <b>Network ready</b>
                            <small>
                                Live data architecture
                            </small>
                        </div>
                    </div>

                    <div className="role-chip">
                        {admin
                            ? 'ADMIN CONTROL'
                            : 'COMMUNITY MEMBER'}
                    </div>

                    <button onClick={logout}>
                        <LogOut size={17} />
                        Sign out
                    </button>

                </div>

            </aside>

            {/* =========================
                MAIN CONTENT
            ========================= */}
            <main>

                <header>

                    <div className="mobile-header-left">

                        <button
                            className="mobile-menu"
                            onClick={() => setOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <span className="eyebrow">
                                MULTI-HAZARD ENVIRONMENTAL INTELLIGENCE
                            </span>

                            <h1>
                                {admin
                                    ? 'Command Center'
                                    : 'Community Safety Center'}
                            </h1>
                        </div>

                    </div>

                    <div className="identity">

                        <span className="live-dot" />

                        <div>
                            <b>
                                {user?.name || 'User'}
                            </b>

                            <small>
                                {admin
                                    ? 'Administrator'
                                    : 'Member'}
                            </small>
                        </div>

                    </div>

                </header>

                {/* =========================
                    TOP HAZARD SWITCHER
                    ========================= */}
                <div className="hazard-switcher">

                    <Link
                        to={base}
                        className={
                            loc.pathname === base
                                ? 'selected'
                                : ''
                        }
                    >
                        <LayoutDashboard size={15} />
                        Flood
                    </Link>

                    {hazards.map(
                        ([path, label, Icon]) => {

                            const destination =
                                `${base}${path}`;

                            return (
                                <Link
                                    key={destination}
                                    to={destination}
                                    className={
                                        loc.pathname === destination
                                            ? 'selected'
                                            : ''
                                    }
                                >
                                    <Icon size={15} />
                                    {label}
                                </Link>
                            );
                        }
                    )}

                </div>

                {children}

            </main>

        </div>
    );
}
