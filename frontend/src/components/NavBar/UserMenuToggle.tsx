interface UserMenuToggleProps {
    toggleUserMenu: () => void;
    mockedUserName: string;
    userMenuOpen: boolean;
}

function UserMenuToggle({
                            toggleUserMenu,
                            mockedUserName,
                            userMenuOpen,
                        }: UserMenuToggleProps) {
    return (
        <button
            onClick={toggleUserMenu}
            className="cursor-pointer flex items-center gap-2 text-white min-w-[120px] whitespace-nowrap"
            aria-haspopup="true"
            aria-expanded={userMenuOpen}
        >
            <span className="sr-only">Abrir menu do usuário</span>
            {mockedUserName}
            <svg
                className={`w-4 h-4 transition-transform duration-300 transform ${
                    userMenuOpen ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
}

export default UserMenuToggle;
