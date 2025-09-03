import axios from 'axios'
import { useState } from 'react'
import '../App.css'
import { Button } from '../components/button'
import { Card } from '../components/Card'
import { Chatbot } from '../components/Chatbot'
import { CreateContentModal } from '../components/CreateContentModal'
import { Sidebar } from '../components/Sidebar'
import { BACKEND_URL } from '../config'
import { useContent } from '../hoooks/useContent'
import { PlusIcon } from '../icons/plusIcon'
import { ShareIcon } from '../icons/shareIcon'
// import { Signup } from './components/Signup'

function Dashboard() {
const [sidebarOpen, setSidebarOpen] = useState(false);

const [modalOpen, setModalOpen] = useState(false);
const [filterType, setFilterType] = useState<string | null>(null);
const { contents, refetch } = useContent();
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex flex-col md:flex-row relative'>
      {/* Mobile sidebar toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 bg-white/80 border border-gray-300 rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      {/* Sidebar and overlay for mobile */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div
            className="fixed top-0 left-0 z-50 w-72 h-full bg-white/70 backdrop-blur-xl border-r border-gray-200 md:hidden transition-transform duration-300"
            onClick={e => e.stopPropagation()}
            style={{ minWidth: '18rem' }}
          >
            <Sidebar onFilter={type => { setFilterType(type); setSidebarOpen(false); }} />
          </div>
        </>
      )}
      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-72 md:fixed md:left-0 md:top-0 h-full">
        <Sidebar onFilter={setFilterType} />
      </div>
      <div className='p-4 sm:p-6 md:p-8 md:ml-72 w-full'>
      <CreateContentModal open={modalOpen} onClose={() => {
        setModalOpen(false);
      }} onContentAdded={refetch}/>
      <div className='flex justify-end gap-3'>
        <Button 
    startIcon={<PlusIcon size={"lg"}></PlusIcon>}
    variant='primary'
    text="Add Content"
    onClick={()=>{
      setModalOpen(true)
    }}/>
    <Button onClick={async()=>{
      try {
        const response=await axios.post(`${BACKEND_URL}/api/v1/brain/share`,
          {
            "share":true
          },{
            headers:{
              "authorization":localStorage.getItem("token")
            }
          }
        );
        console.log('Share response:', response.data); // Debug log
        const shareUrl = `${window.location.origin}/share/${response.data.hash}`
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Show success message (you can replace this with a toast notification later)
        alert(`Share link copied to clipboard!\n${shareUrl}`);
      } catch (error) {
        console.error('Failed to generate share link:', error);
        alert('Failed to generate share link. Please try again.');
      }
    }}
    startIcon={<ShareIcon size={"md"}></ShareIcon>}
    variant='secondary'
    text="Share brain"/>
      </div>
    
  <div className='flex gap-4 flex-wrap justify-center'>
      {contents
        .filter(({ type }) => !filterType || type === filterType)
        .map(({ _id, type, link, title }, idx) => (
          <Card key={_id} _id={_id} title={title} type={type} link={link} onDelete={refetch} cardNumber={idx} />
        ))}
    </div>
      <Chatbot contents={contents} />
    </div>
  </div>
  )
}

export default Dashboard
