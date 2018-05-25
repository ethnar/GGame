Vue.component('dialog-pane-with-logo', {
    template: `
<div class="dialog-pane-with-logo">
    <div class="main-container">
        <header>G the Game</header>
        <div class="logo"></div>
        <slot></slot>
        <div class="legal"></div>
    </div>
</div>
`,
});
