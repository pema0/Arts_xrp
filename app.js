const express = require("express");
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const Art = require('./mongo');
const { XrplClient } = require("xrpl-client");
const { utils, derive, sign } = require("xrpl-accountlib");
const client = new XrplClient("wss://s.altnet.rippletest.net:51233");

const app = express();


const main = async (seed, destination, price, res) => {
    let account;
    if (!utils.isValidSeed(seed)) {
        return res.send("invalid seed");
    }
    account = derive.familySeed(seed);
    if (!utils.isValidAddress(destination)) {
        return res.send("invalid destination address");
    }
    console.log("account : ", account);

    const data = await client.send({
        id: 1,
        command: "account_info",
        account: account.address,
        strict: true
    });
    console.log("Data : ", data.account_data);

    if (data.error) {
        return res.send({ "Error : ": data.error_message });
    }

    console.log("Balance : ", Number(data.account_data.Balance) / 1000000 - 10 - 2 * data.account_data.OwnerCount);
    if (Number(data.account_data.Balance) / 1000000 < Number(price) + 10 - 2 * data.account_data.OwnerCount) {
        console.log("Warning : Your balance is low\n")
        res.send("You must have 10 XRP + theamount you want to send\n")
        // process.exit(1)
    }
    await client.send({
        command: "subscribe",
        accounts: [account.address]
    })

    const { id, signedTransaction } = sign({
        TransactionType: "Payment",
        Account: account.address,
        Destination: destination,
        Amount: String(Number(price) * 1_000_000),
        Sequence: data.account_data.Sequence,
        Fee: String(12),
        LastLedgerSequence: data.ledger_current_index + 2
    }, account)
    console.log("id", id)
    console.log(" ")
    console.log("signedTransaction", signedTransaction)

    const result = await client.send({
        command: "submit",
        tx_blob: signedTransaction
    })
    console.log("submited transaction result : ", result)
    return { passed: true, transactionid: id, raddress: account.address }

    // client.on("transaction",({transaction,meta,ledger_index,engine_result})=>{
    //     if(id === transaction.hash){
    //         console.log(Transaction in ledger : ${ledger_index})
    //         console.log(Transaction in status : ${engine_result})
    //     }
    //     if(typeof meta.delivered_amount === 'string'){
    //         const amount = Number(meta.delivered_amount)/1_000_000
    //         console.log(Delivered amount is : ${amount} XRP)
    //     }else{
    //         console.log(Delivered amount is : ${meta.delivered_amount.value} ${meta.delivered_amount.currency})
    //     }
    //     client.close()
    // })







};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname)));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `recipe-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only image.'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadPhoto = upload.single('image');

app.post('/uploadArt', uploadPhoto, async (req, res) => {
    try {
        const { xrpWalletAddress, description, price } = req.body;
        const imageUrl = req.file.filename;
        const newArt = new Art({
            xrpWalletAddress,
            imageUrl,
            description,
            price
        });
        await newArt.save();
        res.status(201).json({ message: 'Art uploaded successfully' });
    } catch (error) {
        console.error('Error uploading art:', error);
    }
});

app.post("/payment", async (req, res) => {
    try {
        console.log(req.body);
        const { passed, transactionid, raddress } = await main(req.body.familyseed, req.body.xrpWalletAddress, req.body.price, res);
        if (passed) {
            req.body.trasactionid = transactionid;
            // imageUrl
            const storeondb = new ItemBought({ raddress: raddress, from: req.body.xrpWalletAddress, price: req.body.price,  transactionid: transactionid })
            storeondb.save()
            console.log(storeondb)
            res.send({ message: "item bought", status: "success" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error uploading product");
    }
});

app.get("/getalldata", async (req, res) => {
    try {
        const arts = await Art.find();
        console.log(arts);
        res.send({ data: arts, status: 200 });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

module.exports = app; 
