import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const Downloader = ({ api, loadLibrary }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [downloadType, setDownloadType] = useState('');
    const [serverMessages, setServerMessages] = useState('');
    const [downloaderLoading, setDownloaderLoading] = useState(false);
    const serverMessagesEndRef = useRef(null);

      const scrollToBottomForServerMessages = () => {
        serverMessagesEndRef.current.scrollTop = serverMessagesEndRef.current.scrollHeight;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        toast.loading("Downloading video!")
        setDownloaderLoading(true);
        const response = await api.post(`/ytdlp/download/${downloadType}`, { videoUrl }, {
            headers: {
                'Accept': 'text/event-stream'
            },
            responseType: 'stream',
            adapter: 'fetch'
        })

        const stream = response.data;

        const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
        let newMessages = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            newMessages += `${value}`;
            setServerMessages(newMessages);
        }
        setDownloaderLoading(false);
        toast.dismiss();
        toast.success("Video downloaded!")
        loadLibrary();
    }

    useEffect(() => {
        scrollToBottomForServerMessages();
    }, [serverMessages])

    return (
        <div>
            <h3>Download</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="videoUrl">Video URL</label>
                <input type="url" name="videoUrl" id="videoUrl" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value)}} />
                <label htmlFor="downloadType">DownloadType</label>
                <select name="downloadType" id="downloadType" onChange={(e) => setDownloadType(e.target.value)} defaultValue="regular">
                    <option value="regular">YouTube</option>
                    <option value="x">X/Twitter</option>
                    <option value="mp3">MP3</option>
                    <option value="mp4">Mp4</option>
                </select>
                <button type="submit">Submit</button>
                {downloaderLoading && <span>Downloading</span>}
            </form>
            <div className="whitespace-pre overflow-y-auto max-h-24" ref={serverMessagesEndRef}>
                {/* TODO Make this look nicer. */}
                {serverMessages}
            </div>
        </div>
    )
}
export default Downloader