import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/Button/Button";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { loginUser, loginWithGoogle } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    const getFirebaseErrorMessage = (code: string): string => {
        switch (code) {
            case "auth/invalid-email": return "O e-mail informado é inválido.";
            case "auth/user-disabled": return "Este usuário foi desativado.";
            case "auth/user-not-found": return "Usuário não encontrado.";
            case "auth/wrong-password": return "Senha incorreta.";
            case "auth/missing-password": return "Digite uma senha para continuar.";
            case "auth/network-request-failed": return "Falha de conexão. Verifique sua internet.";
            case "auth/popup-closed-by-user": return "O login foi cancelado. Tente novamente.";
            default: return "Ocorreu um erro inesperado. Tente novamente.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            const msg = "Preencha todos os campos.";
            setError(msg);
            toast.error(msg);
            return;
        }

        if (!agreeTerms) {
            const msg = "Você precisa concordar com os Termos & Condições.";
            setError(msg);
            toast.error(msg);
            return;
        }

        try {
            await loginUser(email, password);
            toast.success("Login realizado com sucesso!");
            setError("");
            navigate("/");
        } catch (err: any) {
            const errorCode = err.code || "unknown";
            const msg = getFirebaseErrorMessage(errorCode);
            setError(msg);
            toast.error(msg);
        }
    };

    const handleSocialLogin = async () => {
        try {
            const user = await loginWithGoogle();
            toast.success(`Bem-vindo, ${user.displayName || user.email}!`);
            navigate("/");
        } catch (err: any) {
            const errorCode = err.code || "unknown";
            const msg = getFirebaseErrorMessage(errorCode);
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
            <div className="min-h-screen min-w-screen md:min-h-auto md:min-w-auto w-full max-w-lg bg-black/50 backdrop-blur-md md:rounded-2xl shadow-lg p-8 md:p-10 text-white">
                <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="text-sm text-blue-300 hover:text-white text-xl">
                        ← Início
                    </Link>
                </div>

                <h2 className="text-2xl font-semibold mb-6 text-center">Entrar</h2>

                <div className="flex flex-col gap-3 mb-6">
                    <Button label="Entrar com Google" icon={FaGoogle} onClick={handleSocialLogin} />
                    <Button label="Entrar com Facebook" icon={FaFacebookF} onClick={() => toast.error("Facebook login não implementado")} />
                    <Button label="Entrar com Apple" icon={FaApple} onClick={() => toast.error("Apple login não implementado")} />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <hr className="flex-1 border-gray-500" />
                    <span className="text-gray-400 text-sm">ou</span>
                    <hr className="flex-1 border-gray-500" />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        className="w-full bg-gray-800/60 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        type="password"
                        className="w-full bg-gray-800/60 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <label className="flex items-center gap-2 text-sm sm:text-base text-gray-300 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="accent-blue-500 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
                        />
                        <span className="flex flex-wrap gap-1">
                            Concordo com os{" "}
                            <Link to="/terms" className="text-blue-400 hover:underline">
                                Termos & Condições
                            </Link>
                        </span>
                    </label>

                    <Button label="Entrar" type="submit" />

                    {error && <p className="text-red-400 text-sm font-medium text-center mt-2">{error}</p>}
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Não possui conta?{" "}
                    <Link to="/registrar" className="text-blue-400 hover:underline">
                        Crie sua conta
                    </Link>
                </p>
            </div>
        </div>
    );
}
