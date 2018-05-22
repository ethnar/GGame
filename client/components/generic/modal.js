Vue.component('modal', {
    data: () => ({
    }),

    template: `
<div class="modal">
    <div class="contents">
        <slot></slot>
    </div>
    <div class="backdrop" @click="$emit('close')"></div>
</div>
    `,
});
