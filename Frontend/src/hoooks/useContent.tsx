import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export function useContent(){
    const [contents, setContents]=useState([]);
    
    const fetchContents = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/content`,{
                headers:{
                    "authorization":localStorage.getItem("token")
                }
            });
            setContents(response.data.userContent);
        } catch (error) {
            console.error("Failed to fetch contents:", error);
        }
    };

    useEffect(()=>{
        fetchContents();
    },[]);
    
    return { contents, refetch: fetchContents };
}