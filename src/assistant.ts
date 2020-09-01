import { Message, ReactionCollector } from "discord.js";

let OfficeReactions = new Set(["📓", "💻", "❓"]);

interface OfficeQuery {
    user: string | undefined,
    query: string | undefined
}

export class Assistant
{
    public static OfficeHoursDate: string = "TBD @ TBD PM";
    public assistantID: string = "";

    public commands = new Map([
        ["open", (msg: Message) => this.openOffice(msg)],
        ["close", (msg: Message) => this.closeOffice(msg)],
        ["officehours", (msg: Message) => this.displayOfficeHours(msg)],
        ["info", (msg: Message) => this.displayInfo(msg)]
    ]);

    public collector: ReactionCollector | undefined;

    public officeQueue: Array<OfficeQuery> | undefined; 

    public filter = (reaction: any, user: any) => {
        if (OfficeReactions.has(reaction.emoji.name) && user.id !== this.assistantID) {
            this.officeQueue?.push({user: user.tag, query: reaction.emoji.name});
            this.refreshTableBody();
            return true;
        }
        return false;
    }

    constructor() {}

    openOffice(msg: Message) {
        if(!(msg.member?.hasPermission("ADMINISTRATOR"))) return;
        this.officeQueue = new Array<OfficeQuery>();
        let reply = "Office hours have now opened!\nReact with 📓 for questions about course material, 💻 for questions about the current/upcoming assignment, or ❓ for other questions/help!\nIf you have multiple concerns, just react to the one that matters most. Upon reacting to this message, you will be placed into a queue.\nNick will do his best to help with all concerns. Feel free to wait in a voice channel for help.";
        msg.channel.send(reply).then(response => {
            this.assistantID = response.author.id;
            this.collector = response.createReactionCollector(this.filter);
            OfficeReactions.forEach(reaction => response.react(reaction));
            // this.collector.on("collect", (reaction) => this.handleReaction(reaction));
        });
    }
    
    closeOffice(msg: Message) {
        if (!this.collector) return;
        this.collector?.stop();
        this.collector?.removeAllListeners();
        this.collector = undefined;
        msg.channel.send("Office hours are now closed!\nIf you need any help, feel free to DM Nick or mention them (using @) in a text channel with the question if is not private/sensitive.");
    }

    displayOfficeHours(msg: Message) {
        msg.channel.send(`Nick holds office hours every week on ${Assistant.OfficeHoursDate}.\nIf you need Nick, feel free to email him at \`nicktruong@cmail.carleton.ca\` or DM him on Discord.`);
    }

    displayInfo(msg: Message) {
        msg.channel.send("I am Nick Truong's assistant! If you need Nick, feel free to email him at `nicktruong@cmail.carleton.ca` or DM him on Discord.");
    }

    refreshTableBody() {
        let bodyHTML = document.getElementById("user-table-body");
        if (!bodyHTML) return;
        let tableBody = "";
        let counter = 0;
        this.officeQueue?.forEach(row => {
            tableBody += `<tr><td><button class="pure-button" name="user-table-row">${counter++}</button></td><td>${row.user}</td><td>${row.query}</td><td><textarea class="resize-v"></textarea></td></tr>`;
        });
        bodyHTML.innerHTML = tableBody;
        document.getElementsByName("user-table-row").forEach(row => {
            row.onclick = () => this.removeTableRow(parseInt(row.innerHTML));
        });
    }

    removeTableRow(index: number) {
        this.officeQueue?.splice(index, 1);
        this.refreshTableBody();
    }
}
