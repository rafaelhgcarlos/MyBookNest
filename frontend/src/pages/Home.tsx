import type {FC} from "react";
import Header from "../components/NavBar/Header";
import Hero from "../components/Home/Hero";
import Features from "../components/Home/Features";
import Footer from "../components/Home/Footer";

const Home: FC = () => {
    return (
        <>
            <Header/>
            <Hero/>
            <Features/>
            <Footer/>
        </>
    );
};

export default Home;
