Vue.component('number-selector', {
    props: {
        value: 0,
        min: {
            type: Number,
            default: -Infinity,
        },
        max: {
            type: Number,
            default: Infinity,
        },
    },

    data: () => ({
        inputValue: Number,
    }),

    watch: {
        value: {
            handler() {
                this.inputValue = this.value;
            },
            immediate: true,
        }
    },

    methods: {
        limit(value) {
            return Math.min(this.max, Math.max(this.min, value));
        },

        change(by) {
            this.$emit('input', this.limit(this.value + by));
        },

        canChange(by) {
            return this.limit(this.value + by) !== this.value;
        }
    },

    template: `
<div class="number-selector">
    <button @click="change(-Infinity)" :disabled="!canChange(-Infinity)">&lt;&lt;</button>
    <button @click="change(-1)" :disabled="!canChange(-1)">&lt;</button>
    <input type="number" v-model="inputValue" @input="$emit('input', limit(inputValue));">
    <button @click="change(1)" :disabled="!canChange(1)">&gt;</button>
    <button @click="change(Infinity)" :disabled="!canChange(Infinity)">&gt;&gt;</button>
</div>
    `,
});
