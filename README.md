# Manga.js Core

![manga.js logo](https://github.com/state-machine-solutions/State-Machine-Solutions-Documentation/blob/main/manga_logo.png?raw=true)

The purpose of this project is to keep organized data and be able to add listeners in certain paths, in addition to providing a possible form of message that can be stored in memory.

## Instalation

```
npm i --save manga-js-core

```

### Donate:

If this project helps you, please donate

https://www.paypal.com/donate/?hosted_button_id=TX922XCPET8QG

![donation qrcode image](https://github.com/state-machine-solutions/State-Machine-Solutions-Documentation/blob/main/donations_QRcode.png?raw=true)

## Usage Example

```js
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

# Methods

## Usage Methods

For all examples consider this data struture:

```
{
    my:{
        data:{
            points: {
                current:43
            },
            info:{
                name: "Test",
                keys: ["a", "b", { x: 1, y: 2 }]
            }
        }
    }
}
```


###  get

params: `path` 

To get values based in `path` 


### Example:

```
const manga = new MangaCore()
manga.get("my.data.point").then(value=>{
    console.log("my.path value is ", value)
})

```
Result of value:
```
{
    "current":43
}
```


| If you what to know a length of value without get value you can use `__length` magic property in path, for example `my.data.__length` 

### restricted name of path

`__length` (two underscore)

You shoud pass as last path parameters to return a integer with a number of itens or property.

### get length example:

using a data example

`my.data.__length` returns 2
Becouse data has 2 properties

`my.data.info.name.__length` returns 4 
Becouse name has length property and the value is 4

`my.data.info.keys.__length` returns 3
Becouse it is an array with 3 entries



## set

To update value based on path, but merging with server values

### Example:

```
const manga = new MangaCore()
manga.set("my.data.points", { last: 12 }).then(res=>{
    console.log("setted data points ", res)
})
```
Return
```
{
    "success": true
}
```

After change the result of `my.data.points` will be:

```
{
    "current": 43,
    "last": 12
}
```

## reset

The same as `/set` but overwrite server value

### Example:

```
const manga = new MangaCore()
manga.reset("my.data.points", { last: 12 }).then(res=>{
    console.log("setted data points ", res)
})
```

Return
```
{
    "success": true
}
```

After change the result of `my.data.points` will be:

```
{
    "last": 12
}
```

The `current` all values will be lost

## message

```
const manga = new MangaCore()
manga.message("my.data.points", { last: 12 }).then(res=>{
    console.log("setted data points ", res)
})
```


Message do not save data. But if some client was connected by socket.io, they will receive the message sent by this method. 

| There is no http listener clients. Is not possible to receive messages by http

## delete

```
const manga = new MangaCore()
manga.delete("my.data.points").then(res=>{
    console.log("deleted data points", res)
})
```

Remove data based on path

## clear

Delete all data

```
const manga = new MangaCore()
manga.clear().then(res=>{
    console.log("now all data is empty", res)
})
```

