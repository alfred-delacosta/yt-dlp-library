import { Link } from 'react-router';
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
        <h4>{video.name}</h4>
        <div>
            <video className="w-2/6" controls src={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`}></video>
        </div>
        <div>
            <button type='button' onClick={deleteVideoButtonClick} data-videoid={video.id}>Delete</button>
            <button type="button" className='ml-3'>
                <a href={import.meta.env.PROD ? video.videoPath : `${serverUrl}/${video.videoPath}`} download={""}>Download</a>
            </button>
            <Link className='ml-3' to={`/video/${video.id}`} state={{ video, serverUrl }}>View Video</Link>
        </div>
        <div className='my-10'>
            <a href={video.link} target='_blank'>Original Link</a>
        </div>
    </div>
  )
}
export default Video