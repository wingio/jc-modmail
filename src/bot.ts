import { Client, Collection, IntentsBitField, Message, Partials } from "discord.js"
import * as fs from "fs"
import Command from "./commands/base/Command"
import Config from "./Config"
import { connectToDatabase } from "./Database"
import Logger from "./utils/Logger"



export const bot = new Client({intents: new IntentsBitField(32767 | IntentsBitField.Flags.MessageContent | IntentsBitField.Flags.DirectMessages), partials: [Partials.Channel]})
let logger = new Logger("DEBUG", "Bot")

export const commands: Collection<string[], Command> = new Collection();

bot.once("ready", client => {
    logger.info(`Logged in as ${client.user.tag}`)
})

connectToDatabase().then(() => {

    fs.readdir("./events", (err, files) => {
        let log = new Logger("DEBUG", "Event Loader");
        if (err) return log.error(err);
        files.forEach(file => {
            if (!file.endsWith("Event.js")) return;
            if(file == "Event.js") return;
            import(`./events/${file}`).then(event => {
                log.info(`Loaded event: ${event.default.eventName}`);
                bot.on(event.default.eventName, (...args) => {
                    event.default.handle(bot, ...args);
                });
            });
            delete require.cache[require.resolve(`./events/${file}`)];
        });
    });
    
    fs.readdir('./commands/', (err, allFiles) => {
        let log = new Logger("DEBUG", "Command Loader");
        if (err) log.error(err);
        let files = allFiles.filter(f => f.split('.').pop() === ('js'));
        if (files.length <= 0) log.info('No commands found!');
        else for(let file of files) {
            log.info(`Loading command: ${file.slice(0, -3)}`);
            const props = require(`./commands/${file}`) as {names: string[], run: (client: Client, msg: Message, args: string[]) => any, description: string, dev: boolean};
            let command = new Command(props.names, props.description, props.run);
            command.dev = props.dev;
            commands.set(props.names, command);
        }
    });

    bot.login(Config.token)

})