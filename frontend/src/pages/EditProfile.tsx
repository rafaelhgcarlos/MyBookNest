import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import Button from "../components/Button/Button";
import Header from "../components/NavBar/Header";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function EditProfile() {
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [displayLastName, setDisplayLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [photoBase64, setPhotoBase64] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [touched, setTouched] = useState({ name: false, lastName: false });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser) {
                navigate("/entrar");
                return;
            }

            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setDisplayName(data.name || "");
                    setDisplayLastName(data.lastName || "");
                    setEmail(data.email || "");
                    setBio(data.bio || "");
                    setPhotoBase64(data.photoBase64 || null);
                    setPreviewImage(data.photoBase64 || "/default-avatar.png");
                } else {
                    setPreviewImage("/default-avatar.png");
                }
            } catch (err) {
                console.error("Erro ao buscar usuário:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64String = ev.target?.result as string;
                setPhotoBase64(base64String);
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (loading) {
            toast.error("Aguarde o carregamento do usuário...");
            return;
        }

        if (!displayName.trim() || !displayLastName.trim()) {
            toast.error("Nome e sobrenome são obrigatórios!");
            return;
        }

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            toast.error("Usuário não autenticado!");
            return;
        }

        setLoading(true);

        toast.promise(
            (async () => {
                const userRef = doc(db, "users", firebaseUser.uid);
                await updateDoc(userRef, {
                    name: displayName,
                    lastName: displayLastName,
                    bio,
                    photoBase64,
                });
                await updateProfile(firebaseUser, {
                    displayName: displayName + " " + displayLastName,
                });
            })(),
            {
                loading: "Salvando perfil...",
                success: "Perfil atualizado com sucesso!",
                error: "Erro ao atualizar perfil.",
            }
        ).finally(() => {
            setLoading(false);
        });
    };

    const isNameValid = displayName.trim() !== "";
    const isLastNameValid = displayLastName.trim() !== "";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 pt-16">
            <Header />
            <Toaster position="top-center" />

            <div className="max-w-3xl mx-auto p-6 md:p-12 flex flex-col gap-8">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-black/50 backdrop-blur-md p-6 md:p-12 rounded-2xl shadow-lg flex flex-col gap-6"
                >
                    <h1 className="text-3xl font-bold text-white mb-4">Editar Perfil</h1>

                    {/* Foto de perfil */}
                    <div className="flex flex-col items-center gap-4 group">
                        {loading ? (
                            <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse border-2 border-gradient-to-r from-blue-400 to-purple-500" />
                        ) : (
                            <div className="relative w-32 h-32">
                                <motion.img
                                    key={previewImage} // anima sempre que mudar a imagem
                                    src={previewImage || "/default-avatar.png"}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover border-2 border-gradient-to-r from-blue-400 to-purple-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                                <input
                                    id="profileImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                />
                                <p className="absolute bottom-0 w-full text-center text-xs text-gray-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Clique na imagem para alterar
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Campos de edição */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col w-full">
                            <label className="text-gray-300 text-sm mb-1">Nome</label>
                            <input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                                placeholder="Nome"
                                className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800/60 
                                    ${!isNameValid && touched.name ? "border-2 border-red-500" : ""}`}
                            />
                            {!isNameValid && touched.name && (
                                <span className="text-red-500 text-xs mt-1">O nome é obrigatório.</span>
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            <label className="text-gray-300 text-sm mb-1">Sobrenome</label>
                            <input
                                value={displayLastName}
                                onChange={(e) => setDisplayLastName(e.target.value)}
                                onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                                placeholder="Sobrenome"
                                className={`w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800/60 
                                    ${!isLastNameValid && touched.lastName ? "border-2 border-red-500" : ""}`}
                            />
                            {!isLastNameValid && touched.lastName && (
                                <span className="text-red-500 text-xs mt-1">O sobrenome é obrigatório.</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-gray-300 text-sm mb-1">Email</label>
                        <input
                            value={email}
                            placeholder="Email"
                            type="email"
                            className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800/60"
                            disabled
                        />
                    </div>

                    <div className="flex flex-col w-full">
                        <label className="text-gray-300 text-sm mb-1">Biografia / Sobre mim</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 300))} // Limita a 300 caracteres
                            placeholder="Conte um pouco sobre você..."
                            className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-white bg-gray-800/60 resize-none"
                            rows={4}
                        />
                        <span className="text-gray-400 text-xs mt-1">{bio.length}/300</span>
                    </div>

                    <div className="flex justify-end gap-4 mt-4">
                        <Button label="Cancelar" style="ghost" onClick={() => navigate("/perfil")} />
                        <Button
                            label="Salvar"
                            style="primary"
                            onClick={handleSave}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
