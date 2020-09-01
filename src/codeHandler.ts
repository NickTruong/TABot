import { Message } from "discord.js";
import fetch from "node-fetch";
import { languages } from "./config";
import { Parser } from "./parser";

// http://api.paiza.io:80/runners/create?source_code=test&language=c&input=inputtest&longpoll=false&longpoll_timeout=100&api_key=guest

const base_url = "http://api.paiza.io:80";

interface Create {
    source_code: string,
    language: string,
    input?: string,
    longpoll?: string,
    longpoll_timeout?: string
}

export class CodeHandler
{
    public commands = new Map([
        ["run", (msg: Message) => this.run(msg)],
        ["languages", (msg: Message) => this.displayLanguages(msg)]
    ]);

    public requests: Map<string, Message> = new Map();
    public request_limit: Number = 5;
    public delay: Number = 3000;
    public defaultLanguage: string = "python3";

    constructor() {}

    reportError(message: Message, error: string) {
        message.channel.send("Error: " + error);
    }

    async run(message: Message) {
        let replyPromise = message.channel.send("Building/running...");
        let code = Parser.parseCode(message.content);
        if(!code) {
            message.channel.send("Please make sure you have code wrapped inside of a \"multi-line code block\" (for example: \\``` CODE HERE \\```).");
            return;
        }
        let language = Parser.parseFlag(message.content, "-l");
        if(!languages.has(language)) {
            message.channel.send("Please make sure you have included a valid language after the `-l` flag (for example: `-l python`). \nUse the `$languages` command to see a list of valid languages.");
            return;
        }
        let request: Create = {
            source_code: code,
            language: language
        };
        let id: string = "";
        let response = await this.createRunner(request, message)
        if(!response.ok) return;
        await response.json().then(json => {
            if(json.error) return this.reportError(message, json.error);
            id = json.id;
            this.requests.set(json.id, message);
        });
        if(!id) return;
        while(this.requests.has(id)) {
            let status: string = "";
            let response = await this.getStatus(id);
            if(!response.ok) return;
            await response.json().then(json => {
                if(json.error) return this.reportError(message, json.error);
                status = json.status;
            })
            if(status === "completed") break;
            setTimeout(() => {}, 3000);
        }
        response = await this.getDetails(id);
        await response.json().then(json => {
            this.requests.delete(id);
            if(json.error) return this.reportError(message, json.error);
            let edit = "";
            console.log(json)
            edit += (json.build_stdout)? "Build output: " + "```\n" + json.build_stdout + "```" + "\n" : "";
            edit += (json.build_stderr)? "Build error: " + "```\n" + json.build_stderr + "```" + "\n" : "";
            edit += (json.stdout)? "stdout: " + "```\n" + json.stdout + "```" + "\n" : "";
            edit += (json.stderr)? "stderr: " + "```\n" + json.stderr + "```" + "\n" : "";
            edit += (json.build_time)? "Build time: " + json.build_time + "s\n" : "";
            edit += (json.time)? "Run time: " + json.time + "s\n" : "";
            edit += (json.language)? "Language: " + json.language + "\n" : "";
            replyPromise.then(reply => {
                reply.edit((edit)? edit : "Something went wrong...");
            });
        })
    }

    async displayLanguages(message: Message) {
        let reply = "I currently accept the following " + languages.size + " languages: \n```\n";
        languages.forEach(language => reply += language + "\n");
        reply += "```";
        message.channel.send(reply);
    }

    // base_url + "/runners/create?" + 
    // "source_code=" + request.source_code + 
    // "&language=" + request.language + 
    // ((request.input != null)? "&input=" + request.input : "") + 
    // ((request.longpoll != null)? "&longpoll=" + request.longpoll : "") +
    // ((request.longpoll_timeout != null)? "&longpoll_timeout=" + request.longpoll_timeout : "") +
    // "&api_key=guest"

    createRunner(request: Create, message: Message) {
        const myURL = new URL(base_url + "/runners/create");
        myURL.searchParams.set("source_code", request.source_code);
        myURL.searchParams.set("language", request.language);
        myURL.searchParams.set("api_key", "guest");
        (request.input !== null)? myURL.searchParams.set("input", request.input!) : null;
        (request.longpoll !== null)? myURL.searchParams.set("longpoll", request.longpoll!) : null;
        (request.longpoll_timeout !== null)? myURL.searchParams.set("longpoll_timeout", request.longpoll_timeout!) : null;
        return fetch(myURL,
            {
                method: "POST"
            }
        );
    }

    getStatus(id: string) {
        return fetch(base_url + "/runners/get_status?" +
            "id=" + id +
            "&api_key=guest",
            {
                method: "GET"
            }
        );
    }

    getDetails(id: string) {
        return fetch(base_url + "/runners/get_details?" +
            "id=" + id +
            "&api_key=guest",
            {
                method: "GET"
            }
        );
    }
}
