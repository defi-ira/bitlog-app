import { Component, Inject, OnInit } from '@angular/core';
import { ContractService } from './services/ContractService';
import { Alchemy, Network } from "alchemy-sdk";
import { ethers, BigNumber } from 'ethers';
import { Commit } from './model/Commit';
import { environment } from '../environments/environment';
import { DatePipe } from '@angular/common'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddCommitDialogComponent } from './add-commit-dialog/add-commit-dialog.component';
import { CheckComponent } from './check/check.component';

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
    private contract_address = environment.ARB_CONTRACT_ADDR;
    private ensContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

    private nameList: string[] = ["stevejobs.eth", "marcusaurelieus.eth", "peterthiel.eth", "elonmusk.eth", "georgewashington.eth", "satoshi.eth"];
    private titleList: string[] = [
        "apple lisa contour design",
        "programmable internet money poc",
        "rocketship vertical landing calculators",
        "first weeks writing down stoicisms",
        "a general solution to the byzantine generals problem",
    ];
    private dummyBigInt: string = "0x00";

    public eth_config = {
        apiKey: environment.ALCHEMY_ETH_KEY,
        network: Network.ETH_MAINNET,
      };
    public alchemy = new Alchemy(this.eth_config);

    private AlchemyProvider = new ethers.providers.AlchemyProvider('arbitrum', environment.ALCHEMY_ARB_KEY);
    public readContract = new ethers.Contract(this.contract_address, JSON.stringify(this.contractJson), this.AlchemyProvider);
    
    public address: string;
    public connectedWallet: string;
    public userDisplayName: string = "";

    public displayName: string = "";

    public hasENS: boolean = false;
    public resolvedName: string  = "";

    public commits: Commit[];
    public ensNames: string[] = [];
    public ensIndex: number = 0;
    public viewingAddress: string = "";

    public verified: boolean = false;
    public isLoading: boolean = false;

    public checksOpen: boolean = false;

    constructor(private contractService: ContractService, 
        public dialog: MatDialog,
        private _snackBar: MatSnackBar) {
            this.address = "";
            this.connectedWallet = "";
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

    openAddCommitDialog(): void {
        if (!this.walletConnected()) {
            this.openSnackBar("Plese connect to Web3", "close");
            return;
        } 
        const dialogRef = this.dialog.open(AddCommitDialogComponent, {
          data: {addr: this.address, displayName: this.userDisplayName},
          width: '500px',
        });
    
        dialogRef.afterClosed().subscribe(result => {
            if (result == true) {
                this.openSnackBar("transaction submitted", "close");
            }
        });
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
        this.userDisplayName = '';
        this.connectedWallet = '';
    }

    commitInputChange(e: any) {
        console.log(e);
    }

    public async getENSName(addr: string) { 
        let realAddr: string | null;
        if (addr.length != 42) {
            // try to resolve the ens
            realAddr = await this.resolveENS(addr);
            if (realAddr == null) {
                this.openSnackBar("address not found.", "close");
                return;
            }
        } else {
            realAddr = addr;
        }
        this.verified = this.connectedWallet == realAddr;
        console.log("verified: " + this.verified);
        const nfts = await this.alchemy.nft.getNftsForOwner(realAddr, {
            contractAddresses: [this.ensContractAddress],
        });
        this.ensNames = nfts.ownedNfts.map((nft) => { return nft.title; });
        this.viewingAddress = realAddr;
        this.setDisplayName(this.connectedWallet, this.ensNames);
    }

    public async setUserENSName() {
        const nfts = await this.alchemy.nft.getNftsForOwner(this.connectedWallet, {
            contractAddresses: [this.ensContractAddress],
        });
        let userEnsNames = nfts.ownedNfts.map((nft) => { return nft.title; });
        this.setUserDisplayName(this.connectedWallet, userEnsNames);
    }

    public async resolveENS(ens: string): Promise<string | null> {
        return this.alchemy.core.resolveName(ens);
    }

    public async getCommits(address: string): Promise<Commit[] | null> {

        let commitList: Commit[] = [];
        let realAddr: string | null;

        if (address.length != 42) {
            // try to resolve the ens
            realAddr = await this.resolveENS(address);
            if (realAddr == null) {
                this.openSnackBar("invalid address", "close");
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
        this.isLoading = true;
        this.getCommits(this.address).then((commits: Commit[] | null) => {
            this.setTimestamps(commits).then((dated: Commit[] | null) => {
                this.isLoading = false;
                if (dated == null) { return; }
                this.commits = dated;
                console.log(dated);
                this.getENSName(this.address).then(() => {
                    let addrList = this.ensNames;
                    addrList.push(this.shortAddress(this.viewingAddress));
                    this.dialog.open(CheckComponent, {
                        panelClass: 'no-padding',
                        data: {commits: dated, addrList: addrList, verified: this.verified, title: '' },
                        width: '600px',
                        height: '770px',
                    });
                });
            })
        });
    
    }

    public viewMock() {
        this.dialog.open(CheckComponent, {
            panelClass: 'no-padding',
            data: {commits: this.getRandomCommits(new Date()), addrList: [this.getRandomName()], verified: false, title: this.getRandomTitle() },
            width: '600px',
            height: '770px',
        });
    }

    public getRandomName(): string {
        return this.nameList[Math.floor(Math.random() * (this.nameList.length))];
    }

    public getRandomTitle(): string {
        return this.titleList[Math.floor(Math.random() * (this.titleList.length))];
    }

    public getRandomCommits(from: Date): Commit[] {
        let mockList: Commit[] = [];
        for (let i = 0; i < 33; i++) {
            let offset: number = Math.floor(Math.random() * 58);
            let commit = new Commit(this.dummyBigInt, this.dummyBigInt, this.dummyBigInt);
            const date = new Date();
            date.setDate(from.getDate() - offset);
            commit.setDate(date);
            mockList.push(commit);
        }
        return mockList;
    }

        
    public openMetamask(){
        this.contractService.openMetamask().then(resp =>{
            this.connectedWallet = resp;
            this.address = this.connectedWallet;
            this.setUserDisplayName(resp, null);
        });
    }

    public setDisplayName(addr: any, ensNames: string[] | null) {
        if (ensNames != null) {
            this.ensIndex = 0;
            this.displayName = ensNames[this.ensIndex];
        } else {
            this.displayName = this.shortAddress(this.address);
        }
    }

    public setUserDisplayName(addr: any, ensNames: string[] | null) {
        if (ensNames != null) {
            this.ensIndex = 0;
            this.userDisplayName = ensNames[this.ensIndex];
        } else {
            this.userDisplayName = this.shortAddress(this.connectedWallet);
        }
    }

    public isVerified() {
        
    }

}