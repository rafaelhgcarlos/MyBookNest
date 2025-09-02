import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/Button/Button";
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { api } from "../services/api";


export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        try {
            const response = await api.post("/auth/login", { email, password });

            localStorage.setItem("token", response.data.token);

            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro no login");
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

                <h2 className="text-2xl font-semibold mb-6 text-center">Entre com sua conta</h2>

                <div className="flex flex-col gap-3 mb-6">
                    <Button label="Entrar com Google" icon={FaGoogle} onClick={() => {}} />
                    <Button label="Entrar com Facebook" icon={FaFacebookF} onClick={() => {}} />
                    <Button label="Entrar com Apple" icon={FaApple} onClick={() => {}} />
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

                    {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

                    <Button label="Entrar" type="submit" />
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Não possui uma conta?{" "}
                    <Link to="/registrar" className="text-blue-400 hover:underline">
                        Faça registro
                    </Link>
                </p>
            </div>
        </div>
    );
}
