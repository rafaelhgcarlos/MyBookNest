import NavLinks from "./NavLinks";
import Button from "../Button/Button";

interface User {
    displayName: string;
}

interface UserMenuProps {
    user: User | null;
    userMenuOpen: boolean;
    onLogout: () => void;
}

export default function UserMenu({ user, userMenuOpen, onLogout }: UserMenuProps) {
    if (!user) return null;

    return (
        <div
            className={`transition-all duration-300 overflow-hidden min-w-[180px] ${
                userMenuOpen
                    ? "max-h-screen opacity-100"
                    : "max-h-0 opacity-0 hidden"
            } md:absolute md:right-0  md:bg-slate-900 md:border md:border-slate-800 md:rounded-xl md:shadow-md md:shadow-slate-800 md:mt-2 md:px-2`}
        >
            <ul className="text-xl space-y-3 px-2 py-4 sm:text-lg">
                <NavLinks
                    links={[
                        { label: "Meu Perfil", href: "/profile", icon: "uil-user" },
                        { label: "Meu Backlog", href: "/backlog", icon: "uil-clipboard-notes" },
                        { label: "My Requests", href: "/requests", icon: "uil-postcard" },
                    ]}
                />

                <div className="mt-10 flex items-center justify-center">
                    <Button style="secondary" label="Logout" onClick={onLogout} />
                </div>
            </ul>
        </div>
    );
}
