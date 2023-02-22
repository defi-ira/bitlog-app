import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Commit } from '../model/Commit';

export interface DialogData {
    commits: Commit[];
    addrList: string[];
    verified: boolean;
}

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
  encapsulation: ViewEncapsulation.None 
})
export class CheckComponent implements OnInit {

    public commits: Commit[] = [];
    public addrList: string[] = [];
    public addrIndex: number = 0;
    public addr: string = '';
    public verified: boolean = false;

    public randomColors: Color[] = [Color.BLUE, Color.GREEN, Color.RED, Color.NAVY, Color.ORANGE, Color.PURPLE, Color.YELLOW];

    public dateMap: Map<string, Commit[]>;
    public dateList: string[];
    public truncatedDateList: string[];

    public title: string = '';
    public rowCount: number = 6;
    public dateGap: number = 1;

    public colors: string[];
    public primaryColor: Color = Color.BLUE;
    public secondaryColor: Color = Color.WHITE;
    public color = Color;

    public timestamp: Date = new Date();
    public today: Date = new Date();

    public primaryImageSource: string;
    public secondaryImageSource: string;

    public ensClicked = new EventEmitter<boolean>();
    
    constructor(
        public dialogRef: MatDialogRef<CheckComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private _snackBar: MatSnackBar
    ) {
        this.commits = data.commits;
        this.addrList = data.addrList;
        this.verified = data.verified;
        this.addr = this.addrList[0];

        this.dateMap = new Map();
        this.dateList = [];
        this.truncatedDateList = [];
        this.colors = Object.keys(this.color);
        this.primaryImageSource = this.getImageSource(this.primaryColor);
        this.secondaryImageSource = this.getImageSource(this.secondaryColor);
        this.createDateSets(data.commits);
    }

    ngOnInit(): void {
        
    }

    public createDateSets(commits: Commit[]) {
        this.createDateList(commits);
        this.createDateTable();
        this.truncatedDateList = this.dateList.slice(0, (7 * this.rowCount));
    }

    public createDateList(commits: Commit[]) {
        commits.forEach((commit) => { 
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

    public updateTimestamp() {
        this.timestamp = new Date();
        this.primaryImageSource = this.getImageSource(this.primaryColor);
        this.secondaryImageSource = this.getImageSource(this.secondaryColor);
    }

    public getImageSource(color: string) {
        return "assets/" + color.toLowerCase() + "-check.png" + '?' + this.timestamp.getTime();
    }

    public ensNameClicked() {
        this.ensClicked.emit(true);
    }

    public sliderValueChanged() {
        this.truncatedDateList = this.dateList.slice(0, (7 * this.rowCount));
    }

    public getRandomColor(): Color {
        return this.randomColors[Math.floor(Math.random() * (this.randomColors.length))];
    }

    public randomizePrimary() {
        this.primaryColor = this.getRandomColor();
        this.updateTimestamp();
    }

    public randomizeSecondary() {
        this.secondaryColor = this.getRandomColor();
        this.updateTimestamp();
    }

    public mint() {
        this.dialogRef.close();
    }

    public cycleDisplayName() {
        if(this.addrIndex == (this.addrList.length - 1)) {
            this.addrIndex = 0;
        }
        this.addr = this.addrList[++this.addrIndex];

    }

}

export enum Color {
    "BLACK" = "black",
    "WHITE" = "white",
    "BLUE" = "blue",
    "GREEN" = "green",
    "RED" = "red",
    "NAVY" = "navy",
    "ORANGE" = "orange",
    "PURPLE" = "purple",
    "YELLOW" = "yellow"
}
