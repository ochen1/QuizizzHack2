let parsedConx = JSON.parse(localStorage.getItem("previousContext")),
    roomHash = Encoding.decode(parsedConx.game.roomHash.split("-")[1]),
    playerId = parsedConx.game.playerId,
    gameType = parsedConx.game.gameType;

if (gameType != "solo") {
    throw new Error("Game type must be solo");
}

fetch("https://quizizz.com/play-api/v2/solo-end", {
    headers: {
        accept: "application/json",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "experiment-name": "authRevamp_exp",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    },
    referrerPolicy: "no-referrer-when-downgrade",
    body: JSON.stringify({
        roomHash: roomHash,
        playerId: "me",
        endedAt: Math.round(new Date().getTime() / 1000)
    }),
    method: "POST",
    mode: "cors",
    credentials: "include"
})
.then((res) => {
    if (res.status == 200) {
        console.info("Success!");
    } else if (res.status == 400) {
        console.error("An error occurred. Check the Network tab for details.");
    }
});
