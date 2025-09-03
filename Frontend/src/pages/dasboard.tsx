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

const [modalOpen, setModalOpen] = useState(false);
const [filterType, setFilterType] = useState<string | null>(null);
const { contents, refetch } = useContent();
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-purple-100'>
      <Sidebar onFilter={setFilterType}></Sidebar>
      <div className='p-6 md:p-8 ml-72'>
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
    
    <div className='flex gap-5 flex-wrap '>
      {contents
        .filter(({ type }) => !filterType || type === filterType)
        .map(({ _id, type, link, title }) => (
          <Card key={_id} _id={_id} title={title} type={type} link={link} onDelete={refetch} />
        ))}
    </div>
      <Chatbot contents={contents} />
    </div>
  </div>
  )
}

export default Dashboard
