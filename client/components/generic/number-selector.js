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
                this.inputValue = this.numberToString(this.value);
            },
            immediate: true,
        }
    },

    methods: {
        limit(value, failSafe) {
            if (value !== value) {
                value = failSafe;
            }
            return Math.min(this.max, Math.max(this.min, value));
        },

        change(by) {
            this.$emit('input', this.limit(this.value + by, by));
        },

        canChange(by) {
            return this.limit(this.value + by, by) !== this.value;
        },

        numberToString(value) {
            if (value === Infinity) {
                return '∞';
            } else if (value === -Infinity) {
                return '-∞';
            } else {
                return value;
            }
        },

        stringToNumber(value) {
            if (value === '∞') {
                return Infinity;
            } else if (value === '-∞') {
                return -Infinity;
            } else {
                return value;
            }
        }
    },

    template: `
<div class="number-selector">
    <button @click="change(-Infinity)" :disabled="!canChange(-Infinity)">&lt;&lt;</button>
    <button @click="change(-1)" :disabled="!canChange(-1)">&lt;</button>
    <input type="text" v-model="inputValue" @input="$emit('input', limit(stringToNumber(inputValue)));">
    <button @click="change(1)" :disabled="!canChange(1)">&gt;</button>
    <button @click="change(Infinity)" :disabled="!canChange(Infinity)">&gt;&gt;</button>
</div>
    `,
});
