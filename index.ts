import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs/promises";

const app : express.Application = express();
const portti : number = Number(process.env) || 3002;
const uploadKasittelija = multer({
     dest : path.resolve(__dirname, "tmp"),
     fileFilter : (req, file, callback) => {

        if (["json"].includes(file.mimetype.split("/")[1])) {

            callback(null, true);
        } else {
            callback(new Error());
        }

     }
}).single("tiedosto");

app.set("view engine", "ejs");

app.use(express.static(path.resolve(__dirname, "public")));

app.post("/upload", async(req : express.Request, res : express.Response) => {

    uploadKasittelija(req, res, async(err : any) => { 

        if (err) {

            res.render("index", { virhe : "Virheellinen tiedostomuoto. Käytä ainoastaan json-tiedostoja."});

        }else {

            if(req.file === undefined){
                res.render("index", { virhe : "Valitse json-tiedosto."});
            }

            let tiedot : any = {};
            let otsikko : string = ("");
            let otsikkoTaiteilu : string = ("");

            if (req.file) {

                tiedot = JSON.parse(await fs.readFile(path.resolve(__dirname, "tmp", String(req.file.filename)), { encoding : "utf-8"}));
                otsikko = req.file.originalname.replace('_',' ');
                otsikkoTaiteilu = otsikko.charAt(0).toUpperCase() + otsikko.slice(1);

               await fs.unlink(path.resolve(__dirname, "tmp", String(req.file.filename)));             

            }
            res.render("upload", {tiedot : tiedot, otsikkoTaiteilu : otsikkoTaiteilu} );
        }

    });

});

app.get("/upload", async(req : express.Request, res : express.Response) => {

    res.render("upload");

});

app.get("/", async(req : express.Request, res : express.Response) => {

    res.render("index", {virhe : ""});

});

app.listen(portti, () => {
    console.log(`Palvelin käynnistyi osoitteeseen http://localhost:${portti}`);
});  