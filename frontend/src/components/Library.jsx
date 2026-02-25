import toast from 'react-hot-toast'
import { Link } from 'react-router';
import Video from './Video';
import Mp3 from './Mp3';
import Pagination from './Pagination';
import { useState, useEffect } from 'react';

const VideoItem = ({ item: video, serverUrl, deleteVideoButtonClick, transferToJellyfinButtonClick, generateSubtitlesButtonClick, setVideoLibrary, api }) => (
  <div className='col-12 col-sm-4 mb-3'>
    <Video video={video} serverUrl={serverUrl} deleteVideoButtonClick={deleteVideoButtonClick} transferToJellyfinButtonClick={transferToJellyfinButtonClick} setVideoLibrary={setVideoLibrary} api={api} />
  </div>
);

const Mp3Item = ({ item: mp3, serverUrl, setMp3Library, deleteMp3ButtonClick, api }) => (
  <div className='col-12 col-sm-4 mb-3'>
    <Mp3 mp3={mp3} serverUrl={serverUrl} setMp3Library={setMp3Library} deleteMp3ButtonClick={deleteMp3ButtonClick} api={api} />
  </div>
);

const Library = ({ api, serverUrl, numberOfItems }) => {
  const [videoData, setVideoData] = useState({ videos: [], totalPages: 0, currentPage: 1, totalItems: 0, loading: false });
  const [mp3Data, setMp3Data] = useState({ mp3s: [], totalPages: 0, currentPage: 1, totalItems: 0, loading: false });

  const fetchVideos = async (page = 1, limit = numberOfItems) => {
    setVideoData(prev => ({ ...prev, loading: true }));
    try {
      const response = await api.get(`/videos/paginated?page=${page}&limit=${limit}`);
      setVideoData({ ...response.data, loading: false });
    } catch (error) {
      console.error(error);
      setVideoData(prev => ({ ...prev, loading: false }));
      toast.error('Error loading videos');
    }
  };

  const fetchMp3s = async (page = 1, limit = numberOfItems) => {
    setMp3Data(prev => ({ ...prev, loading: true }));
    try {
      const response = await api.get(`/mp3s/paginated?page=${page}&limit=${limit}`);
      setMp3Data({ ...response.data, loading: false });
    } catch (error) {
      console.error(error);
      setMp3Data(prev => ({ ...prev, loading: false }));
      toast.error('Error loading MP3s');
    }
  };

  useEffect(() => {
    fetchVideos(1, numberOfItems);
    fetchMp3s(1, numberOfItems);
  }, [numberOfItems]);

  async function deleteVideoButtonClick(e) {
    try {
      const videoId = parseInt(e.target.dataset.videoid);
      await api.delete(`/videos/${videoId}`);
      toast.success('Video deleted');
      fetchVideos(videoData.currentPage, numberOfItems);
    } catch (error) {
      console.log(error);
      toast.error("There was an error deleting the video");
    }
  }

  async function transferToJellyfinButtonClick(e) {
    try {
      const videoId = parseInt(e.target.dataset.videoid);
      toast.promise(async () => {
        const transferResults = await api.post(`/videos/transfertojellyfin/${videoId}`);
        console.log(transferResults)
      }, {
        loading: "Moving video to Jellyfin folder location...",
        success: 'Video transfered successfully!',
        error: 'There was an error transferring the video',
      });
    } catch (error) {
      console.log(error);
      toast.error("There was an error transferring the video")
    }
  }

  // async function generateSubtitlesButtonClick(e) {
  //   try {
  //     const videoId = parseInt(e.target.dataset.videoid);
  //     toast.promise(async () => {
  //       const transferResults = await api.post(`/videos/generatesubtitles/${videoId}`);
  //       console.log(transferResults)
  //     }, {
  //       loading: "Generating subtitles...",
  //       success: 'Subtitles generated successfully!',
  //       error: 'There was an error generating subtitles',
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("There was an error generating subtitles.")
  //   }
  // }

  async function convertToMp4(e) {
    try {
      const videoId = parseInt(e.target.dataset.videoid);
      toast.promise(async () => {
        const transferResults = await api.post(`/videos/transfertojellyfin/${videoId}`);
        console.log(transferResults)
      }, {
        loading: "Moving video to Jellyfin folder location...",
        success: 'Video transfered successfully!',
        error: 'There was an error transferring the video',
      });
    } catch (error) {
      console.log("Error in convertToMp4 function");
      console.log(error)
      toast.error("There was an error converting the video to MP4.")
    }
  }

  async function deleteMp3ButtonClick(e) {
    try {
      const mp3Id = parseInt(e.target.dataset.mp3id);
      await api.delete(`/mp3s/${mp3Id}`);
      toast.success('Mp3 deleted');
      fetchMp3s(mp3Data.currentPage, numberOfItems);
    } catch (error) {
      console.log(error);
      toast.error("There was an error deleting the MP3");
    }
  }

  return (
    <div className='row'>
      {videoData.videos.length > 0 && (
        <Pagination
          currentItems={videoData.videos}
          totalPages={videoData.totalPages}
          currentPage={videoData.currentPage}
          onPageChange={(page) => fetchVideos(page, numberOfItems)}
          renderItem={(props) => <VideoItem {...props} serverUrl={serverUrl} deleteVideoButtonClick={deleteVideoButtonClick} transferToJellyfinButtonClick={transferToJellyfinButtonClick} api={api} />}
        />
      )}
      {videoData.videos.length < 1 && !videoData.loading && (
        <div className="col-12">
          <p className="lead">No videos found.</p>
        </div>
      )}
      <div className="col-12">
        <h3>MP3s</h3>
      </div>
      <div className="col-12">
        <div className="row">
          {mp3Data.mp3s.length > 0 && (
            <Pagination
              currentItems={mp3Data.mp3s}
              totalPages={mp3Data.totalPages}
              currentPage={mp3Data.currentPage}
              onPageChange={(page) => fetchMp3s(page, numberOfItems)}
              renderItem={(props) => <Mp3Item {...props} serverUrl={serverUrl} deleteMp3ButtonClick={deleteMp3ButtonClick} api={api} />}
            />
          )}
          {mp3Data.mp3s.length < 1 && !mp3Data.loading && (
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