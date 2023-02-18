import { Component, Inject, OnInit } from '@angular/core';
import { ContractService } from '../services/ContractService';
import { Alchemy, Network } from "alchemy-sdk";
import { ethers, BigNumber } from 'ethers';
import { Commit } from '../model/Commit';
import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common'; 
import { MatSnackBar } from '@angular/material/snack-bar';

declare const window: any;

export interface DialogData {
    address: string;
}

export enum Color {
    "BLACK" = "black",
    "WHITE" = "white",
    "BLUE" = "blue",
    "GREEN" = "green",
    "RED" = "red"
}

@Component({
  selector: 'bit-log-app',
  templateUrl: './bit-log-app.component.html',
  styleUrls: ['./bit-log-app.component.css']
})
export class BitLogAppComponent implements OnInit {

    private window: any;
    private contractJson = require("../contracts/BitLog.json");
    private web3: any = require('web3');

    private config = {
        apiKey: environment.INFURA_ARB_KEY,
        network: Network.ARB_MAINNET,
    };

    private provider = new ethers.providers.Web3Provider(window.ethereum, 'arbitrum');
    private contract_address = environment.ARB_CONTRACT_ADDR;

    private contract = new ethers.Contract(this.contract_address, JSON.stringify(this.contractJson), this.provider.getSigner());

    public address: string;
    public commitInput: string;
    public displayName: string = "";
    public hasENS: boolean = false;
    public resolvedName: string  = "";

    public primaryColor: Color = Color.WHITE;
    public secondaryColor: Color = Color.BLACK;
    public timestamp: Date = new Date();

    public primaryImageSource: string;
    public secondaryImageSource: string;

    public color = Color;
    public colors: string[];

    public commits: Commit[];
    public dateMap: Map<string, Commit[]>;
    public dateList: string[]; 

    constructor(private contractService: ContractService, public datepipe: DatePipe, private _snackBar: MatSnackBar) {
        this.address = "";
        this.commitInput = "";
        this.commits = [];
        this.dateMap = new Map();
        this.dateList = [];
        this.colors = Object.keys(this.color);
        this.primaryImageSource = this.getImageSource(this.primaryColor);
        this.secondaryImageSource = this.getImageSource(this.secondaryColor);
    }

    ngOnInit(): void {

    }

    formatDate(date: Date | undefined){
        return date?.toLocaleDateString("en-US");
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action);
    }

    public walletConnected(): boolean {
        return this.address.length > 0;
    }

    public commitsLoaded(): boolean {
        return this.commits.length > 0;
    }

    public shortAddress(): string {
        return this.address.slice(0,4) + "..." + this.address.slice(38,42)
    }

    public async getResolvedName(addr: string): Promise<string | null> {
        return this.provider.lookupAddress(addr);
    }

    disconnect() {
        this.address = '';
    }

    commitInputChange(e: any) {
        console.log(e);
    }

    public logCommit(e: any) {
        e.preventDefault();
        this.writeCommit();
    }

    public async writeCommit() {
        const connect = await this.contract.connect(this.provider);
        await this.contract['addCommit'](BigNumber.from("0x" + this.commitInput).toHexString(), BigNumber.from(this.address).toHexString());
    }

    public async getCommits(address: string) {
        if (address.length != 42) {
            this.openSnackBar("Invalid address, expected 42 chars.", "close");
            return;
        }

        const numCommits = await this.contract['getNumCommits'](this.address);
        const allCommits = await this.contract['getAllCommits'](this.address, numCommits);
        if (allCommits.length == 0) {
            this.openSnackBar("No history found for address.", "close");
        }

        for (let i = 0; i < allCommits.length; i++) {
            const id = await this.contract['getCommitId'](allCommits[i]);
            this.commits.push(new Commit(this.address, this.address, id));
        }

        /*
        this.resolvedName = await this.getResolvedName(address) || "";
        if (this.resolvedName.length > 0) {
            this.hasENS = true;
        }
        */
    }

    public async setTimestamps(commits: Commit[]) {
        for (let i = 0; i < commits.length; i++) {
            const timestamp = await this.contract['getCommitTime'](commits[i].commitId);
            commits[i].setTimestamp(timestamp);
            const date: Date = new Date(timestamp * 1000);
            commits[i].setDate(date);
        }
        this.createDateSets(commits);
    }

    public createDateSets(commits: Commit[]) {
        this.createDateList(commits);
        this.createDateTable();
    }

    public createDateList(commits: Commit[]) {
        this.commits.forEach((commit) => { 
            if (commit.date && this.dateMap.get(commit.date.toLocaleDateString("en-US"))) {
                this.dateMap.get(commit.date.toLocaleDateString("en-US"))?.push(commit);
            } else if (commit.date) {
                this.dateMap.set(commit.date.toLocaleDateString("en-US"), [commit]);
            }
        });
    }

    public createDateTable() {
        let dateMarker: Date = new Date();
        const todayString: string = dateMarker.toLocaleDateString("en-US");
        for(let i = 0; i < 56; i++) {
            this.dateList[i] = dateMarker.toLocaleDateString("en-US"), this.dateMap.get(dateMarker.toLocaleDateString("en-US")) || [];
            if (this.dateMap.get(dateMarker.toLocaleDateString("en-US")) == null) {
                this.dateMap.set(dateMarker.toLocaleDateString("en-US"), []);
            }
            dateMarker.setDate(dateMarker.getDate() - 1);
        }
    }

    public getListFromDate(index: number) {
        return this.dateMap.get(this.dateList[index])?.length;
    }

    public getImageFromKey(key: string) {
        if(this.dateMap.get(key) && this.dateMap.get(key)?.length) {
            const length = this.dateMap.get(key)?.length
            if (length && length > 0) {
                return this.primaryColor.toLowerCase() + "-check.png";
            }
        }
        return this.secondaryColor.toLowerCase() + "-check.png";
    }

    public viewAddress(e: any) {
        e.preventDefault();
        this.commits = [];
        this.getCommits(this.address).then(() => {this.setTimestamps(this.commits)}).then(() => { });
    }
        
    openMetamask(){
        this.contractService.openMetamask().then(resp =>{
            this.address = resp;
            this.setDisplayName(resp);
    })}

    public setDisplayName(addr: any) {
        this.displayName = addr;
    }

    public updateTimestamp() {
        this.timestamp = new Date();
        this.primaryImageSource = this.getImageSource(this.primaryColor);
        this.secondaryImageSource = this.getImageSource(this.secondaryColor);
    }

    public getImageSource(color: string) {
        return "/assets/" + color.toLowerCase() + "-check.png" + '?' + this.timestamp.getTime();
    }


}