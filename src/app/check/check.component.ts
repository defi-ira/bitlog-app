import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Commit } from '../model/Commit';

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss']
})
export class CheckComponent implements OnChanges {

    @Input() public commits: Commit[] = [];
    @Input() public addr: string = '';

    public dateMap: Map<string, Commit[]>;
    public dateList: string[];
    public truncatedDateList: string[];

    public title: string = '';
    public rowCount: number = 8;

    public colors: string[];
    public primaryColor: Color = Color.WHITE;
    public secondaryColor: Color = Color.BLACK;
    public color = Color;

    public timestamp: Date = new Date();
    public today: Date = new Date();

    public primaryImageSource: string;
    public secondaryImageSource: string;

    @Output() ensClicked = new EventEmitter<boolean>();
    
    constructor() {
        this.dateMap = new Map();
        this.dateList = [];
        this.truncatedDateList = [];
        this.colors = Object.keys(this.color);
        this.primaryImageSource = this.getImageSource(this.primaryColor);
        this.secondaryImageSource = this.getImageSource(this.secondaryColor);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.createDateSets(this.commits);
        console.log(changes);
    }

    public commitsLoaded() {
        if (this.addr.length > 0) {
            return true;
        }
        return false;
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

}

export enum Color {
    "BLACK" = "black",
    "WHITE" = "white",
    "BLUE" = "blue",
    "GREEN" = "green",
    "RED" = "red"
}
