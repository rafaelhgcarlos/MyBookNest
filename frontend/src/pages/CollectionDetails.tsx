import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    deleteDoc,
    updateDoc,
    Timestamp,
    addDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/NavBar/Header";
import toast from "react-hot-toast";
import { FiTrash2, FiArrowLeft } from "react-icons/fi";

interface Book {
    id: string;
    title: string;
    author: string;
    pages?: number;
    cover?: string;
    category?: string;
    read?: boolean;
}

interface Collection {
    id: string;
    title: string;
    description?: string;
    cover?: string;
    createdAt?: string;
}

interface Achievement {
    id: number;
    title: string;
    desc: string;
    unlocked: boolean;
}

export default function CollectionDetails() {
    const { id } = useParams();
    const [collectionData, setCollectionData] = useState<Collection | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
    const [filter, setFilter] = useState<"all" | "read" | "unread" | "author">("all");

    // --- Carregar coleção e livros ---
    const loadCollection = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const colRef = doc(db, "collections", id);
            const colSnap = await getDoc(colRef);
            if (colSnap.exists()) {
                const data = colSnap.data() as Collection & { createdAt?: any };
                const createdAtStr =
                    data.createdAt && typeof data.createdAt === "object" && "toDate" in data.createdAt
                        ? (data.createdAt as Timestamp).toDate().toLocaleDateString()
                        : undefined;

                setCollectionData({ ...data, id: colSnap.id, createdAt: createdAtStr });
            }

            const booksRef = collection(db, "collections", id, "books");
            const booksSnap = await getDocs(booksRef);
            const booksList: Book[] = booksSnap.docs.map((b) => ({ ...(b.data() as Book), id: b.id }));
            setBooks(booksList);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar coleção.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCollection().then(() => {
            saveCollectionStats();
        });
    }, [id]);

    const totalBooks = books.length;
    const totalRead = books.filter(b => b.read).length;
    const readPercent = totalBooks > 0 ? Math.round((totalRead / totalBooks) * 100) : 0;
    const totalPages = books.reduce((acc, b) => acc + (b.pages || 0), 0);
    const authors = Array.from(new Set(books.map((b) => b.author))).join(", ");

    const baseXP = totalRead * 10;
    const categoryBonus = Array.from(new Set(books.map(b => b.category)))
        .reduce((acc, cat) => {
            const catBooks = books.filter(b => b.category === cat);
            if (catBooks.every((b) => b.read)) return acc + 20;
            return acc;
        }, 0);
    const xp = baseXP + categoryBonus;
    const nextLevel = totalBooks * 10 + 20 * Array.from(new Set(books.map(b => b.category))).length;
    const progressPercent = nextLevel > 0 ? Math.min((xp / nextLevel) * 100, 100) : 0;
    const level = Math.floor(xp / 50) + 1;

    const uniqueReadAuthors = Array.from(
        new Set(books.filter(b => b.read).map(b => b.author).filter(Boolean))
    );

    let medal: string | null = null;
    if (totalBooks > 0) {
        if (readPercent <= 33) medal = "🥉 Bronze";
        else if (readPercent <= 66) medal = "🥈 Prata";
        else medal = "🥇 Ouro";
    }

    const badges = [
        { name: "Iniciante", emoji: "📘", achieved: totalRead >= 1 },
        { name: "Leitor Ávido", emoji: "📚", achieved: readPercent >= 50 },
        { name: "Mestre da Biblioteca", emoji: "🏆", achieved: readPercent === 100 },
        { name: "Colecionador de Categorias", emoji: "🎯", achieved: Array.from(new Set(books.map(b => b.category))).some(cat => books.filter(b => b.category === cat).every(b => b.read)) },
        { name: "Diversidade de Autores", emoji: "✍️", achieved: uniqueReadAuthors.length >= 3 },
    ];

    const achievements: Achievement[] = [
        { id: 1, title: "Primeiro Livro", desc: "Leia o primeiro livro da coleção", unlocked: totalRead >= 1 },
        { id: 2, title: "50% Lidos", desc: "Leia metade da coleção", unlocked: readPercent >= 50 },
        { id: 3, title: "100% Lidos", desc: "Leia todos os livros da coleção", unlocked: readPercent === 100 },
        { id: 4, title: "Todos da Categoria", desc: "Leia todos livros de uma categoria", unlocked: Array.from(new Set(books.map(b => b.category))).some(cat => books.filter(b => b.category === cat).every(b => b.read)) },
        { id: 5, title: "3 Autores Diferentes", desc: "Leia livros de 3 autores diferentes", unlocked: uniqueReadAuthors.length >= 3 },
    ];

    const saveCollectionStats = async () => {
        if (!collectionData) return;

        const statsRef = collection(db, "collectionsStats");

        const statsData = {
            collectionId: collectionData.id,
            title: collectionData.title,
            totalBooks,
            totalRead,
            readPercent,
            totalPages,
            xp,
            level,
            medal,
            badges: badges.filter(b => b.achieved).map(b => b.name),
            timestamp: Timestamp.now(),
        };

        try {
            await addDoc(statsRef, statsData);
            console.log("Estatísticas salvas:", statsData);
        } catch (err) {
            console.error("Erro ao salvar estatísticas:", err);
        }
    };

    const removeBook = async (bookId: string) => {
        if (!id) return;
        try {
            await deleteDoc(doc(db, "collections", id, "books", bookId));
            setBooks((prev) => prev.filter((b) => b.id !== bookId));
            toast.success("Livro removido da coleção!");
            await saveCollectionStats();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover livro.");
        } finally {
            setBookToDelete(null);
        }
    };

    const toggleRead = async (bookId: string) => {
        if (!id) return;
        const current = books.find((b) => b.id === bookId);
        if (!current) return;
        const newReadState = !current.read;

        try {
            await updateDoc(doc(db, "collections", id, "books", bookId), { read: newReadState });
            setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, read: newReadState } : b)));
            toast.success(newReadState ? "📘 Livro marcado como lido!" : "🔖 Livro desmarcado!");
            await saveCollectionStats();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar status de leitura.");
        }
    };


    const filteredBooks = useMemo(() => {
        let filtered = [...books];

        if (filter === "read") filtered = filtered.filter(b => b.read === true);
        else if (filter === "unread") filtered = filtered.filter(b => b.read !== true);

        if (filter === "author") filtered.sort((a, b) => (a.author || "").localeCompare(b.author || ""));

        return filtered;
    }, [books, filter]);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />
            <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
                <Link
                    to="/perfil"
                    className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition mt-4"
                >
                    <FiArrowLeft /> Voltar
                </Link>

                {loading ? (
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 animate-pulse">
                        <div className="w-36 h-36 bg-gray-700 rounded-xl" />
                        <div className="flex-1 space-y-4 py-2">
                            <div className="h-6 bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-700 rounded w-5/6" />
                            <div className="h-3 bg-gray-700 rounded w-full mt-3" />
                            <div className="h-3 bg-gray-700 rounded w-2/4 mt-2" />
                        </div>
                    </div>
                ) : collectionData ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/30 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6"
                    >
                        <img
                            src={collectionData.cover || "/default-collection.png"}
                            alt={collectionData.title}
                            className="w-36 h-36 object-cover rounded-xl border border-blue-400 shadow-md"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">{collectionData.title}</h1>
                                <p className="text-gray-300 mt-2">{collectionData.description || "Sem descrição para esta coleção."}</p>
                            </div>
                            <div className="mt-4 text-gray-400 text-sm space-y-1">
                                <p>Total de livros: {totalBooks}</p>
                                <p>Autores: {authors || "Nenhum autor"}</p>
                                {totalPages > 0 && <p>Total de páginas: {totalPages}</p>}
                                {collectionData.createdAt && <p>Criado em: {collectionData.createdAt}</p>}

                                <div className="w-full bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
                                    <motion.div
                                        className="bg-cyan-400 h-3 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                                <p className="text-gray-300 text-xs mt-1">
                                    XP: {xp}/{nextLevel} - Level {level}
                                </p>

                                {medal && <motion.p key={medal} transition={{ duration: 0.5 }} className="mt-2 text-lg text-yellow-400">{medal}</motion.p>}

                                <div className="flex gap-3 mt-2 flex-wrap">
                                    {badges.map((b) => b.achieved && (
                                        <motion.div key={b.name} transition={{ duration: 0.5 }} className="px-2 py-1 bg-yellow-400 text-black rounded-full text-xs font-semibold shadow-md">
                                            {b.emoji} {b.name}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center text-white">Coleção não encontrada.</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/25 rounded-2xl p-4 shadow-md">
                        <h3 className="text-white font-semibold">Conquistas</h3>
                        <p className="text-gray-400 text-sm mt-1">Progresso desta coleção</p>
                        <div className="mt-3 space-y-2">
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-14 bg-gray-700/50 rounded-xl animate-pulse" />
                            )) : achievements.map((a) => (
                                <div key={a.id} className="flex items-center justify-between bg-white/3 rounded-md p-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.unlocked ? "bg-green-500" : "bg-gray-700"}`}>
                                            {a.unlocked ? "✓" : "•"}
                                        </div>
                                        <div>
                                            <div className="text-white text-sm">{a.title}</div>
                                            <div className="text-gray-400 text-xs">{a.desc}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-200">{a.unlocked ? "Desbloqueado" : "Bloqueado"}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black/25 rounded-2xl p-4 shadow-md">
                        <h3 className="text-white font-semibold">Resumo</h3>
                        <div className="mt-3 text-gray-300 text-sm space-y-2">
                            {loading ? Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-4 bg-gray-700/50 rounded animate-pulse" />
                            )) : (
                                <>
                                    <div>Total de livros: <strong className="text-white">{totalBooks}</strong></div>
                                    <div>Total lidos: <strong className="text-white">{totalRead}</strong></div>
                                    <div>Progresso: <strong className="text-white">{readPercent}%</strong></div>
                                    <div>Medalha: <strong className="text-yellow-400">{readPercent >= 66 ? "Ouro" : readPercent >= 33 ? "Prata" : "Bronze"}</strong></div>
                                    <div>Nível: <strong className="text-white">{level}</strong></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-2 mt-4">
                    {[
                        { key: "all", label: "Todos" },
                        { key: "read", label: "Lidos" },
                        { key: "unread", label: "Não Lidos" },
                        { key: "author", label: "Autor A-Z" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                border-2
                ${filter === f.key ? "bg-cyan-500 border-cyan-400 text-white shadow-lg" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-cyan-400"}
                flex items-center gap-1
            `}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-5">
                    {loading ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-gray-700/70 rounded-xl h-48 animate-pulse" />
                    )) : filteredBooks.map((book) => (
                        <motion.div
                            key={book.id}
                            whileHover={{ scale: 1.04 }}
                            className="relative bg-gray-900/60 rounded-xl shadow-lg overflow-hidden border border-transparent hover:border-cyan-400 transition-all"
                        >
                            <img
                                src={book.cover || "/default-book.png"}
                                alt={book.title}
                                className="w-full h-44 object-cover object-top"
                            />
                            <div className="p-3 flex flex-col justify-between h-28">
                                <div>
                                    <h3 className="text-white font-semibold text-sm line-clamp-2">{book.title}</h3>
                                    <p className="text-gray-400 text-xs mt-1 line-clamp-1">{book.author}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <button
                                        onClick={() => toggleRead(book.id)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${book.read ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-700 text-gray-200 hover:bg-gray-600"}`}
                                    >
                                        {book.read ? "Lido" : "Marcar Lido"}
                                    </button>
                                    <button
                                        onClick={() => setBookToDelete(book)}
                                        className="p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {bookToDelete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                className="bg-blue-950/95 rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col items-center"
                            >
                                <h2 className="text-xl font-bold text-white mb-4">Confirmar exclusão</h2>
                                <p className="text-gray-300 text-center mb-6">
                                    Tem certeza que deseja remover <strong>{bookToDelete.title}</strong> da coleção?
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => setBookToDelete(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition">Cancelar</button>
                                    <button onClick={() => removeBook(bookToDelete.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition">Remover</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
