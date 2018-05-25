import {ServerService} from '../../services/server.js'
import '../game/dialog-pane-with-logo.js';

export const RegisterView = {
    data: () => ({
        user: '',
        password: '',
        passphrase: '',
        error: ''
    }),

    methods: {
        goToLogin() {
            window.location.hash = '/login';
        },

        register() {
            ServerService
                .register(this.user, this.password, this.passphrase)
                .then(() => {
                    this.goToLogin();
                }).catch((error) => {
                    this.error = error;
                });
        }
    },

    template: `
<div>
    <dialog-pane-with-logo>
        Username
        <input name="user" v-model="user" />
        Password
        <input name="password" type="password" v-model="password" />
        Secret
        <input name="passphrase" type="text" v-model="passphrase" />
        <button @click="register()">Register</button>
        <div class="error">{{error}}</div>
        <a class="text" href="#/login">Back to login</a>
    </dialog-pane-with-logo>
</div>
`,
};
