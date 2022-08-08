import { Document } from "mongodb";

export default class User implements Document {

    constructor(
        public inventory: string[],
        public id: string
    ) {}

}