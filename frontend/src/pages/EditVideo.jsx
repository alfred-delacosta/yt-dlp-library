import { useParams, useLocation, useNavigate } from "react-router"
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, useAuthStore } from "../lib/axios";

const EditVideo = () => {
    const { accessToken } = useAuthStore();
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    const location = useLocation();
    const { video, serverUrl } = location.state;
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');

    useEffect(() => {
        setName(video.name);
        setDescription(video.description);
        setLink(video.link);
    }, [])

    async function handleUpdateClick(e) {
        e.preventDefault();
        const data = {
            ...video,
            name,
            description,
            link
        }
        toast.promise(async () => {
            try {
                await api.post('/videos/update', data);
                navigate('/dashboard')
            } catch (error) {
                console.error(error);
            }
        }, {
            loading: "Updating video",
            success: "Video updated! ✅",
            error: "There was an error updating the video"
        })
    }


  return (
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10">
                <form>
                    <div className="mb-3">
                        <label htmlFor="name">Video Name</label>
                        <input type="text" className="form-control" name="name" id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description">Description</label>
                        <textarea name="description" id="description" className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={8}></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="link">Original Link</label>
                        <input type="url" className="form-control" name="link" id="link" value={link} onChange={e => setLink(e.target.value)} />
                    </div>
                    <input type="hidden" name="id" value={video.id} />
                    <input type="hidden" name="downloadDate" value={video.downloadDate} />
                    <input type="hidden" name="ext" value={video.ext} />
                    <input type="hidden" name="type" value={video.type} />
                    <input type="hidden" name="videoPath" value={video.videoPath} />
                    <input type="hidden" name="serverPath" value={video.serverPath} />
                    <input type="hidden" name="userId" value={video.userId} />
                    <div className="d-grid">
                        <button className="btn btn-primary" type="submit" onClick={handleUpdateClick}>Update</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}
export default EditVideo