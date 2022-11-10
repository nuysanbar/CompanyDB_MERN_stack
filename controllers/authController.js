const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const User=require('../data/User');

const handleAuth=async (req,res)=>{
    const {user,pwd}=req.body;
    if(!user || !pwd)return res.status(400).json({"error":"both username and password is required"});
    
    const foundUser= await User.findOne({username:user}).exec();
    if(!foundUser) return res.status(400).json({"error":"user is not available register first"});

    const match= await bcrypt.compare(pwd,foundUser.password);
    if(match){
        const roles=Object.values(foundUser.roles);
        const access_token=jwt.sign(
            {
                "userInfo":{
                    "username":foundUser.username,
                    "roles":roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'60s'}
        )
        const refresh_token=jwt.sign(
            {"username":foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:'1d'}
        )
        foundUser.refreshToken=refresh_token;
        const result=await foundUser.save();
        console.log(result);
        res.cookie('jwt',refresh_token,{httpOnly:true,sameSite:'None',maxAge:24*60*60*1000}); //secure:true in production
        res.json({access_token});
    }else{
        res.status(400).json({"error":"wrong password"})
    }
}

module.exports={handleAuth}