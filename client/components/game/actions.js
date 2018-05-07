import {ServerService} from '../../services/server.js';

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
                    const action = data.creature.currentAction;

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