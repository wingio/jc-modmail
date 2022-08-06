import { Document } from "mongodb";

export class Item implements Document {

    constructor(public name: string, public price: number, public description: string, public id: string, public stock: number, public type: ItemType, public flags: ItemFlags[]) {}

}

export class CustomItem extends Item {

    constructor(public name: string, public price: number, public description: string, public id: string, public stock: number, public type: ItemType, public flags: ItemFlags[], public step: number, public steptimestamp: bigint, public shopid: string, public prodCost: number) {
        super(name, price, description, id, stock, type, flags);
    }

}

export class RoleItem extends Item {

    constructor(public name: string, public price: number, public description: string, public id: string, public stock: number, public type: ItemType, public flags: ItemFlags[], public role: string, public level: number, public itemneeded?: string) {
        super(name, price, description, id, stock, type, flags);
    }

}


export enum ItemType {
    role,
    consumable
}

export enum ItemFlags {
    exchangeable,
    interchangable,
    levelrequirement,
    itemrequirement,
    custom
}