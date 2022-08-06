import { Client } from "discord.js";
import Logger from "../utils/Logger";

export default class Event {
    public static eventName: string;
    public client: Client;
    public log: Logger = new Logger("DEBUG");

    public handle(...args: any[]) : void {};
}