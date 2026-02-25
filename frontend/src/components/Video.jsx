import { Link } from 'react-router';
import { Trash2, MonitorUp, HardDriveDownload, SquareArrowOutUpRight, Pencil, Film, ClosedCaption } from 'lucide-react'
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";

const Video = ({ video, serverUrl, deleteVideoButtonClick, transferToJellyfinButtonClick, setVideoLibrary, api }) => {
    const [serverMessages, setServerMessages] = useState('');
    const serverMessagesEndRef = useRef(null);
    const subtitles = `/media/subtitles/${video.id}-${video.name}-subtitle.vtt`
    console.log(subtitles);
    const scrollToBottomForServerMessages = () => {
        serverMessagesEndRef.current.scrollTop = serverMessagesEndRef.current.scrollHeight;
    }

    async function generateSubtitlesButtonClick(e) {
        try {
          const videoId = parseInt(e.target.dataset.videoid);
          toast.promise(async () => {
            const response = await api.post(`/videos/generatesubtitles/${videoId}`, {}, {
                responseType: 'stream',
                adapter: 'fetch',
                headers: {
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                },
            });

            const stream = response.data;

            const reader = stream.pipeThrough(new TextDecoderStream()).getReader();
            let newMessages = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                newMessages += `${value}`;
                setServerMessages(newMessages);
            }
          }, {
            loading: "Generating subtitles...",
            success: (data) => {
                console.log(data);
                return 'Subtitles generated successfully!';
            },
            error: (data) => {
                console.log(data);
                return 'There was an error generating subtitles';
            },
          });
        } catch (error) {
          console.log(error);
          toast.error("There was an error generating subtitles.")
        }
    }

    useEffect(() => {
        scrollToBottomForServerMessages();
    }, [serverMessages])

  return (
    <div>
        <div className="card shadow">
            {video.thumbnailPath && (
                <video className="w-100 h-50vh" loading="lazy" preload="meta" controls src={import.meta.env.PROD ? `/${video.videoPath}` : `${serverUrl}/${video.videoPath}`} poster={import.meta.env.PROD ? `/${video.thumbnailPath}` : `${serverUrl}/${video.thumbnailPath}`}>
                    <track src={subtitles} kind="subtitles" srclang="en" label="English" />
                </video>
            )}
            {video.thumbnailPath === undefined && (
                <video className="w-100 h-50vh" loading="lazy" preload="meta" controls src={import.meta.env.PROD ? `/${video.videoPath}` : `${serverUrl}/${video.videoPath}`} poster="">
                    <track src={subtitles} kind="subtitles" srclang="en" label="English" />
                </video>
            )}
            {video.thumbnailPath === null && (
                <video className="w-100 h-50vh" loading="lazy" preload="meta" controls src={import.meta.env.PROD ? `/${video.videoPath}` : `${serverUrl}/${video.videoPath}`} poster="">
                    <track src={subtitles} kind="subtitles" srclang="en" label="English" />
                </video>
            )}
            <div className="card-body">
                <h5 className="card-title">{video.name}</h5>
                <div className="d-grid">
                    <a className="btn btn-outline-primary" data-bs-toggle="collapse" href={`#collapse-video-${video.id}`} role="button" aria-expanded="false" aria-controls={`collapse-video-${video.id}`}>
                        See Description
                    </a>
                </div>
                <div className="collapse" id={`collapse-video-${video.id}`}>
                    <p className="card-text whitespace-break-spaces max-height-50vh overflow-y-auto border rounded  p-3 mt-3">{video.description}</p>
                </div>
                <div className="row mt-3">
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <Link className='btn btn-primary' to={`/video/${video.id}`} state={{ video, serverUrl }}><MonitorUp /> View Video</Link>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <Link className='btn btn-info' to={`/edit/video/${video.id}`} state={{ video, serverUrl }}><Pencil /> Edit Video</Link>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={import.meta.env.PROD ? `/${video.videoPath}` : `${serverUrl}/${video.videoPath}`} download={""} className='btn btn-success'><HardDriveDownload /> Download</a>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <button type='button' onClick={deleteVideoButtonClick} data-videoid={video.id} className='btn btn-danger'><Trash2 /> Delete</button>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <a href={video.link} target='_blank' className='btn btn-warning'><SquareArrowOutUpRight /> Original Link</a>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <button type='button' onClick={transferToJellyfinButtonClick} data-videoid={video.id} className='btn btn-info'><Film /> Transfer to Jellyfin</button>
                    </div>
                    <div className="col-12 col-sm-6 d-grid mb-1">
                        <button type='button' onClick={generateSubtitlesButtonClick} data-videoid={video.id} className='btn btn-info'><ClosedCaption /> Generate Subtitles</button>
                    </div>
                    <div className="col-12 d-grid mb-1">
                        <div className="whitespace-break-spaces overflow-y-auto max-height-25vh" ref={serverMessagesEndRef}>
                            {serverMessages}
                        </div>
                    </div>
                    <div className="col-12 d-grid mb-1">
                        <div className="whitespace-break-spaces overflow-y-auto max-height-25vh">
                            {video.subtitles}
                        </div>
                    </div>

                </div>
                <div className="row mt-3">
                    <div className="col-12 text-center">
                        <h6>Download Date: {new Date(video.downloadDate).toLocaleString()}</h6>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
export default Video