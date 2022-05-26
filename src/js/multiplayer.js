import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onDisconnect, onValue, update } from "firebase/database";

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
const auth = getAuth(app);
const database = getDatabase(app);

function createRoom(playerID) {
    let roomRef = ref(database, `rooms/${playerID}`);
    set(roomRef, {
        playerOne: {
            id: playerID,
            Letter: "X",
            Color: "red",
        },
        playerTwo: {
            id: "null",
            Letter: "O",
            Color: "blue",
        }
    });
    return roomRef;
}

let hasRoom=false;
function matchMaking(playerID) {
    let allPlayersRef = ref(database, "players");
    let allroomsRef = ref(database, "rooms");
    let roomRef;
    
    onValue(allroomsRef, (snapshot) => {
        let rooms = snapshot.val();
        if(rooms){
            if(!hasRoom){
                for (let [key, value] of Object.entries(rooms)) {
                    value=JSON.parse(JSON.stringify(value));
                    let playertwo=value.playerTwo.id
                    if(playertwo==="null"){
                        // playertwo=playerID;
                        roomRef=ref(database, `rooms/${value.playerOne.id}`);
                        hasRoom=true;
                        update(roomRef,{playerTwo:{id:playerID, Letter:'O', Color:"blue"}});
                        break;
                    }
                }
                if(!hasRoom){
                    hasRoom=true;
                    roomRef = createRoom(playerID);
                }
            }
        }
        else if (rooms === null) {
            hasRoom=true;
            roomRef = createRoom(playerID);
        }
    })
    // onValue(allPlayersRef, (snapshot) => {
    //     console.log(snapshot.val());
    // })
}

(function () {
    let mode = localStorage.getItem("mode");
    if (mode === "online") {
        let playerID, playerRef;

        onAuthStateChanged(auth, (user) => {
            if (user) {
                playerID = user.uid;
                playerRef = ref(database, `players/${playerID}`);
                set(playerRef, {
                    id: playerID,
                    name: "Anonymous"
                });
                onDisconnect(playerRef).remove();
                matchMaking(playerID);

                //remove room if player disconnects
                let roomRef = ref(database, `rooms/${playerID}`);
                if (roomRef) {
                    hasRoom=false;
                    onDisconnect(roomRef).remove();
                }

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