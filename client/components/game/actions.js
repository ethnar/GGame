import {ServerService} from '../../services/server.js';
import {ToastNotification} from '../generic/toast-notification.js';

Vue.component('actions', {
    props: [
        'target',
        'name',
        'exclude',
    ],

    data: () => ({
        advanced: false,
        repetitions: 10,
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
                        target.actions &&
                        target.actions.find(a => a.id === action.actionId);
                }),
        };
    },

    methods: {
        selectAction(action, targetId, repetitions = null) {
            if (Math.abs(repetitions) === Infinity) {
                repetitions = Number.MAX_SAFE_INTEGER;
            }
            ServerService.request('action', {
                action: action.id,
                target: targetId,
                repetitions: action.repeatable ? repetitions : 1,
            }).then(() => {
                this.$emit('action');
            });
        },

        advancedAction(action, targetId, event) {
            if (!action.available) {
                ToastNotification.notify(action.message);
                return;
            }
            event.preventDefault();
            this.advanced = {
                action,
                targetId,
            };
        }
    },

    template: `
<div v-if="target.actions">
    <div v-for="action in target.actions" v-if="(!name || action.name === name) && (!exclude || !exclude.includes(action.name))">
        <button
            class="action"
            @click="advancedAction(action, target.id, $event);"
            :class="{ current: currentAction === action, disabled: !action.available }"
        >
            {{action.name}}
        </button>
    </div>
    <modal v-if="advanced" @close="advanced = null;" class="action-modal">
        <template slot="header">{{advanced.action.name}}</template>
        <template slot="main">
            <div v-if="advanced.action.repeatable">
                Repeat?<br/>
                <br/>
                <number-selector class="number-select" v-model="repetitions" :min="1" :choices="[1, 10, 100]"></number-selector>
                <br/>
                <br/>
            </div>
            <button @click="selectAction(advanced.action, advanced.targetId, repetitions);advanced = false;">Confirm</button>
        </template>
    </modal>
</div>
    `
});