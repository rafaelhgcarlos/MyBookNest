import type {FC} from "react";

const Navbar: FC = () => {
    return (
        <header className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600">MyBookNest</h1>
                <ul className="hidden md:flex gap-6 text-gray-700">
                    <li className="hover:text-indigo-600 cursor-pointer">Home</li>
                    <li className="hover:text-indigo-600 cursor-pointer">Livros</li>
                    <li className="hover:text-indigo-600 cursor-pointer">Contato</li>
                </ul>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Entrar
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
