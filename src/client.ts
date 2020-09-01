import * as Discord from "discord.js";
import { Bot } from "./bot";
import { config } from "./config";

const discordClient = new Discord.Client();
const bot = new Bot();

discordClient.on('ready', () => {
    console.log(`Logged in as ${discordClient.user!.tag}!`);
});

discordClient.on('message', msg => {
    if(msg.author.id + msg.author.tag === discordClient.user!.id + discordClient.user!.tag)
        return
    
    if(msg.content[0] === config.prefix) {
        bot.handleCommand(msg);
    }
});

discordClient.login(config.token);
