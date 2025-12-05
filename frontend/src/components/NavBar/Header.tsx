import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavMenu from "./NavMenu.tsx";
import NavMenuMobile from "./NavMenuMobile.tsx";
import Button from "../Button/Button";
import UserMenu from "./UserMenu.tsx";
import UserMenuToggle from "./UserMenuToggle.tsx";

import { Menu as IconBars, X as IconClose } from "lucide-react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface User {
    displayName: string;
}

export default function Header() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const [isLoading, setIsLoading] = useState(true); // 👈 AQUI

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

    async function handleLogout() {
        try {
            await signOut(auth);
            setUser(null);
            setUserMenuOpen(false);
        } catch { /* empty */ }
    }

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const displayName = [data.name, data.lastName].filter(Boolean).join(" ");
                    setUser({ displayName });
                } else {
                    setUser({
                        displayName:
                            firebaseUser.displayName ||
                            firebaseUser.email ||
                            "Usuário",
                    });
                }
            } else {
                setUser(null);
            }

            setIsLoading(false);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            unsubscribe();
        };
    }, []);

    // 🔥 SE ESTÁ CARREGANDO → MOSTRA SKELETON
    if (isLoading) {
        return (
            <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/80 shadow-lg shadow-black/30">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4 gap-8">
                        <div className="h-8 w-40 bg-gray-700 rounded animate-pulse" />

                        <div className="md:hidden h-10 w-10 bg-gray-700 rounded-full animate-pulse" />

                        <nav className="hidden md:flex gap-6">
                            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
                            <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
                        </nav>

                        <div className="hidden md:flex items-center gap-4">
                            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
                            <div className="h-8 w-20 bg-gray-600 rounded animate-pulse" />
                        </div>
                    </div>

                    <div className="md:hidden mt-2 space-y-2">
                        <div className="h-6 w-full bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-full bg-gray-700 rounded animate-pulse" />
                        <div className="h-6 w-full bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            </header>
        );
    }

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

                    <div className="flex items-center md:hidden">
                        <Button
                            style="ghost"
                            size="lg"
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            icon={isMenuOpen ? IconClose : IconBars}
                            iconPosition="alone"
                            state="enabled"
                            type="button"
                        />
                    </div>

                    <nav className="hidden md:flex">
                        <NavMenu user={user} />
                    </nav>

                    <div className="hidden md:flex items-center justify-end text-xl">
                        {user ? (
                            <div className="relative">
                                <UserMenuToggle
                                    toggleUserMenu={toggleUserMenu}
                                    mockedUserName={user.displayName || "Usuário"}
                                    userMenuOpen={userMenuOpen}
                                />
                                <UserMenu
                                    user={{ displayName: user.displayName }}
                                    userMenuOpen={userMenuOpen}
                                    onLogout={handleLogout}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-end gap-4 sm:text-sm lg:text-lg">
                                <Button
                                    style="ghost"
                                    label="Entrar"
                                    onClick={() => navigate("/entrar")}
                                />
                                <Button
                                    style="primary"
                                    label="Registrar"
                                    onClick={() => navigate("/registrar")}
                                />
                            </div>
                        )}
                    </div>
                </div>

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
