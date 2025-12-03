import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    Timestamp,
} from "firebase/firestore";

import { motion } from "framer-motion";
import toast from "react-hot-toast";

import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";

import {
    Trash2,
    Search
} from "lucide-react";

interface Collection {
    id: string;
    title: string;
    description?: string;
    cover?: string;
    medal?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export default function CollectionsList() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [sortFilter, setSortFilter] = useState<"created" | "alpha" | "medal">("created");
    const [search, setSearch] = useState("");
    const [descending] = useState(true);

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        id: null as string | null,
        title: null as string | null,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const sortOptions = [
        { label: "Ordem de Criação", value: "created", icon: "🕒" },
        { label: "A-Z", value: "alpha", icon: "🔤" },
        { label: "Medalha", value: "medal", icon: "🥇" },
    ];

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                navigate("/entrar");
                return;
            }

            try {
                const ref = collection(db, "collections");
                const qCol = query(ref, where("userId", "==", user.uid));
                const snap = await getDocs(qCol);

                const result = snap.docs.map((d) => {
                    const data = d.data() as Omit<Collection, 'id'>;
                    return {
                        id: d.id,
                        ...data,
                    };
                });

                setCollections(result);
            } catch (err) {
                toast.error("Erro ao carregar coleções");
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const getMedalText = (medal?: string) => {
        if (!medal) return null;

        const m = medal.trim();

        if (m.includes("Ouro")) return "Ouro";
        if (m.includes("Prata")) return "Prata";
        if (m.includes("Bronze")) return "Bronze";

        return null;
    };

    const sortedCollections = useMemo(() => {
        let arr = [...collections];

        arr = arr.filter((c) =>
            c.title.toLowerCase().includes(search.toLowerCase())
        );

        const medalOrder = ["Ouro", "Prata", "Bronze"];

        if (sortFilter === "alpha") {
            arr.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortFilter === "medal") {
            arr.sort((a, b) => {
                const aM = getMedalText(a.medal);
                const bM = getMedalText(b.medal);

                const aIndex = aM ? medalOrder.indexOf(aM) : medalOrder.length;
                const bIndex = bM ? medalOrder.indexOf(bM) : medalOrder.length;

                return aIndex - bIndex;
            });
        } else {
            arr.sort(
                (a, b) =>
                    (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
            );
        }

        if (!descending) arr.reverse();

        return arr;
    }, [collections, search, sortFilter, descending]);

    const totalPages = Math.ceil(sortedCollections.length / itemsPerPage);

    const paginatedCollections = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return sortedCollections.slice(start, end);
    }, [sortedCollections, currentPage]);

    const handleDelete = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteDoc(doc(db, "collections", deleteModal.id));
            setCollections((prev) =>
                prev.filter((c) => c.id !== deleteModal.id)
            );
            toast.success("Coleção excluída!");
        } catch (err) {
            toast.error("Erro ao excluir.");
        } finally {
            setDeleteModal({ open: false, id: null, title: null });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />

            <div className="max-w-7xl mx-auto p-6 md:p-12 flex flex-col gap-10">

                {/* HEADER */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                            Minhas Coleções
                        </h1>
                        <p className="text-blue-300 mt-1">
                            {collections.length} coleções no total
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">

                        <div className="flex items-center bg-gray-900/60 px-4 py-2 rounded-xl border border-blue-700/30 w-full sm:w-64">
                            <Search className="text-blue-300 mr-2" size={18} />
                            <input
                                placeholder="Buscar..."
                                className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <select
                            value={sortFilter}
                            onChange={(e) => {
                                setSortFilter(e.target.value as any);
                                setCurrentPage(1);
                            }}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-blue-500/30 hover:border-blue-400 transition focus:ring-2 focus:ring-blue-500"
                        >
                            {sortOptions.map((opt) => (
                                <option
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-black"
                                >
                                    {opt.icon} {opt.label}
                                </option>
                            ))}
                        </select>

                        <Button
                            label="+ Nova Coleção"
                            style="primary"
                            onClick={() => navigate("/criar-colecao")}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-gray-800/50 animate-pulse rounded-2xl border border-blue-700/30"
                            />
                        ))}
                    </div>
                )}

                {!loading && sortedCollections.length === 0 && (
                    <div className="text-center text-gray-300 mt-20">
                        <p className="text-xl">Nenhuma coleção encontrada 😕</p>
                        <Button
                            label="Criar primeira coleção"
                            style="primary"
                            onClick={() => navigate("/criar-colecao")}
                        />
                    </div>
                )}

                {!loading && paginatedCollections.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {paginatedCollections.map((c) => {
                            const medal = getMedalText(c.medal);

                            const medalEmoji =
                                medal === "Ouro" ? "🥇" :
                                    medal === "Prata" ? "🥈" :
                                        medal === "Bronze" ? "🥉" : null;

                            return (
                                <motion.div
                                    key={c.id}
                                    whileHover={{ scale: 1.04 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => navigate(`/colecao/${c.id}`)}
                                    className="
        relative w-full max-w-[280px]
        bg-gray-900/40 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-xl cursor-pointer
        overflow-hidden hover:border-white/20
        transition-all
    "
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteModal({
                                                open: true,
                                                id: c.id,
                                                title: c.title,
                                            });
                                        }}
                                        className="
            absolute top-3 right-3 z-20
            bg-gray-900/60 p-1.5 rounded-full
            border border-white/10
            text-red-400 hover:bg-gray-900/80
        "
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    {medalEmoji && (
                                        <div
                                            className="
                absolute top-3 left-3
                flex items-center gap-2
                bg-gray-800/70 backdrop-blur-md
                border border-white/20 shadow-lg
                px-2 py-1 rounded-xl
                z-20
            "
                                        >
                                            <span className="text-xl">{medalEmoji}</span>
                                            <span className="text-xs font-semibold text-white">
                {c.medal?.replace(/🥇|🥈|🥉/g, '').trim()}
            </span>
                                        </div>
                                    )}

                                    <div className="relative h-48 w-full">
                                        <img
                                            src={c.cover || '/default-collection.png'}
                                            alt={c.title}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    </div>

                                    <div className="px-4 py-3 text-center">
                                        <h3 className="text-white font-semibold text-lg truncate">
                                            {c.title}
                                        </h3>

                                        {c.description && (
                                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                                {c.description}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!loading && sortedCollections.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-10">

                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-40"
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>

                        <span className="text-white text-lg">
                            Página {currentPage} de {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-40"
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </button>

                    </div>
                )}

            </div>

            {deleteModal.open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-gray-900 p-6 rounded-2xl text-white shadow-2xl w-80 border border-blue-700/40"
                    >
                        <h2 className="text-xl font-semibold mb-3">
                            Excluir coleção?
                        </h2>

                        <p className="text-gray-300">
                            A coleção{" "}
                            <span className="text-blue-400 font-semibold">
                                {deleteModal.title}
                            </span>{" "}
                            será removida permanentemente.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                label="Cancelar"
                                style="secondary"
                                onClick={() =>
                                    setDeleteModal({ open: false, id: null, title: null })
                                }
                            />
                            <Button
                                label="Excluir"
                                onClick={handleDelete}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
