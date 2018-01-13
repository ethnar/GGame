import {ServerService} from '../../services/server.js'

export const MainView = {
    data: () => ({
    }),

    subscriptions: () => ({
    }),

    created () {
        ServerService.request('yay?');
    },

    template: `
<div>
    Yay, the game!
</div>
`,
};
