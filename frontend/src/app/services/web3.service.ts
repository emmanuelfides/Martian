/*
Project : Cryptotrades
FileName :  web3.service.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the service which used to handle metamask related functions
*/
import { Injectable } from '@angular/core';
import { ethers } from "ethers";
import { abi } from '../constants/abi';
import { abibemd } from '../constants/abibemd';
import { config } from '../constants/config';
import { mulitisend } from '../constants/MultiSend';
import { mulitisendbemd } from '../constants/MultisendBemd';
@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  web3Provider:any;
  address: any;
  signer:any
  constructor() { }
  
  createContract = (data:any, callback:any) => {
      this.web3Provider.send('eth_sendTransaction', [{
          from: this.address,
          data: data,
          gasLimit: '3000000'
        }]
      ).then((result: any) => {
        var resulter = {
          status: true,
          result: result,
          message: 'create contract hash created successfully'
        }
        callback(resulter)
      }).catch((error:any) => {
        console.log("checking1 ",error)
        var result = {
          status: false,
          message: 'create contract failed access'
        }
        callback(result)
      })
  }

  approveContract = (contract_address:any, callback: any) => {
    const currentContract = new ethers.Contract(contract_address, abi, this.signer)
    currentContract.isApprovedForAll(this.address,config.main_address).then((isApproved: any) => {
      if(isApproved) {
        var resulter = {
          status: true,
          result: isApproved,
          message: 'approve success'
        }
        callback(resulter);
      } else {
        currentContract.setApprovalForAll(config.main_address, true).then((result: any) => {
          var resulter = {
          status: true,
          result: result,
          message: 'approve success'
          }
          callback(resulter);
        }).catch((error: any) => {
            console.log(error);
            var resulter = {
            status: false,
            message: 'approve failed'
            }
            callback(resulter)
        })
      }
    })
  }

  sendMoneyToOwnerBemd = async (addressArray: any, priceArray: any, priceValue:any, callback: any) => {
    const bemdabi = new ethers.Contract('0x50A53Ad44590DF1D6c9fCf257d6416e937e5ED4f', abibemd, this.signer);
    const currentContract = new ethers.Contract(config.multi_contract_address_bemd, mulitisendbemd, this.signer)
      await bemdabi
      .approve(config.main_address, priceValue)
      await bemdabi
      .approve(config.multi_contract_address_bemd, priceValue)
      await currentContract.multiSendDiffToken('0x50A53Ad44590DF1D6c9fCf257d6416e937e5ED4f', addressArray, priceArray,{gasLimit: 1000000}).then((result: any) => {
        var resulter = {
        status: true, 
        result: result,
        message: 'money send successful'
        }
        callback(resulter);
      }).catch((error: any) => {
          console.log(error);
          var resulter = {
          status: false,
          message: 'money failed send'
          }
          callback(resulter)
      });
  }

  sendMoneyToOwner = (addressArray: any, priceArray: any, priceValue:any, callback: any) => {
    const currentContract = new ethers.Contract(config.multi_contract_address, mulitisend, this.signer)
    currentContract.sendETH(addressArray, priceArray,{gasLimit: 1000000, value: priceValue}).then((result: any) => {
      var resulter = {
      status: true, 
      result: result,
      message: 'money send successful'
      }
      callback(resulter);
    }).catch((error: any) => {
        console.log(error);
        var resulter = {
        status: false,
        message: 'money failed send'
        }
        callback(resulter)
    })
  }

  mintContract = async (contract_address: any, callback: any) => {
    const currentContract = new ethers.Contract(contract_address, abi, this.signer)
    currentContract.mint(this.address).then((result: any) => {
        var resulter = {
        status: true,
        result: result.hash,
        message: 'minted  successfully'
        }
        callback(resulter)
    }).catch((error: any) => {
        var resulter = {
        status: false,
        message: 'minted failed'
        }
        callback(resulter)
    })
  }


  getTransactionConract = (hash: any, callback: any) => {
    this.web3Provider.send( 'eth_getTransactionReceipt', [hash] ).then((tresult: any) => {
        console.log("transaction receipt ", tresult);
        if (tresult != null) {
        var resulter = {
            status: true,
            result: tresult.contractAddress,
            message: 'mint created successfully'
        }
        callback(resulter)
        } else {
        var result = {
            status: false,
            message: 'mint created failed'
        }
        callback(result)
        }
    }).catch((error: any) => {
        console.log(error);
        var resulter = {
        status: false,
        message: 'minted failed'
        }
        callback(resulter)
    })
  }

  getTransactionToken = (hash: any, callback: any) => {
    this.web3Provider.send( 'eth_getTransactionReceipt', [hash] ).then((tresult: any) => {
        console.log("transaction receipt ", tresult);
        if (tresult != null) {
        var resulter = {
            status: true,
            result: tresult.logs[0].topics[3],
            message: 'mint created successfully'
        }
        callback(resulter)
        } else {
        var result = {
            status: false,
            message: 'mint created failed'
        }
        callback(result)
        }
    }).catch((error: any) => {
        console.log(error);
        var resulter = {
        status: false,
        message: 'minted failed'
        }
        callback(resulter)
    })
  }

}
 