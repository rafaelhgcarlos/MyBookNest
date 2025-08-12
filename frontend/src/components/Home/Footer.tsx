import type {FC} from "react";

const Footer: FC = () => {
    return (
        <footer className="bg-gray-100 py-6 mt-20">
            <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
                © {new Date().getFullYear()} MyBookNest — Todos os direitos reservados.
            </div>
        </footer>
    );
};

export default Footer;
