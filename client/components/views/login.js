import {ServerService} from '../../services/server.js'

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
    <div class="main-container">
        <header>G the Game</header>
        <div class="logo"></div>
        <input name="user" v-model="user" />
        <input name="password" type="password" v-model="password" />
        <button @click="logIn()">Enter</button>
        <div class="error">{{error}}</div>
        <a class="register" href="#/register">Register</a>
        <div class="legal"></div>
    </div>
</div>
`,
};
