import {ServerService} from '../../services/server.js';

Vue.component('current-action', {
    data: () => ({
        reseter: false,
    }),

    computed: {
        displayRepetitions() {
            if (this.currentAction.repetitions > 10000) {
                return '∞';
            }
            if (this.currentAction.repetitions === 1) {
                return '';
            }
            return this.currentAction.repetitions;
        },
        firstRotation() {
            return Math.min(this.progress, 50) / 50 * 180 - 180;
        },
        secondRotation() {
            return (this.progress - 50) / 50 * 180 - 180;
        }
    },

    subscriptions() {
        const currentActionStream = ServerService
            .getMainStream()
            .pluck('creature')
            .pluck('currentAction');

        const progressStream = currentActionStream
            .pluck('progress');

        const cut = (min, max) => (number) => {
            return Math.max(Math.min(100, (number - min * 100) / (max - min)), 0);
        };

        return {
            currentAction: currentActionStream,
            progress: progressStream.scan((acc, item) => {
                if (acc > item) {
                    this.reseter = !this.reseter;
                }
                return item;
            }),
            // progress: Rx.Observable.interval(10).scan((acc, item) => {
            //         return ((item || 0) + 1) % 100;
            //     }),
            trProgress: progressStream.map(cut(0/8, 1/8)),
            rProgress:  progressStream.map(cut(1/8, 3/8)),
            bProgress:  progressStream.map(cut(3/8, 5/8)),
            lProgress:  progressStream.map(cut(5/8, 7/8)),
            tlProgress: progressStream.map(cut(7/8, 8/8)),
        }
    },

    template: `
<div class="current-action" :key="reseter" @click="$emit('click', $event)">
    <div class="current-action-wrapper">
        <div class="half first-container">
            <div class="half first" :style="{ 'transform': 'rotate(' + firstRotation + 'deg)' }"></div>
        </div>
        <div class="half second-container">
            <div class="half second" :style="{ 'transform': 'rotate(' + secondRotation + 'deg)' }" v-if="progress > 50"></div>
        </div>
        <div class="mid-cover">
            <img v-if="currentAction && currentAction.icon" :src="currentAction.icon" class="shadow">
            <img v-if="currentAction && currentAction.icon" :src="currentAction.icon" class="icon">
            <div class="repetitions">{{displayRepetitions}}</div>
        </div>
        <div class="border"></div>
    </div>
</div>
    `,
});
