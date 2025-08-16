import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button/Button.tsx";
import { Home } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
    const navigate = useNavigate();
    const handleGoHome = () => navigate("/");

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-950 to-blue-800 px-6 py-24 sm:py-32 lg:px-8 text-white">
            <div className="text-center max-w-2xl">
                <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto">
                    <DotLottieReact
                        src="https://lottie.host/297ff614-454e-499f-ae06-4b1391209c47/9KFyY0dGGy.lottie"
                        loop
                        autoplay
                    />
                </div>

                <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
                    Oops! Página não encontrada
                </h1>

                <p className="mt-4 text-lg text-blue-200">
                    Parece que você tentou acessar uma página que não existe.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        label={"Voltar para Home"}
                        icon={Home}
                        iconPosition={"left"}
                        onClick={handleGoHome}
                    />
                    <Link
                        to="#"
                        aria-label="Contact support"
                        className="text-sm font-medium text-blue-200 hover:text-white transition"
                    >
                        Contatar suporte →
                    </Link>
                </div>
            </div>
        </main>
    );
}
