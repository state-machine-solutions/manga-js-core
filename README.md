# Manga.js Core

The purpose of this project is to keep organized data and be able to add listeners in certain paths, in addition to providing a possible form of message that can be stored in memory.

## Instalation

```
npm i --save manga-js-core

```

If this project helps you, please donate

### Donate:

https://www.paypal.com/donate/?hosted_button_id=TX922XCPET8QG

![donation qrcode image](https://github.com/state-machine-solutions/State-Machine-Solutions-Documentation/blob/main/donations_QRcode.png?raw=true)

## Usage Example

```
const {MangaCore, ListenerClient} = require('manga-js-core')
manga = new MangaCore()

let client1 = new ListenerClient()
let infoClient1 = client1.getListenerInfo(
        "test.one",
        "onChange",
        (method, value)=>{
            console.log("client1 recive event becouse value test.one was changed", value)
        })
manga.addListener(infoClient1, client1, false)

let client2 = new ListenerClient()
let infoClient2 = client2.getListenerInfo(
        "test",
        "onChange",
        (method, value)=>{
            console.log("client2 recive event becouse value inside a test was changed", value)
        })
manga.addListener(infoClient2, client2, false)


let client3 = new ListenerClient()
let infoClient3 = client3.getListenerInfo(
        "test.many",
        "onChangeLength",
        (method, value)=>{
            console.log("client3 recive event becouse length of test.many was changed", value)
            //to recive the list now
            manga.get("test.many").then((v)=>{console.log("and now client 3 get value of many:", v)})
        })
manga.addListener(infoClient3, client3, false)


Promise.all([
    manga.set("test.one", 1, false),
    manga.set("test.two", 2, false),
    manga.set("test.many", [1,2,3], false)
    ]
) .then(
    ()=>{
        manga.get("test").then(console.log)
    }
)

//messages example

let infoClient1Message = client1.getListenerInfo(
    "message.chat.room1",
    "onMessage",
    (method, value)=>{
        if(value?.from == "client1"){
            return;
        }
        console.log("client1 recive message:", value)
        //send response after 6 seconds
        setTimeout(()=>{
            manga.message("message.chat.room1", {from:"client1", message:"Hi, "+new Date()})
        }, 6000)
    })
manga.addMessageListener(infoClient1Message, client1, false)

let infoClient2Message = client2.getListenerInfo(
    "message.chat.room1",
    "onMessage",
    (method, value)=>{
        if(value?.from == "client2"){
            return;
        }
        console.log("client2 recive message:", value)
        //send response after 5 seconds
        setTimeout(()=>{
            manga.message("message.chat.room1", {from:"client2", message:"Hello, "+new Date()})
        }, 5000)
    })
manga.addMessageListener(infoClient2Message, client2, false)

manga.message("message.chat.room1", {from:"someone", message:"Welcome, "+new Date()})

```
