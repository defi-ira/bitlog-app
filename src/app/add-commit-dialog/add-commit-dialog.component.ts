import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BigNumber, ethers } from 'ethers';
import { environment } from 'src/environments/environment';

declare const window: any;

export interface DialogData {
    addr: string;
    displayName: string;
}

@Component({
  selector: 'app-add-commit-dialog',
  templateUrl: './add-commit-dialog.component.html',
  styleUrls: ['./add-commit-dialog.component.scss']
})
export class AddCommitDialogComponent implements OnInit {

    private window: any;
    private contractJson = require("../contracts/BitLog.json");
    private contract_address = environment.ARB_CONTRACT_ADDR;

    private provider = new ethers.providers.Web3Provider(window.ethereum, 'arbitrum');
    private contract = new ethers.Contract(this.contract_address, JSON.stringify(this.contractJson), this.provider.getSigner());

    public commitInput: string;
    public addr: string;
    public displayName: string;

    constructor(
        public dialogRef: MatDialogRef<AddCommitDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _snackBar: MatSnackBar
    ) {
        this.addr = data.addr;
        this.displayName = data.displayName;
        this.commitInput = "";
    }

    ngOnInit(): void {
    }

    public logCommit(e: any) {
        e.preventDefault();
        if (this.commitInput.trim().length != 40) {
            this.openSnackBar("Length should be exactly 0b40 chars", "close");
            return;
        }
        this.writeCommit(this.commitInput.trim());
    }

    public async writeCommit(commitInput: string) {
        const connect = await this.contract.connect(this.provider);
        console.log(connect);
        if (connect.provider == null) {
            this.openSnackBar("Could not connect, please switch to a supported network", "close");
            return;
        }
        await this.contract['addCommit'](BigNumber.from("0x" + commitInput.trim()).toHexString(), BigNumber.from(this.addr).toHexString());
        this.dialogRef.close(true);
    }

    public onClose() {
        this.dialogRef.close(false);
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action);
    }



}
