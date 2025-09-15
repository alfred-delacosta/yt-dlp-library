import { useEffect, useState } from "react"
import toast from 'react-hot-toast'

const Library = ({ api, videoLibrary, setVideoLibrary, mp3Library }) => {
    // const [videoLibrary, setVideoLibrary] = useState([]);
    // const [mp3Library, setMp3Library] = useState([]);

    // async function loadLibrary() {
    //     const videoApiResponse = await api.get('/videos');
    //     const mp3ApiResponse = await api.get('/mp3s');

    //     setVideoLibrary(videoApiResponse.data);
    //     setMp3Library(mp3ApiResponse.data);
    // }

    async function deleteButtonClick(e) {
        const videoId = parseInt(e.target.dataset.videoid);

        try {
            const deleteResults = await api.delete(`/videos/${videoId}`);
            toast.success('Video deleted')
            // TODO Refresh video library?
            setVideoLibrary(videoLibrary.filter(video => video.id !== videoId));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the video")
        }
    }


    const listVideos = videoLibrary.map(video => (
        <li key={video.id}>
            <h4>{video.name}</h4>
            <div>
                <video controls src={video.link}></video>
            </div>
            <div>
                <button onClick={deleteButtonClick} data-videoid={video.id}>Delete</button>
            </div>
        </li>
    ))

    const listMp3s = mp3Library.map(mp3 => (
        <li key={mp3.id}>
            <h4>{mp3.name}</h4>
            <div>
                <video controls src={mp3.link}></video>
            </div>
        </li>
    ))

  return (
    <div>
        <h3>Library</h3>
        <h3>Videos</h3>
        <ul>{listVideos}</ul>
        <h3>MP3s</h3>
        <ul>{listMp3s}</ul>
    </div>

  )
}
export default Library