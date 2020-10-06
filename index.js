// ==UserScript==
// @name         Quizizz Answers Highlighter and Powerup Generator
// @namespace    https://github.com/ochen1/QuizizzHack2
// @supportURL   https://github.com/ochen1/QuizizzHack2
// @contributionURL https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=Z87WKG5G9JBYL&item_name=Userscript+-+Quizizz+Hack+2+Donation&currency_code=CAD&source=url
// @version      0.1.2
// @description  Highlight answers from Quizizz quizzes and adds a button to get any powerup your heart desires.
// @author       ochen1 / chandan1602
// @match        *://quizizz.com/join/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

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
    ]; // Source: https://quizizz.zendesk.com/hc/en-us/articles/360035742972-How-many-Power-ups-are-there-

    // Inject required libraries
    let script;
    for (let lib of [
        "//cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/AlertifyJS/1.13.1/alertify.min.js"
    ]) {
        script = document.createElement("script");
        script.src = lib;
        script.type = "application/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
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
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function waitForElement(queries, timeoutms) {
        return new Promise(async (resolve, reject) => {
            if (timeoutms) {
                let timeout = setTimeout(() => {
                    reject('Waiting for element timed out.');
                }, timeoutms);
            }
            while (true) {
                for (let query of queries) {
                    if (document.querySelector(query)) {
                        if (timeoutms) {
                            clearTimeout(timeout);
                        }
                        resolve();
                        return;
                    }
                }
                await sleep(1000);
            }
        });
    }

    function isQuizizzQuiz() {
        return (
            window.location.pathname.split("/").slice(1, 3).join("-") ==
                "join-game" &&
            new URLSearchParams(window.location.search).get("gameType") &&
            JSON.parse(localStorage.getItem("previousContext")).game !== null
        );
    }

    function waitForQuizizzQuiz(interval) {
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

    if (!isQuizizzQuiz()) {
        console.warn(
            "Warning: Not a Quizizz quiz. Waiting for Quizizz quiz..."
        );
    }

    class Encoding {
        static encodeRaw(t, e, o = "quizizz.com") {
            let s = 0;
            s = e
                ? o.charCodeAt(0)
                : o.charCodeAt(0) + o.charCodeAt(o.length - 1);
            let r = [];
            for (let o = 0; o < t.length; o++) {
                let n = t[o].charCodeAt(0),
                    c = e ? this.safeAdd(n, s) : this.addOffset(n, s, o, 2);
                r.push(String.fromCharCode(c));
            }
            return r.join("");
        }

        static decode(t, e = !1) {
            if (e) {
                let e = this.extractHeader(t);
                return this.decodeRaw(e, !0);
            }
            {
                let e = this.decode(this.extractHeader(t), !0),
                    o = this.extractData(t);
                return this.decodeRaw(o, !1, e);
            }
        }

        static decodeRaw(t, e, o = "quizizz.com") {
            let s = this.extractVersion(t);
            let r = 0;
            (r = e
                ? o.charCodeAt(0)
                : o.charCodeAt(0) + o.charCodeAt(o.length - 1)),
                (r = -r);
            let n = [];
            for (let o = 0; o < t.length; o++) {
                let c = t[o].charCodeAt(0),
                    a = e ? this.safeAdd(c, r) : this.addOffset(c, r, o, s);
                n.push(String.fromCharCode(a));
            }
            return n.join("");
        }

        static addOffset(t, e, o, s) {
            return 2 === s
                ? this.verifyCharCode(t)
                    ? this.safeAdd(t, o % 2 == 0 ? e : -e)
                    : t
                : this.safeAdd(t, o % 2 == 0 ? e : -e);
        }

        static extractData(t) {
            let e = t.charCodeAt(t.length - 2) - 33;
            return t.slice(e, -2);
        }

        static extractHeader(t) {
            let e = t.charCodeAt(t.length - 2) - 33;
            return t.slice(0, e);
        }

        static extractVersion(t) {
            if ("string" == typeof t && t[t.length - 1]) {
                let e = parseInt(t[t.length - 1], 10);
                if (!isNaN(e)) return e;
            }
            return null;
        }

        static safeAdd(t, e) {
            let o = t + e;
            return o > 65535
                ? o - 65535 + 0 - 1
                : o < 0
                ? 65535 - (0 - o) + 1
                : o;
        }

        static verifyCharCode(t) {
            if ("number" == typeof t)
                return !(
                    (t >= 55296 && t <= 56319) ||
                    (t >= 56320 && t <= 57343)
                );
        }
    }

    function GetSetMeta() {
        let URL = new URLSearchParams(window.location.search),
            GameType = URL.get("gameType"),
            prevConx = localStorage.getItem("previousContext"),
            parsedConx = JSON.parse(prevConx),
            encodedRoomHash = parsedConx.game.roomHash,
            roomHash = Encoding.decode(encodedRoomHash.split("-")[1]),
            playerId = parsedConx.currentPlayer.playerId;
        return {
            URL: URL,
            GameType: GameType,
            prevConx: prevConx,
            parsedConx: parsedConx,
            encodedRoomHash: encodedRoomHash,
            roomHash: roomHash,
            playerId: playerId
        };
    }

    function GetSetData() {
        let { roomHash, GameType } = GetSetMeta();

        let data = {
            roomHash: roomHash,
            type: GameType
        };

        let xhttp = new XMLHttpRequest();
        xhttp.open(
            "POST",
            "https://game.quizizz.com/play-api/v3/getQuestions",
            false
        );
        xhttp.setRequestHeader(
            "Content-Type",
            "application/json;charset=UTF-8"
        );
        xhttp.send(JSON.stringify(data));
        return JSON.parse(xhttp.responseText);
    }

    function GetAnswer(Question) {
        switch (Question.structure.kind) {
            case "BLANK":
                // Text Response, we have no need for image detection in answers
                let ToRespond = [];
                for (let i = 0; i < Question.structure.options.length; i++) {
                    ToRespond.push(Question.structure.options[i].text);
                }
                return ToRespond;
            case "MSQ":
                // Multiple Choice
                let Answers = Encoding.decode(Question.structure.answer);
                Answers = JSON.parse(Answers);
                let TextArray = [];
                for (let i = 0; i < Answers.length; i++) {
                    if (Answers[i].text == "") {
                        TextArray.push(
                            Question.structure.options[Answers[i]].media[0].url
                        );
                    } else {
                        TextArray.push(
                            Question.structure.options[Answers[i]].text
                        );
                    }
                }
                return TextArray;
            case "MCQ":
                // Single Choice
                let AnswerNum = Encoding.decode(Question.structure.answer);
                let Answer = Question.structure.options[AnswerNum].text;
                if (Answer == "") {
                    Answer = Question.structure.options[AnswerNum].media[0].url;
                }
                return Answer;
        }
    }

    function GetQuestion(Set) {
        for (let v of Object.keys(Set.questions)) {
            v = Set.questions[v];
            switch (GetQuestionType()) {
                case "Both":
                    let BothSRC = document.getElementsByClassName(
                        "question-media"
                    )[0].children[0].src;
                    BothSRC = BothSRC.slice(0, BothSRC.search("/?w=") - 1);
                    if (v.structure.query.media[0]) {
                        if (v.structure.query.media[0].url == BothSRC) {
                            let BothQuestion = document.getElementsByClassName(
                                "question-text"
                            )[0].children[0].children[0].innerHTML;
                            if (
                                Fix(BothQuestion) == Fix(v.structure.query.text)
                            ) {
                                return v;
                            }
                        }
                    }
                    break;
                case "Media":
                    let CurrentSRC = document.getElementsByClassName(
                        "question-media"
                    )[0].children[0].src;
                    CurrentSRC = CurrentSRC.slice(
                        0,
                        CurrentSRC.search("/?w=") - 1
                    );
                    if (v.structure.query.media[0]) {
                        if (v.structure.query.media[0].url == CurrentSRC) {
                            return v;
                        }
                    }
                    break;
                case "Text":
                    let ToSearchA = document.getElementsByClassName(
                        "question-text"
                    )[0].children[0].children[0].innerHTML;
                    let ToSearchB = v.structure.query.text;
                    ToSearchB = ToSearchB;
                    ToSearchA = ToSearchA;
                    if (Fix(ToSearchA) == Fix(ToSearchB)) {
                        return v;
                    }
                    break;
            }
        }
        return "Error: No question found";
    }

    function GetQuestionType() {
        if (document.getElementsByClassName("question-media")[0]) {
            // Media was detected, check if text is too
            if (document.getElementsByClassName("question-text")[0]) {
                // Detected text aswell, send it to the onchanged
                return "Both";
            } else {
                // Failed to detect text aswell, Media is all that we need to send
                return "Media";
            }
        } else {
            // Media wasn't detected, no need to check if text was because it has to be
            return "Text";
        }
    }

    let CurrentQuestionNum = "";
    let LastRedemption;

    function Fix(s) {
        // TODO: fix Fix() function
        let sEnd = s.lastIndexOf("&nbsp;");
        if (sEnd == s.length - 6) {
            s = s.substring(0, sEnd);
        }
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#8203;/g, "‍");
        s = jQuery("<div>").html(String(s))[0].innerHTML;
        s = s.replace(/\s+/g, " ");
        return s;
    }

    function cleanup() {
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

    async function QuestionChangedLoop() {
        while (true) {
            if (!isQuizizzQuiz()) {
                // Game over.
                cleanup();
                break;
            }
            // TODO: Still crashes at the end of the redemption question.
            await sleep(100);
            let NewNum = document.getElementsByClassName("current-question")[0] === undefined ? false : document.getElementsByClassName("current-question")[0];
            let RedemptionQues = document.getElementsByClassName(
                "redemption-marker"
            ).length == 1;
            if (NewNum) {
                await waitForElement(['.options-container', '.typed-option-input']);
                if (NewNum.innerHTML != CurrentQuestionNum) {
                    await sleep(1000);
                    if (
                        document.getElementsByClassName("typed-option-input")[0]
                    ) {
                        let Set = GetSetData();
                        let Question = GetQuestion(Set);
                        if (Question == "Error: No question found") {
                            alert(
                                "An error occurred, This should never happen. Please DM East_Arctica#9238 with your quiz link."
                            );
                        } else {
                            let Answer = GetAnswer(Question);
                            if (Array.isArray(Answer)) {
                                // We are on a question with multiple answers
                                let ToShow = "";
                                for (let x = 0; x < Answer.length; x++) {
                                    if (ToShow == "") {
                                        ToShow = Answer[x];
                                    } else {
                                        ToShow = ToShow + " | " + Answer[x];
                                    }
                                }
                                let ToShowNew =
                                    "Press Ctrl+C to copy (Answers are seperated by ' | ')";
                                prompt(ToShowNew, ToShow);
                            } else {
                                let NewAnswer = "Press Ctrl+C to copy.";
                                prompt(NewAnswer, Answer);
                            }
                        }
                    } else {
                        let Choices = document.getElementsByClassName(
                            "options-container"
                        )[0].children[0].children;
                        for (let i = 0; i < Choices.length; i++) {
                            if (!Choices[i].classList.contains("emoji")) {
                                let Choice =
                                    Choices[i].children[0].children[0]
                                        .children[0].children[0];
                                let Set = GetSetData();
                                let Question = GetQuestion(Set);
                                if (Question === "Error: No question found") {
                                    alert(
                                        "Failed to find question! This is a weird issue I don't understand, you will just have to answer this question legit for now."
                                    );
                                } else {
                                    let Answer = GetAnswer(Question);
                                    if (Array.isArray(Answer)) {
                                        // We are on a question with multiple answers
                                        for (
                                            let x = 0;
                                            x < Answer.length;
                                            x++
                                        ) {
                                            if (
                                                Fix(Choice.innerHTML) ==
                                                Answer[x]
                                            ) {
                                                Choice.parentElement.parentElement.parentElement.parentElement.classList.add(
                                                    "correct-answer-x3Ca8B"
                                                );
                                            }
                                        }
                                    } else {
                                        if (Fix(Choice.innerHTML) == Answer) {
                                            Choice.parentElement.parentElement.parentElement.parentElement.classList.add(
                                                "correct-answer-x3Ca8B"
                                            );
                                        } else if (
                                            Choice.style.backgroundImage
                                                .slice(
                                                    5,
                                                    Choice.style.backgroundImage
                                                        .length - 2
                                                )
                                                .slice(
                                                    0,
                                                    Choice.style.backgroundImage
                                                        .slice(
                                                            5,
                                                            Choice.style
                                                                .backgroundImage
                                                                .length - 2
                                                        )
                                                        .search("/?w=") - 1
                                                ) ==
                                            GetAnswer(GetQuestion(GetSetData()))
                                        ) {
                                            Choice.parentElement.parentElement.parentElement.parentElement.classList.add(
                                                "correct-answer-x3Ca8B"
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                    CurrentQuestionNum = NewNum.innerHTML;
                }
            } else if (RedemptionQues) {
                if (LastRedemption != GetQuestion(GetSetData())) {
                    let Choices = document.getElementsByClassName(
                        "options-container"
                    )[0].children[0].children;
                    for (let i = 0; i < Choices.length; i++) {
                        if (!Choices[i].classList.contains("emoji")) {
                            let Choice =
                                Choices[i].children[0].children[0].children[0]
                                    .children[0];
                            if (
                                Fix(Choice.innerHTML) ==
                                GetAnswer(GetQuestion(GetSetData()))
                            ) {
                                Choice.parentElement.parentElement.parentElement.parentElement.classList.add(
                                    ...["correct-answer-x3Ca8B", "redemption-answer-x3Ca8B"]
                                );
                            }
                        }
                    }
                    LastRedemption = GetQuestion(GetSetData());
                }
            }
        }
    }

    async function createCreatePowerupButton() {
        // Define the function the button should call when it is clicked.
        window.createPowerup = async function () {
            let { GameType, roomHash, playerId } = GetSetMeta();
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
                // TODO: insert list of powerups
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

    async function entry() {
        if (document.domain != "quizizz.com") {
            throw new Error("Not a Quizizz quiz.");
        }
        // await sleep(1000);
        await waitForQuizizzQuiz();
        createCreatePowerupButton();
        document.head.insertAdjacentHTML(
            "beforeend",
            `
<style id="answers-x3Ca8B" type="text/css">
.correct-answer-x3Ca8B > div > div:nth-of-type(1) {
    --answer-box-shadow-color-x3Ca8B: #ededed;
    border: none !important;
    box-shadow: 0px 0px 10px 10px inset var(--answer-box-shadow-color-x3Ca8B) !important;
}
.correct-answer-x3Ca8B.redemption-answer-x3Ca8B > div > div:nth-of-type(1) {
    --answer-box-shadow-color-x3Ca8B: #212121 !important;
}
.correct-answer-x3Ca8B p {
    color: lime !important;
}
</style>
    `
        );
        try {
            await QuestionChangedLoop();
        } catch (err) {
            if (!isQuizizzQuiz()) {
                // Game over.
                cleanup();
            } else {
                throw err;
            }
        }
    }
    entry();
})();
