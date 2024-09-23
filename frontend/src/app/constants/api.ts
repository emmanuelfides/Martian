/*
Project : Cryptotrades
FileName :  api.ts
Author : LinkWell
File Created : 21/07/2021
CopyRights : LinkWell
Purpose : This is the file which contain all api constants used in the application 
*/
export const API = {
    base_url: "https://api.bettermentdigital.co:3000",
    
    user_login: "/user/login",
    user_register:"/user",
    user_forgot:"/user/forgot",
    user_reset:"/user/reset",
    user_profile: "/user/profile",
    user_update: "/user/update",

    item_check_balance: "/item/checkbalance",
    item_transfer_balance: "/item/sendeth",

    collection_add: "/collection/add",
    collection_update: "/collection/update",
    collection_detail: "/collection/detail",
    collection_delete: "/collection/delete",
    collection_list: "/collection/list",
    collection_generateabi: "/collection/generateabi",

    category_list: "/category/list",
    item_add: "/item/add",
    item_update: "/item/update",
    item_updatePrice: "/item/updatePrice",
    item_delete: "/item/delete",
    item_list: "/item/list",
    item_favourite_list: "/item/favouriteslist",
    item_listbycollection: "/item/listbycollection",
    item_publish: "/item/publish",
    item_purchase: "/item/purchase",
    item_transfer: "/item/transfer",
    item_views_add: "/item/addviews",
    item_like_add: "/item/addfavourites",
    item_report: "/item/report",
    item_more_collection: "/item/morefromcollection",
    item_history: "/item/history",
    item_prices: "/item/prices",

    item_offers: "/item/offers",
    item_offer_add: "/item/addoffer",
    item_offer_remove: "/item/removeoffer",
    item_offer_action: "/item/actionoffer",
    settings_option: "/settings/getoptions",
}
