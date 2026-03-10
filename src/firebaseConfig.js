import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCp-Sgb9brEeqVACda7aMbYYdYTBlrvZDg",
    authDomain: "chatalugafacil.firebaseapp.com",
    databaseURL: "https://chatalugafacil-default-rtdb.firebaseio.com/",
    projectId: "chatalugafacil",
    storageBucket: "chatalugafacil.firebasestorage.app",
    messagingSenderId: "572649283019",
    appId: "1:572649283019:web:2d46c7a5a2e18411116a4e"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
