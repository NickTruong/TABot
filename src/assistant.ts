import { Message, ReactionCollector } from "discord.js";

let OfficeReactions = new Set(["📓", "💻", "❓"]);
let TutorialReactions = new Set(["❓", "❗"]);

interface Query {
    user: string | undefined,
    query: string | undefined
}

enum SessionState {
    None,
    OfficeHours,
    Tutorial
}

export class Assistant
{
    public static OfficeHoursTime: string = "TBD @ TBD";
    public static TutorialTime: string = "TBD @ TBD - TBD";
    public assistantID: string = "";
    public sessionState: SessionState = SessionState.None;

    public commands = new Map([
        ["openofficehours", (msg: Message) => this.openOffice(msg)],
        ["closeofficehours", (msg: Message) => this.closeOffice(msg)],
        ["opentutorial", (msg: Message) => this.openTutorial(msg)],
        ["closetutorial", (msg: Message) => this.closeTutorial(msg)],
        ["officehours", (msg: Message) => this.displayOfficeHours(msg)],
        ["info", (msg: Message) => this.displayInfo(msg)]
    ]);

    public collector: ReactionCollector | undefined;

    public userQueue: Array<Query> | undefined; 

    public filterOfficeHours = (reaction: any, user: any) => {
        if (OfficeReactions.has(reaction.emoji.name) && user.id !== this.assistantID) {
            this.userQueue?.push({user: user.tag, query: reaction.emoji.name});
            this.refreshTableBody();
            return true;
        }
        return false;
    }

    public filterTutorial = (reaction: any, user: any) => {
        if (TutorialReactions.has(reaction.emoji.name) && user.id !== this.assistantID) {
            this.userQueue?.push({user: user.tag, query: reaction.emoji.name});
            this.refreshTableBody();
            return true;
        }
        return false;
    }

    constructor() {}

    displayInfo(msg: Message) {
        msg.channel.send("I am Nick Truong's assistant! If you need Nick, feel free to email him at `nicktruong@cmail.carleton.ca` or DM him on Discord.");
    }

    openOffice(msg: Message) {
        if(this.sessionState != SessionState.None) return;
        if(!(msg.member?.hasPermission("ADMINISTRATOR"))) return;
        this.sessionState = SessionState.OfficeHours;
        let div = document.getElementById(`session-state-${this.sessionState}`);
        if (div) div.hidden = false;
        this.userQueue = new Array<Query>();
        let reply = "Office hours have now opened!\nReact with 📓 for questions about course material, 💻 for questions about the current/upcoming assignment, or ❓ for other questions/help!\nIf you have multiple concerns, just react to the one that matters most. Upon reacting to this message, you will be placed into a queue.\nIf you have already received help but wish to ask for help again, just react to this message again.\nNick will do his best to help with all concerns. Feel free to hang out in a voice channel while you wait for help.";
        msg.channel.send(reply).then(response => {
            this.assistantID = response.author.id;
            this.collector = response.createReactionCollector(this.filterOfficeHours);
            OfficeReactions.forEach(reaction => response.react(reaction));
            // this.collector.on("collect", (reaction) => this.handleReaction(reaction));
        });
    }
    
    closeOffice(msg: Message) {
        if(this.sessionState != SessionState.OfficeHours) return;
        console.log(`session-state-${this.sessionState}`)
        let div = document.getElementById(`session-state-${this.sessionState}`);
        if (div) div.hidden = true;
        this.collector?.stop();
        this.collector?.removeAllListeners();
        this.collector = undefined;
        this.userQueue = undefined;
        this.refreshTableBody();
        this.sessionState = SessionState.None;
        msg.channel.send("Office hours are now closed!\nIf you need any help, feel free to DM Nick or mention them (using @) in a text channel with the question if is not private/sensitive.");
    }

    displayOfficeHours(msg: Message) {
        msg.channel.send(`Nick holds office hours every week on ${Assistant.OfficeHoursTime}.\nIf you need Nick, feel free to email him at \`nicktruong@cmail.carleton.ca\` or DM him on Discord.`);
    }

    openTutorial(msg: Message) {
        if(this.sessionState != SessionState.None) return;
        if(!(msg.member?.hasPermission("ADMINISTRATOR"))) return;
        this.sessionState = SessionState.Tutorial;
        let div = document.getElementById(`session-state-${this.sessionState}`);
        if (div) div.hidden = false;
        this.userQueue = new Array<Query>();
        let reply = "The tutorial has now started!\nReact with ❓ if you need help or react with ❗ if you are finished and wish to be marked.\nUpon reacting to this message, you will be placed into a queue.\nIf you have already received help but wish to ask for help again, just react to this message again.\nNick will do his best to get around to helping everybody. Feel free to hang out in a voice channel while you wait for help.";
        msg.channel.send(reply).then(response => {
            this.assistantID = response.author.id;
            this.collector = response.createReactionCollector(this.filterTutorial);
            TutorialReactions.forEach(reaction => response.react(reaction));
            // this.collector.on("collect", (reaction) => this.handleReaction(reaction));
        });
    }
    
    closeTutorial(msg: Message) {
        if(this.sessionState != SessionState.Tutorial) return;
        let div = document.getElementById(`session-state-${this.sessionState}`);
        if (div) div.hidden = true;
        this.collector?.stop();
        this.collector?.removeAllListeners();
        this.collector = undefined;
        this.userQueue = undefined;
        this.refreshTableBody();
        this.sessionState = SessionState.None;
        msg.channel.send("The tutorial is now closed!\nIf you need any help, feel free to DM Nick or mention them (using @) in a text channel with the question if is not private/sensitive.");
    }

    displayTutorialTime(msg: Message) {
        msg.channel.send(`Nick's Tutorial takes place most weeks on ${Assistant.TutorialTime}.\nIf you need Nick, feel free to email him at \`nicktruong@cmail.carleton.ca\` or DM him on Discord.`);
    }

    refreshTableBody() {
        let bodyHTML = document.getElementById(`user-table-body-${this.sessionState}`);
        if (!bodyHTML) return;
        let tableBody = "";
        let counter = 0;
        this.userQueue?.forEach(row => {
            tableBody += `<tr><td><button class="pure-button" name="user-table-row">${counter++}</button></td><td>${row.user}</td><td>${row.query}</td><td><textarea class="resize-v"></textarea></td></tr>`;
        });
        bodyHTML.innerHTML = tableBody;
        document.getElementsByName("user-table-row").forEach(row => {
            row.onclick = () => this.removeTableRow(parseInt(row.innerHTML));
        });
    }

    removeTableRow(index: number) {
        this.userQueue?.splice(index, 1);
        this.refreshTableBody();
    }
}
