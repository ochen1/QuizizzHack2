// Libraries for the game info

class Context {
    static GetPlayerMeta() {
        let prevConx = localStorage.getItem("previousContext"),
            parsedConx = JSON.parse(prevConx);
        let playerId = parsedConx.currentPlayer.playerId,
            score = parsedConx.currentPlayer.score,
            currentStreak = parsedConx.currentPlayer.currentStreak,
            previousStreak = parsedConx.currentPlayer.previousStreak,
            longestStreak = parsedConx.currentPlayer.longestStreak,
            accuracy = parsedConx.currentPlayer.accuracy,
            totalCorrect = parsedConx.currentPlayer.totalCorrect,
            isOver = parsedConx.currentPlayer.isOver,
            hasJoinedTheGame = parsedConx.currentPlayer.hasJoinedTheGame;
        return {
            playerId: playerId,
            score: score,
            currentStreak: currentStreak,
            previousStreak: previousStreak,
            longestStreak: longestStreak,
            accuracy: accuracy,
            totalCorrect: totalCorrect,
            isOver: isOver,
            hasJoinedTheGame: hasJoinedTheGame
        };
    }

    static GetUserMeta() {
        let prevConx = localStorage.getItem("previousContext"),
            parsedConx = JSON.parse(prevConx);
        let email = parsedConx.currentPlayer.email,
            firstName = parsedConx.currentPlayer.firstName,
            lastName = parsedConx.currentPlayer.lastName,
            name = parsedConx.currentPlayer.name,
            userName = parsedConx.currentPlayer.userName,
            photoUrl = parsedConx.currentPlayer.photoUrl,
            courses = parsedConx.currentPlayer.courses,
            mongoId = parsedConx.currentPlayer.mongoId,
            gradeList = parsedConx.currentPlayer.gradeList,
            favSubjects = parsedConx.currentPlayer.favSubjects,
            language = parsedConx.currentPlayer.language,
            occupation = parsedConx.currentPlayer.occupation,
            selectedAvater = parsedConx.currentPlayer.selectedAvater,
            isUnderAge = parsedConx.currentPlayer.isUnderAge,
            parentEmail = parsedConx.currentPlayer.parentEmail,
            groupIds = parsedConx.currentPlayer.groupIds,
            dob = parsedConx.currentPlayer.dob,
            groups = parsedConx.currentPlayer.groups,
            teachers = parsedConx.currentPlayer.teachers,
            isLoggedIn = parsedConx.currentPlayer.isLoggedIn,
            emailValidationStatus =
                parsedConx.currentPlayer.emailValidationStatus,
            hasPassword = parsedConx.currentPlayer.hasPassword;
        return {
            email: email,
            firstName: firstName,
            lastName: lastName,
            name: name,
            userName: userName,
            photoUrl: photoUrl,
            courses: courses,
            mongoId: mongoId,
            gradeList: gradeList,
            favSubjects: favSubjects,
            language: language,
            occupation: occupation,
            selectedAvater: selectedAvater,
            isUnderAge: isUnderAge,
            parentEmail: parentEmail,
            groupIds: groupIds,
            dob: dob,
            groups: groups,
            teachers: teachers,
            isLoggedIn: isLoggedIn,
            emailValidationStatus: emailValidationStatus,
            hasPassword: hasPassword
        };
    }

    static GetGameMeta() {
        let prevConx = localStorage.getItem("previousContext"),
            parsedConx = JSON.parse(prevConx);
        let quizId = Encoding.decode(parsedConx.game.quizId.split("-")[1]),
            quizName = Encoding.decode(parsedConx.game.quizName.split("-")[1]),
            quizImage = parsedConx.game.quizImage,
            grade = parsedConx.game.grade,
            subjects = parsedConx.game.subjects,
            createdAt = parsedConx.game.createdAt,
            isClassroomGame = parsedConx.game.isClassroomGame,
            classroomInfo = parsedConx.game.classroomInfo,
            roomCode = parsedConx.game.roomCode,
            roomHash = Encoding.decode(parsedConx.game.roomHash.split("-")[1]),
            gameType = parsedConx.game.gameType,
            gameMode = parsedConx.game.gameMode,
            expiry = parsedConx.game.expiry,
            numQuestions = parsedConx.game.numQuestions,
            numQuesAttempted = parsedConx.game.numQuesAttempted,
            numCorrect = parsedConx.game.numCorrect,
            accuracy = parsedConx.game.accuracy,
            playerId = parsedConx.game.playerId,
            playerUsername = parsedConx.game.playerUsername,
            isOver = parsedConx.game.isOver,
            lastVisibleQuestionId = parsedConx.game.lastVisibleQuestionId,
            questionStartTimestamp = parsedConx.game.questionStartTimestamp,
            questionIdForQuestionStartTimestamp =
                parsedConx.game.questionIdForQuestionStartTimestamp;
        return {
            quizId: quizId,
            quizName: quizName,
            quizImage: quizImage,
            grade: grade,
            subjects: subjects,
            createdAt: createdAt,
            isClassroomGame: isClassroomGame,
            classroomInfo: classroomInfo,
            roomCode: roomCode,
            roomHash: roomHash,
            gameType: gameType,
            gameMode: gameMode,
            expiry: expiry,
            numQuestions: numQuestions,
            numQuesAttempted: numQuesAttempted,
            numCorrect: numCorrect,
            accuracy: accuracy,
            playerId: playerId,
            playerUsername: playerUsername,
            isOver: isOver,
            lastVisibleQuestionId: lastVisibleQuestionId,
            questionStartTimestamp: questionStartTimestamp,
            questionIdForQuestionStartTimestamp: questionIdForQuestionStartTimestamp
        };
    }

    static GetAppSettings() {
        let prevConx = localStorage.getItem("previousContext"),
            parsedConx = JSON.parse(prevConx);
        let showMemes = parsedConx.appSettings.showMemes,
            playMusic = parsedConx.appSettings.playMusic,
            playSFX = parsedConx.appSettings.playSFX,
            readAloud = parsedConx.appSettings.readAloud,
            selectedLanguage = parsedConx.appSettings.selectedLanguage,
            selectedTheme = parsedConx.appSettings.selectedTheme;
        return {
            showMemes: showMemes,
            playMusic: playMusic,
            playSFX: playSFX,
            readAloud: readAloud,
            selectedLanguage: selectedLanguage,
            selectedTheme: selectedTheme
        };
    }

    static async GetSetData() {
        let { roomHash, gameType } = this.GetGameMeta();

        let xhr = new XMLHttpRequest();
        xhr.open(
            "POST",
            "https://game.quizizz.com/play-api/v3/getQuestions",
            false
        );
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(
            JSON.stringify({
                roomHash: roomHash,
                type: gameType
            })
        );

        await new Promise((resolve) => {
            if (
                xhr.readyState === XMLHttpRequest.DONE &&
                xhr.status === 200
            ) {
                resolve();
            } else {
                console.log(xhr);
            }
            xhr.onreadystatechange = () => {
                if (
                    xhr.readyState === XMLHttpRequest.DONE &&
                    xhr.status === 200
                ) {
                    resolve();
                } else {
                    console.log(xhr);
                }
            };
        });
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            return JSON.parse(xhr.responseText);
        }
    }
}
