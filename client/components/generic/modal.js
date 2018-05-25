Vue.component('modal', {
    data: () => ({
    }),

    template: `
<div class="modal">
    <div class="contents">
        <button class="close" @click="$emit('close')">X</button>
        <div class="title">
            <slot name="header"></slot>
        </div>
        <div class="main">
            <slot name="main"></slot>
        </div>
    </div>
    <div class="backdrop" @click="$emit('close')"></div>
</div>
    `,
});
