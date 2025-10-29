import {useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {auth, db} from "../lib/firebase";
import {doc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc, Timestamp} from "firebase/firestore";
import {type User as FirebaseUser} from "firebase/auth";
import Button from "../components/Button/Button";
import Header from "../components/NavBar/Header";
import {motion} from "framer-motion";
import toast from "react-hot-toast";
import {Trash2} from "lucide-react";
import {useMemo} from "react";

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
    medal?: string[];
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export default function MyProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBio, setEditingBio] = useState(false);
    const [bioText, setBioText] = useState("");
    const [collections, setCollections] = useState<Collection[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: null as "collection" | "book" | null,
        id: null as string | null,
        title: null as string | null,
    });
    const [favoriteGenre, setFavoriteGenre] = useState("—");
    const [lastRead, setLastRead] = useState("—");
    const [sortFilter, setSortFilter] = useState<"medal" | "created" | "alpha">("created");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const sortOptions = [
        {label: "Ordem de Criação", value: "created", icon: "🕒"},
        {label: "Alfabética (A-Z)", value: "alpha", icon: "🔤"},
        {label: "Medalha", value: "medal", icon: "🥇"},
    ];


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            if (!firebaseUser) {
                navigate("/entrar");
                return;
            }

            try {
                const collectionsRef = collection(db, "collections");
                const qCollections = query(collectionsRef, where("userId", "==", firebaseUser.uid));
                const collectionsSnap = await getDocs(qCollections);

                const userCollections: Collection[] = [];
                const allBooks: Book[] = [];
                const genreCount: Record<string, number> = {};

                for (const colDoc of collectionsSnap.docs) {
                    const colData = colDoc.data() as Collection;
                    const collectionId = colDoc.id;
                    userCollections.push({...colData, id: collectionId});

                    const booksRef = collection(db, "collections", collectionId, "books");
                    const booksSnap = await getDocs(booksRef);

                    booksSnap.forEach((bookDoc) => {
                        const bookData = bookDoc.data() as Book;
                        allBooks.push({...bookData, id: bookDoc.id});

                        if (bookData.genre) {
                            genreCount[bookData.genre] = (genreCount[bookData.genre] || 0) + 1;
                        }
                    });
                }

                setCollections(userCollections);
                setBooks(allBooks);

                const mostReadGenre =
                    Object.entries(genreCount)
                        .sort(([, a], [, b]) => b - a)[0]?.[0] || "—";
                setFavoriteGenre(mostReadGenre);

                const lastReadBook = allBooks
                    .filter((b) => b.readDate)
                    .sort((a, b) => new Date(b.readDate!).getTime() - new Date(a.readDate!).getTime())[0];
                setLastRead(lastReadBook ? lastReadBook.title : "—");

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
            el.scrollLeft += velocity;
            velocity *= 0.85;
            if (Math.abs(velocity) > 0.5) {
                animationFrame = requestAnimationFrame(smoothScroll);
            } else {
                velocity = 0;
            }
        };

        el.addEventListener("wheel", handleWheel, {passive: false});
        return () => {
            el.removeEventListener("wheel", handleWheel);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const openDeleteModal = (type: "collection" | "book", id: string, title: string) => {
        setDeleteModal({open: true, type, id, title});
    };
    const closeDeleteModal = () => setDeleteModal({open: false, type: null, id: null, title: null});

    const handleDelete = async () => {
        if (!deleteModal.id || !deleteModal.type) return;

        try {
            if (deleteModal.type === "collection") {
                const booksRef = collection(db, "collections", deleteModal.id, "books");
                const booksSnap = await getDocs(booksRef);
                const batchPromises = booksSnap.docs.map((bookDoc) => deleteDoc(bookDoc.ref));
                await Promise.all(batchPromises);

                await deleteDoc(doc(db, "collections", deleteModal.id));

                setCollections(prev => prev.filter(c => c.id !== deleteModal.id));
                setBooks(prev => prev.filter(b => !booksSnap.docs.some(doc => doc.id === b.id)));

                toast.success("Coleção deletada com sucesso!");
            } else if (deleteModal.type === "book") {
                const bookToDelete = books.find(b => b.id === deleteModal.id);
                if (!bookToDelete) throw new Error("Livro não encontrado.");

                const collectionId = (bookToDelete as any).collectionId;
                await deleteDoc(doc(db, "collections", collectionId, "books", deleteModal.id));

                setBooks(prev => prev.filter(b => b.id !== deleteModal.id));

                toast.success("Livro deletado com sucesso!");
            }
        } catch (err) {
            console.error("Erro ao deletar:", err);
            toast.error("Erro ao deletar. Tente novamente.");
        } finally {
            closeDeleteModal();
        }
    };

    const handleBioSave = async () => {
        if (!user) return;
        const userRef = doc(db, "users", auth.currentUser!.uid);
        try {
            await updateDoc(userRef, {bio: bioText});
            setUser({...user, bio: bioText});
            setEditingBio(false);
            toast.dismiss();
            toast.success("Biografia atualizada com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar bio:", err);
            toast.dismiss();
            toast.error("Não foi possível atualizar a biografia. Tente novamente.");
        }
    };

    const getMedalText = (medal: string | string[] | null | undefined) => {
        if (!medal) return null;
        const medalStr = Array.isArray(medal) ? medal[0] : medal;
        if (medalStr.includes("Ouro")) return "Ouro";
        if (medalStr.includes("Prata")) return "Prata";
        if (medalStr.includes("Bronze")) return "Bronze";
        return null;
    };

    const sortedCollections = useMemo(() => {
        const cols = [...collections];
        const medalOrder = ["Ouro", "Prata", "Bronze"];

        if (sortFilter === "medal") {
            cols.sort((a, b) => {
                const aMedalText = getMedalText(a.medal);
                const bMedalText = getMedalText(b.medal);

                const aIndex = aMedalText ? medalOrder.indexOf(aMedalText) : medalOrder.length;
                const bIndex = bMedalText ? medalOrder.indexOf(bMedalText) : medalOrder.length;

                return aIndex - bIndex;
            });
        } else if (sortFilter === "alpha") {
            cols.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortFilter === "created") {
            cols.sort((a, b) => {
                const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });
        }

        return cols;
    }, [collections, sortFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header/>
            <div
                className={`max-w-6xl mx-auto p-6 md:p-12 flex flex-col gap-8 transition-all duration-300 ${deleteModal.open ? 'blur-sm opacity-70 pointer-events-none' : ''}`}>
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full max-w-4xl mx-auto p-6 rounded-3xl shadow-2xl bg-black/20"
                >
                    <div className="w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                        {loading ? (
                            <div
                                className="w-32 h-32 rounded-full bg-gray-700 animate-pulse border-2 border-gradient-to-r from-blue-400 to-purple-500 shadow-lg"/>
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
                                <div
                                    className="p-4 rounded-2xl shadow-inner flex flex-col min-h-[120px] bg-blue-900/40 w-full">
          <textarea
              value={bioText}
              onChange={(e) =>
                  e.target.value.length <= 300 && setBioText(e.target.value)
              }
              className="w-full min-h-[100px] p-3 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Escreva sua biografia..."
          />
                                    <div className="flex flex-col sm:flex-row gap-2 mt-3 items-center">
                                        <Button label="Salvar" style="primary" onClick={handleBioSave}/>
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
                                    whileHover={{scale: 1.02}}
                                    className="w-full min-h-[120px] flex items-start cursor-pointer rounded-2xl border-2 border-transparent hover:border-dashed hover:border-blue-400 transition-all p-4 bg-gray-900/20"
                                    onClick={() => setEditingBio(true)}
                                >
                                    <p className="text-gray-300 text-left break-all">
                                        {user?.bio || "Clique para adicionar uma biografia."}
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

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {Array.from({length: 3}).map((_, i) => (
                            <div
                                key={i}
                                className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-lg animate-pulse"
                            >
                                <div className="w-10 h-10 mb-2 rounded-full bg-gray-600"/>
                                <div className="w-20 h-3 mb-2 bg-gray-600 rounded"/>
                                <div className="w-12 h-6 bg-gray-500 rounded mt-1"/>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            {label: "Livros", value: books.length, icon: "📚"},
                            {label: "Gênero favorito", value: favoriteGenre, icon: "🎭"},
                            {label: "Última leitura", value: lastRead, icon: "🕯️"},
                        ].map(({label, value, icon}) => (
                            <motion.div
                                key={label}
                                whileHover={{scale: 1.05}}
                                className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-lg"
                            >
                                <span className="text-3xl mb-2">{icon}</span>
                                <p className="text-gray-400 text-sm">{label}</p>
                                <motion.h2
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.4}}
                                    className="text-2xl font-bold text-white"
                                >
                                    {value}
                                </motion.h2>
                            </motion.div>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full mt-8">
                        <div className="w-1/2 h-8 bg-gray-600 rounded animate-pulse"/>
                        <div className="flex gap-2">
                            <div className="w-32 h-10 bg-gray-600 rounded animate-pulse"/>
                            <div className="w-24 h-10 bg-gray-600 rounded animate-pulse"/>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                        <h2 className="text-2xl font-semibold text-white break-words max-w-full md:max-w-[60%]">
                            Minhas Coleções
                        </h2>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
                            {collections.length > 0 && (
                                <Button
                                    label="+ Nova Coleção"
                                    style="primary"
                                    onClick={() => navigate("/criar-colecao")}
                                />
                            )}

                            {collections.length > 0 && (
                                <div className="relative">
                                    <motion.button
                                        onClick={() => setDropdownOpen(prev => !prev)}
                                        whileTap={{scale: 0.95}}
                                        className="flex justify-between items-center w-full md:w-auto gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                                    >
              <span className="flex items-center gap-2">
                {sortOptions.find(o => o.value === sortFilter)?.icon}{" "}
                  {sortOptions.find(o => o.value === sortFilter)?.label}
              </span>
                                        <span>▾</span>
                                    </motion.button>

                                    {dropdownOpen && (
                                        <motion.ul
                                            initial={{opacity: 0, y: -10}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -10}}
                                            className="absolute mt-2 min-w-[200px] w-full md:w-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden z-50 border border-blue-500/30"
                                        >
                                            {sortOptions.map(option => (
                                                <motion.li
                                                    key={option.value}
                                                    whileHover={{backgroundColor: "rgba(59, 130, 246, 0.2)"}}
                                                    onClick={() => {
                                                        setSortFilter(option.value as any);
                                                        setDropdownOpen(false);
                                                    }}
                                                    className="cursor-pointer px-4 py-2 flex items-center gap-2 text-white transition whitespace-nowrap"
                                                >
                                                    {option.icon} {option.label}
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scroll-smooth py-4 px-2"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#3B82F6 #1E293B",
                        }}
                    >

                        {!loading && collections.length == 0 && (
                            <motion.div
                                whileHover={{scale: 1.05}}
                                onClick={() => navigate("/criar-colecao")}
                                className="flex-shrink-0 w-64 flex flex-col items-center justify-center gap-3 bg-gray-800/60 p-6 rounded-2xl shadow-lg cursor-pointer border-2 border-dashed border-blue-400 hover:border-blue-500 transition-colors"
                            >
                                <div
                                    className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-400/20 text-blue-400 text-4xl font-bold">
                                    +
                                </div>
                                <p className="text-white font-medium text-center">Criar Nova Coleção</p>
                            </motion.div>
                        )}

                        {loading ? (
                            <div className="flex gap-4 overflow-x-auto py-4 px-2">
                                {Array.from({ length: 1 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="relative flex-shrink-0 w-48 sm:w-56 md:w-64 bg-gray-700/50 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg animate-pulse flex flex-col items-center gap-2 sm:gap-3"
                                    >
                                        <div className="absolute -top-2 -left-2 w-8 h-4 sm:w-10 sm:h-5 bg-gray-600 rounded-full" />
                                        <div className="w-full h-36 sm:h-44 md:h-48 bg-gray-600 rounded-xl mb-2" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl" />
                                        <div className="h-4 w-3/4 bg-gray-600 rounded mb-1" />
                                        <div className="h-3 w-5/6 bg-gray-600 rounded mb-1" />
                                    </div>
                                ))}
                            </div>
                        ) : collections.length > 0
                            ? sortedCollections.map((col) => (
                                <motion.div
                                    key={col.id}
                                    whileHover={{scale: 1.05}}
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
                                        <Trash2 className="w-5 h-5"/>
                                    </button>

                                    <div className="relative">
                                        {col.medal && (
                                            <motion.div
                                                initial={{opacity: 0, y: -10}}
                                                animate={{opacity: 1, y: 0}}
                                                className={`absolute -top-3 -left-3 px-2 py-1 rounded-full text-xs font-bold text-black shadow-md ${
                                                    col.medal.includes("Ouro")
                                                        ? "bg-yellow-400"
                                                        : col.medal.includes("Prata")
                                                            ? "bg-gray-300"
                                                            : "bg-amber-700"
                                                }`}
                                            >
                                                {col.medal}
                                            </motion.div>
                                        )}
                                        <img
                                            src={col.cover || "/default-collection.png"}
                                            alt={col.title}
                                            className="w-full h-48 object-cover rounded-xl"
                                        />
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                                    </div>

                                    <h3 className="text-white font-semibold text-center text-lg truncate">{col.title}</h3>

                                    {col.description && (
                                        <p className="text-gray-400 text-sm text-center line-clamp-2">{col.description}</p>
                                    )}
                                </motion.div>
                            ))
                            : ('')}
                    </div>
                </div>
            </div>

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        exit={{scale: 0.8, opacity: 0}}
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
