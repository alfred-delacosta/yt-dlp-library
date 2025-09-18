import { Link } from 'react-router';
import { Trash2, MonitorUp, HardDriveDownload, SquareArrowOutUpRight } from 'lucide-react'

const Video = ({ video, serverUrl, setVideoLibrary }) => {
    
    async function deleteVideoButtonClick(e) {
        const videoId = parseInt(e.target.dataset.videoid);
        try {
            const deleteResults = await api.delete(`/videos/${videoId}`);
            toast.success('Video deleted')
            setVideoLibrary(videoLibrary.filter(video => video.id !== videoId));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the video")
        }
    }

  return (
    <div>
        <div className="card shadow">
            <video className="w-100" controls src={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`}></video>
            <div className="card-body">
                <h5 className="card-title">{video.name}</h5>
                <div className="d-grid">
                    <a className="btn btn-outline-primary" data-bs-toggle="collapse" href={`#collapse-video-${video.id}`} role="button" aria-expanded="false" aria-controls={`collapse-video-${video.id}`}>
                        See Description
                    </a>
                </div>
                <div className="collapse" id={`collapse-video-${video.id}`}>
                    <p className="card-text whitespace-break-spaces max-height-50vh overflow-y-auto border rounded  p-3 mt-3">{video.description}</p>
                </div>
                <div className="row mt-3">
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <Link className='btn btn-primary' to={`/video/${video.id}`} state={{ video, serverUrl }}><MonitorUp /> View Video</Link>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`} download={""} className='btn btn-success'><HardDriveDownload /> Download</a>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <button type='button' onClick={deleteVideoButtonClick} data-videoid={video.id} className='btn btn-danger'><Trash2 /> Delete</button>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={video.link} target='_blank' className='btn btn-warning'><SquareArrowOutUpRight /> Original Link</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default Video