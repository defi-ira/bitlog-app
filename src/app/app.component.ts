import { Component, Inject, OnInit } from '@angular/core';
import { ContractService } from './services/ContractService';
import { Alchemy, Network } from "alchemy-sdk";
import { ethers, BigNumber } from 'ethers';
import { Commit } from './model/Commit';
import { environment } from '../environments/environment';
import { DatePipe } from '@angular/common'; 
import { MatSnackBar } from '@angular/material/snack-bar';

declare const window: any;

export interface DialogData {
    address: string;
}

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    private window: any;
    private contractJson = require("./contracts/BitLog.json");
    private web3: any = require('web3');
    private contract_address = environment.ARB_CONTRACT_ADDR;
    private ensContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

    public eth_config = {
        apiKey: "PJkOEl4iMuFWVpY3QMr4hq8a2qfIS5Ht",
        network: Network.ETH_MAINNET,
      };
    public alchemy = new Alchemy(this.eth_config);

    private AlchemyProvider = new ethers.providers.AlchemyProvider('arbitrum', environment.ALCHEMY_ARB_KEY);
    public readContract = new ethers.Contract(this.contract_address, JSON.stringify(this.contractJson), this.AlchemyProvider);
    
    private provider = new ethers.providers.Web3Provider(window.ethereum, 'arbitrum');
    private contract = new ethers.Contract(this.contract_address, JSON.stringify(this.contractJson), this.provider.getSigner());

    public address: string;
    public connectedWallet: string;
    public commitInput: string;
    public displayName: string = "";
    public hasENS: boolean = false;
    public resolvedName: string  = "";

    public commits: Commit[];
    public ensNames: string[] = [];
    public ensIndex: number = 0;

    constructor(private contractService: ContractService, public datepipe: DatePipe, private _snackBar: MatSnackBar) {
        this.address = "";
        this.connectedWallet = "";
        this.commitInput = "";
        this.commits = [];
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
        return this.connectedWallet.length > 0;
    }

    public commitsLoaded(): boolean {
        return this.commits.length > 0;
    }

    public shortAddress(addr: string): string {
        return addr.slice(0,4) + "..." + addr.slice(38,42)
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

    public async getENSName(addr: string) { 
        let realAddr: string | null;
        if (addr.length != 42) {
            // try to resolve the ens
            realAddr = await this.resolveENS(addr);
            if (realAddr == null) {
                this.openSnackBar("Invalid address, expected 42 chars.", "close");
                return;
            }
        } else {
            realAddr = addr;
        }     
        const nfts = await this.alchemy.nft.getNftsForOwner(realAddr, {
            contractAddresses: [this.ensContractAddress],
        });
        this.ensNames = nfts.ownedNfts.map((nft) => { return nft.title; });
        this.setDisplayName(this.connectedWallet, this.ensNames);
    }

    public async resolveENS(ens: string): Promise<string | null> {
        return this.alchemy.core.resolveName(ens);
    }

    public async writeCommit() {
        const connect = await this.contract.connect(this.provider);
        await this.contract['addCommit'](BigNumber.from("0x" + this.commitInput).toHexString(), BigNumber.from(this.address).toHexString());
    }

    public async getCommits(address: string): Promise<Commit[] | null> {

        let commitList: Commit[] = [];
        let realAddr: string | null;

        if (address.length != 42) {
            // try to resolve the ens
            realAddr = await this.resolveENS(address);
            if (realAddr == null) {
                this.openSnackBar("Invalid address, expected 42 chars.", "close");
                return null;
            }
        } else {
            realAddr = address;
        }

        const numCommits = await this.readContract['getNumCommits'](realAddr);
        const allCommits = await this.readContract['getAllCommits'](realAddr, numCommits);
        if (allCommits.length == 0) {
            this.openSnackBar("No history found for address.", "close");
        }

        for (let i = 0; i < allCommits.length; i++) {
            const id = await this.readContract['getCommitId'](allCommits[i]);
            commitList.push(new Commit(realAddr, realAddr, id));
        }
        commitList.reverse();
        return commitList;
    }

    public async setTimestamps(commits: Commit[] | null): Promise<Commit[] | null> {
        if (commits == null) { return null; }
        for (let i = 0; i < commits.length; i++) {
            const timestamp = await this.readContract['getCommitTime'](commits[i].commitId);
            commits[i].setTimestamp(timestamp);
            const date: Date = new Date(timestamp * 1000);
            commits[i].setDate(date);
        }
        return commits;
    }

    public viewAddress(e: any) {
        e.preventDefault();
        this.commits = [];
        this.getCommits(this.address).then((commits: Commit[] | null) => {
            this.setTimestamps(commits).then((dated: Commit[] | null) => {
                if (dated == null) { return; }
                this.commits = dated;
                this.getENSName(this.address);
            })
        });
    }
        
    openMetamask(){
        this.contractService.openMetamask().then(resp =>{
            this.connectedWallet = resp;
            this.address = this.connectedWallet;
            this.setDisplayName(resp, null);
        })
    }

    public setDisplayName(addr: any, ensNames: string[] | null) {
        if (ensNames != null) {
            this.ensIndex = 0;
            this.displayName = ensNames[this.ensIndex];
        } else {
            this.displayName = this.shortAddress(this.connectedWallet);
        }
    }

    public cycleDisplayENS() {
        // see if loopover
        if (this.ensIndex + 1 == this.ensNames.length) {
            this.ensIndex = 0;
            this.displayName = this.ensNames[this.ensIndex];
        } else {
            this.displayName = this.ensNames[++this.ensIndex];
        }

    }

}