import { model, Schema, Types } from "mongoose";
const UserSchema = new Schema({
    username:{type:String,required:true,unique:true},
    password: {type:String,required:true}
});
export const UserModel=model("User",UserSchema);
const ContentSchema = new Schema({
    link:{type:String,required:true},
    type:{type:String,required:true},
    title:{type:String,required:true},
    tags:[{type:Types.ObjectId, ref:'Tag'}],
    userId:{type:Types.ObjectId,ref:'User',required:true}
});
export const ContentModel=model("Content",ContentSchema);
const TagsSchema=new Schema({
    title:{type:String,required:true,unique:true}
})
export const TagsModel=model("Tag",TagsSchema);
const LinkSchema=new Schema({
    hash:{type:String,required:true,unique:true},
    userId:{type:Types.ObjectId,ref:'User',required:true,unique: true}
})
export const LinkModel=model("Link",LinkSchema);