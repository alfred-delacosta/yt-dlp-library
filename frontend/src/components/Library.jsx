import toast from 'react-hot-toast'
import { Link } from 'react-router';
import Video from './Video';
import Mp3 from './Mp3';
import Pagination from './Pagination';

const Library = ({ api, serverUrl, videoLibrary, setVideoLibrary, mp3Library, setMp3Library, numberOfItems }) => {

    async function deleteVideoButtonClick(e) {
        try {
            const videoId = parseInt(e.target.dataset.videoid);
            const deleteResults = await api.delete(`/videos/${videoId}`);
            toast.success('Video deleted')
            setVideoLibrary(videoLibrary.filter(video => video.id !== videoId));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the video")
        }
    }

    
    function listVideos() { 
        return videoLibrary.map(video => (
        <div key={video.id} className='col-12 col-sm-4 mb-3'>
            <Video video={video} serverUrl={serverUrl} deleteVideoButtonClick={deleteVideoButtonClick} setVideoLibrary={setVideoLibrary} api={api} />
        </div>
    ))
    }

    // const listVideos = videoLibrary.map(video => (
    //     <div key={video.id} className='col-12 col-sm-4 mb-3'>
    //         <Video video={video} serverUrl={serverUrl} deleteVideoButtonClick={deleteVideoButtonClick} setVideoLibrary={setVideoLibrary} api={api} />
    //     </div>
    // ))

    async function deleteMp3ButtonClick(e) {
        try {
            const mp3Id = parseInt(e.target.dataset.mp3id);
            const deleteResults = await api.delete(`/mp3s/${mp3Id}`);
            toast.success('Mp3 deleted')
            setMp3Library(mp3Library.filter(mp3 => mp3.id !== mp3Id));
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the MP3")
        }
    }

    function listMp3s() {
        return mp3Library.map(mp3 => (
        <div key={mp3.id} className='col-12 col-sm-4 mb-3'>
            <Mp3 mp3={mp3} serverUrl={serverUrl} setMp3Library={setMp3Library} deleteMp3ButtonClick={deleteMp3ButtonClick} api={api} />
        </div>
    ))}

    // const listMp3s = mp3Library.map(mp3 => (
    //     <div key={mp3.id} className='col-12 col-sm-4 mb-3'>
    //         <Mp3 mp3={mp3} serverUrl={serverUrl} setMp3Library={setMp3Library} deleteMp3ButtonClick={deleteMp3ButtonClick} api={api} />
    //     </div>
    // ))

  return (
    <div className='row'>
        {videoLibrary.length > 0 && <Pagination items={listVideos()} itemsPerPage={numberOfItems} />}
        {videoLibrary.length < 1 && (
            <div className="col-12">
                <p className="lead">No videos found.</p>
            </div>
        )}
        <div className="col-12">
            <h3>MP3s</h3>
        </div>
        <div className="col-12">
            <div className="row">
                {mp3Library.length > 0 && <Pagination items={listMp3s()} itemsPerPage={numberOfItems} />}
                {mp3Library.length < 1 && (
                    <div className="col-12">
                        <p className="lead">No MP3s found.</p>
                    </div>
                )}
            </div>
        </div>
    </div>

  )
}
export default Library