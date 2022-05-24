import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBmE5Ccjk52L8ZcMLsJVpyFFmEKXFZHy2A",
    authDomain: "tic-tac-toe-multiplayer-efebf.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-multiplayer-efebf-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tic-tac-toe-multiplayer-efebf",
    storageBucket: "tic-tac-toe-multiplayer-efebf.appspot.com",
    messagingSenderId: "300642173930",
    appId: "1:300642173930:web:59f71e7c2e2b0cef5fe893"
};

const app = initializeApp(firebaseConfig);
let mode = localStorage.getItem("mode");

(function () {
    if (mode === "online") {
        const auth = getAuth();

        signInAnonymously(auth)
            .then(() => {
                console.log("logged successfully!")
            })
            .catch((error) => {
                const errorMessage = error.message;
                alert(errorMessage + "refreshPage!");
            });

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user)
                
            } else {
                console.log("user logged out!")
            }
        });
    }
})();