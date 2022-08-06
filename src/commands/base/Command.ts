import { Client, Message } from "discord.js";

export default class Command {
    public run = (client: Client, msg: Message, args: string[]) => {}
    
    public names: string[];
    public description: string;
    public dev: boolean;

    constructor(names: string[], description: string, run: (client: Client, msg: Message, args: string[]) => void) {
        this.names = names;
        this.description = description;
        this.run = run;
    }
}