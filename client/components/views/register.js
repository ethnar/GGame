import {ServerService} from '../../services/server.js'

export const RegisterView = {
    data: () => ({
        user: '',
        password: '',
        error: ''
    }),

    methods: {
        goToLogin() {
            window.location.hash = '/login';
        },

        register() {
            ServerService
                .register(this.user, this.password)
                .then(() => {
                    this.goToLogin();
                }).catch((error) => {
                    this.error = error;
                });
        }
    },

    template: `
<div>
    <input name="user" v-model="user" />
    <input name="password" type="password" v-model="password" />
    <input type="button" @click="register()" value="Register" />
    <div>{{error}}</div>
</div>
`,
};
