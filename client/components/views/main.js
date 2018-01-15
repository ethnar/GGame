import {ServerService} from '../../services/server.js'

export const MainView = {
    data: () => ({
    }),

    subscriptions() {
        return {
            data: ServerService.getMainStream(),
        };
    },

    created () {
    },

    methods: {
        search() {
            ServerService.request('action', {
                action: 'search'
            })
        }
    },

    template: `
<div>
    Yay, the game!
    {{data}}
</div>
`,
};
