import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import Header from "../components/NavBar/Header";
import Button from "../components/Button/Button";
import {db, auth} from "../lib/firebase";
import {collection, addDoc, serverTimestamp} from "firebase/firestore";
import toast from "react-hot-toast";

export default function CreateCollection() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cover, setCover] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [shakeTitle, setShakeTitle] = useState(false);
    const [shakeDescription, setShakeDescription] = useState(false);
    const [touchedTitle, setTouchedTitle] = useState(false);
    const [touchedDescription, setTouchedDescription] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCover(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (loading) return;
        let hasError = false;

        setTouchedTitle(true);
        setTouchedDescription(true);

        if (!title.trim()) {
            setShakeTitle(true);
            hasError = true;
            toast.error("Dê um nome para sua coleção!");
        } else if (title.trim().length > 50) {
            setShakeTitle(true);
            hasError = true;
            toast.error("O título não pode ter mais de 50 caracteres.");
        }

        if (description.trim().length > 200) {
            setShakeDescription(true);
            hasError = true;
            toast.error("A descrição não pode ter mais de 200 caracteres.");
        }

        if (hasError) return;

        const user = auth.currentUser;
        if (!user) {
            toast.dismiss();
            toast.error("Você precisa estar logado para criar uma coleção.");
            navigate("/entrar");
            return;
        }

        setLoading(true);
        toast.dismiss();

        try {
            const defaultCover = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                title || "Coleção"
            )}&background=1F2937&color=FFFFFF`;

            await addDoc(collection(db, "collections"), {
                title: title.trim(),
                description: description.trim(),
                cover: cover || defaultCover,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            toast.success("Coleção criada com sucesso!");
            navigate("/perfil");
        } catch (err) {
            console.error("Erro ao criar coleção:", err);
            toast.error("Não foi possível criar a coleção. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const shakeVariant = {
        shake: {x: [0, -8, 8, -8, 8, 0], transition: {duration: 0.4}},
        still: {x: 0},
    };

    const isTitleValid = !touchedTitle || (title.trim().length > 0 && title.trim().length <= 50);
    const isDescriptionValid = !touchedDescription || description.trim().length <= 200;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header/>

            <div className="max-w-3xl mx-auto p-6 md:p-12">
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6}}
                    className="bg-black/30 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/10"
                >
                    <div className="mb-4">
                        <Button
                            label="Voltar"
                            style="secondary"
                            onClick={() => navigate("/perfil")}
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-white text-center mb-8">
                        Criar Nova Coleção
                    </h1>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            <div
                                className="w-40 h-56 bg-gray-800/60 rounded-2xl border border-dashed border-blue-400/50 flex items-center justify-center overflow-hidden">
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt="Prévia da capa"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm text-center">
                                        Nenhuma capa
                                        <br/> selecionada
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-gray-300 text-sm font-medium">
                                    Upload da capa (opcional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="block text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                />
                            </div>
                        </div>

                        <motion.div
                            animate={shakeTitle ? "shake" : "still"}
                            variants={shakeVariant}
                            onAnimationComplete={() => setShakeTitle(false)}
                        >
                            <label className="text-gray-300 text-sm font-medium mb-2 block">
                                Nome da coleção *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    e.target.value.length <= 50 && setTitle(e.target.value)
                                }
                                onBlur={() => setTouchedTitle(true)}
                                placeholder="Ex: Meus livros favoritos de 2024"
                                maxLength={50}
                                className={`w-full p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                                    isTitleValid
                                        ? "bg-gray-900/50 focus:ring-blue-400 border border-transparent"
                                        : "bg-gray-900/50 border border-red-500 focus:ring-red-400"
                                }`}
                            />
                            <p
                                className={`text-xs mt-1 ${
                                    title.length >= 45 || !isTitleValid
                                        ? "text-red-400"
                                        : "text-gray-400"
                                }`}
                            >
                                {title.length}/50
                            </p>
                        </motion.div>

                        <motion.div
                            animate={shakeDescription ? "shake" : "still"}
                            variants={shakeVariant}
                            onAnimationComplete={() => setShakeDescription(false)}
                        >
                            <label className="text-gray-300 text-sm font-medium mb-2 block">
                                Descrição (opcional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) =>
                                    e.target.value.length <= 200 && setDescription(e.target.value)
                                }
                                onBlur={() => setTouchedDescription(true)}
                                placeholder="Conte um pouco sobre essa coleção..."
                                rows={4}
                                maxLength={200}
                                className={`w-full p-3 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 ${
                                    isDescriptionValid
                                        ? "bg-gray-900/50 focus:ring-blue-400 border border-transparent"
                                        : "bg-gray-900/50 border border-red-500 focus:ring-red-400"
                                }`}
                            />
                            <p
                                className={`text-xs mt-1 ${
                                    description.length >= 180 || !isDescriptionValid
                                        ? "text-red-400"
                                        : "text-gray-400"
                                }`}
                            >
                                {description.length}/200
                            </p>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
                            <button
                                className={`w-auto flex justify-center items-center transition-colors duration-300 rounded-md font-semibold select-none
px-4 py-2 gap-1 text-base
bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 shadow-md
${isTitleValid && isDescriptionValid && !loading
                                    ? "cursor-pointer opacity-100"
                                    : "cursor-not-allowed opacity-50 pointer-events-none"}`}
                                onClick={handleCreate}
                                disabled={!isTitleValid || !isDescriptionValid || loading}
                            >
                                {loading ? "Criando..." : "Criar Coleção"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
