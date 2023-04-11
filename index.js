const { log } = require('console')
const express= require('express')
const mongoose= require('mongoose')
const multer= require('multer')
const path=require('path')
const app = express()
app.use(express.static('public'))

mongoose.set('strictQuery',false)
//connect to Mongodb
mongoose.connect("mongodb://127.0.0.1:27017/UploadingImages_with_mongodb")

//creating the Schema for the image
const imageSchema= new mongoose.Schema({
    name:String,
    data:Buffer,
    contentType:String
})

//create the model for image
const Image= mongoose.model("Image",imageSchema)

//Configure multer for file upload

const storage= multer.memoryStorage()
const upload = multer({storage:storage})

//handle the form submission for uploading image
app.post("/upload",upload.single('image'),async(req,res)=>{
    try {
        const image= new Image({
            name:req.file.filename,
            data:req.file.buffer,
            contentType:req.file.mimetype
        })
        await image.save()
        res.redirect('/')
    } catch (error) {
        console.log(error);
        res.status(500)
    }
})

//serve an image on the page
app.get('/image/:id',async(req,res)=>{
    try {
        const image= await Image.findById(req.params.id)
        res.set('Content-Type',image.contentType)
        res.send(image.data)
    } catch (error) {
        console.log(error);
    }
})

//configure the router to the home

app.get('/',async(req,res)=>{
    try {
        res.sendFile(__dirname+'/index.html')
    } catch (error) {
        
    }
})


// Return the latest images as a JSON response
app.get('/latest-images', async (req, res) => {
    try {
      const images = await Image.find().sort('-_id').limit(10);
      res.json(images);
    } catch (error) {
      console.log(error);
      res.status(500).send('Error fetching latest images');
    }
  });
app.listen(3500,()=>{console.log('The server running on port 3500...');})