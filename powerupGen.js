class QuizizzPowerupApi {
    static createPowerup({ gameType, roomHash, playerId, chosenPowerup }) {
        return new Promise((resolve) => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "https://game.quizizz.com/play-api/awardPowerup");
            xhr.setRequestHeader(
                "Content-Type",
                "application/json;charset=UTF-8"
            );
            xhr.send(
                JSON.stringify({
                    gameType: gameType,
                    roomHash: roomHash,
                    playerId: playerId,
                    powerup: {
                        name: chosenPowerup
                    }
                })
            );
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    resolve({
                        statusCode: xhr.status,
                        response: JSON.parse(xhr.responseText)
                    });
                }
            };
        });
    }
    }
}

class PowerupGen {
    static async createCreatePowerupButton() {
        // TODO: Create settings panel
        // Define the function the button should call when it is clicked.
        window.createPowerup = async function () {
            let { gameType, roomHash, playerId } = Context.GetGameMeta();
            let chosenPowerup = await new Promise((resolve) => {
                // TODO: Add choice buttons (eg. automatically fill the input with option when the li is clicked)
                alertify.prompt(
                    "Choose Powerup",
                    "Please enter your desired powerup.<br>Here is a handy list: " +
                        "<ul><li>" +
                        ValidPowerups.join("</li><li>") +
                        "</li></ul><br>",
                    "2x",
                    function (evt, value) {
                        resolve(value);
                    },
                    function () {
                        resolve(false);
                    }
                );
            });
            if (chosenPowerup === false) {
                return false;
            }
            if (!ValidPowerups.includes(chosenPowerup)) {
                if (
                    !(await new Promise((resolve) => {
                        alertify.confirm(
                            "Invalid Powerup Name",
                            "That does not appear to be a valid powerup!<br>Valid powerups: " +
                                "<ul><li>" +
                                ValidPowerups.join("</li><li>") +
                                "</li></ul>" +
                                "<br>Proceed anyway?",
                            () => {
                                resolve(true);
                            },
                            () => {
                                resolve(false);
                            }
                        );
                    }))
                ) {
                    return false;
                }
            }
            let {
                statusCode,
                response
            } = await QuizizzPowerupApi.createPowerup({
                gameType: gameType,
                roomHash: roomHash,
                playerId: playerId,
                chosenPowerup: chosenPowerup
            });
            if (statusCode != 200 || response.error) {
                // The attempt to add the powerup failed for some reason.
                // TODO: Automatically report this error.
                if (response.error) {
                    alertify.notify(
                        response.error + " (" + response.type + ")",
                        "error",
                        10
                    );
                } else {
                    alertify.notify("An unknown error occurred.", "error", 5);
                }
                return false;
            }
            alertify.notify(
                "SUCCESS: " +
                    response.powerup.status +
                    " " +
                    response.powerup.name.toUpperCase(),
                "success",
                3
            );
        };
        /*
        document.head.insertAdjacentHTML(
            "beforeend",
            `
<style id="powerups-x3Ca8B" type="text/css">
#wrapper-x3Ca8B {
    position: fixed;
    top: 5vh;
    right: 1vw;
    background-color: #212121;
    opacity: 50%;
    border-radius: 12px;
    transition: opacity 250ms ease-in-out, background 50ms ease-in-out;
    text-align: center;
    padding: 12px 8px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    z-index: 1000;
    cursor: pointer;
}
#wrapper-x3Ca8B:hover {
    opacity: 0.8;
}
#wrapper-x3Ca8B:active {
    background-color: #2E7D32;
}
#label-x3Ca8B {
    color: #fafafa;
    font-size: 19pt;
    font-family: "Trebuchet MS", Helvetica, sans-serif;
}
#author-x3Ca8B {
    color: #dadada;
    font-size: 8pt;
    font-family: "Lucida Console", Monaco, monospace;
}
</style>
`
        );
        document.body.insertAdjacentHTML(
            "beforeend",
            `
<div id="wrapper-x3Ca8B" role="button" onclick="window.createPowerup();">
    <div id="container-x3Ca8B">
        <span id="label-x3Ca8B">Create Powerup</span>
        <br>
        <span id="author-x3Ca8B">ochen1</span>
    </div>
</div>
`
        );
        */

        // Rainbow animation from: https://codepen.io/nohoid/pen/kIfto
        document.head.insertAdjacentHTML(
            "beforeend",
            `
<style id="powerups-x3Ca8B" type="text/css">
#btn-rainbow-x3Ca8B {
    background: linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3);
    background-size: 1800% 1800%;
    -webkit-animation: rainbow 8s ease infinite;
    -z-animation: rainbow 8s ease infinite;
    -o-animation: rainbow 8s ease infinite;
    animation: rainbow 8s ease infinite;
    transition: background 250ms ease-in;
}
#btn-rainbow-x3Ca8B img {
    height: 90%;
    filter: opacity(75%);
    transition: filter 100ms ease-in;
}
#btn-rainbow-x3Ca8B:hover img {
    filter: opacity(90%);
}

@-webkit-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-moz-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@-o-keyframes rainbow {
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
@keyframes rainbow { 
    0%{background-position:0% 82%}
    50%{background-position:100% 19%}
    100%{background-position:0% 82%}
}
</style>
`
        );

        // TODO: Ensure button is always at the end of list
        document
            .querySelector(
                ".control-center-container > .tool-bar > .powerup-wrapper"
            )
            .insertAdjacentHTML(
                "beforeend",
                `
<div data-v-5bf8f3b0="" id="wrapper-x3Ca8B" class="powerup-container" onclick="window.createPowerup();">
    <div data-v-5bf8f3b0="" id="btn-rainbow-x3Ca8B" class="powerup-icon control-center-btn">
        <img data-v-5bf8f3b0="" src="https://github.com/FortAwesome/Font-Awesome/blob/master/svgs/solid/plus-circle.svg?raw=true" class="powerup-icon-image">
    </div>
    <span data-v-5bf8f3b0="" class="btn-title">Add New</span>
</div>
`
            );
    }

    static cleanup() {
        // The quiz has ended.
        // We need to collect and clean up the elements we've injected.
        console.log("Quizizz quiz ended.");
        for (let id of [
            // Remove every element with the ids in the list
            "wrapper-x3Ca8B", // Create Powerup Button
            "powerups-x3Ca8B" // Create Powerup Stylesheet
        ]) {
            if (document.getElementById(id)) {
                document.getElementById(id).remove();
            } else {
                console.warn(
                    "Warning: Tried to remove element on cleanup with id " +
                        id +
                        " but could not find it."
                );
            }
        }
    }
}
