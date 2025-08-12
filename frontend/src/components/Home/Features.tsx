import type {FC} from "react";
import { BookOpen, Search, Bookmark } from "lucide-react";

const features = [
    {
        icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
        title: "Catálogo de livros",
        description: "Pesquise e explore milhares de títulos facilmente.",
    },
    {
        icon: <Search className="w-8 h-8 text-indigo-600" />,
        title: "Busca inteligente",
        description: "Encontre rapidamente o que você procura.",
    },
    {
        icon: <Bookmark className="w-8 h-8 text-indigo-600" />,
        title: "Lista de favoritos",
        description: "Salve os livros que deseja ler mais tarde.",
    },
];

const Features: FC = () => {
    return (
        <section className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid gap-10 md:grid-cols-3">
                {features.map((feat, i) => (
                    <div
                        key={i}
                        className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                    >
                        {feat.icon}
                        <h3 className="mt-4 text-xl font-semibold">{feat.title}</h3>
                        <p className="mt-2 text-gray-600">{feat.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
