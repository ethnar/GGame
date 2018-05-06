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
            });
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
        Stamina: <meter-bar color="limegreen" :value="player.status.stamina"/><br/>
        Energy: <meter-bar color="dodgerblue" :value="player.status.energy"/><br/>
        Satiated: <meter-bar color="orange" :value="100 - player.status.hunger"/><br/>
        Stealth: <meter-bar color="gray" :value="player.status.stealth"/><br/>
        Tool: {{player.tool && player.tool.name}}<br/>
        <actions
            :target="player" 
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
    <div v-for="recipe in player.recipes">
        {{recipe.name}}<br/>
        Materials: <div v-for="(qty, name) in recipe.materials">{{name}} ({{qty}})</div>
        <actions
            :target="recipe" 
        />
    </div>
    <hr/>
    <div v-for="plan in player.buildingPlans">
        {{plan.name}}<br/>
        Materials: <div v-for="(qty, name) in plan.materials">{{name}} ({{qty}})</div>
        <actions
            :target="plan" 
        />
    </div>
    <hr/>
    <hr/>
    {{node.name}}
    <actions
        :target="node"
    />
    <hr/>
    <div v-for="resource in node.resources">
        {{resource.name}}
        <actions
            :target="resource"
        />
    </div>
    <hr/>
    Buildings:
    <div v-for="structure in node.structures">
        {{structure.name}}
        <actions
            :target="structure"
        />
    </div>
    <hr/>
    Nodes:
    <div v-for="node in node.connectedNodes">
        {{node.name}}
        <actions
            :target="node"
        />
    </div>
    <hr/>
    <hr/>
    <pre>{{player}}</pre>
    <hr/>
    <pre>{{node}}</pre>
    
</div>
`,
};
