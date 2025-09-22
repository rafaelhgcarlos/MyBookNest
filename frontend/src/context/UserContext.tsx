import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

interface UserData {
    displayName: string;
    email: string;
    photoBase64?: string;
}

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} });

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
            if (!firebaseUser) {
                setUser(null);
                return;
            }

            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUser({
                        displayName: [data.name, data.lastName].filter(Boolean).join(" "),
                        email: data.email,
                        photoBase64: data.photoBase64 || "",
                    });
                } else {
                    setUser({
                        displayName: firebaseUser.displayName || firebaseUser.email || "Usuário",
                        email: firebaseUser.email || "",
                        photoBase64: firebaseUser.photoURL || "",
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar usuário:", err);
            }
        });

        return () => unsubscribe();
    }, []);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
