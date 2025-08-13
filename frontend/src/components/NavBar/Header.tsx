import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavMenu from "./NavMenu.tsx";
import NavMenuMobile from "./NavMenuMobile.tsx";
import Button from "../Button/Button";
import UserMenu from "./UserMenu.tsx";
import UserMenuToggle from "./UserMenuToggle.tsx";

import { Menu as IconBars, X as IconClose } from "lucide-react";

interface User {
    displayName: string;
}

export default function Header() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>({
        displayName: "Rafael Gonzaga",
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    function toggleMenu() {
        setIsMenuOpen((prev) => !prev);
    }

    function toggleUserMenu() {
        setUserMenuOpen((prev) => !prev);
    }

    function handleScroll() {
        setIsScrolled(window.scrollY > 50);
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            setIsMenuOpen(false);
        }
    }

    function handleLogout() {
        setUser(null);
        setUserMenuOpen(false);
        navigate("/");
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
                isMenuOpen || isScrolled
                    ? "bg-slate-900/80 shadow-lg shadow-black/30"
                    : "bg-transparent"
            }`}
        >
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4 gap-8">
                    <a
                        href="/"
                        className="flex gap-3 logo-font text-2xl lg:text-3xl font-black italic items-center text-white hover:text-blue-400 transition-colors cursor-pointer select-none"
                    >
                        MyBookNest
                    </a>

                    {/* Botão mobile */}
                    <div className="flex items-center md:hidden">
                        <Button
                            style="ghost"
                            size="lg"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            icon={isMenuOpen ? IconClose : IconBars}
                            iconPosition="alone"
                            state="enabled"
                        />
                    </div>

                    {/* Menu desktop */}
                    <nav className="hidden md:flex">
                        <NavMenu user={user} />
                    </nav>

                    {/* Área usuário desktop */}
                    <div className="hidden md:flex items-center justify-end text-xl">
                        {user ? (
                            <div className={"relative"}>
                                <UserMenuToggle
                                    toggleUserMenu={toggleUserMenu}
                                    mockedUserName={user.displayName || "Usuário"}
                                    userMenuOpen={userMenuOpen}
                                />
                                <UserMenu
                                    user={user}
                                    userMenuOpen={userMenuOpen}
                                    onLogout={handleLogout}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-end gap-4 sm:text-sm lg:text-lg">
                                <Button
                                    style="ghost"
                                    label="Sign in"
                                    onClick={() => navigate("/")}
                                />
                                <Button
                                    style="primary"
                                    label="Sign up"
                                    onClick={() => navigate("/")}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu mobile */}
                <NavMenuMobile
                    user={user}
                    toggleUserMenu={toggleUserMenu}
                    isMenuOpen={isMenuOpen}
                    userMenuOpen={userMenuOpen}
                    onLogout={handleLogout}
                />
            </div>
        </header>
    );
}
