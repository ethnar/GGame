Vue.component('dialog-pane-with-logo', {
    data: () => ({

    }),
    created() {
        this.legal = window.LEGAL_HTML;
    },

    template: `
<div class="dialog-pane-with-logo">
    <div class="main-container">
        <header>G the Game</header>
        <div class="logo"></div>
        <slot></slot>
        <div class="legal" v-html="legal"></div>
    </div>
</div>
`,
});
