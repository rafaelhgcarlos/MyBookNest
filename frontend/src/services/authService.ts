import { auth, db } from "../lib/firebase";
import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    type User as FirebaseUser,
    updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const loginUser = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const registerUser = async (email: string, password: string, name: string, lastName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: `${name} ${lastName}` });


        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            lastName,
            email: user.email,
            createdAt: new Date(),
        });

        return user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user: FirebaseUser = result.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        const [firstName, ...rest] = (user.displayName || "").split(" ");
        const lastName = rest.join(" ");

        await setDoc(userRef, {
            uid: user.uid,
            name: firstName,
            lastName,
            email: user.email,
            createdAt: new Date(),
        });
    }

    return user;
};
