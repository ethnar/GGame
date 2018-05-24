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

    template: `
<div
    class="radial-progress"
    :data-progress="percentage"
    :style="{ 'background-color': background, width: size + 'px', height: size + 'px' }"
    @click="$emit('click', $event)"
>
    <div class="circle">
        <div class="mask full">
            <div class="fill" :style="{ 'background-color': color }"></div>
        </div>
        <div class="mask half">
            <div class="fill" :style="{ 'background-color': color }"></div>
            <div class="fill fix" :style="{ 'background-color': color }"></div>
        </div>
        <div class="shadow"></div>
        <div class="inset"><slot></slot></div>
    </div>
</div>
`,
})
