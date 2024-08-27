const express = require('express')
const dynamoose = require('dynamoose')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

dynamoose.aws.ddb.local('http://localhost:7000')

const userSchema = new dynamoose.Schema({
    name:{
        type:String,
        hashKey:true
    },
    password:{
        type:String
    }
})

const User = dynamoose.model('User',userSchema)

app.post('/register',async(req,res)=> {
    const {name,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10)
    const user = new User({name,password:hashedPassword})
    try{
        await user.save();
        res.json({Message:'Registration Successsful',user})
    }
    catch(error){
        res.status(500).json({message:error.message})
    }
})

app.post('/login',async(req,res)=> {
    const {name,password} = req.body;
    const user = await User.get({name})
    try{
        if(user){
            const validPassword = await bcrypt.compare(password,user.password);
            if(validPassword){
                res.json({message:'login successful'})
                console.log('login successfull');
            }
            else{
                res.status(400).json({message:'Invalid password'})
            }
        }
        else{
            res.status(404).json({message:'user not found'})
        }
    }
    catch(error){
        res.status(500).json({message:error.message})
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT , ()=>{
    console.log(`port running on ${PORT}`);
    
})