# Node Js

- Node Js is basically a chrome v8 engine c++ code that wrap with JS and that make server

# Express JS

**POST** : POST route basically wo route hota hain jisme data URL mein nahi dikhta.

**GET** : GET route mein data URL mein dikhta hain.

**Middleware** : middleware ek aisa function hota hai jo har route se pahle chalta hai, iska matlab saare routes mein koi bhi chale usse pahle middleware chalta hai and usmein likha code pahle execute hota hain.

**req** : req mein saara data hota hai aane waale user ki request ki
taraf ka, jaise ki uski location, device info and other
things.

**res** : res mein controls hote hai jinke basis pe hum server
se response bhei paate hai.

**next()** : node ke saath ek dikkat hai ki agar control ek baar bhi kisi
middleware par gaya to control khud se agle route/middleware
par nahi jaayega, use agle par lejaane ke liye aapko push
karna padega aur ye push kahlaayega next ko chalaana

**Dynamic Routing** : aisa koi bhi route jiska koi hissa baar baar same rehta hai
and kuchh hissa baar baaar change hota hai iske liye aap ek
dynamic route bana sakte ho.

- route parameters to make any route dynamic you can use **:** at the place where
  you want to make it dynamic and to acesss these value use **req.params**

**template engines** : ye ek style of markup se convert krke
aapko html dete hai

## ejs setup karne ke liye

1. ejs install

- npm i ejs

2. configure ejs

- app.set ("view engine", "ejs")

3. ek **views** folder banao

4. usmein ejs files bana
   send ki jagah render karo

### express generator

- ek folder bana ke deta hai, jiska matlab aapko
  khudse folder nahi banana hai, to express gen saare files ko isis
  folder mein daal ke dega

**steps to use express generator**

- sabse pahle jeevan mein ek baar laptop par install karo globally

  - **npm i express-generator -g**

- to create new app anywhere:
  - open cmd move to desktop create new app:
  - **express appname --view=ejs**
  - and after run it

# Database - MongoDB

- har naye app ka data store hoga storage mein, par usey directly rakne
  ki jagah ek container mein rakhege, us container mein sirf us app ka
  data aavega or use **Database** kehte hain.

### DB setup (code) => DB formation (db)

### Model (code) => Collection (db)

### Schema (code) => Documents (db)

- ek app ka poora data ko kehte hain => **DB**

- ek app mein variety of data hota hai par poora data hota app ka hi
  hai par us data ka sub category ko kehelata hain => **Collecton**

- collection matlab ki bola users ka data, ek user pe baat kri to hua vo => **Document**

  - Ex : Amazon is whole **DB** and User DB is called **collection** and each user called **Document**

## Session & Cookie

**Session** => Session use kehete hain jo data server pe save karta hain

**Cookie** => Cookie use kehete hain jo Browser or Frontend pe save karta hain

### Session createung steps:

- npm install express-session

1. create

   - req. session.koibhinaam = koibhivalue;

2. read

   - req. session.koibhinaam

3. delete
   - req. session.destroy( )

#

### Cookie setup steps:

- npm install cookie-parser

1. cookie reading

   - res. cookie ("name", value);

2. cookie delete

   - req. cookies.name

3. cookie delete
   - res. clearCookie("name'");

## Flash

**Flash** - jab bhi aap kisi ejs page ko dekhege waha par aapko kisi prakaar ka koi information
dena hai, wo kehlata hai flash messages, they are more like good looking alerts,warning and descriptions

#### Steps for setup flash messages :

1. install connect-flash

2. make sure you setup express-session

3. make sure you put connect flash in a app.use function

4. kisi bhi route mein aap ko flash create karna hai
5. kisi bhi doosre route par app use chalane ka try karein

##### AAP CONNECT FLASH KO USE NAHI KR SKTE BINA EXPRESS SESSION KE
