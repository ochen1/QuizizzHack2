// Inject required function-libraries
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForElement(queries, timeoutms) {
    return new Promise(async (resolve, reject) => {
        if (timeoutms) {
            let timeout = setTimeout(() => {
                reject("Waiting for element timed out.");
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
