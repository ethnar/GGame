import {ServerService} from '../../services/server.js'

export const LoginView = {
    data: () => ({
        user: '',
        password: '',
        error: ''
    }),

    created() {
        // this.goToTheGame();

        // TODO: remove
        this.user = 'test';
        this.password = 'test';
    },

    methods: {
        goToTheGame() {
            window.location.hash = '/main';
        },

        logIn() {
            ServerService
                .authenticate(this.user, this.password)
                .then(() => {
                    this.goToTheGame();
                }).catch((error) => {
                    this.error = error;
                });
        }
    },

    template: `
<div>
    <input name="user" v-model="user" />
    <input name="password" type="password" v-model="password" />
    <input type="button" @click="logIn()" value="Log in" />
    <div>{{error}}</div>
</div>
`,
};
