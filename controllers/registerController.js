const bcrypt=require('bcrypt');
const User=require('../data/User');
const handleNewUser= async (req,res)=>{
    const {user,pwd}=req.body;
    if(!user || !pwd)return res.status(400).json({"message":"username and password required"})
    const duplicate= await User.findOne({username:user}).exec();
    if(duplicate) return res.sendStatus(409);
    
    try{
        const hashedPwd= await bcrypt.hash(pwd,10);
        const result=await User.create({
            "username":user,
            "password":hashedPwd
        })
        console.log(result);
        res.status(201).json({"success":"new user is created"})
    }catch(err){
        res.status(500).json({"error":"server problem"})
    }
}
module.exports={handleNewUser};
