import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";
import toast from "react-hot-toast";

interface Book {
    id: string;
    title: string;
    author: string;
    cover?: string;
}

interface Collection {
    id: string;
    title: string;
    description?: string;
    cover?: string;
}

export default function CollectionDetails() {
    const { id } = useParams();
    const [collectionData, setCollectionData] = useState<Collection | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newBookTitle, setNewBookTitle] = useState("");
    const [newBookAuthor, setNewBookAuthor] = useState("");

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;

            try {
                const colRef = doc(db, "collections", id);
                const colSnap = await getDoc(colRef);
                if (colSnap.exists()) {
                    setCollectionData({ ...(colSnap.data() as Collection), id: colSnap.id });
                }

                const booksRef = collection(db, "collections", id, "books");
                const booksSnap = await getDocs(booksRef);
                const booksList: Book[] = booksSnap.docs.map((b) => ({
                    ...(b.data() as Book),
                    id: b.id,
                }));
                setBooks(booksList);
            } catch (err) {
                console.error(err);
                toast.error("Erro ao carregar coleção.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleAddBook = async () => {
        if (!id || !newBookTitle.trim()) return;
        try {
            setAdding(true);
            const bookData = {
                title: newBookTitle,
                author: newBookAuthor || "Autor desconhecido",
                createdAt: new Date(),
            };
            const booksRef = collection(db, "collections", id, "books");
            const docRef = await addDoc(booksRef, bookData);
            setBooks((prev) => [...prev, { ...bookData, id: docRef.id }]);
            setNewBookTitle("");
            setNewBookAuthor("");
            toast.success("Livro adicionado!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar livro.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Carregando coleção...
            </div>
        );
    }

    if (!collectionData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                Coleção não encontrada.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />
            <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 backdrop-blur-md rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6"
                >
                    <img
                        src={collectionData.cover || "/default-collection.png"}
                        alt={collectionData.title}
                        className="w-48 h-48 object-cover rounded-xl border border-blue-400"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-white">{collectionData.title}</h1>
                        {collectionData.description && (
                            <p className="text-gray-300 mt-2">{collectionData.description}</p>
                        )}
                        <p className="text-gray-400 mt-4">Livros: {books.length}</p>
                    </div>
                </motion.div>

                <div className="bg-black/20 rounded-2xl p-6 shadow-inner flex flex-col gap-4">
                    <h2 className="text-xl text-white font-semibold">Adicionar Livro</h2>
                    <input
                        type="text"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        placeholder="Título do livro"
                        className="p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                        type="text"
                        value={newBookAuthor}
                        onChange={(e) => setNewBookAuthor(e.target.value)}
                        placeholder="Autor (opcional)"
                        className="p-3 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Button
                        label={adding ? "Adicionando..." : "Adicionar Livro"}
                        style="primary"
                        onClick={handleAddBook}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <motion.div
                            key={book.id}
                            whileHover={{ scale: 1.05 }}
                            className="bg-gray-800/60 p-4 rounded-2xl shadow-lg"
                        >
                            <img
                                src={book.cover || "/default-book.png"}
                                alt={book.title}
                                className="w-full h-40 object-cover rounded-lg mb-2"
                            />
                            <h3 className="text-white font-semibold text-center">{book.title}</h3>
                            <p className="text-gray-400 text-sm text-center">{book.author}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
