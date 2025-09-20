import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const Downloader = ({ api, loadLibrary }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [downloadType, setDownloadType] = useState('mp4');
    const [serverMessages, setServerMessages] = useState('');
    const [downloaderLoading, setDownloaderLoading] = useState(false);
    const serverMessagesEndRef = useRef(null);

      const scrollToBottomForServerMessages = () => {
        serverMessagesEndRef.current.scrollTop = serverMessagesEndRef.current.scrollHeight;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            toast.loading("Downloading!")
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
            toast.success("Download completed!")
            setVideoUrl('');
            loadLibrary();   
        } catch (error) {
            console.log(error);
            toast.dismiss();
            toast.error("Uh-oh! There was an error with the download. ☹")
        }
    }

    useEffect(() => {
        scrollToBottomForServerMessages();
    }, [serverMessages])

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-sm-5">
                <h3>Download</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="videoUrl">Video URL</label>
                        <input type="url" className="form-control" name="videoUrl" id="videoUrl" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value)}} required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label" htmlFor="downloadType">DownloadType</label>
                        <select className="form-control" name="downloadType" id="downloadType" onChange={(e) => setDownloadType(e.target.value)}>
                            <option value="mp4">Mp4</option>
                            <option value="x">X/Twitter</option>
                            <option value="regular">Best (Possible Non-MP4 file)</option>
                            <option value="mp3">MP3</option>
                        </select>
                    </div>
                    <button className="btn btn-outline-primary" type="submit">Submit</button>
                </form>
            </div>
            <div className="col-12 col-sm-7 align-self-center mt-3 mt-sm-0">
                <div className="whitespace-break-spaces overflow-y-auto max-height-25vh" ref={serverMessagesEndRef}>
                    {/* TODO Make this look nicer. */}
                    {serverMessages}
                </div>
            </div>
        </div>
    )
}
export default Downloader