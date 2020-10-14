// Constants
const ErrorReportingURL = "";
const MetricsURL = null;
/*
const ValidPowerups = [
    "2x",
    "50-50",
    "eraser",
    "immunity",
    "time-freeze",
    "power-play",
    "streak-saver",
    "glitch"
];
// Source: https://quizizz.zendesk.com/hc/en-us/articles/360035742972-How-many-Power-ups-are-there-
*/

fetch("https://cf.quizizz.com/game/data/PowerupsConfig/v10.json")
    .then((res) => res.json())
    .then((res) => {
        window.ValidPowerups = Object.keys(res);
    });

function injectLibs() {
    // Inject required libraries
    console.debug("Injecting required libraries...");
    let script;
    for (let lib of [
        "//cdnjs.cloudflare.com/ajax/libs/AlertifyJS/1.13.1/alertify.min.js"
    ]) {
        script = document.createElement("script");
        script.src = lib;
        script.type = "application/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
        console.debug("Injected script", lib);
    }
    let stylesheet;
    for (let lib of [
        "//cdnjs.cloudflare.com/ajax/libs/AlertifyJS/1.13.1/css/alertify.min.css",
        "//cdnjs.cloudflare.com/ajax/libs/AlertifyJS/1.13.1/css/themes/semantic.min.css"
    ]) {
        stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = lib;
        stylesheet.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(stylesheet);
        console.debug("Injected stylesheet", lib);
    }
}

function GetAnswer(question) {
    console.debug("Getting answer of question:", question);
    let answer;
    switch (question.structure.kind) {
        case "BLANK":
            // Text Response
            answer = question.structure.options.map((answer) => {
                return answer.text;
            });
            break;
        case "MSQ":
            // Multiple Choice
            let answers = JSON.parse(
                Encoding.decode(question.structure.answer)
            );
            answer = answers.map((answer) => {
                return answer.text == ""
                    ? question.structure.options[answer].media[0].url
                    : question.structure.options[answer].text;
            });
            break;
        case "MCQ":
            // Single Choice
            let answerId = Encoding.decode(question.structure.answer);
            answer =
                question.structure.options[answerId].text == ""
                    ? question.structure.options[answerId].media[0].url
                    : question.structure.options[answerId].text;
    }
    console.debug(
        `Found answer of question of type ${question.structure.kind}: `,
        answer
    );
    return answer;
}

function GetCurrentQuestionType() {
    // TODO: Wait for element before timing out to unknown type
    // Gets the method of identification for the current question
    if (document.querySelector(".quiz-container .question-media")) {
        // Media detected, check if text is also present
        if (document.querySelector(".quiz-container .question-media")) {
            // Also detected text
            console.debug("Detected current question type:", "both");
            return "both";
        } else {
            // Text not also present
            console.debug("Detected current question type:", "media");
            return "media";
        }
    } else if (document.querySelector(".quiz-container .question-text")) {
        // No media detected, must be text
        console.debug("Detected current question type:", "text");
        return "text";
    }
    throw new Error("Unknown question type.");
}

function GetCurrentAnswerType() {
    // TODO: Wait for element before timing out to unknown type
    // Gets the response type of the current question
    if (document.querySelector(".quiz-container .typed-option-input")) {
        // Text box detected
        console.debug("Detected current answer type:", "BLANK");
        return "BLANK";
    } else if (
        document.querySelector(".quiz-container .options-container .msq")
    ) {
        // Options box detected and checkbox emoji detected
        console.debug("Detected current question type:", "MSQ");
        return "MSQ";
    } else if (document.querySelector(".quiz-container .options-container")) {
        // Options box detected
        console.debug("Detected current question type:", "MCQ");
        return "MCQ";
    }
    throw new Error("Unknown response type.");
}

function GetCurrentQuestion(set) {
    console.debug("Finding current question in set:", set);
    // TODO: Use Context's lastVisibleQuestionId instead of this brute-force checking method
    let currentQuestionType = GetCurrentQuestionType();
    let mediaSRC, text;
    if (currentQuestionType == "media" || currentQuestionType == "both") {
        mediaSRC = document
            .querySelector(".quiz-container .question-media img")
            .split("?")[0]; //! May need to use "/?" instead of "?"
    }
    if (currentQuestionType == "text" || currentQuestionType == "both") {
        text = document.querySelector(".quiz-container .question-text p") // TODO: use > div > div.innerHTML instead of p.outerhtml
            .outerHTML;
    }
    console.debug(
        "Current question identifier:",
        currentQuestionType,
        text,
        mediaSRC
    );
    for (let question of Object.values(set.questions)) {
        // Loop through list of questions to match it with the current question
        if (
            question.structure.query.media[0] &&
            question.structure.query.text &&
            mediaSRC &&
            text
        ) {
            // Candidate question and current question are both questions with both media and text
            if (
                question.structure.query.media[0].url == mediaSRC &&
                text == question.structure.query.text
            ) {
                return question;
            }
        } else if (question.structure.query.media[0] && mediaSRC) {
            // Candidate question and current question are both media questions
            if (question.structure.query.media[0].url == mediaSRC) {
                return question;
            }
        } else if (question.structure.query.text && text) {
            // Candidate question and current question are both text questions
            if (text == question.structure.query.text) {
                return question;
            }
        }
    }
    console.error("Failed to get current question.");
    return null;
}

async function mainLoop() {
    window.LastCompletedQuestionNumber = 0;
    while (isQuizizzQuiz()) {
        console.debug("Waiting for question change...");
        await waitForQuestionChange();
        console.debug("Question changed.");
        let isRedemptionQuestion = !!document.querySelector(
            ".redemption-marker"
        );
        console.debug(`This question is${isRedemptionQuestion ? "" : " not"} a redemption question.`);
        if (isRedemptionQuestion) {
            if (
                document.querySelector(
                    "screen-redemption-question-selector[data-screen='redemption-question-selector']"
                )
            ) {
                // Question not present on page, still waiting for question selection
                console.debug("Redemption question selector found. Waiting for main quiz container...");
                await waitForElement([
                    ".transitioner .quiz-container.question-redemption-theme[currentpage='inGame|quiz']"
                ]);
                console.debug("Main quiz container found.");
            }
        }
        let questionNum = document.querySelector(".current-question")
            ? parseInt(document.querySelector(".current-question").innerText)
            : false; // The current question was not found
        console.debug("Got question number:", questionNum);
        if (questionNum) {
            console.debug("Waiting for input form (any type)...");
            await waitForElement([".options-container", ".typed-option-input"]);
            console.debug("Input form found.");
            let currentSet = await Context.GetSetData();
            console.debug("Got current set data:", currentSet);
            let currentQuestion = GetCurrentQuestion(currentSet);
            if (currentQuestion === null) {
                // TODO: Error reporting.
                throw Error("Current question not found in current set.");
            }
            let answer = GetAnswer(currentQuestion);
            switch (GetCurrentAnswerType()) {
                case "BLANK":
                    console.info("Manual Input", answer);
                    break;
                case "MSQ":
                    // Multiple Choice
                    console.info("Multiple Choice", answer);
                    break;
                case "MCQ":
                    // Single Choice
                    console.info("Single Choice", answer);
                    break;
            }
        } else {
            // TODO: Auto error reporting
            console.error("Question number not found?");
        }
    }
    console.warn("Main loop ended.");
    PowerupGen.cleanup();
    console.debug("Cleanup complete. Starting new loop.");
    mainLoop(); // Start waiting again in case another quiz is started.
}
