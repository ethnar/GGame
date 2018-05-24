export default Vue.component('radial-progress', {
    props: {
        percentage: Number,
        size: {
            type: Number,
            default: 50,
        },
        color: {
            type: String,
            default: 'lightgray',
        },
        background: {
            type: String,
            default: 'black',
        },
    },

    computed: {
        firstRotation() {
            return Math.min(this.percentage, 50) / 50 * 180 - 90;
        },

        secondRotation() {
            return (this.percentage - 50) / 50 * 180 + 90;
        }
    },

    template: `
<div class="radial-progress" :style="{width: size + 'px', height: size + 'px', 'background-color': background}">
    <div class="radial-progress-wrapper" :style="{ 'transform': 'scale(' + (size / 100) + ')', 'background-color': background }">
        <div class="half first" :style="{ 'transform': 'rotate(' + firstRotation + 'deg)', 'border-top-color': color }"></div>
        <div class="half second" :style="{ 'transform': 'rotate(' + secondRotation + 'deg)', 'border-top-color': color }" v-if="percentage > 50"></div>
        <div class="half second-overlay" :style="{ 'border-top-color': background }"></div>
        <div class="mid-cover"></div>
        <!--<div class="outer-cover"></div>-->
        <div class="shadow"></div>
    </div>
</div>
`,
})
