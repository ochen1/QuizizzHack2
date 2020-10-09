// Quizizz Libraries
function isQuizizzQuiz() {
    return (
        window.location.pathname.split("/").slice(1, 3).join("-") ==
            "join-game" &&
        new URLSearchParams(window.location.search).get("gameType") &&
        JSON.parse(localStorage.getItem("previousContext")).game !== null
    );
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
