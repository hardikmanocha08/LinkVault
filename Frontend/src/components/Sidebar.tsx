import { LinkIcon } from "../icons/LinkIcon";
import { LinkVaultIcon } from "../icons/LinkVaultIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItems } from "./SidebarItem";
export function Sidebar({ onFilter }: { onFilter?: (type: string) => void }) {
    return <div className="pl-6 h-screen fixed w-72 left-0 top-0 bg-white/70 backdrop-blur-xl border-r border-gray-200">
        <div className="flex items-center gap-2 text-xl pt-5 font-semibold text-gray-900">
            <div className="pr-1 ">
                <LinkVaultIcon></LinkVaultIcon>
            </div>
            <span>LinkVault</span>
        </div>
        <div className="pt-5 font-medium">
            <SidebarItems text="Twitter" icon={<TwitterIcon />} onClick={() => onFilter?.("twitter")} />
            <SidebarItems text="Youtube" icon={<YoutubeIcon />} onClick={() => onFilter?.("youtube")} />
            <SidebarItems text="Other" icon={<LinkIcon />} onClick={() => onFilter?.("other")} />
        </div>
    </div>
}