import {ServerService} from '../../services/server.js';
import {ToastNotification} from '../generic/toast-notification.js';

Vue.component('actions', {
    props: [
        'target',
        'name',
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
        selectAction(action, targetId) {
            if (!action.available) {
                ToastNotification.notify(action.message);
                return;
            }
            ServerService.request('action', {
                action: action.id,
                target: targetId,
            }).then(() => {
                this.$emit('action');
            });
        }
    },

    template: `
<div v-if="target.actions">
    <div v-for="action in target.actions" v-if="!name || action.name === name">
        <button
            class="action"
            @click="selectAction(action, target.id);"
            :class="{ current: currentAction === action, disabled: !action.available }"
        >
            {{action.name}}
        </button>
    </div>
</div>
    `
});