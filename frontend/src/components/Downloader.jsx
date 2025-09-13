import { useState, useRef } from "react";

const Downloader = ({ api }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [serverMessages, setServerMessages] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const response = await api.post('/ytdlp/download/regular', { videoUrl }, {
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
            console.log("Server messages: ", serverMessages);
            console.log("Values: ", value);
            newMessages += `${value}`;
            setServerMessages(newMessages);
        }
    }

    return (
        <div>
            <h3>Download</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="videoUrl">Video URL</label>
                <input type="url" name="videoUrl" id="videoUrl" value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value)}} />
                <label htmlFor="downloadType">DownloadType</label>
                <select name="downloadType" id="downloadType">
                    <option value="1">YouTube</option>
                    <option value="2">X/Twitter</option>
                    <option value="3">MP3</option>
                    <option value="4">Other</option>
                </select>
                <button type="submit">Submit</button>
            </form>
            <div className="whitespace-pre">
                {/* TODO Make this look nicer. */}
                {serverMessages}
            </div>
        </div>
    )
}
export default Downloader