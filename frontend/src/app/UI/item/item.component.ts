/*
Project : Cryptotrades
FileName :  item.component.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the component file which used to define item as sub compoonent
*/
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { config } from 'src/app/constants/config';
import { UserService } from 'src/app/services/user.service';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {
  mediaBase: string = config.media_path
  profile_image: string = 'nouser.jpg' 
  profile_name:string = ''; 
  itemInfo:any;
  authorInfo:any;
  @Input() item: any;
  @Output() itemEvent = new EventEmitter<any>();
  constructor(
    private userService: UserService,
    private itemService: ItemService
  ) { }

  ngOnInit(): void {
    this.getItemInfo()
  }

  /**
   * This is the function which used to get item detail from api
   */
   getItemInfo = () => {
    this.itemService.listItem({
      page:1,
      type:'view',
      item_id: this.item._id
    }).subscribe(result=>{
      if(result.status == true) {
        this.itemInfo = result.tempArray[0];
        this.getProfileInfo();
      }
    })
 }


  getProfileInfo = () => {
    this.userService.viewProfile(this.itemInfo.author_id).subscribe(result=>{
      var resulter:any = result;
      this.authorInfo = resulter.result;
      this.updateProfileInfo()
    })
  }

  /**
   * This is the function which parse profile information for display
   */
   updateProfileInfo = () => {
    this.profile_image = this.authorInfo.profile_image.length > 0 ? this.authorInfo.profile_image : 'nouser.jpg';
    this.profile_name = this.authorInfo.first_name.length > 0 ? this.authorInfo.first_name + ' ' + this.authorInfo.last_name : this.authorInfo.username
  }

  /**
   * This is the function which used send notification to parent component for item view
   */
   viewAction = () => {
    this.itemEvent.emit({
      type:"view",
      item:this.item
    });
  }


  /**
   * This is the function which used send notification to parent component for item edit
   */
  editAction = () => {
    this.itemEvent.emit({
      type:"edit",
      item:this.item
    });
  }

  /**
   * This is the function which used send notification to parent component for item delete
   */
  deleteAction = () => {
    this.itemEvent.emit({
      type:"delete",
      item:this.item
    });
  }

  /**
   * This is the function which used send notification to parent component for item publish
   */
  publishAction = () => {
    this.itemEvent.emit({
      type:"publish",
      item:this.item
    });
  }

}
