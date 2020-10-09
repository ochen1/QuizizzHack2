class PowerupGen {
    static async createCreatePowerupButton() {
        // Define the function the button should call when it is clicked.
        window.createPowerup = async function () {
            let { GameType, roomHash, playerId } = Context.GetSetMeta();
            let chosenPowerup = await new Promise((resolve) => {
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
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "https://game.quizizz.com/play-api/awardPowerup");
            xhr.setRequestHeader(
                "Content-Type",
                "application/json;charset=UTF-8"
            );
            xhr.send(
                JSON.stringify({
                    gameType: GameType,
                    roomHash: roomHash,
                    playerId: playerId,
                    powerup: {
                        name: chosenPowerup
                    }
                })
            );
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    let ret = JSON.parse(xhr.responseText);
                    if (xhr.status != 200 || ret.error) {
                        // The attempt to add the powerup failed for some reason.
                        // TODO: Automatically report this error.
                        if (ret.error) {
                            alertify.notify(
                                ret.error + " (" + ret.type + ")",
                                "error",
                                10
                            );
                        } else {
                            alertify.notify(
                                "An unknown error occurred.",
                                "error",
                                5
                            );
                        }
                        return false;
                    }
                    alertify.notify(
                        "SUCCESS: " +
                            ret.powerup.status +
                            " " +
                            ret.powerup.name.toUpperCase(),
                        "success",
                        3
                    );
                }
            };
        };
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
        //TODO: Better UI + settings control
        document.body.insertAdjacentHTML(
            "beforeend",
            `
    <div id="wrapper-x3Ca8B" role="button" onclick="window.createPowerup();">
    <div id="container-x3Ca8B">
        <span id="label-x3Ca8B">Create Powerup</span>
        <br>
        <span id="author-x3Ca8B">ochen1 / chandan1602</span>
    </div>
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
            "wrapper-x3Ca8B",
            "powerups-x3Ca8B",
            "answers-x3Ca8B"
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
        entry(); // Start waiting again in case another quiz is started.
    }
}
