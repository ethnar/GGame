import {ServerService} from '../../services/server.js';
import {ToastNotification} from '../generic/toast-notification.js';

Vue.component('actions', {
    props: [
        'target',
        'name',
    ],

    data: () => ({
        advanced: false,
        repetitions: Infinity,
    }),

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
        selectAction(action, targetId, repetitions = null) {
            if (!action.available) {
                ToastNotification.notify(action.message);
                return;
            }
            if (Math.abs(repetitions) === Infinity) {
                repetitions = Number.MAX_SAFE_INTEGER;
            }
            ServerService.request('action', {
                action: action.id,
                target: targetId,
                repetitions,
            }).then(() => {
                this.$emit('action');
            });
        },

        advancedAction(action, targetId, event) {
            event.preventDefault();
            this.advanced = {
                action,
                targetId,
            };
        }
    },

    template: `
<div v-if="target.actions">
    <div v-for="action in target.actions" v-if="!name || action.name === name">
        <v-touch @press.prevent="advancedAction(action, target.id, $event);">
            <button
                class="action"
                @click="selectAction(action, target.id);"
                :class="{ current: currentAction === action, disabled: !action.available }"
            >
                {{action.name}}
            </button>
        </v-touch>
        <modal v-if="advanced">
            Repeat how many times?<br/>
            <br/>
            <number-selector v-model="repetitions" :min="1"></number-selector>
            <br/>
            <br/>
            <button @click="advanced = false;">Cancel</button>
            <button @click="selectAction(advanced.action, advanced.targetId, repetitions);advanced = false;">Confirm</button>
        </modal>
    </div>
</div>
    `
});