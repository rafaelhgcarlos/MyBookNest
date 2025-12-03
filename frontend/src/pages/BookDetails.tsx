import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import toast from "react-hot-toast";
import { auth } from "../lib/firebase";

interface Book {
    id: string;
    volumeInfo: {
        categories?: string[];
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: { thumbnail?: string; smallThumbnail?: string };
        averageRating?: number;
    };
}

interface Collection {
    id: string;
    title: string;
    cover?: string;
    booksCount?: number;
}

export default function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionsLoading, setCollectionsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState<"select" | "login" | "create" | false>(false);
    const [addingToCollection, setAddingToCollection] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiKey = import.meta.env.VITE_BOOKS_API_KEY;
                const url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Falha ao carregar dados do livro");
                const data = await res.json();
                setBook(data);
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar os detalhes do livro.");
            } finally {
                setLoading(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };
        fetchBook();
    }, [id]);

    useEffect(() => {
        const fetchCollections = async () => {
            setCollectionsLoading(true);
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    setCollections([]);
                    return;
                }
                const q = query(
                    collection(db, "collections"),
                    where("userId", "==", currentUser.uid)
                );

                const colSnap = await getDocs(q);
                const cols: Collection[] = await Promise.all(
                    colSnap.docs.map(async (doc) => {
                        const booksSnap = await getDocs(collection(db, "collections", doc.id, "books"));
                        return {
                            id: doc.id,
                            title: doc.data().title,
                            cover: doc.data().cover || "/default-collection.png",
                            booksCount: booksSnap.size,
                        };
                    })
                );
                setCollections(cols);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar coleções.");
            } finally {
                setCollectionsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const coverSrc = useMemo(() => {
        const t = book?.volumeInfo?.imageLinks?.thumbnail || book?.volumeInfo?.imageLinks?.smallThumbnail;
        return t ? t.replace("&edge=curl", "").replace("http://", "https://") : null;
    }, [book]);

    const stripHtml = (html?: string) => (html ? html.replace(/<[^>]+>/g, "") : "");

    const Stars = ({ value = 0 }: { value?: number }) => (
        <span className="select-none" aria-label={`Avaliação ${value} de 5`}>
      {"★".repeat(Math.round(value))}
            {"☆".repeat(5 - Math.round(value))}
    </span>
    );

    const addToCollection = async (collectionId: string) => {
        if (!book) return;

        try {
            setAddingToCollection(true);

            const booksRef = collection(db, "collections", collectionId, "books");

            const q = query(booksRef, where("title", "==", book.volumeInfo.title));
            const existsSnap = await getDocs(q);

            if (!existsSnap.empty) {
                toast.error("Este livro já está nesta coleção!");
                setAddingToCollection(false);
                return;
            }

            await addDoc(booksRef, {
                title: book.volumeInfo.title,
                author: book.volumeInfo.authors?.join(", ") || "Autor desconhecido",
                cover: coverSrc || "",
                createdAt: new Date(),
                genre: book.volumeInfo.categories?.[0] || "Desconhecido",
                readDate: new Date().toISOString(),
            });

            toast.success("Livro adicionado à coleção!");
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar o livro à coleção.");
        } finally {
            setAddingToCollection(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
            <Header />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-28 pb-24">
                <Link
                    to="/biblioteca"
                    className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition mb-6"
                >
                    <FiArrowLeft /> Voltar para a Biblioteca
                </Link>

                {loading ? (
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 animate-pulse bg-blue-900/55 border border-blue-800/70 rounded-3xl p-6 md:p-10">
                        <div className="w-40 sm:w-48 md:w-56 h-64 bg-blue-800/70 rounded-2xl" />
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-8 bg-blue-800/70 rounded w-3/4" />
                            <div className="h-4 bg-blue-800/70 rounded w-1/2" />
                            <div className="h-4 bg-blue-800/70 rounded w-full" />
                            <div className="h-4 bg-blue-800/70 rounded w-full" />
                            <div className="h-4 bg-blue-800/70 rounded w-5/6" />
                        </div>
                    </div>
                ) : error || !book ? (
                    <div className="min-h-screen flex items-center justify-center text-white">{error || "Livro não encontrado"}</div>
                ) : (
                    <motion.div className="bg-blue-900/55 border border-blue-800/70 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                            <div className="flex-shrink-0 flex justify-center md:justify-start">
                                {coverSrc ? (
                                    <img
                                        src={coverSrc}
                                        alt={book.volumeInfo.title}
                                        className="w-40 sm:w-48 md:w-56 h-auto rounded-2xl shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-40 sm:w-48 md:w-56 h-64 bg-blue-800/70 flex items-center justify-center rounded-2xl">
                                        Sem capa
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-100 break-words">
                                    {book.volumeInfo.title}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="italic text-blue-300">
        {book.volumeInfo.authors?.join(", ") || "Autor desconhecido"}
    </span>

                                    {book.volumeInfo.categories && (
                                        <span className="px-3 py-1 bg-blue-700/70 text-blue-100 rounded-full text-xs font-semibold uppercase">
            {book.volumeInfo.categories[0]}
        </span>
                                    )}

                                    <Stars value={book.volumeInfo.averageRating || 4} />
                                </div>
                                <p className={`mt-4 text-blue-100/90 leading-relaxed ${expanded ? "" : "line-clamp-5"}`}>
                                    {stripHtml(book.volumeInfo.description)}
                                </p>
                                {book.volumeInfo.description && book.volumeInfo.description.length > 300 && (
                                    <button
                                        onClick={() => setExpanded((s) => !s)}
                                        className="mt-2 text-sm text-blue-300 hover:text-white transition"
                                    >
                                        {expanded ? "Ver menos" : "Ver mais"}
                                    </button>
                                )}

                                <div className="mt-6">
                                    <Button
                                        label="Adicionar à Coleção"
                                        style="primary"
                                        onClick={() => {
                                            const currentUser = auth.currentUser;
                                            if (!currentUser) {
                                                toast.error("Você precisa estar logado para adicionar livros a uma coleção.");
                                                setModalOpen("login");
                                            } else if (collections.length === 0) {
                                                setModalOpen("create");
                                            } else {
                                                setModalOpen("select");
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {modalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-2 sm:px-4"
                        onClick={() => setModalOpen(false)}
                    >
                        <motion.div
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            className="relative bg-blue-950/95 rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-4xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-3 right-3 text-blue-200 hover:text-white text-2xl"
                                onClick={() => setModalOpen(false)}
                            >
                                <FiX />
                            </button>

                            {modalOpen === "login" && (
                                <div className="flex flex-col items-center gap-4">
                                    <h2 className="text-xl font-bold text-white text-center">Você precisa estar logado</h2>
                                    <Link to="/entrar">
                                        <Button label="Ir para Login" style="primary" />
                                    </Link>
                                </div>
                            )}

                            {modalOpen === "create" && (
                                <div className="flex flex-col items-center gap-4">
                                    <h2 className="text-xl font-bold text-white text-center">Nenhuma coleção encontrada</h2>
                                    <Link to="/criar-colecao">
                                        <Button label="Criar Coleção" style="primary" />
                                    </Link>
                                </div>
                            )}

                            {modalOpen === "select" && (
                                <div className="overflow-y-auto overflow-x-hidden max-h-[80vh] scroll-smooth custom-scroll grid grid-cols-1 sm:grid-cols-2 gap-6 md:p-4">
                                    {collectionsLoading
                                        ? [...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-blue-800/50 rounded-2xl animate-pulse h-44 flex flex-col items-center">
                                                <div className="w-full h-32 bg-blue-700/70 rounded-t-2xl mb-3" />
                                                <div className="p-3 w-full">
                                                    <div className="h-4 bg-blue-700/70 rounded mb-1" />
                                                    <div className="h-3 bg-blue-700/70 rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))
                                        : collections.map((col) => (
                                            <motion.div
                                                key={col.id}
                                                whileHover={{ scale: 1.04, y: -2, boxShadow: "0 4px 10px rgba(0,255,255,0.25)" }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className={`bg-blue-800/50 rounded-2xl cursor-pointer overflow-hidden border border-blue-700 flex flex-col items-center transition-transform duration-200 will-change-transform
                                    ${addingToCollection ? "opacity-50 pointer-events-none" : ""}`}
                                                onClick={() => addToCollection(col.id)}
                                            >
                                                <img src={col.cover} alt={col.title} className="w-full h-36 sm:h-40 object-cover rounded-t-2xl" />
                                                <div className="p-3 text-center">
                                                    <h3 className="text-white font-semibold text-sm sm:text-base break-words">{col.title}</h3>
                                                    <p className="text-blue-300 text-xs sm:text-sm">{col.booksCount} livro(s)</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
