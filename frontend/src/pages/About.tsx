import Header from "../components/NavBar/Header";
import { motion } from "framer-motion";
import { Book, Sparkles, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export default function About() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
            <Header />

            <section className="flex flex-col items-center justify-center text-center py-20 px-6 mt-20">
                {loading ? (
                    <>
                        <div className="h-12 md:h-16 w-64 md:w-96 bg-gray-300 rounded mb-4 animate-pulse"></div>
                        <div className="h-4 md:h-6 w-80 md:w-96 bg-gray-300 rounded animate-pulse"></div>
                    </>
                ) : (
                    <>
                        <motion.h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            Sobre o <span className="text-blue-300">MyBookNest</span>
                        </motion.h1>
                        <motion.p
                            className="text-lg md:text-xl max-w-2xl leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Nosso objetivo é transformar a maneira como você organiza e descobre livros,
                            criando um espaço moderno e inteligente para sua jornada literária.
                        </motion.p>
                    </>
                )}
            </section>

            <section className="bg-white text-gray-900 py-16 px-8 md:px-20">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl shadow-lg bg-gray-200 animate-pulse flex flex-col items-center justify-start gap-4 h-64"
                            >
                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                <div className="w-32 h-6 bg-gray-300 rounded"></div>
                                <div className="w-40 h-4 bg-gray-300 rounded"></div>
                                <div className="w-36 h-4 bg-gray-300 rounded"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            <motion.div
                                className="p-6 rounded-2xl shadow-lg bg-gray-50"
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: "tween", duration: 0.2 }}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                <Book size={36} className="mx-auto mb-3 text-blue-600" />
                                <h2 className="text-2xl font-semibold mb-3">Missão</h2>
                                <p className="leading-relaxed">
                                    Criar um espaço simples e inteligente para leitores acompanharem sua
                                    jornada literária e explorarem novos títulos.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-6 rounded-2xl shadow-lg bg-gray-50"
                                whileHover={{ scale: 1.08 }}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{type: "tween", duration: 0.2, delay: 0.2 }}
                            >
                                <Sparkles size={36} className="mx-auto mb-3 text-blue-600" />
                                <h2 className="text-2xl font-semibold mb-3">Visão</h2>
                                <p className="leading-relaxed">
                                    Ser a principal plataforma de organização e descoberta de livros,
                                    conectando pessoas através da leitura.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-6 rounded-2xl shadow-lg bg-gray-50"
                                whileHover={{ scale: 1.08 }}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{type: "tween",duration: 0.2, delay: 0.4 }}
                            >
                                <Globe size={36} className="mx-auto mb-3 text-blue-600" />
                                <h2 className="text-2xl font-semibold mb-3">Valores</h2>
                                <p className="leading-relaxed">
                                    Simplicidade, inovação e comunidade. Acreditamos que a leitura é uma
                                    experiência que deve ser compartilhada.
                                </p>
                            </motion.div>
                        </>
                    )}
                </div>
            </section>

            <section className="bg-gradient-to-r from-blue-800 to-blue-600 py-20 px-8 md:px-20 text-center">
                {loading ? (
                    <>
                        <div className="h-8 md:h-10 w-64 md:w-96 bg-gray-300 rounded mb-4 animate-pulse"></div>
                        <div className="h-4 md:h-6 w-80 md:w-96 bg-gray-300 rounded mx-auto animate-pulse"></div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold mb-4">Nossa História</h2>
                        <p className="max-w-3xl mx-auto text-lg leading-relaxed">
                            O MyBookNest nasceu da paixão por tecnologia e livros. Ele foi idealizado
                            para ajudar leitores a terem mais controle e prazer em sua jornada literária.
                        </p>
                    </>
                )}
            </section>

            <section className="bg-white py-16 px-8 text-center">
                {loading ? (
                    <>
                        <div className="h-10 md:h-12 w-72 md:w-96 bg-gray-300 rounded mb-4 mx-auto animate-pulse"></div>
                        <div className="h-4 md:h-6 w-80 md:w-96 bg-gray-300 rounded mb-6 mx-auto animate-pulse"></div>
                        <div className="h-12 w-48 bg-gray-400 rounded mx-auto animate-pulse"></div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
                            Pronto para começar sua próxima leitura?
                        </h2>
                        <p className="mb-6 text-lg text-slate-800 leading-relaxed">
                            Cadastre-se agora e descubra um novo jeito de organizar e explorar livros.
                        </p>
                        <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition">
                            Registrar
                        </button>
                    </>
                )}
            </section>
        </div>
    );
}
