import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, } from "firebase/database";

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
        const auth = getAuth(app);
        const database = getDatabase(app);
        let playersRef=ref(database,"players");

        let playerID, playerRef;

        onAuthStateChanged(auth, (user) => {
            if (user) {
                playerID=user.uid;
                playerRef=ref(database,`players/${playerID}`);
                set(playerRef,{
                    id:playerID,
                    name: "Anonymous"
                });
                onDisconnect(playerRef).remove()

            } else {
                console.log("user logged out!");
            }
        });

        signInAnonymously(auth)
            .then(() => {
                console.log("logged successfully!")
            })
            .catch((error) => {
                const errorMessage = error.message;
                alert(errorMessage + "refreshPage!");
            });
    }
})();