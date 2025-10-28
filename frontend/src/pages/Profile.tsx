import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { type User as FirebaseUser } from "firebase/auth";
import Button from "../components/Button/Button";
import Header from "../components/NavBar/Header";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

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
    bio?: string;
}

interface Collection {
    id: string;
    title: string;
    description?: string;
    cover?: string;
}

export default function MyProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<Record<string, number>>({});
    const [editingBio, setEditingBio] = useState(false);
    const [bioText, setBioText] = useState("");
    const [collections, setCollections] = useState<Collection[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        type: "collection" | "book" | null;
        id: string | null;
        title: string | null;
    }>({ open: false, type: null, id: null, title: null });

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
                    const userData: User = {
                        displayName: [data.name, data.lastName].filter(Boolean).join(" "),
                        email: data.email,
                        photoURL:
                            data.photoBase64 ||
                            data.photoURL ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                [data.name, data.lastName].filter(Boolean).join(" ")
                            )}&background=1F2937&color=FFFFFF&rounded=true`,
                        bio: data.bio || "",
                    };
                    setUser(userData);
                    setBioText(userData.bio || "");
                } else {
                    setUser({
                        displayName: firebaseUser.displayName || firebaseUser.email || "Usuário",
                        email: firebaseUser.email || "",
                        photoURL: firebaseUser.photoURL || "/default-avatar.png",
                        bio: "",
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
                    if (data.genre) genreCount[data.genre] = (genreCount[data.genre] || 0) + 1;
                });

                const collectionsRef = collection(db, "collections");
                const qCollections = query(collectionsRef, where("userId", "==", firebaseUser.uid));
                const collectionsSnap = await getDocs(qCollections);

                const userCollections: Collection[] = [];
                collectionsSnap.forEach((doc) => {
                    const data = doc.data() as Collection;
                    userCollections.push({ ...data, id: doc.id });
                });

                setCollections(userCollections);

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

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let velocity = 0;
        let animationFrame: number;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            velocity += e.deltaY * 50;
            cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(smoothScroll);
        };

        const smoothScroll = () => {
            if (!el) return;

            let nextScroll = el.scrollLeft + velocity;

            if (nextScroll < -50) nextScroll = -50;
            else if (nextScroll > el.scrollWidth - el.clientWidth + 50) {
                nextScroll = el.scrollWidth - el.clientWidth + 50;
            }

            el.scrollLeft = nextScroll;

            velocity *= 0.85;

            if (nextScroll < 0 || nextScroll > el.scrollWidth - el.clientWidth) {
                velocity *= 0.5;
            }

            if (Math.abs(velocity) > 0.5) {
                animationFrame = requestAnimationFrame(smoothScroll);
            } else {
                velocity = 0;
            }
        };

        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const openDeleteModal = (type: "collection" | "book", id: string, title: string) => {
        setDeleteModal({ open: true, type, id, title});
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, type: null, id: null, title: null });
    };

    const handleDelete = async () => {
        if (!deleteModal.id || !deleteModal.type) return;

        try {
            if (deleteModal.type === "collection") {
                await deleteDoc(doc(db, "collections", deleteModal.id));
                setCollections(prev => prev.filter(c => c.id !== deleteModal.id));
            }
            if (deleteModal.type === "book") {
                await deleteDoc(doc(db, "books", deleteModal.id));
                setBooks(prev => prev.filter(b => b.id !== deleteModal.id));
            }
            toast.success(`${deleteModal.type === "collection" ? "Coleção" : "Livro"} deletado!`);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao deletar.");
        } finally {
            closeDeleteModal();
        }
    };

    const handleBioSave = async () => {
        if (!user) return;
        const userRef = doc(db, "users", auth.currentUser!.uid);
        try {
            await updateDoc(userRef, { bio: bioText });
            setUser({ ...user, bio: bioText });
            setEditingBio(false);
            toast.dismiss()
            toast.success("Biografia atualizada com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar bio:", err);
            toast.dismiss()
            toast.error("Não foi possível atualizar a biografia. Tente novamente.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />
            <div className={`max-w-6xl mx-auto p-6 md:p-12 flex flex-col gap-8 transition-all duration-300 ${deleteModal.open ? 'blur-sm opacity-70 pointer-events-none' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl shadow-2xl bg-black/20"
                >
                    <div className="w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                        {loading ? (
                            <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse border-2 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg" />
                        ) : (
                            <img
                                src={user?.photoURL}
                                alt="Foto de perfil"
                                className="w-32 h-32 object-cover rounded-full border-2 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg"
                            />
                        )}
                    </div>

                    <div className="flex-1 flex flex-col gap-3 justify-start w-full">
                        <h1 className="text-3xl font-bold text-white text-center md:text-left">{user?.displayName}</h1>
                        <p className="text-gray-300 text-center md:text-left">{user?.email}</p>

                        <div className="mt-2 text-left w-full max-w-full">
                            {user?.bio && !editingBio && (
                                <span className="text-gray-400 text-sm font-medium mb-1 block">Biografia</span>
                            )}

                            {editingBio ? (
                                <div className="p-4 rounded-2xl shadow-inner flex flex-col min-h-[120px] bg-blue-900/40 w-full">
          <textarea
              value={bioText}
              onChange={(e) =>
                  e.target.value.length <= 300 && setBioText(e.target.value)
              }
              className="w-full min-h-[100px] p-3 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Escreva sua biografia..."
          />
                                    <div className="flex flex-col sm:flex-row gap-2 mt-3 items-center">
                                        <Button label="Salvar" style="primary" onClick={handleBioSave} />
                                        <Button
                                            label="Cancelar"
                                            style="secondary"
                                            onClick={() => {
                                                setEditingBio(false);
                                                setBioText(user?.bio || "");
                                            }}
                                        />
                                        <span className="ml-auto text-gray-400 text-sm">{bioText.length}/300</span>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full min-h-[120px] flex items-start cursor-pointer rounded-2xl border-2 border-transparent hover:border-dashed hover:border-blue-400 transition-all p-4 bg-gray-900/20"
                                    onClick={() => setEditingBio(true)}
                                >
                                    <p className="text-gray-300 text-left break-all">
                                        {user?.bio || "Clique aqui para adicionar uma biografia."}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-center md:justify-start">
                            <Button
                                label="Editar Perfil"
                                style="primary"
                                onClick={() => navigate("/editar-perfil")}
                            />
                        </div>
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
                                        {book.readDate && (
                                            <p className="text-gray-500 text-xs">Lido em: {book.readDate}</p>
                                        )}
                                        <Button
                                            label="Ver detalhes"
                                            style="ghost"
                                            onClick={() => navigate(`/livro/${book.id}`)}
                                        />
                                    </motion.div>
                                ))}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-white">Minhas Coleções</h2>

                    <div className="relative">
                        <div
                            ref={scrollRef}
                            className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2"
                            style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#3B82F6 #1E293B",
                            }}
                        >
                            {loading
                                ? (
                                    <div className="flex-shrink-0 w-64 h-64 bg-gray-700/50 rounded-2xl p-4 animate-pulse flex flex-col items-center gap-3">
                                        <div className="w-full h-40 bg-gray-600 rounded-lg" />
                                        <div className="h-5 w-3/4 bg-gray-600 rounded" />
                                        <div className="h-4 w-1/2 bg-gray-600 rounded" />
                                    </div>
                                )
                                : collections.length > 0
                                    ? collections.map((col) => (
                                        <motion.div
                                            key={col.id}
                                            whileHover={{ scale: 1.05 }}
                                            className="relative flex-shrink-0 w-64 bg-gray-800/60 backdrop-blur-md p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-gray-700/60 transition-all group"
                                            onClick={() => navigate(`/colecao/${col.id}`)}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteModal("collection", col.id, col.title);
                                                }}
                                                className="absolute top-2 right-2 text-red-500 bg-gray-900/50 p-1 rounded-full z-10 hover:bg-gray-900/70"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                                                <img
                                                    src={col.cover || "/default-collection.png"}
                                                    alt={col.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                            </div>

                                            <h3 className="text-white font-semibold text-center text-lg truncate">{col.title}</h3>

                                            {col.description && (
                                                <p className="text-gray-400 text-sm text-center line-clamp-2">{col.description}</p>
                                            )}
                                        </motion.div>
                                    ))
                                    : ('')}

                            {!loading && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => navigate("/criar-colecao")}
                                    className="flex-shrink-0 w-64 flex flex-col items-center justify-center gap-3 bg-gray-800/60 p-6 rounded-2xl shadow-lg cursor-pointer border-2 border-dashed border-blue-400 hover:border-blue-500 transition-colors"
                                >
                                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-400/20 text-blue-400 text-4xl font-bold">
                                        +
                                    </div>
                                    <p className="text-white font-medium text-center">Criar Nova Coleção</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-gray-900 rounded-2xl p-6 w-full max-w-xs sm:max-w-sm md:max-w-md text-center shadow-xl"
                    >
                        <h3 className="text-white text-lg font-semibold mb-4">
                            Confirmar exclusão
                        </h3>
                        <p className="text-gray-400 mb-6 text-sm sm:text-base break-words">
                            Tem certeza que deseja deletar{" "}
                            <span className="font-bold md:truncate">{deleteModal.title}</span>?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Button
                                label="Cancelar"
                                style="secondary"
                                onClick={closeDeleteModal}
                            />
                            <Button
                                label="Deletar"
                                style="primary"
                                onClick={handleDelete}
                            />
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
}
