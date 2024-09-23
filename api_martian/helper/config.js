/*
Project : Martian
FileName :  config.js
Author : Emmark Lab
File Created : 21/07/2021
CopyRights : Emmark Lab
Purpose : This is the file which maintain globl variable for the application
*/
const config = {
    app: {
      port: 3000
    },
    db: {
      host: 'localhost',
      port: 27017,
      username: '',
      password: '',
      name: 'martiandb',
      prefix:'martian_'
    },
    mail: {
      type:"",
      smtp: {
        host:"smtp.sendgrid.net",
        secure:false,
        port:587,
        username:'',
        password:''
      }
    },
    site_name:'Martian',
    site_link:'#',
    site_email: '',
    secret_key:'jfVRtwN7xBl7LjRucIUdPnrh1UVUhzhZ',
    public_key:'6gluXXunc77uukLJbSmlQ31ckSlLq8Qi',
    converstion_url: "https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD",
    rpcurl: "https://bsc-dataseed.binance.org/",
    owner: {
      address: "0x44fb92F9Cc720BdF2C7b5975E2765342CdD09e00",
      key: "f8979221e0f8fefe4c700fa7d3c434a2a91c52cc4aae4f0c84b46d040c56038d"
    }
   };
   
   
module.exports = config;
