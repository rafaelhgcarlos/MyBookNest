import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";
import { FiArrowLeft, FiExternalLink, FiBookOpen, FiTag, FiCalendar, FiLayers } from "react-icons/fi";

interface Book {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        description?: string;
        imageLinks?: {
            thumbnail?: string;
            smallThumbnail?: string;
        };
        publisher?: string;
        publishedDate?: string;
        pageCount?: number;
        categories?: string[];
        previewLink?: string;
        infoLink?: string;
        averageRating?: number;
        ratingsCount?: number;
    };
}

export default function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stripHtml = (html?: string) =>
        html ? html.replace(/<[^>]+>/g, "") : "";

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
            } catch (err: any) {
                console.error("Erro ao carregar livro:", err);
                setError("Não foi possível carregar os detalhes do livro.");
            } finally {
                setLoading(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        };
        fetchBook();
    }, [id]);

    const info = book?.volumeInfo;

    const coverSrc = useMemo(() => {
        const t = info?.imageLinks?.thumbnail || info?.imageLinks?.smallThumbnail;
        return t ? t.replace("&edge=curl", "").replace("http://", "https://") : null;
    }, [info?.imageLinks]);

    const rating = info?.averageRating ?? 4;
    const ratingsCount = info?.ratingsCount ?? 0;

    const Stars = ({ value = 0 }) => (
        <span className="select-none" aria-label={`Avaliação ${value} de 5`}>
      {"★".repeat(Math.round(value))}
            {"☆".repeat(5 - Math.round(value))}
    </span>
    );

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
                <Header />
                <main className="flex-1 max-w-6xl mx-auto px-6 pt-28 pb-20">
                    <div className="relative">
                        <div className="absolute inset-0 -z-10 blur-3xl opacity-40">
                            <div className="h-40 w-40 bg-blue-700/40 rounded-full absolute -top-6 -left-4" />
                            <div className="h-56 w-56 bg-indigo-600/30 rounded-full absolute top-10 right-10" />
                        </div>

                        <div className="bg-blue-900/50 border border-blue-800/70 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl">
                            <div className="flex flex-col md:flex-row gap-8 animate-pulse">
                                <div className="w-48 h-72 bg-blue-800/70 rounded-2xl" />
                                <div className="flex-1 space-y-4">
                                    <div className="h-8 w-2/3 bg-blue-800/70 rounded-lg" />
                                    <div className="h-5 w-1/2 bg-blue-800/70 rounded-lg" />
                                    <div className="h-5 w-1/3 bg-blue-800/70 rounded-lg" />
                                    <div className="h-24 w-full bg-blue-800/70 rounded-xl" />
                                    <div className="h-10 w-56 bg-blue-800/70 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !book || !info) {
        return (
            <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
                <Header />
                <main className="flex-1 max-w-6xl mx-auto px-6 pt-28 pb-20">
                    <Link
                        to="/biblioteca"
                        className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition mb-6"
                    >
                        <FiArrowLeft /> Voltar para a Biblioteca
                    </Link>
                    <div className="bg-blue-900/60 border border-blue-800 rounded-3xl p-8 backdrop-blur-xl">
                        <p className="text-blue-200"> {error ?? "Livro não encontrado."} </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white">
            <Header />

            <main className="flex-1 max-w-6xl mx-auto px-6 pt-28 pb-24 relative">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute -top-10 -left-10 h-40 w-40 bg-blue-700/40 rounded-full blur-3xl" />
                    <div className="absolute top-40 -right-10 h-56 w-56 bg-indigo-600/40 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 left-1/3 h-24 w-24 bg-sky-500/30 rounded-full blur-2xl" />
                </div>

                <Link
                    to="/biblioteca"
                    className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition mb-6"
                >
                    <FiArrowLeft /> Voltar para a Biblioteca
                </Link>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="bg-blue-900/55 border border-blue-800/70 rounded-3xl p-6 md:p-10 backdrop-blur-xl shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                        <motion.div
                            initial={{ scale: 0.98, rotate: 0 }}
                            whileHover={{ scale: 1.02, rotate: -0.5 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                            className="self-start"
                        >
                            {coverSrc ? (
                                <img
                                    src={coverSrc}
                                    alt={`Capa do livro ${info.title}`}
                                    className="w-48 md:w-56 h-auto rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)] object-cover ring-1 ring-blue-800/60"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="w-48 md:w-56 h-72 bg-blue-800/70 text-blue-300 rounded-2xl flex items-center justify-center">
                                    Sem capa
                                </div>
                            )}
                        </motion.div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-4xl font-extrabold text-blue-100 tracking-tight">
                                {info.title}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-300/90">
                <span className="italic">
                  {info.authors?.join(", ") || "Autor desconhecido"}
                </span>
                                <span className="opacity-50">•</span>
                                <span className="inline-flex items-center gap-2">
                  <Stars value={rating} />{" "}
                                    <span className="text-blue-400/80">
                    {ratingsCount > 0 ? `(${ratingsCount})` : "sem avaliações"}
                  </span>
                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <FiCalendar className="opacity-80" />
                                    <span className="text-blue-300/90">
                    {info.publishedDate || "Data indisp."}
                  </span>
                                </div>
                                <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <FiBookOpen className="opacity-80" />
                                    <span className="text-blue-300/90">
                    {info.pageCount ? `${info.pageCount} páginas` : "Páginas indisp."}
                  </span>
                                </div>
                                <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <FiLayers className="opacity-80" />
                                    <span className="text-blue-300/90">
                    {info.publisher || "Editora indisp."}
                  </span>
                                </div>
                            </div>

                            {info.categories && info.categories.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {info.categories.map((c) => (
                                        <span
                                            key={c}
                                            className="inline-flex items-center gap-2 text-xs bg-sky-400/10 text-sky-200 px-3 py-1 rounded-full border border-sky-500/20"
                                        >
                      <FiTag className="opacity-80" />
                                            {c}
                    </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-blue-100 mb-2">
                                    Descrição
                                </h2>
                                <p
                                    className={`text-blue-100/90 leading-relaxed ${
                                        expanded ? "" : "line-clamp-5"
                                    }`}
                                >
                                    {stripHtml(info.description) || "Nenhuma descrição disponível."}
                                </p>
                                {info.description && info.description.length > 300 && (
                                    <button
                                        onClick={() => setExpanded((s) => !s)}
                                        className="mt-2 text-sm text-blue-300 hover:text-white transition"
                                    >
                                        {expanded ? "Ver menos" : "Ver mais"}
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button
                                    label="Adicionar à Biblioteca"
                                    onClick={() => {}}
                                    style="primary"
                                />
                                {info.previewLink && (
                                    <a
                                        href={info.previewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-700 bg-blue-950/40 hover:bg-blue-900/50 transition no-underline text-blue-100"
                                    >
                                        <FiExternalLink /> Ler amostra
                                    </a>
                                )}
                                {info.infoLink && (
                                    <a
                                        href={info.infoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-700 bg-blue-950/40 hover:bg-blue-900/50 transition no-underline text-blue-100"
                                    >
                                        <FiExternalLink /> Página do livro
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
