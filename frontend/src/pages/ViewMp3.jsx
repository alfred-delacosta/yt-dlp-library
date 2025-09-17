import { useParams, useLocation, Link } from "react-router"

const ViewMp3 = () => {
    const location = useLocation();
    const { mp3, serverUrl } = location.state;
    const { id } = useParams();
  return (
    <div>
        <h1>View Video</h1>
        <h4>{mp3.name}</h4>
        <div>
            <audio controls src={import.meta.env.PROD ? `/${mp3.mp3Path}` : `${serverUrl}/${mp3.mp3Path}`}></audio>
        </div>
        <div>
            {/* <button type='button' onClick={deleteButtonClick} data-videoid={video.id}>Delete</button> */}
            <button type="button" className='ml-3'>
                <a href={import.meta.env.PROD ? `/${mp3.mp3Path}` : `${serverUrl}/${mp3.mp3Path}`} download={""}>Download</a>
            </button>
        </div>
        <div>
            <Link to="/dashboard">Dashboard</Link>
        </div>
    </div>
  )
}
export default ViewMp3