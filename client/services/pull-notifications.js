const config = {
    apiKey: 'AIzaSyC75M7koUSuNQ31mNBZQGz08MsdUwQlZq4',
    authDomain: 'gthegame-205009.firebaseapp.com',
    databaseURL: 'https://gthegame-205009.firebaseio.com',
    projectId: 'gthegame-205009',
    storageBucket: 'gthegame-205009.appspot.com',
    messagingSenderId: '413606385188',
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

export const pullNotifications = {
    init() {
        return messaging.requestPermission()
            .then(() => messaging.getToken())
            .then(token => {
               return token;
            })
            .catch((error) => {
                console.error('Error occurred!', error);
            });
    }
};

messaging.onMessage(payload => {
    console.log('onMessage:', payload);
});
