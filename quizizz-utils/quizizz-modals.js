class QuizizzModals {
    static createIntroModal() {
        document.querySelector(".control-center-container").insertAdjacentHTML(
            "beforeend",
            `
<div data-v-4959087c="" data-test="modal-container" class="modal-container" onclick="this.parentElement.removeChild(this);">
    <div data-v-4959087c="" class="modal-mask stack-to-bottom" style="justify-content: flex-start;">
        <div data-v-4959087c="" class="modal-body">
            <div data-v-08038f4f="" class="powerup-onboarding-container" style="left: 224px; background-color: #aafaaa;" onclick="event.cancelBubble = true;">
                <img data-v-08038f4f="" v-if="true" src="https://cf.quizizz.com/game/img/powerups/powerup-onboarding-banner.png" class="powerup-onboarding-img">
                <div data-v-08038f4f="" class="powerup-onboarding-title">Quizizz hack has been injected!</div>
                <div data-v-08038f4f="" class="powerup-onboarding-instruction">Use the 'Add New' button to get any powerup you want!</div>
                <button data-v-08038f4f="" class="powerup-onboarding-button" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement.parentElement.parentElement);">GOT IT</button>
            </div>
        </div>
    </div>
</div>
`
        );
    }
}
