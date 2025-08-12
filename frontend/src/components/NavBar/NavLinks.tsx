interface NavLinksProps {
    links: {
        label: string;
        href: string;
        icon?: string
    }[]
}

function NavLinks({links}: NavLinksProps) {
    return (
        <>
            {links.map((link, index) => (
                <li key={index}>
                    <a href={link.href} className="transition-all text-white hover:text-blue-500 whitespace-nowrap">
                        <i
                            className={`uil ${link.icon} ${link.icon ? null : 'hidden'}`}
                        ></i>
                        &nbsp;{link.label}
                    </a>
                </li>
            ))}
        </>
    )
}

export default NavLinks
