
export function EyeOffIcon({ className = "w-4 h-4" }: { readonly className?: string }){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-6.94"/>
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-4.87 6.82"/>
            <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/>
            <path d="M1 1l22 22"/>
        </svg>
    );
}


