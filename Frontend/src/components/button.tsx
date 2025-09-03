import type { ReactElement } from 'react';
import '../App.css';
export interface ButtonProps{
    variant:"primary"| "secondary";
    text:string;
    startIcon?: ReactElement;
    onClick ?:()=>void;
    fullWidth?:boolean;
    loading?:boolean;
    className?:string;
}

const variantStyles={
    "primary":  "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    "secondary": "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 active:bg-indigo-300"
}
const defaultStyles="px-4 pl-2 py-2 rounded-md font-medium flex items-center cursor-pointer transition-colors duration-200 shadow-sm"
export const Button =({variant,text,startIcon,onClick,fullWidth,loading,className}:ButtonProps)=>{
   
    return <button 
        onClick={onClick} 
        className={`${variantStyles[variant]} ${defaultStyles} ${fullWidth ? " w-full flex justify-center items-center " : ""} ${loading ? "opacity-45" : ""} ${className || ""}`}
        disabled={loading}
    >
        <div className='pr-2 '>
            {startIcon}
        </div>
        {text} 
    </button>
}