import '../game/dialog-pane-with-logo.js';

export const DisclaimerView = {
    template: `
<div>
    <dialog-pane-with-logo>
        About the game
        <p>Welcome to the game. Before you begin - a word of warning. This game is unlike anything else out there. It takes time to achieve anything in this game, even thou it doesn't ask for your constant attention. The world in this game is dangerous and death is permanent.</p>
        Registration
        <p>To register to the game you need to provide the secret. You can contact the creator of the game <a href="mailto:ethnar.dev@gmail.com" target="_blank">here</a> to get the secret.</p>
        <a class="text" href="#/register">Continue</a>
    </dialog-pane-with-logo>
</div>
`,
};
