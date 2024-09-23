/*
Project : Cryptotrades
FileName :  app.component.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the main component which load layout for the application
*/
import {AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CollapseDirective} from 'ngx-bootstrap/collapse';
import { Router, NavigationEnd } from '@angular/router';
import {filter} from 'rxjs/operators';
import { UserService } from './services/user.service';
import { ItemService } from 'src/app/services/item.service';
import { config } from './constants/config';
import { ethers } from "ethers";
import Onboard from 'bnc-onboard'
import {MatSnackBar} from '@angular/material/snack-bar';
import { Web3Service } from './services/web3.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked  {
  mediaBase:string = config.media_path
  title = 'nftfrontend';
  user:any = null;
  profile_image:string = ""
  current_page:string = '';
  isAPILoading:boolean = false;
  
  wallet:any = null;
  onboard:any= null;
  private _isCollapsed: boolean = true;
  set isCollapsed(value) {
    this._isCollapsed = value;
  }
  get isCollapsed() {
    if (this.collapseRef) {
      // temp fix for "overflow: hidden"
      if (getComputedStyle(this.collapseRef.nativeElement).getPropertyValue('display') === 'flex') {
       this.renderer.removeStyle(this.collapseRef.nativeElement, 'overflow');
      }
    }
    return this._isCollapsed;
  }
  @ViewChild(CollapseDirective, { read: ElementRef, static: false }) collapse !: CollapseDirective;
  collapseRef:any;

  wallets = [
    { walletName: "metamask", preferred: true },
    { walletName: "walletConnect", rpc: {
      [56]: 'https://bsc-dataseed.binance.org/'
    },preferred: true },
  ];
  categories:any = []
  constructor(
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public web3Service: Web3Service,
    private itemService: ItemService
  ) {
    
    localStorage.removeItem("token");
    this.onboard = Onboard({
      dappId: config.onboard.key,       // [String] The API key created by step one above
      networkId: config.onboard.network,  // [Integer] The Ethereum network ID your Dapp uses.
      darkMode: true,
      blockPollingInterval:4000,
      walletSelect: {  wallets: this.wallets   },
      subscriptions: {
        address: address => {
          console.log("address ", address)
          if(this.wallet.provider !== undefined){
          this.web3Service.address = address;
          this.web3Service.web3Provider = new ethers.providers.Web3Provider(this.wallet.provider)
          this.web3Service.signer = this.web3Service.web3Provider.getSigner();
          console.log(address);
          if(address && address !== undefined) {
            localStorage.setItem("wallet",this.wallet.name)
            this.connectAPI(address);
          } else {
            this.logoutAction();
          }
        }
        },
        network: network => {
          if(network !== undefined && config.onboard.network != network){
            this.snackBar.open("Please choose proper blockchain", "", { duration: 2000 });
          }
        },
        wallet: wallet => {
          this.connectWallet(wallet);
        }
      },
    });
  
    this.user = this.userService.getUser();
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event:any) => {

      var url = event.url.split("/");
      console.log(url);
      if(url[1].includes("?")) {
        var suburl = url[1].split("?")
        this.current_page = suburl[0];
      } else {
        this.current_page = url[1];
      }
    });

    this.getCategory();
  }

  ngOnInit() {
    if(this.user != null) {
      this.profile_image = this.user.profile_image != '' ? this.user.profile_image : "nouser.jpg"
    }
    this.walletSelect();
  }

  walletSelect = async() => {
    if(localStorage.getItem("wallet")) {
      this.isAPILoading = true
      await this.onboard.walletSelect(localStorage.getItem("wallet"));
      await this.onboard.walletCheck()
    }
  }
  

  ngAfterViewChecked (): void {
    this.collapseRef = this.collapse;
  }

  /**
   * This is the function which used to logout user from the application on menu click
   */
  logoutAction = async() => {
    localStorage.removeItem("wallet");
    localStorage.removeItem("token");
    await this.onboard.walletReset();
    location.href = config.base_url
  }

  /**
   * This is the function which used to login through metamask
   */
  connectWalletAction = async() => {
    this.isAPILoading = true
    await this.onboard.walletReset();
    await this.onboard.walletSelect("MetaMask");
    await this.onboard.walletCheck();
  }

  connectWallet = async(wallet:any) => {
    console.log(wallet);
	  if(wallet && wallet !== undefined) {
      //localStorage.setItem("wallet",wallet.name)
      this.wallet = wallet;
	  }
  }

  getCategory = () => {
    this.itemService.categoryList().subscribe(result=>{
      for (let index = 0; index < result.tempArray.length; index++) {
        const element = result.tempArray[index];
        this.categories.push(element)
        if(index == 7) {
          break;
        }
      }
    })
  }
  
  connectAPI = (address:any) => {
    var params = {
      'username':'',
      'first_name': '',
      'last_name': '',
      'email':'',
      'profile_image':'',
      'social_info':JSON.stringify({"id":address,"type":"metamask"})
    }
    this.userService.register(params).subscribe(
      (result: any) => {
        this.isAPILoading = false;
        if(result.status == true) {
            localStorage.setItem('token',result.return_id);
            this.user = this.userService.getUser();
            this.userService.profileNotification({
              type: 'login',
              data: this.user 
            })
            this.profile_image = this.user.profile_image != '' ? this.user.profile_image : "nouser.jpg"
          } else {
            this.snackBar.open(result.message, "", { duration: 2000 });
          }
      }
    )
  }
}
