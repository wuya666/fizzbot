"use strict";

const fetch = require("node-fetch");
const basePath = "https://api.noopschallenge.com";
const startPath = "/fizzbot";

// GET method with node-fetch
async function tryGet(url) {
    let result = {};

    try {
        let response = await fetch(url);
        result = await response.json();
    } catch (error) {
        console.log("Something Bad Happened!!")
        console.log(error);
    }

    return result;
}

// POST method with node-fetch
async function tryPost(url, data) {
    let result = {}

    try {
        let response = await fetch(url, {
            method: "post",
            body: JSON.stringify(data),
            headers: {"Content-Type": "application/json"}
        });
        result = await response.json();
    } catch (error) {
        console.log("Something Bad Happened!!")
        console.log(error);
    }

    return result;
}

// Calculate the answer with the rules and the numbers
function calcAnswer(rules, numbers) {
    let answer = [];
    try {
        for (let n of numbers) {
            let tempo = [];
            for (let r of rules) {
                if (n % r["number"] === 0) {
                    tempo.push(r["response"]);
                }
            }
            let result = tempo.join("");
            if (result === "") {
                result = String(n);
            }
            answer.push(result);
        }
    } catch (error) {
        console.log("Something Bad Happened!!")
        console.log(error);
    }
    return {"answer": answer.join(" ")};
}

// Main solver function
const startSolver = async (url) => {
    let cont = true;
    let answer = {};

    // main loop
    while (cont) {
        // send GET request to url
        console.log("GET the question...") 
        let res = await tryGet(url);

        if (JSON.stringify(res) === "{}") {
            console.log("Oops, something is wrong!!");
            cont = false;
            break;
        }

        if (typeof res["message"] !== "undefined") {
            // GET response contains message, show it
            console.log("====== GET message begins ======");
            console.log(res["message"]);
            console.log("====== GET message ends ======");
        }

        if (typeof res["nextQuestion"] !== "undefined") {
            // GET response contains the nextQuestion link, go there
            url = basePath + res["nextQuestion"]
            continue;
        }

        if (typeof res["rules"] !== "undefined" && typeof res["numbers"] !== "undefined") {
            // it's a real question
            let rules = res["rules"];
            let numbers = res["numbers"];
            
            // show the rules
            console.log("====== Rules begins ======");
            console.log(JSON.stringify(rules))
            console.log("====== Rules ends ======");
            
            // show the numbers
            console.log("====== Numbers begins ======");
            console.log(JSON.stringify(numbers))
            console.log("====== Numbers ends ======");

            // calculate the answer
            answer = calcAnswer(rules, numbers);
        } else {
            // the first question or something, answer "JavaScript!!" anyway
            answer = {"answer": "JavaScript!!"};
        }

        // show our decided answer
        console.log("====== Our answer ======");
        console.log(JSON.stringify(answer));
        console.log("====== Answer ends ======");

        // POST the answer back to the url
        console.log("POST the answer...")
        res = await tryPost(url, answer);

        if (JSON.stringify(res) === "{}") {
            console.log("Oops, something is wrong!!");
            cont = false;
            break;
        }

        if (typeof res["message"] !== "undefined") {
            // POST response contains message, show it
            console.log("====== POST message begins ======");
            console.log(res["message"]);
            console.log("====== POST message ends ======");
        }

        if (typeof res["nextQuestion"] !== "undefined") {
            // POST response contains the nextQuestion link, go there
            url = basePath + res["nextQuestion"]
            continue;
        }

        // No next question?
        console.log("No more questions, test finished!!");
        cont = false;

    }
}

// Entry point
startSolver(basePath + startPath);
