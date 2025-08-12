import type { FC } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Hero: FC = () => {
    return (
        <section className="w-full bg-gradient-to-r from-blue-950 to-blue-800 text-white pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        Organize e descubra seus livros favoritos
                    </h2>
                    <p className="mt-4 text-lg text-blue-200">
                        Encontre, salve e acompanhe seu progresso de leitura com facilidade.
                    </p>
                    <button
                        type="button"
                        className="mt-6 px-6 py-3 bg-white text-blue-900 rounded-lg font-medium hover:bg-blue-100 transition"
                    >
                        Começar agora
                    </button>
                </div>
                <div className="hidden md:flex" aria-label="Animação ilustrativa de leitura">
                    <DotLottieReact
                        src="https://lottie.host/191b0ff0-eb9d-409c-8db8-bf7fb73eea55/dgC6eqeVie.lottie"
                        loop
                        autoplay
                        style={{ width: 400, height: 400 }}
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
