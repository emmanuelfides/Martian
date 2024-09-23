/*
Project : Cryptotrades
FileName :  viewcollection.component.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the component which show collection view for all users
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { config } from 'src/app/constants/config';
import { CollectionService } from 'src/app/services/collection.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import {ModalDirective} from 'ngx-bootstrap/modal';
import { ItemService } from 'src/app/services/item.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Web3Service } from 'src/app/services/web3.service';
@Component({
  selector: 'app-viewcollection',
  templateUrl: './viewcollection.component.html',
  styleUrls: ['./viewcollection.component.css']
})
export class ViewcollectionComponent implements OnInit {
  spinner: boolean = false
  subscription:any;
  mediaBase:string = config.media_path;
  blockChainExplorer:string = config.blockchain_url;
  ownCollection:boolean = false;
  currentUser:any;
  collectionID:string = "";
  collectionInfo:any;
  collection_banner:string = "default.png"
  collection_logo:string = "default.png"
  collection_desc:string = "";
  collection_name:string = "";
  collection_id:string = "";
  collectionContract:string = "";

  morecollection:any = [];
  moreloading:boolean = true;
  is_morecollection_viewall:boolean = false

  items:any = [];
  page:any = 1;
  isApiLoading:boolean = false;
  loading:boolean = true
  keyword:string = ""
  searchInput:string = "";
  @ViewChild('confirmationModal') public confirmationModal: ModalDirective;
  @ViewChild('confirmationItemModal') public confirmationItemModal: ModalDirective;
  selectedItem:any;
  
  constructor(
    private collectionService: CollectionService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private itemService: ItemService,
    private snackBar: MatSnackBar,
    private web3Service: Web3Service
  ) { 
    this.confirmationModal = this.confirmationItemModal =this.subscription;
    this.currentUser = this.userService.getUser();
  }

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(params => {
      if(params.id) {
        this.loading = true
        this.collectionID = params.id;
        this.getCollectionInfo();
      } else {
        this.collectionID = ""
      }
      console.log(params) //log the entire params object
    });

    this.userService.notifier.subscribe(result=>{
      this.currentUser = this.userService.getUser();
      if(this.collectionID) {
        this.getCollectionInfo();
      }
    })
    this.getMoreCollection();
    
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  
  /**
   * This is the function which used to get collection detail from api
   */
  getCollectionInfo() {
    this.collectionService.viewCollection({
      collection_id:this.collectionID
    }).subscribe(result=>{
      this.collectionContract = this.collectionID;
      this.collectionInfo = result.result;
      this.collection_banner = this.collectionInfo.banner;
      this.collection_logo = this.collectionInfo.image;
      this.collection_name = this.collectionInfo.name;
      this.collection_desc = this.collectionInfo.description;
      if(this.currentUser) {
        this.ownCollection = (this.collectionInfo.author_id == this.currentUser.user_id) ? true : false;
      } else {
        this.ownCollection = false;
      }
      
      this.page = 1;
      this.getItemList();
    })
  }
  
  getMoreCollection = () => {
    this.itemService.moreCollection({
      collection_id: this.collectionID
    }).subscribe(result=>{
      if(result.status == true) {
         this.morecollection = result.data
         this.is_morecollection_viewall = (this.morecollection.length>4) ? true : false
         if(this.morecollection.length>4) {
             this.morecollection.splice(3,1)
         }
      }
      this.moreloading = false;
    })
  } 
   /**
   * This is the function which used to delete collection by id
   */
  deleteAction = ()=> {
    this.spinner = true
    this.confirmationModal.hide()
    this.collectionService.deleteCollection({
      collection_id: this.collectionID
    }).subscribe(result=>{
      this.spinner = false;
      this.router.navigate(["/collection/mycollection"])
    })
  }

  /**
   * This is the function which used to get item list by collection 
   */
  getItemList = () => {
    this.isApiLoading = true;
    var params = {
      page: this.page,
      type:'mycollection',
      collection_id: this.collectionInfo._id,
      keyword:this.keyword
    }
    console.log(this.page)
    this.itemService.listItem(params).subscribe(result=>{
      this.isApiLoading = false;
      console.log(result); 
      if(result.status == true) {
         if(this.page == 1) {
           this.items = result.tempArray
         } else {
           for (let index = 0; index < result.tempArray.length; index++) {
             const element = result.tempArray[index];
             this.items.push(element)
           }
         }
      }
     this.loading = false;
    })
  }

  /**
   * This is the function which used to get item list by collection on page scroll
   */
  onNextPage = () => {
    if(this.loading == true && this.isApiLoading == true ) {
      return;
    }
    this.page = this.page + 1;
    this.getItemList();
  }

  /**
   * This is the output function which used to navgate, edit and publish item
   */
  itemEvent = (event:any) => {
    if(event.type == "edit") {
      this.router.navigate(['/item/edit/'+event.item._id])
    } else if (event.type == "delete") {
      this.confirmationItemModal.show();
      this.selectedItem = event.item;
    } else if(event.type == "view") {
      this.router.navigate(['/item/view/'+event.item._id])
    } else if(event.type == "publish") {
      this.selectedItem = event.item;
      this.mintItem();
    }
  }

  /**
   * This is the  function which used to delete item and update item array
   */
  itemDeleteAction = () => {
    var index = this.items.findIndex((itemobj:any)=> {
      return itemobj._id == this.selectedItem._id
    })
    if(index != -1) {
      this.items.splice(index,1);
      this.itemService.deleteItem({
        item_id:this.selectedItem._id
      }).subscribe(result=>{
      })
    }
    this.confirmationItemModal.hide()
  }

  /**
   * This is the  function which used to search item by keyword with collection filter
   */
  searchAction = () => {
    this.loading = true;
    this.keyword = this.searchInput.replace(" ", "+")
    this.page = 1;
    this.getItemList();
  }

  /**
   * This is the  function which used to reset search by keyword with collection filter
   */
  resetAction = () => {
    this.loading = true;
    this.searchInput = "";
    this.keyword = "";
    this.searchAction();
  }
  /**
   * This is the function which used to mint using metamask
   */
  publishCollection() {
    this.spinner = true
    this.collectionService.generateABI({
      name: this.collectionInfo.name,
      symbol: this.collectionInfo.contract_symbol,
      collection_id: this.collectionInfo._id
    }).subscribe(result1=>{
         if(result1.status == true) {
           this.createMetaMaskContract(result1.result);
         } else {
           this.spinner = false
           this.snackBar.open(result1.message, "", { duration: 2000 });
         }
    })
  }

    /**
   * This is the function which used to create contract through meta mask
   */
     createMetaMaskContract = (data:any) => {
      let that = this;
      this.web3Service.createContract(data,function(contractResult:any){
          if(contractResult.status == true) {
            console.log(contractResult);
             that.getTransactionContract(contractResult.result)
          } else {
            that.spinner = false
            that.snackBar.open(contractResult.message, "", { duration: 2000 });
          }
      });
    }

  /**
   * This is the function which used to track for contract address completion
   */
  getTransactionContract = (hash:any) => {
    let that = this;
    setTimeout(() => {
      that.web3Service.getTransactionConract(hash, function (result: any) {
        that.parseContractResult(result, hash);
      })
    }, 2000);

  }

  /**
   * This is the function which used to track for token id on loop
   */
  parseContractResult = (result: any, hash: any) => {
    if (result.status == false) {
      this.getTransactionContract(hash);
    } else {
      let that = this
      console.log(result.result);
      that.approveMetaMaskContract(result.result)
    }
  }
  
  /**
   * This is the function which used to create contract through meta mask
   */
  approveMetaMaskContract = (contract_address:any) => {
    let that = this;
    this.web3Service.approveContract(contract_address,function(approveResult:any){
        if(approveResult.status == true) {
              that.updateCollectionApi({
                collection_id: that.collectionInfo._id,
                contract_address : contract_address
              })
        } else {
          that.spinner = false
          that.snackBar.open(approveResult.message, "", { duration: 2000 });
        }
    });
  }

  /**
   * This is the function which used to update collection from api
   */
  updateCollectionApi = (params:any) => {
    this.collectionService.updateCollection(params).subscribe(result=>{
      if(result.status == true) {
        this.router.navigate(['/collection/mycollection']);
      }
      this.spinner = false
      this.snackBar.open(result.message, "", { duration: 2000 });
    })
  }

  /**
   * This is the function which used to mint using metamask
   */
  mintItem() {
    this.spinner = true;
    let that = this;
    this.web3Service.mintContract(this.collectionInfo.contract_address, function (resulter: any) {
      if (resulter.status == true) {
        that.getTransactionToken(resulter.result);
      } else {
        that.spinner = false
        that.snackBar.open(resulter.message, "", { duration: 2000 });
      }
    });
  }

  /**
   * This is the function which used to track for token id 
   */
  getTransactionToken = (transaction_hash:any) => {
    let that = this;
    setTimeout(() => {
      that.web3Service.getTransactionToken(transaction_hash, function (result: any) {
        that.parseTokenResult(result, transaction_hash);
      })
    }, 2000);

  }

  /**
   * This is the function which used to track for token id on loop
   */
  parseTokenResult = (result: any, transaction_hash: any) => {
    if (result.status == false) {
      this.getTransactionToken(transaction_hash);
    } else {
      let that = this
      that.publishItem(result.result, transaction_hash);
    }
  }

  /**
   * This is the function which used to publish item using transaction hash and token id
   */
  publishItem = (token_id:any,transaction_hash:any) => {
    this.itemService.publishItem({
      item_id: this.selectedItem._id,
      token_id: token_id,
      transaction_hash: transaction_hash
    }).subscribe(result=>{
      if(result.status == true) {
        this.resetAction();
      }
      this.snackBar.open("Item published successfully", "", { duration: 2000 });
      this.spinner = false
    })
  }

}
