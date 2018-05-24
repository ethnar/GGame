let instance;

Vue.component('context-menu', {
    data: () => ({
        visible: false,
        name: '',
        data: '',
        html: '',
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
        <div v-html="html"></div>
        <actions
            v-if="data"
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
        setTimeout(() => {
            const height = instance.$el.offsetHeight;
            instance.y = Math.min(parseInt(instance.y, 10), window.innerHeight - height) + 'px';
        });
        const x = Math.min(window.innerWidth - halfWidth, Math.max(halfWidth, event.clientX));
        instance.x = x + 'px';
        instance.y = (window.innerHeight - event.clientY + 20) + 'px';
    }
});

export const ContextMenu = {
    open: (label, data, html) => {
        instance.name = label;
        instance.data = data;
        instance.html = html;
        instance.visible = true;
    }
};
