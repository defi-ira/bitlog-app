import { Injectable } from '@angular/core';
import { async } from '@angular/core/testing';
import { ethers } from 'ethers';
import Web3 from "web3";

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class ContractService {

    window:any;
    constructor() { }
    private getAccounts = async () => {
        try {
            return await window.ethereum.request({ method: 'eth_accounts' });
        } catch (e) {
            return [];
        }
    }

    private sendTransaction = async (contractAddress: string, commitId_: string) => {
    }

    public openMetamask = async () => {
        window.web3 = new Web3(window.ethereum);
        let addresses = await this.getAccounts();
        if (!addresses.length) {
            try {
                addresses = await window.ethereum.enable();
            } catch (e) {
                return false;
            }
        }
        console.log(addresses);
        return addresses.length ? addresses[0] : null;
    };

}