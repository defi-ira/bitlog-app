import { BigNumber } from "ethers";

export class Commit {
    public address: string;
    public commitId: string;
    public timestamp: string;

    constructor(address_: any, commitId_: any) {
        this.commitId = BigNumber.from(commitId_).toHexString();
        this.address = BigNumber.from(address_).toHexString();
        this.timestamp = BigNumber.from(0).toHexString();
    }
    public setTimestamp(timestamp_: any) {
        this.timestamp = BigNumber.from(timestamp_).toHexString();
    }
}