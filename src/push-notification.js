import * as firebase from 'firebase';

export const initializeFirebase = () => {
    const config = {
        messagingSenderId: "264584510493"
    };

    firebase.initializeApp(config);
}

export const askForPermissionToReceiveNotifications = async () => {
    try {
        const messaging = firebase.messaging();
        await messaging.requestPermission();
        const token = await messaging.getToken();
        localStorage.setItem("notification-token", token);
        return token;
    } catch (error) {
        console.error(error);
    }
};