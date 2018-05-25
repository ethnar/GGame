Vue.component('meter-orb', {
    props: [
        'color',
        'value',
        'onlyGrowing'
    ],

    data: () => ({
        reseter: false,
    }),

    watch: {
        value(to, from) {
            if (from > to && this.onlyGrowing) {
                this.reseter = !this.reseter;
            }
        }
    },

    template: `
<span class="meter-orb" @click="$emit('click', $event);">
    <div
        :key="reseter"
        class="fill"
        :style="{ 'background-color': color, 'clip-path': 'inset(' + (100 - (value || 0)) + '% 0 0)' }"
    ></div>
    <div class="border"></div>
</span>
    `,
});