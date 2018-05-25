import {ServerService} from '../../services/server.js'
import '../game/dialog-pane-with-logo.js';

export const LoginView = {
    data: () => ({
        user: '',
        password: '',
        error: ''
    }),

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
<div class="Login">
    <dialog-pane-with-logo>
        Username
        <input name="user" v-model="user" />
        Password
        <input name="password" type="password" v-model="password" />
        <button @click="logIn()">Enter</button>
        <div class="error">{{error}}</div>
        <a class="text" href="#/disclaimer">Register</a>
    </dialog-pane-with-logo>
</div>
`,
};
