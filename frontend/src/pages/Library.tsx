import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";

interface Book {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        imageLinks?: {
            thumbnail?: string;
        };
    };
}

const BOOKS_PER_PAGE = 20;

export default function BookSearch() {
    const [query, setQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [books, setBooks] = useState<Book[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [starRatings, setStarRatings] = useState<{ [id: string]: number }>({});
    const [loading, setLoading] = useState(false);

    const searchBooks = useCallback(
        async (page = 0, customQuery?: string) => {
            const term = customQuery ?? searchTerm;
            if (!term) return;

            setLoading(true);
            const startIndex = page * BOOKS_PER_PAGE;
            const apiKey = import.meta.env.VITE_BOOKS_API_KEY;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                term
            )}&maxResults=${BOOKS_PER_PAGE}&startIndex=${startIndex}&orderBy=relevance&key=${apiKey}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                const fetchedBooks = data.items || [];
                setBooks(fetchedBooks);

                const ratings: { [id: string]: number } = {};
                fetchedBooks.forEach((item: Book) => {
                    ratings[item.id] = Math.floor(Math.random() * 3) + 3;
                });
                setStarRatings(ratings);

                setHasMorePages(fetchedBooks.length === BOOKS_PER_PAGE);
            } catch (error) {
                console.error("Erro ao buscar livros:", error);
            } finally {
                setLoading(false);
            }
        },
        [searchTerm]
    );

    useEffect(() => {
        if (!searchTerm) {
            const INITIAL_QUERY = "A";
            setSearchTerm(INITIAL_QUERY);
            searchBooks(0, INITIAL_QUERY);
        }
    }, [searchBooks, searchTerm]);

    const handleSearch = () => {
        if (!query.trim()) return;
        setCurrentPage(0);
        setSearchTerm(query.trim());
        searchBooks(0, query.trim());
    };

    const renderStars = (rating: number) => (
        <>
            {"★".repeat(rating)}
            {"☆".repeat(5 - rating)}
        </>
    );

    // Componente para o card de loading (skeleton)
    const LoadingCard = () => (
        <div className="bg-blue-900/50 backdrop-blur-md rounded-3xl p-6 border border-blue-800 shadow-lg animate-pulse flex flex-col items-center text-center max-w-full h-[360px]">
            <div className="w-36 h-48 mb-6 bg-blue-700 rounded-xl" />
            <div className="h-6 bg-blue-700 rounded-md w-5/6 mb-4" />
            <div className="h-4 bg-blue-700 rounded-md w-3/4 mb-6" />
            <div className="h-4 bg-yellow-600 rounded-md w-1/2" />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-20">
                <h2 className="text-4xl font-extrabold mb-10 text-center tracking-wide">
                    🔍 Encontre livros para sua biblioteca
                </h2>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                    }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                    role="search"
                    aria-label="Busca de livros"
                >
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ex: Harry Potter, Stephen King, romance..."
                        className="w-full sm:w-96 p-3 bg-blue-950/60 text-white placeholder-blue-300 border border-blue-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        aria-label="Campo de busca de livros"
                        autoFocus
                    />
                    <Button style="primary" label="Pesquisar" onClick={handleSearch} />
                </form>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* Exibe 8 cards de loading para preencher a grid */}
                        {[...Array(8)].map((_, i) => (
                            <LoadingCard key={i} />
                        ))}
                    </div>
                ) : books.length > 0 ? (
                    <>
                        <h3 className="text-3xl font-semibold mb-8 text-center text-blue-200">
                            📚 Resultados da pesquisa
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {books.map((book, index) => (
                                <motion.a
                                    key={book.id}
                                    href={`/library/books/${book.id}`}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
                                    className="bg-blue-900/60 backdrop-blur-md rounded-3xl p-6 border border-blue-800 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col items-center text-center no-underline max-w-full"
                                    aria-label={`Livro ${book.volumeInfo.title} por ${
                                        book.volumeInfo.authors?.join(", ") || "autor desconhecido"
                                    }`}
                                >
                                    {book.volumeInfo.imageLinks?.thumbnail ? (
                                        <img
                                            src={book.volumeInfo.imageLinks.thumbnail}
                                            alt={`Capa do livro ${book.volumeInfo.title}`}
                                            className="w-36 h-auto mb-4 rounded-xl shadow-md object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="w-36 h-48 mb-4 bg-blue-800 rounded-xl flex items-center justify-center text-blue-400 text-sm">
                                            Sem capa
                                        </div>
                                    )}

                                    <h3 className="text-lg font-semibold text-blue-100 mb-1 truncate max-w-full" title={book.volumeInfo.title}>
                                        {book.volumeInfo.title}
                                    </h3>
                                    <p className="text-sm text-blue-300 italic mb-2 break-words whitespace-normal">
                                        {book.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
                                    </p>
                                    <p
                                        className="text-yellow-400 text-sm select-none"
                                        aria-label={`Avaliação: ${starRatings[book.id] || 4} estrelas`}
                                    >
                                        {renderStars(starRatings[book.id] || 4)}
                                    </p>
                                </motion.a>
                            ))}
                        </div>

                        <div className="flex justify-between mt-12 max-w-md mx-auto">
                            <Button
                                style="secondary"
                                label="Anterior"
                                state={currentPage === 0 ? "disabled" : "enabled"}
                                onClick={() => {
                                    if (currentPage === 0) return;
                                    const prev = currentPage - 1;
                                    setCurrentPage(prev);
                                    searchBooks(prev);
                                }}
                            />
                            <Button
                                style="primary"
                                label="Próxima"
                                state={!hasMorePages ? "disabled" : "enabled"}
                                onClick={() => {
                                    if (!hasMorePages) return;
                                    const next = currentPage + 1;
                                    setCurrentPage(next);
                                    searchBooks(next);
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-center text-blue-300 mt-16 select-none">
                        Nenhum livro encontrado!
                    </p>
                )}
            </main>
        </div>
    );
}
