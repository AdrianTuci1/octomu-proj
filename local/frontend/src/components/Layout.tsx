import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Library, Settings, Activity } from "lucide-react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Library, label: "Catalog", href: "/catalog" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Activity className="h-6 w-6 mr-2" />
                    <span>Octomus Local</span>
                </div>
                <nav className="sidebar-nav">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
}
