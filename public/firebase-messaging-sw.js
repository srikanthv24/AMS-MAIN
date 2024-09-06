importScripts('https://www.gstatic.com/firebasejs/6.6.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.6.2/firebase-messaging.js');

firebase.initializeApp({
    messagingSenderId: "264584510493"
});

const messaging = firebase.messaging();