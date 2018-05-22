let instance;

Vue.component('context-menu', {
    data: () => ({
        visible: false,
        name: '',
        data: '',
        x: 0,
        y: 0,
    }),

    mounted() {
        instance = this;
    },

    template: `
<div :hidden="!visible" :style="{ bottom: y, left: x }" class="context-menu">
    <div class="contents">
        <div class="title">{{name}}</div>
        <actions
            :target="data"
            @action="visible = false"
        />
    </div>
    <div class="backdrop" @click="visible = false"></div>
</div>
    `,
});

window.addEventListener('mousemove', (event) => {
    if (instance && !instance.visible) {
        const halfWidth = parseInt(window.getComputedStyle(instance.$el).width, 10) / 2;
        const x = Math.min(screen.width - halfWidth, Math.max(halfWidth, event.clientX));
        instance.x = x + 'px';
        instance.y = (screen.height - event.clientY + 20) + 'px';
    }
});

export const ContextMenu = {
    open: (label, data) => {
        instance.name = label;
        instance.data = data;
        instance.visible = true;
    }
};
