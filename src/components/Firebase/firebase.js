import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

console.log(process.env.REACT_APP_API_KEY);

const config = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: "modulus-e56e4.firebaseapp.com",
    databaseURL: "https://modulus-e56e4.firebaseio.com",
    projectId: "modulus-e56e4",
    storageBucket: "modulus-e56e4.appspot.com",
    messagingSenderId: "768709169703",
    appId: "1:768709169703:web:a38f5dfb315550f831b402",
    measurementId: "G-TX7CYMZJN7"
};

class Firebase {
    constructor() {
        app.initializeApp(config);

        this.auth = app.auth();
        this.db = app.database();

    }
    // *** Auth API ***
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);

    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);

    doSignOut = () => this.auth.signOut();

    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

    doPasswordUpdate = password =>
        this.auth.currentUser.updatePassword(password);

    // *** Merge Auth and DB User API *** //
    onAuthUserListener = (next, fallback) =>
        this.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                this.user(authUser.uid)
                    .once('value')
                    .then(snapshot => {
                        const dbUser = snapshot.val();
                        // default empty roles
                        if (!dbUser.roles) {
                            dbUser.roles = {};
                        }
                        // merge auth and db user
                        authUser = {
                            uid: authUser.uid,
                            email: authUser.email,
                            ...dbUser,
                        };
                        next(authUser);
                    });

            } else {
                fallback();
            }
        });

    // *** User API ***
    user = uid => this.db.ref(`users/${uid}`);
    users = () => this.db.ref('users');

    course = appID => this.db.ref(`courses/${appID}`);
    courses = () => this.db.ref('courses');


}



export default Firebase;
