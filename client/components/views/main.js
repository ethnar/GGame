import {ServerService} from '../../services/server.js'

Vue.component('meter-bar', {
    props: [
        'color',
        'value',
    ],

    template: `
<span class="meter-bar">
    <div
        class="fill"
        :style="{ 'background-color': color, width: (value || 0) + '%' }"
    ></div>
</span>
    `,
});

Vue.component('actions', {
    props: [
        'target',
    ],

    subscriptions() {
        const dataStream = ServerService.getMainStream();
        const targetStream = this.stream('target');
        return {
            currentAction: Rx.Observable
                .combineLatest([
                    dataStream,
                    targetStream
                ])
                .map(([data, target]) => {
                    const action = data.character.currentAction;

                    return action &&
                        action.entityId === target.id &&
                        target.actions.find(a => a.id === action.actionId);
                }),
        };
    },

    methods: {
        selectAction(actionId, targetId) {
            ServerService.request('action', {
                action: actionId,
                target: targetId,
            })
        }
    },

    template: `
<div v-if="target.actions">
    <div v-for="action in target.actions">
        <button
            class="action"
            @click="selectAction(action.id, target.id);"
            :disabled="!action.available"
            :class="{ current: currentAction === action }"
        >
            {{action.name}}
        </button>
    </div>
</div>
    `
});

export const MainView = {
    data: () => ({
    }),

    subscriptions() {
        const stream = ServerService.getMainStream();
        return {
            player: stream.pluck('character'),
            node: stream.pluck('node'),
        };
    },

    created () {
    },

    methods: {
    },

    template: `
<div v-if="player && node">
    <hr/>
    <div>
        Name: {{player.name}}<br/>
        Action: <meter-bar color="magenta" :value="player.status.actionProgress"/><br/>
        Health: <meter-bar color="red" :value="player.status.health"/><br/>
        Energy: <meter-bar color="lightblue" :value="player.status.energy"/><br/>
        Satiated: <meter-bar color="orange" :value="100 - player.status.hunger"/><br/>
        Tool: {{player.tool && player.tool.name}}<br/>
        <actions
            :target="player" 
        />
    </div>
    <hr/>
    <div v-for="resource in node.resources">
        {{resource.name}}
        <actions
            :target="resource" 
        />
    </div>
    <hr/>
    <div v-for="item in player.inventory">
        {{item.name}} <span v-if="item.qty > 1">({{item.qty}})</span>
        <actions
            :target="item" 
        />
    </div>
    <hr/>
    <hr/>
    {{player}}
    <hr/>
    {{node}}
</div>
`,
};
