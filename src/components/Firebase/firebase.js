import app from 'firebase/app';
import 'firebase/auth';

const config = {
    apiKey: "AIzaSyDdAwZEPIHGmecudZQ2VGaYKtBRTX0U6aY",
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
}

export default Firebase;