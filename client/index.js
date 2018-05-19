import {LoginView} from './components/views/login.js'
import {MainView} from './components/views/main.js'
import {RegisterView} from './components/views/register.js';

Vue.use(VueRx, Rx);
Vue.use(VueTouch);

Vue.prototype.stream = function (prop) {
    return this.$watchAsObservable(prop).pluck('newValue').startWith(this[prop]);
};

window.router = new VueRouter({
    routes: [{
        path: '/login',
        component: LoginView
    }, {
        path: '/register',
        component: RegisterView
    }, {
        path: '/main',
        component: MainView
    }, {
        path: '*',
        redirect: '/login'
    }]
});

const app = new Vue({
    router: window.router
}).$mount('#app');
