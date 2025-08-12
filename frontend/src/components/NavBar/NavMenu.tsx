import NavLinks from "./NavLinks";

interface NavMenuProps {
    user?: any
}

export default function NavMenu({}: NavMenuProps) {
    return (
        <>
            <nav
                className={"md:text-xl lg:text-2xl list-none md:rounded-[10px]"}>
                <ul className={"md:flex flex-row md:gap-7"}>
                    <NavLinks links={[
                        {label: "Inicio", href: "/", icon: "uil-home"},
                        {label: "Biblioteca", href: "/biblioteca", icon: "uil-book"},
                        {label: "Sobre", href: "/sobre", icon: "uil-question-circle"},
                    ]}>
                    </NavLinks>
                </ul>
            </nav>
        </>
    )
}
