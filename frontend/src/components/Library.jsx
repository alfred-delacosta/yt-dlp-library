import toast from 'react-hot-toast'
import { Link } from 'react-router';
import Video from './Video';
import Mp3 from './Mp3';

const Library = ({ api, serverUrl, videoLibrary, setVideoLibrary, mp3Library, setMp3Library }) => {
    const listVideos = videoLibrary.map(video => (
        <div key={video.id} className='col-4'>
            <Video video={video} serverUrl={serverUrl} setVideoLibrary={setVideoLibrary} />
        </div>
    ))

    const listMp3s = mp3Library.map(mp3 => (
        <div key={mp3.id} className='col-4'>
            <Mp3 mp3={mp3} serverUrl={serverUrl} setMp3Library={setMp3Library} />
        </div>
    ))

  return (
    <div className='container'>
        <div className="row">
            <div className="col-12">
                <h2>Library</h2>
            </div>
            <div className="col-12">
                <h3>Videos</h3>
            </div>
        </div>
        <div className="row">
            {listVideos}
        </div>
        <div className="row">
            <div className="col-12">
                <h3>MP3s</h3>
            </div>
            {listMp3s}
        </div>
    </div>

  )
}
export default Library