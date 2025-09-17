const LibraryCounts = ({ videoCount, mp3Count }) => {
    // const [videoCount, setVideoCount] = useState(0);
    // const [mp3Count, setMp3Count] = useState(0);

    // async function getCounts() {
    //     const videoResults = await api.get('/videos/count');
    //     setVideoCount(videoResults.data[0]['COUNT(*)']);
        
    //     const mp3Results = await api.get('/mp3s/count');
    //     setMp3Count(mp3Results.data[0]['COUNT(*)']);
    // }

    // useEffect(() => {
    //     getCounts();
    // }, [videoCount, mp3Count])

  return (
    <div>
        <h1>Counts</h1>
        <div>
            Number of Videos: {videoCount}
        </div>
        <div>
            Number of MP3s: {mp3Count}
        </div>
    </div>
  )
}
export default LibraryCounts