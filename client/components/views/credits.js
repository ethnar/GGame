import '../game/dialog-pane-with-logo.js';

export const CreditsView = {
    methods: {
        goBack() {
            window.location = '#/main';
        }
    },

    template: `
<div>
    <dialog-pane-with-logo>
        <p>Design & Programming</p>
        <a href="mailto:ethnar.dev@gmail.com" target="_blank">Arkadiusz Bisaga</a>
        <p>Art</p>
        <a href="https://assetstore.unity.com/publishers/13229" target="_blank">Rexard</a>
        <a href="https://icons8.com/" target="_blank">Icons8</a>
        <br/>
        <button class="text" @click="goBack()">Go back</button>
    </dialog-pane-with-logo>
</div>
`,
};
