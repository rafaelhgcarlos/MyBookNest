import NavLinks from "./NavLinks";
import UserMenuToggle from "./UserMenuToggle";
import Button from "../Button/Button";
import UserMenu from "./UserMenu";
import { useNavigate } from "react-router-dom";

interface User {
    displayName: string;
}

interface NavMenuMobileProps {
    user: User | null;
    isMenuOpen: boolean;
    userMenuOpen: boolean;
    toggleUserMenu: () => void;
    onLogout: () => void;
}

function NavMenuMobile({
                           user,
                           isMenuOpen,
                           userMenuOpen,
                           toggleUserMenu,
                           onLogout,
                       }: NavMenuMobileProps) {
    const navigate = useNavigate();

    return (
        <nav
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } md:hidden`}
            aria-hidden={!isMenuOpen}
        >
            <hr className="border border-slate-900" />

            <ul className="text-xl space-y-3 px-2 py-4">
                <NavLinks
                    links={[
                        { label: "Inicio", href: "/", icon: "uil-home" },
                        { label: "Biblioteca", href: "/biblioteca", icon: "uil-book" },
                        { label: "Sobre", href: "/sobre", icon: "uil-question-circle" },
                    ]}
                />
            </ul>

            <hr className="border border-slate-900" />

            <div className="flex items-center justify-center gap-6 py-4">
                {user ? (
                    <div className="text-lg">
                        <UserMenuToggle
                            toggleUserMenu={toggleUserMenu}
                            mockedUserName={user.displayName || "Usuário"}
                            userMenuOpen={userMenuOpen}
                        />
                    </div>
                ) : (
                    <>
                        <Button
                            style="secondary"
                            label="Sign in"
                            onClick={() => navigate("/")}
                        />
                        <Button
                            style="primary"
                            label="Sign up"
                            onClick={() => navigate("/")}
                        />
                    </>
                )}
            </div>

            <UserMenu user={user} userMenuOpen={userMenuOpen} onLogout={onLogout} />
        </nav>
    );
}

export default NavMenuMobile;
