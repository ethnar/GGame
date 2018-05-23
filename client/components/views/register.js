import {ServerService} from '../../services/server.js'

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
    Username <input name="user" v-model="user" /><br/>
    Password <input name="password" type="password" v-model="password" /><br/>
    Secret <input name="passphrase" type="text" v-model="passphrase" /><br/>
    <input type="button" @click="register()" value="Register" />
    <div>{{error}}</div>
</div>
`,
};
