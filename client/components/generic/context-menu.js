let instance;
let mouse = {};

Vue.component('context-menu', {
    data: () => ({
        visible: false,
        reallyShow: false,
        name: '',
        data: '',
        html: '',
        x: 0,
        y: 0,
    }),

    mounted() {
        instance = this;
    },

    watch: {
        visible() {
            if (this.visible) {
                console.log('showing!', mouse.x);
                setTimeout(() => {
                    console.log('positioning!', mouse.x, instance.$refs.modal.$el.offsetHeight);
                    const halfWidth = instance.$refs.modal.$el.offsetWidth / 2;
                    const height = instance.$refs.modal.$el.offsetHeight;
                    instance.y = Math.min((window.innerHeight - mouse.y + 20), window.innerHeight - height) + 'px';
                    const x = Math.min(window.innerWidth - halfWidth, Math.max(halfWidth, mouse.x));
                    instance.x = x + 'px';
                    instance.reallyShow = true;
                });
            } else {
                instance.reallyShow = false;
            }
        },
    },

    template: `
<div>
    <modal v-if="visible" :style="{ top: 'auto', bottom: y, left: x, 'visibility': reallyShow ? 'visible' : 'hidden' }" class="context-menu" @close="visible = false;" ref="modal">
        <template slot="header">{{name}}</template>
        <template slot="main">
            <div class="html" v-html="html"></div>
            <actions
                class="actions"
                v-if="data"
                :target="data"
                @action="visible = false"
            />
        </template>
    </modal>
</div>
    `,
});

window.addEventListener('mousemove', (event) => {
    if (instance && !instance.visible) {
        mouse = {
            x: event.clientX,
            y: event.clientY,
        };
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
