import { useRef, useState } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./button";
import { Input } from "./Input";

import axios from "axios";
import { BACKEND_URL } from "../config";
const ContentType = {
    Youtube: "youtube",
    Twitter: "twitter"
} as const;

type ContentTypeValue = typeof ContentType[keyof typeof ContentType];

export function CreateContentModal({open,onClose,onContentAdded}){
    const titleRef=useRef<HTMLInputElement>(null);
    const linkRef=useRef<HTMLInputElement>(null);
    const [type,setType] =useState<ContentTypeValue>(ContentType.Youtube);
    async function addContent(){
         const title=titleRef.current?.value;
         const link=linkRef.current?.value;
         await axios.post(`${BACKEND_URL}/api/v1/content`,{
            link,
            title,
            type
         },{
            headers:{
                "authorization":localStorage.getItem("token")
            }
         })
         onContentAdded?.(); // Trigger refresh after adding content
         onClose()
    }
    return <div>
        {open &&  <div>
            <div className="w-screen h-screen bg-black fixed top-0 left-0 opacity-30 flex justify-center z-40">
            </div>
            <div className="w-screen h-screen fixed left-0 top-0 flex justify-center z-50">
                <div className=" flex flex-col justify-center">
                <span className="bg-white/80 backdrop-blur-xl fixed p-6 rounded-xl border border-white/60 shadow-lg ">
                        <div className="flex justify-end">
                            <button onClick={onClose} className="cursor-pointer" aria-label="Close modal">
                                <CrossIcon/>
                            </button>
                            
                        </div>  
                        <div className="space-y-2">
                            <Input reference={titleRef} placeholder={"Title"}/>
                            <Input reference={linkRef} placeholder={"Link"}/>
                        </div>  
                        <div className="pt-2">
                            <h1 className="text-sm font-medium text-gray-700">Type</h1>
                            <div className="flex gap-2 p-3 justify-center pb-2">
                            <Button text="Youtube" variant={type ===ContentType.Youtube ? "primary":"secondary"} onClick={()=>{
                                setType(ContentType.Youtube)
                            }}></Button>
                            <Button text="Twitter" variant={type ===ContentType.Twitter ? "primary":"secondary"} onClick={()=>{
                                setType(ContentType.Twitter)
                            }}></Button>
                            </div>
                        </div>
                        <div className="flex justify-center pt-1">  
                        <Button onClick={addContent} variant="primary" text="Submit"></Button>
                        </div>                   
                    </span>
                    </div>
            </div>
            </div>}

    </div>
}
