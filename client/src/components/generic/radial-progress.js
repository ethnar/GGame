export default Vue.component('radial-progress', {
    props: [
        'percentage',
        'size',
    ],

    computed: {
        firstRotation() {
            return Math.min(this.percentage, 50) / 50 * 180 - 90;
        },

        secondRotation() {
            return (this.percentage - 50) / 50 * 180 + 90;
        }
    },

    template: `
<div class="radial-progress" :style="{width: size + 'px', height: size + 'px'}">
    <div class="radial-progress-wrapper" :style="'transform: scale(' + (size / 100) + ')'">
        <div class="half first" :style="'transform: rotate(' + firstRotation + 'deg)'"></div>
        <div class="half second" :style="'transform: rotate(' + secondRotation + 'deg)'" v-if="percentage > 50"></div>
        <div class="half second-overlay"></div>
        <div class="mid-cover"></div>
        <div class="outer-cover"></div>
    </div>
</div>
`,
})
