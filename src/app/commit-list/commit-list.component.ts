import { Component, Input, OnInit } from '@angular/core';
import { Commit } from '../model/Commit';

@Component({
  selector: 'app-commit-list',
  templateUrl: './commit-list.component.html',
  styleUrls: ['./commit-list.component.scss']
})
export class CommitListComponent implements OnInit {

    @Input() public commits: Commit[] = [];
    @Input() public displayName: string = "";

    constructor() { }

    ngOnInit(): void {
    }

    formatDate(date: Date | undefined){
        return date?.toLocaleDateString("en-US");
    }
  
}
