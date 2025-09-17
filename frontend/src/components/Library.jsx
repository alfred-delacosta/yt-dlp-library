import toast from 'react-hot-toast'
import { Link } from 'react-router';

const Library = ({ api, serverUrl, videoLibrary, setVideoLibrary, mp3Library, setMp3Library }) => {
    // const [videoLibrary, setVideoLibrary] = useState([]);
    // const [mp3Library, setMp3Library] = useState([]);

    // async function loadLibrary() {
    //     const videoApiResponse = await api.get('/videos');
    //     const mp3ApiResponse = await api.get('/mp3s');

    //     setVideoLibrary(videoApiResponse.data);
    //     setMp3Library(mp3ApiResponse.data);
    // }

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

    async function deleteMp3ButtonClick(e) {
        const mp3Id = parseInt(e.target.dataset.mp3id);

        try {
            const deleteResults = await api.delete(`/mp3s/${mp3Id}`);
            toast.success('Mp3 deleted')
            setMp3Library(mp3Library.filter(mp3 => mp3.id !== mp3Id));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the MP3")
        }
    }


    const listVideos = videoLibrary.map(video => (
        <li key={video.id}>
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
        </li>
    ))

    const listMp3s = mp3Library.map(mp3 => (
        <li key={mp3.id}>
            <h4>{mp3.name}</h4>
            <div>
                <audio controls src={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`}></audio>
            </div>
            <div>
                <button type='button' onClick={deleteMp3ButtonClick} data-mp3id={mp3.id}>Delete</button>
                <button type="button" className='ml-3'>
                    <a href={import.meta.env.PROD ? mp3.mp3Path : `${serverUrl}/${mp3.mp3Path}`} download={""}>Download</a>
                </button>
                <Link className='ml-3' to={`/mp3/${mp3.id}`} state={{ mp3, serverUrl }}>View MP3</Link>
            </div>
        </li>
    ))

  return (
    <div>
        <h2>Library</h2>
        <h3>Videos</h3>
        <ul>{listVideos}</ul>
        <h3>MP3s</h3>
        <ul>{listMp3s}</ul>
    </div>

  )
}
export default Library