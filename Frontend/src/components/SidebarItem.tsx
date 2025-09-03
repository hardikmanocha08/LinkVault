import type { ReactElement } from "react";

export function SidebarItems({ text, icon, onClick }: {
    text: string;
    icon: ReactElement;
    onClick?: () => void;
}) {
    return <div className="flex text-gray-700 py-2 cursor-pointer
    hover:bg-gray-200 rounded max-w-48 pl-4" onClick={onClick}>
        <div className=" pr-2">
            {icon}
        </div>
        <div className="">
            {text}
        </div>
    </div>
}