import { BigNumber } from "ethers";

export class Commit {
    public address: string;
    public author: string;
    public commitId: string;
    public timestamp: string;
    public date?: Date;
    public block?: string;

    constructor(address_: any, author_: any, commitId_: any) {
        this.commitId = BigNumber.from(commitId_).toHexString();
        this.author = BigNumber.from(author_).toHexString();
        this.address = BigNumber.from(address_).toHexString();
        this.timestamp = BigNumber.from(0).toHexString();
    }
    public setTimestamp(timestamp_: any) {
        this.timestamp = BigNumber.from(timestamp_).toHexString();
    }

    public setDate(timestamp_: any) {
        // TODO: check this calculation for accuracy
        this.date = new Date(timestamp_);
    }

    public setBlock(block: any) {
        this.block = block;
    }
}