import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/NavBar/Header";

interface Book {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: { thumbnail?: string };
    };
}

const BOOKS_PER_PAGE = 10;

export default function BookSearch() {
    const navigate = useNavigate();

    const [books, setBooks] = useState<Book[]>([]);
    const [query, setQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("A");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [starRatings, setStarRatings] = useState<{ [id: string]: number }>({});

    const fetchBooks = useCallback(
        async (page = 0, term = searchTerm) => {
            if (!term.trim()) return;
            setLoading(true);

            try {
                const startIndex = page * BOOKS_PER_PAGE;
                const apiKey = import.meta.env.VITE_BOOKS_API_KEY;
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                        term
                    )}&maxResults=${BOOKS_PER_PAGE}&startIndex=${startIndex}&key=${apiKey}`
                );
                const data = await res.json();
                const fetchedBooks: Book[] = data.items || [];

                setBooks(fetchedBooks);
                setTotalItems(data.totalItems || 0);

                const ratings: { [id: string]: number } = {};
                fetchedBooks.forEach((book) => {
                    ratings[book.id] = Math.floor(Math.random() * 3) + 3;
                });
                setStarRatings(ratings);
            } catch (err) {
                console.error("Erro ao buscar livros:", err);
            } finally {
                setLoading(false);
            }
        },
        [searchTerm]
    );

    useEffect(() => {
        fetchBooks(0, searchTerm);
        setCurrentPage(0);
    }, [fetchBooks, searchTerm]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;
        setSearchTerm(query.trim());
    };

    const renderStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

    const totalPages = Math.ceil(totalItems / BOOKS_PER_PAGE);

    return (
        <div className="relative min-h-screen text-gray-100 flex flex-col overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[length:200%_200%] animate-gradient-x">
                <div className="w-full h-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950" />
            </div>

            <Header />
            <main className="flex-grow flex flex-col items-center pt-24 px-4 mb-20">
                <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">
                    MyBookNest
                </h1>
                <p className="text-blue-300 text-center text-sm italic mb-8">
                    “Seu refúgio digital para descobrir novas histórias.”
                </p>

                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row items-center gap-2 mb-12 w-full max-w-md"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar livros..."
                        className="w-full px-4 py-2 rounded-full bg-blue-950/50 border border-blue-700 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition"
                    >
                        Buscar
                    </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl">
                    {loading
                        ? Array.from({ length: BOOKS_PER_PAGE }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="bg-blue-900/40 backdrop-blur-xl border border-blue-700/50 rounded-2xl p-4 flex flex-col items-center text-center animate-pulse"
                            >
                                <div className="w-28 sm:w-32 md:w-36 h-40 sm:h-48 md:h-52 bg-blue-800 rounded-lg mb-2" />
                                <div className="w-3/4 h-4 bg-blue-700 rounded mb-1" />
                                <div className="w-1/2 h-3 bg-blue-700 rounded mb-1" />
                                <div className="w-1/3 h-3 bg-yellow-600 rounded" />
                            </div>
                        ))
                        : books.map((book) => (
                            <motion.div
                                key={book.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-blue-900/60 backdrop-blur-xl border border-blue-700/50 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                                onClick={() => navigate(`/biblioteca/${book.id}`)}
                            >
                                <img
                                    src={
                                        book.volumeInfo.imageLinks?.thumbnail ||
                                        "https://books.google.com/googlebooks/images/no_cover_thumb.gif"
                                    }
                                    alt={book.volumeInfo.title}
                                    className="w-28 sm:w-32 md:w-36 h-40 sm:h-48 md:h-52 object-cover rounded-lg mb-2 transition-transform duration-300"
                                />
                                <h3 className="text-sm sm:text-base font-semibold text-blue-100 truncate w-full">
                                    {book.volumeInfo.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-blue-300 italic truncate w-full">
                                    {book.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                                </p>
                                <p className="text-yellow-400 text-sm">
                                    {renderStars(starRatings[book.id] || 4)}
                                </p>
                            </motion.div>
                        ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={() => {
                                if (currentPage === 0) return;
                                const prev = currentPage - 1;
                                setCurrentPage(prev);
                                fetchBooks(prev);
                            }}
                            disabled={currentPage === 0}
                            className={`px-4 py-2 rounded-full ${
                                currentPage === 0
                                    ? "bg-blue-700/50 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500"
                            } transition`}
                        >
                            Anterior
                        </button>

                        <span className="flex items-center px-3 py-1 rounded-full bg-blue-950/50 text-blue-200">
                            {currentPage + 1} / {totalPages}
                        </span>

                        <button
                            onClick={() => {
                                if (currentPage + 1 >= totalPages) return;
                                const next = currentPage + 1;
                                setCurrentPage(next);
                                fetchBooks(next);
                            }}
                            disabled={currentPage + 1 >= totalPages}
                            className={`px-4 py-2 rounded-full ${
                                currentPage + 1 >= totalPages
                                    ? "bg-blue-700/50 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500"
                            } transition`}
                        >
                            Próximo
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
