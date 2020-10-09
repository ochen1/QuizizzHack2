// Constants
const ErrorReportingURL = "";
const MetricsURL = null;
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
    switch (question.structure.kind) {
        case "BLANK":
            // Text Response
            return question.structure.options.map((answer) => {
                return answer.text;
            });
        case "MSQ":
            // Multiple Choice
            let answers = JSON.parse(
                Encoding.decode(question.structure.answer)
            );
            return answers.map((answer) => {
                return answer.text == ""
                    ? question.structure.options[answer].media[0].url
                    : question.structure.options[answer].text;
            });
        case "MCQ":
            // Single Choice
            let answerId = Encoding.decode(question.structure.answer),
                answer =
                    question.structure.options[answerId].text == ""
                        ? question.structure.options[answerId].media[0].url
                        : question.structure.options[answerId].text;
            return answer;
    }
}

function GetCurrentQuestionType() {
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
    return null;
}

function waitForQuestionChange() {
    return new Promise(async (resolve) => {
        try {
            while (
                window.LastCompletedQuestionNumber ==
                parseInt(document.querySelector(".current-question").innerText)
            ) {
                await sleep(500);
            }
            console.debug(
                "Question changed:",
                window.LastCompletedQuestionNumber,
                parseInt(document.querySelector(".current-question").innerText)
            );
            window.LastCompletedQuestionNumber = parseInt(
                document.querySelector(".current-question").innerText
            );
        } catch (err) {
            if (!err instanceof TypeError) {
                throw err;
            }
        } finally {
            resolve();
        }
    });
}

async function mainLoop() {
    window.LastCompletedQuestionNumber = 0;
    while (isQuizizzQuiz()) {
        await waitForQuestionChange();
        let isRedemptionQuestion = !!document.querySelector(
            ".redemption-marker"
            );
            if (isRedemptionQuestion) {
                if (document.querySelector("screen-redemption-question-selector[data-screen='redemption-question-selector']")) {
                    // Question not present on page, still waiting for question selection
                    await waitForElement([".transitioner .quiz-container.question-redemption-theme[currentpage='inGame|quiz']"]);
                }
            }
            let questionNum = document.querySelector(".current-question")
                ? parseInt(document.querySelector(".current-question").innerText)
                : false; // The current question was not found
            if (questionNum) {
            await waitForElement([".options-container", ".typed-option-input"]);
            let currentSet = await Context.GetSetData();
            let currentQuestion = GetCurrentQuestion(currentSet);
            if (currentQuestion === null) {
                // TODO: Error reporting.
                throw Error("Current question not found in current set.");
            }
            let answer = GetAnswer(currentQuestion);
            switch (GetCurrentAnswerType()) {
                case "BLANK":
                    console.log("Manual Input", answer);
                    break;
                case "MSQ":
                    // Multiple Choice
                    console.log("Multiple Choice", answer);
                    break;
                case "MCQ":
                    // Single Choice
                    console.log("Single Choice", answer);
                    break;
            }
        } else {
            // TODO: Auto error reporting
        }
    }
    PowerupGen.cleanup();
    mainLoop(); // Start waiting again in case another quiz is started.
}
