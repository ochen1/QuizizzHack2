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

    static createFatalErrorModal(errorcode) {
        document.querySelector(".root-component").insertAdjacentHTML(
            "beforeend",
            `
<div data-v-b36beb7c="" class="overlay-wrapper">
    <div data-v-b36beb7c="" class="overlay overlay-rejoin-error">
        <div data-v-b36beb7c="" class="image-container">
            <img data-v-b36beb7c="" src="https://cf.quizizz.com/game/img/ui/invalid_game.png" alt="avocado">
        </div>
        <div data-v-b36beb7c="" class="text-container">
            <span data-v-b36beb7c="">
            An error has occurred. Please try again.
            </span>
            <span data-v-b36beb7c="" class="error-code"><br data-v-b36beb7c=""><br data-v-b36beb7c="">
            If the issue persists, please share a screenshot on Github
            <br data-v-b36beb7c="">
            Error code - ${errorcode}.
            </span>
        </div>
        <div data-v-b36beb7c="" class="btn-wrapper">
            <a style="color: inherit; text-decoration: inherit;" href="https://github.com">Report an issue</a>
        </div>
    </div>
</div>
</div>
`
        );
    }

    static createFailureToReportErrorModal(errdata) {
        let vdiv = document.createElement("div");
        vdiv.innerText = vdiv.textContent = errdata; // HTML-escaped data
        document.querySelector(".root-component").insertAdjacentHTML(
            "beforeend",
            `
<div data-v-b36beb7c="" class="overlay-wrapper">
    <div data-v-b36beb7c="" class="overlay overlay-rejoin-error">
        <div data-v-b36beb7c="" class="image-container">
            <img data-v-b36beb7c="" src="https://cf.quizizz.com/game/img/ui/disconnect.png" alt="disconnect">
        </div>
        <div data-v-b36beb7c="" class="text-container">
            <span data-v-b36beb7c="">
            Failed to automatically report the error!
            </span>
            <span data-v-b36beb7c="" class="error-code"><br data-v-b36beb7c=""><br data-v-b36beb7c="">
            If the issue persists please share a screenshot on Github
            <br data-v-b36beb7c="">
            Please share the data below with us.
            <br data-v-b36beb7c="">
            <textarea rows="4" cols="50">${vdiv.innerHTML}</textarea>
            </span>
        </div>
        <div data-v-b36beb7c="" class="btn-wrapper">
            <a style="color: inherit; text-decoration: inherit;" href="https://github.com">Report an issue</a>
        </div>
    </div>
</div>
</div>
`
        );
    }
}
