import * as Discord from "discord.js";
import { Message } from "discord.js";
import { CodeHandler } from "./codeHandler";
import { Assistant } from "./assistant";

export class Bot
{
    public commands: Map<string, any>;
    public codeHandler: CodeHandler;
    public assistant: Assistant;

    constructor() {
        this.commands = new Map([
            ["commands", (msg: Message) => this.displayCommands(msg)],
            ["help", (msg: Message) => this.displayHelp(msg)]
        ]);
        this.codeHandler = new CodeHandler();
        this.assistant = new Assistant();
        this.commands = new Map([
            ...this.commands,
            ...this.codeHandler.commands,
            ...this.assistant.commands
        ]);
    }

    handleCommand(msg: Discord.Message) {
        let split = msg.content.substr(1).split(" ");
        let command = split[0].toLowerCase();
        if(this.commands.has(command)) {
            this.commands.get(command)(msg);
        }
    }

    displayCommands(msg: Discord.Message) {
        let reply = "Possible commands are: ```";
        this.commands.forEach((value, key, map) => reply += key + "\n");
        reply += "```";
        msg.channel.send(reply);
    }

    displayHelp(msg: Discord.Message) {

    }

    reportError(message: Message, error: string) {
        message.channel.send("Error: " + error);
    }
}
