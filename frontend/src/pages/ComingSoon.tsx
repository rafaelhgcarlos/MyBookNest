import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FiInstagram, FiPhone } from 'react-icons/fi';

export default function ComingSoon() {
    return (
        <main className="bg-gradient-to-br from-green-800 via-slate-900 to-slate-950 text-green-200 min-h-screen flex flex-col justify-center items-center px-6 py-12">
            <div className="max-w-4xl w-full flex flex-col items-center gap-10">
                <div className="w-48 sm:w-64 md:w-100">
                    <DotLottieReact
                        src="https://lottie.host/23b61c29-466f-438c-a167-123d274ac3bc/vJPYArlOKB.lottie"
                        loop
                        autoplay
                    />
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-6xl font-extrabold text-lime-400 drop-shadow-lg">
                    Algo incrível está chegando!
                </h1>

                <p className="max-w-xl text-center text-lg sm:text-xl text-green-300 leading-relaxed">
                    Organize sua coleção, acompanhe suas leituras e descubra novos mundos. O futuro da gestão de livros está chegando!
                </p>

                <div className="flex gap-10 mt-6 text-lime-400 text-4xl sm:text-5xl">
                    <a
                        href="https://www.instagram.com/fael.hgc"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="hover:text-lime-300 transition-colors"
                    >
                        <FiInstagram />
                    </a>
                    <a
                        href="https://wa.me/5512991706194"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                        className="hover:text-lime-300 transition-colors"
                    >
                        <FiPhone />
                    </a>
                </div>
            </div>

            <footer className="mt-16 text-green-600 text-sm opacity-70">
                &copy; {new Date().getFullYear()} Rafael Gonzaga. Todos os direitos reservados.
            </footer>
        </main>
    );
}
