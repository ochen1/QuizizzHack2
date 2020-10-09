if (!isQuizizzQuiz()) {
    console.warn(
        "Warning: Not a Quizizz quiz. Waiting for Quizizz quiz..."
    );
}

function entry() {
    injectLibs();
    PowerupGen.createCreatePowerupButton();
    mainLoop();
}

entry();
