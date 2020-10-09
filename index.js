if (!isQuizizzQuiz()) {
    console.warn(
        "Warning: Not a Quizizz quiz. Waiting for Quizizz quiz..."
    );
}

function entry() {
    injectLibs();
    waitForQuizizzQuiz().then(() => {
        waitForElement([".in-quiz"]).then(() => {
            PowerupGen.createCreatePowerupButton();
            mainLoop();
        });
    });
}

entry();
