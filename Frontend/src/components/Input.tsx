import React from 'react';

interface InputProps {
    readonly placeholder: string;
    readonly reference?: React.RefObject<HTMLInputElement | null>;
    readonly type?: string;
}

export function Input({placeholder,reference,type="text"}: InputProps){
    return <div>
        <input 
            ref={reference} 
            placeholder={placeholder} 
            type={type} 
            className="px-4 py-2 border rounded w-full" 
        />
    </div>
}