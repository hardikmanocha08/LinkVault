import cors from "cors";
import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { JWT_PASSWORD, MONGO_URL } from './config.js';
import { ContentModel, LinkModel, UserModel } from './db.js';
import { userMiddleware } from './middleware.js';
import { random } from './utils.js';

const JWT_PASSWORDS=JWT_PASSWORD;
mongoose.connect(MONGO_URL);
const app = express();
app.use(express.json());
app.use(cors());
app.post('/api/v1/signup', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
   try{ await UserModel.create({
        username: username,
        password: password
    });
    res.json({
        msg: "You have Signed Up"
    });
}catch(e){
    res.status(411).json({
        msg:"User already exists"
    })
}
});

app.post('/api/v1/signin', async (req, res) => {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username, password });

    if (!user) {
        return res.status(401).json({ msg: "User does not exist or invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_PASSWORDS);
    res.json({ token });
});
app.post('/api/v1/content',userMiddleware,async (req,res)=>{
    const {link,type,title,tags} = req.body;
    try {
        // If type is 'other', attempt to fetch OpenGraph metadata
        let ogTitle: string | undefined = undefined;
        let ogDescription: string | undefined = undefined;
        let ogImage: string | undefined = undefined;
        if (type === 'other') {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 5000);
                const resp = await fetch(link, { signal: controller.signal, headers: { 'User-Agent': 'LinkVault/1.0 (+https://example.com)' } });
                clearTimeout(timeout);
                if (resp.ok) {
                    const html = await resp.text();
                    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
                    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
                    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
                    ogTitle = ogTitleMatch ? ogTitleMatch[1] : undefined;
                    ogDescription = ogDescMatch ? ogDescMatch[1] : undefined;
                    ogImage = ogImageMatch ? ogImageMatch[1] : undefined;
                    // fallback to <title>
                    if (!ogTitle) {
                        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
                        if (titleMatch) ogTitle = titleMatch[1];
                    }
                }
            } catch (err) {
                // ignore OG fetch errors — still create content without metadata
                console.error('OG fetch failed', err);
            }
        }

        await ContentModel.create({
            link: link,
            type: type,
            title: title,
            tags: tags,
            //@ts-ignore
            userId: req.id,
            ogTitle,
            ogDescription,
            ogImage
        });
        res.json({ msg: "Content added" });
    } catch (e) {
        res.status(411).json({ msg: "Incorrect Content Format" });
    }
})
// Get current user's share status (whether a public link exists)
app.get('/api/v1/brain/share', userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.id;
    const link = await LinkModel.findOne({ userId });
    if (!link) {
        return res.json({ shared: false });
    }
    return res.json({ shared: true, hash: link.hash });
});
app.get('/api/v1/content',userMiddleware,async(req,res)=>{
            //@ts-ignore
    const userId=req.id;
    const userContent=await ContentModel.find({
        userId:userId
    }).populate("userId","username")
    res.json({userContent})
})
app.delete('/api/v1/content',userMiddleware,async (req,res)=>{
    const content_id=req.body.content_id;
    const foundContent=await ContentModel.deleteOne({
        _id:content_id,
        //@ts-ignore
        userId:req.id
    })    
    if(foundContent.deletedCount==0){
        res.status(404).json({
            msg:"Content not found! "
        })
    }
    else{
        res.json({
            msg:"Content Deleted Successfully"
        })
    }
}) 
app.post('/api/v1/brain/share',userMiddleware,async(req,res)=>{
    const share = req.body.share;
    // Accept both boolean true and string "true"
    const isEnable = share === true || share === "true";
    // Debug log
    if(isEnable){
        const existingLink=await LinkModel.findOne({
            //@ts-ignore
            userId:req.id
        })
        console.log('Existing link:', existingLink); // Debug log
        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return;
        }
        const hash = random(10);
        console.log('Generated hash:', hash); // Debug log
        const newLink = await LinkModel.create({
             //@ts-ignore
            userId:req.id, 
            hash: hash
        })
        console.log('Created new link:', newLink); // Debug log
        res.json({
            hash: newLink.hash
        })
    }
    else{
       await LinkModel.deleteOne({
            //@ts-ignore
            userId:req.id
        });
        res.json({
            msg:"Sharing disabled"
        })
    }
})
app.get('/api/v1/brain/:shareLink',async(req,res)=>{
    const hash=req.params.shareLink;
    const link=await LinkModel.findOne({
        hash
    })
   
    if(!link){
        res.status(411).json({
            msg: "Incorrect input"
        })
        
        return;
    }
    const content=await ContentModel.find({
        //@ts-ignore
        userId:link.userId
    })
    const user=await UserModel.findOne({
        _id:link.userId
    })
    
    res.json({
        username:user?.username,
        content:content
    })
    
})
app.listen(process.env.PORT || 3000);
