import { auth, db } from "../lib/firebase";
import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    type User as FirebaseUser,
    updateProfile,
    sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const loginUser = async (email: string, password: string) => {
    if (!email || !password) throw { code: "auth/missing-credentials" };

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (err: any) {
        throw { code: err.code || "unknown" };
    }
};

export const logoutUser = async () => {
    return await signOut(auth);
};

export const resetPassword = async (email: string) => {
    return await sendPasswordResetEmail(auth, email);
};

export const registerUser = async (email: string, password: string, name: string, lastName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: `${name} ${lastName}` });

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name + " " + lastName
        )}&background=1F2937&color=FFFFFF&rounded=true`;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            lastName,
            email: user.email,
            photoURL: avatarUrl,
            createdAt: new Date(),
        });

        return user;
    } catch (error: any) {
        throw error;
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
