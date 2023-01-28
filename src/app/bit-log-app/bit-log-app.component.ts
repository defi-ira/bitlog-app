import { Component, OnInit } from '@angular/core';
import { ContractService } from '../services/ContractService';

@Component({
  selector: 'bit-log-app',
  templateUrl: './bit-log-app.component.html',
  styleUrls: ['./bit-log-app.component.css']
})
export class BitLogAppComponent implements OnInit {

    public address: string;

    constructor(private contractService: ContractService) {
        this.address = "";
    }

    ngOnInit(): void {
        
    }

    public walletConnected(): boolean {
        return this.address.length > 0;
    }

    public shortAddress(): string {
        return this.address.slice(0,4) + "..." + this.address.slice(39,42)
    }
        
    openMetamask(){
        this.contractService.openMetamask().then(resp =>{
            this.address = resp;
    })}

}
