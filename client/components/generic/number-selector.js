Vue.component('number-selector', {
    props: {
        value: 0,
        min: {
            type: Number,
            default: -100,
        },
        max: {
            type: Number,
            default: 100,
        },
        choices: {
            type: Array,
            default: () => [],
        }
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

        set(to) {
            this.$emit('input', this.limit(to));
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
    <div class="number">
        <input type="text" v-model="inputValue" @input="$emit('input', limit(stringToNumber(inputValue)));">
        <div class="buttons">
            <button @click="change(-1)" :disabled="!canChange(-1)">&lt;</button>
            <button @click="change(1)" :disabled="!canChange(1)">&gt;</button>
        </div>
    </div>
    <div class="choices" v-if="choices.length">
        <button v-for="number in choices" @click="set(number)">{{number}}</button>
    </div>
</div>
    `,
});
