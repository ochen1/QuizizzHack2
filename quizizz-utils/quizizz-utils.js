// Quizizz Libraries
function isQuizizzQuiz() {
    if (window.location.pathname.split("/").slice(1, 3).join("-") != "join-game") {
        return false;
    } else {
        gameConx = JSON.parse(localStorage.getItem("previousContext")).game;
        if (gameConx.isOver) {
            return false;
        } else {
            return true;
        }
    }
}

function waitForQuizizzQuiz() {
    return new Promise(async function (resolve) {
        while (true) {
            if (isQuizizzQuiz()) {
                console.log("Quizizz quiz resolved.");
                resolve();
                return true;
            }
            await sleep(1000);
            // console.log("Quizizz quiz still pending...");
        }
    });
}
