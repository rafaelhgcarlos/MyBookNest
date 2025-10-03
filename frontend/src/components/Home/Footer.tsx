const Footer: FC = () => {
    return (
        <footer className="bg-gradient-to-b from-blue-900 to-blue-700">
            <div className="w-full flex bg-slate-900 py-3 text-center justify-center text-gray-100">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-2">
                    <p className="text-lg md:text-xl font-bold tracking-wider">
                        MyBookNest
                    </p>
                    <p className="hidden md:flex md:text-white"> - </p>
                    <p className="text-xs md:text-sm">
                        © {new Date().getFullYear()} Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
);
};

import type {FC} from "react";

export default Footer;
