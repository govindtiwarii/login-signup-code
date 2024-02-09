import UserModel from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailConfig.js'

class UserController{
    static userRegistration = async(req,res) => {
        const{name , email , password , password_onfirmation, tc} = req.body
        const user  =  await UserModel.findOne({email:email})
        if(user){
            res.send({"status":"failed", "message":"email already exist"})
        }else{
            if(name && email && password && password_onfirmation && tc){
                if(password===password_onfirmation){
                   try {
                    const salt = await bcrypt.genSalt(12)
                    const hashPassword = await bcrypt.hash(password,salt)
                    const doc = UserModel({
                        name:name,
                        email:email,
                        password:hashPassword,
                        tc:tc
                    })
                    await doc.save()
                    const saved_user = await UserModel.findOne({email:email})

                    const token = jwt.sign({userID : saved_user._id},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
                    res.send({"status":"success", "message":"registered successfully", "token":token})
                   } catch (error) {
                    console.log(error);
                    res.send({"status":"failed", "message":"unable to register"})
                   }
                }else{
                    res.send({"status":"failed", "message":"password does not match"})
                }

            }else{
                res.send({"status":"failed", "message":"all fields require"})
            }
        }
    }
     
    static userLogin = async(req,res) => {
        try {
            const {email, password} = req.body
            if(email&&password){
                const user  =  await UserModel.findOne({email:email})    
                if(user !=null ){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if((user.email===email) && isMatch){

                        // generating jwt token
                        const token = jwt.sign({userID : user._id},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
                        res.send({"status":"success", "message":"login successfully" , "token":token})
                    }else{
                        res.send({"status":"failed", "message":"email or password does not match"})
                    }
                }else{
                    res.send({"status":"failed", "message":"email is not registered"})
                }
            }
            else{
                    res.send({"status":"failed", "message":"all fields require"})
            }
        } catch (error) {
         console.log(error);  
         res.send({"status":"failed", "message":"Unable to login"}) 
        }
    }



    static changeUserPassword = async (req,res) => {
        const{password, password_onfirmation} = req.body
        if(password && password_onfirmation){
            if(password !== password_onfirmation){
                res.send({"status":"failed", "message":"Password does not match"})
            }else{
               const salt = await bcrypt.genSalt(12)
               const newHashPassword = await bcrypt.hash(password,salt);
               
               
               await UserModel.findByIdAndUpdate(req.user._id , {$set:{password : newHashPassword}})
               console.log(req.user._id);

               res.send({"status":"Success", "message":"Password changed successfully"})
            }
        }else{
            res.send({"status":"failed", "message":"All filds required"})
        }
    }

    static loggedUser = async (req , res) => {
        res.send({"user": req.user})
    }

    static sendUserPasswordResetEmail = async(req,res) => {
     const {email} = req.body
     if(email){
        const user = await UserModel.findOne({email:email})

        if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({userID:user._id}, secret,{expiresIn:'15m'})
            const link = `http://127.0.0.1:300/api/user/reset/${user._id}/${token}`
            console.log(link);

            //// email link
            let info = await transporter.sendMail({
                from:process.env.EMAIL_FROM,
                to: user.email,
                subject:"Govind tiwari password reset link api testing",
                html: `<p>Click <a href="${link}">here</a> to reset your password</p>`,
            })

            // console.log(link);

            res.send({"status":"Success", "message":"Email sent please check your mail box","info":info})
        } else {
            res.send({"status":"failed", "message":"Email does not exist"})
        }
     }  else{
        res.send({"status":"failed", "message":"Email is required"})
     } 
    }

    static userPasswordReset = async (req,res) => {
        const {password,password_onfirmation} = req.body
        const {id, token} = req.params
        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY
        try {
            jwt.verify(token,new_secret)
            if (password && password_onfirmation) {
                if (password !== password_onfirmation) {
                    res.send({"status":"failed", "message":"Password and confirm password does not match"})
                    
                } else {
                    const salt = await bcrypt.genSalt(12)
                    const newHashPassword = await bcrypt.hash(password,salt)
                    await UserModel.findByIdAndUpdate(user._id , {$set:{password : newHashPassword}})
                     
                    
                     res.send({"status":"success", "message":"Password changed successfully"})
                }  
            } else {
                res.send({"status":"failed", "message":"All fields are required"})
            }

        } catch (error) {
            console.error(error);
            res.status(500).send({"status": "failed", "message": "Error sending email"});
        
        }
    }

}


export default UserController;