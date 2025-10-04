import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/Button/Button";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getFirebaseErrorMessage = (code: string): string => {
        switch (code) {
            case "auth/invalid-email": return "O e-mail informado é inválido.";
            case "auth/user-not-found": return "Não existe usuário com este e-mail.";
            case "auth/network-request-failed": return "Falha de conexão. Verifique sua internet.";
            case "auth/too-many-requests": return "Muitas tentativas. Tente novamente mais tarde.";
            default: return "Ocorreu um erro inesperado. Tente novamente.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            const msg = "Digite seu email para redefinir a senha.";
            setError(msg);
            toast.error(msg, { id: "error-toast" });
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading("Enviando email...", { id: "loading-toast" });

        try {
            await resetPassword(email.trim().toLowerCase());
            toast.dismiss(loadingToast);
            toast.success("Email de redefinição de senha enviado!", { id: "success-toast" });
            setError("");
        } catch (err: any) {
            toast.dismiss(loadingToast);
            const msg = getFirebaseErrorMessage(err.code || "unknown");
            setError(msg);
            toast.error(msg, { id: "error-toast" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
            <div className="min-h-screen min-w-screen md:min-h-auto md:min-w-auto w-full max-w-lg bg-black/50 backdrop-blur-md md:rounded-2xl shadow-lg p-8 md:p-10 text-white">

                <div className="flex justify-between items-center mb-8">
                    <Link to="/entrar" className="text-sm text-blue-300 hover:text-white text-xl">
                        ← Voltar
                    </Link>
                </div>

                <h2 className="text-2xl font-semibold mb-6 text-center">Redefinir Senha</h2>

                <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu email"
                        type="email"
                        className="w-full bg-gray-800/60 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <Button
                        label={loading ? "Enviando..." : "Enviar link"}
                        type="submit"
                        state={loading ? "disabled" : "enabled"}
                    />

                    {error && <p className="text-red-400 text-sm font-medium text-center mt-2">{error}</p>}
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Lembrou sua senha?{" "}
                    <Link to="/entrar" className="text-blue-400 hover:underline">
                        Voltar ao login
                    </Link>
                </p>
            </div>
        </div>
    );
}
