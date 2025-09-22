import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { type User as FirebaseUser } from "firebase/auth";
import Button from "../components/Button/Button";
import Header from "../components/NavBar/Header";
import { motion } from "framer-motion";

interface Book {
    id: string;
    title: string;
    author: string;
    cover?: string;
    genre?: string;
    rating?: number;
    readDate?: string;
}

interface User {
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function MyProfile() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    const [genres, setGenres] = useState<Record<string, number>>({});

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            if (!firebaseUser) {
                navigate("/entrar");
                return;
            }

            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUser({
                        displayName: [data.name, data.lastName].filter(Boolean).join(" "),
                        email: data.email,
                        photoURL: data.photoURL || "",
                    });
                } else {
                    setUser({
                        displayName: firebaseUser.displayName || firebaseUser.email || "Usuário",
                        email: firebaseUser.email || "",
                        photoURL: firebaseUser.photoURL || "",
                    });
                }

                const booksRef = collection(db, "books");
                const q = query(booksRef, where("userId", "==", firebaseUser.uid));
                const booksSnap = await getDocs(q);
                const userBooks: Book[] = [];
                const genreCount: Record<string, number> = {};

                booksSnap.forEach((doc) => {
                    const data = doc.data() as Book;
                    userBooks.push({ ...data, id: doc.id });
                    if (data.genre) {
                        genreCount[data.genre] = (genreCount[data.genre] || 0) + 1;
                    }
                });

                setBooks(userBooks);
                setGenres(genreCount);
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />

            <div className="max-w-6xl mx-auto p-6 md:p-12 flex flex-col gap-8">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center gap-6 bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-lg"
                >
                    {loading ? (
                        <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse border-4 border-gradient-to-r from-blue-400 to-purple-500" />
                    ) : (
                        <img
                            src={user?.photoURL || "/default-avatar.png"}
                            alt="Foto de perfil"
                            className="w-32 h-32 rounded-full border-4 border-gradient-to-r from-blue-400 to-purple-500 object-cover"
                        />
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                        {loading ? (
                            <>
                                <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-1" />
                                <div className="h-4 w-64 bg-gray-700 rounded animate-pulse mb-2" />
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-white">{user?.displayName}</h1>
                                <p className="text-gray-300">{user?.email}</p>
                                <div className="mt-4 flex gap-3 justify-center">
                                    <Button label="Editar Perfil" style="primary" onClick={() => navigate("/editar-perfil")} />
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {!loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                    >
                        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg hover:scale-105 transform transition-transform">
                            <p className="text-gray-400">Livros adicionados</p>
                            <h2 className="text-2xl font-bold text-white">{books.length}</h2>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg hover:scale-105 transform transition-transform">
                            <p className="text-gray-400">Gênero favorito</p>
                            <h2 className="text-2xl font-bold text-white">
                                {Object.keys(genres).length > 0
                                    ? Object.entries(genres).sort((a, b) => b[1] - a[1])[0][0]
                                    : "—"}
                            </h2>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 text-center shadow-lg hover:scale-105 transform transition-transform">
                            <p className="text-gray-400">Última leitura</p>
                            <h2 className="text-2xl font-bold text-white">
                                {books.length > 0
                                    ? books
                                    .filter((b) => b.readDate)
                                    .sort((a, b) => (b.readDate! > a.readDate! ? 1 : -1))[0]?.title || "—"
                                    : "—"}
                            </h2>
                        </div>
                    </motion.div>
                )}

                {/* Meus livros */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-white">Meus Livros</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center gap-2 bg-gray-700/50 rounded-2xl p-4 animate-pulse"
                                >
                                    <div className="w-32 h-44 bg-gray-600 rounded-lg mb-2"></div>
                                    <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                    <div className="h-3 w-16 bg-gray-600 rounded"></div>
                                </div>
                            ))
                            : books.length === 0
                                ? <p className="text-gray-300">Você ainda não adicionou nenhum livro.</p>
                                : books.map((book) => (
                                    <motion.div
                                        key={book.id}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex flex-col items-center gap-2 bg-gray-800/60 p-4 rounded-2xl shadow-lg"
                                    >
                                        <div className="relative w-32 h-44">
                                            <img
                                                src={book.cover || "/default-book.png"}
                                                alt={book.title}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            {book.rating && (
                                                <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                                                    ⭐ {book.rating}/5
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-white font-medium text-center">{book.title}</h3>
                                        <p className="text-gray-300 text-sm text-center">{book.author}</p>
                                        {book.genre && <p className="text-gray-400 text-xs">{book.genre}</p>}
                                        {book.readDate && <p className="text-gray-500 text-xs">Lido em: {book.readDate}</p>}
                                        <Button label="Ver detalhes" style="ghost" onClick={() => navigate(`/livro/${book.id}`)} />
                                    </motion.div>
                                ))}
                    </div>
                </div>

                {/* Coleções */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-white">Minhas Coleções</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Card de criar nova coleção */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate("/colecoes")}
                            className="flex flex-col items-center justify-center gap-2 bg-gray-800/60 p-4 rounded-2xl shadow-lg cursor-pointer border-2 border-dashed border-blue-400 hover:border-blue-500 transition-colors"
                        >
                            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-400/20 text-blue-400 text-3xl font-bold">
                                +
                            </div>
                            <p className="text-white font-medium text-center">Criar Nova Coleção</p>
                        </motion.div>
                        {/* Futuramente renderizar cards de coleções do usuário */}
                    </div>
                </div>

            </div>
        </div>
    );
}
