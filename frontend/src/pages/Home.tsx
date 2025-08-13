import type {FC} from "react";
import Header from "../components/NavBar/Header";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import Footer from "../components/Home/Footer";

const Home: FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
