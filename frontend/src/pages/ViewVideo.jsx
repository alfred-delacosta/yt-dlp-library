import { useParams, useLocation, Link } from "react-router"

const ViewVideo = () => {
    const location = useLocation();
    const { video, serverUrl } = location.state;
    const { id } = useParams();
  return (
    <div>
        <h1>View Video</h1>
        <h4>{video.name}</h4>
        <div>
            <video className="w-2/6" controls src={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`}></video>
        </div>
        <div>
            {/* <button type='button' onClick={deleteButtonClick} data-videoid={video.id}>Delete</button> */}
            <button type="button" className='ml-3'>
                <a href={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`} download={""}>Download</a>
            </button>
        </div>
        <div>
            <Link to="/dashboard">Dashboard</Link>
        </div>
    </div>
  )
}
export default ViewVideo