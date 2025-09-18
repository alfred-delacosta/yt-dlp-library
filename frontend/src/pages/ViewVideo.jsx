import { useParams, useLocation, useNavigate } from "react-router"
import Video from "../components/Video";
import toast from "react-hot-toast";
import { api } from "../lib/axios";

const ViewVideo = () => {
    const location = useLocation();
    const { video, serverUrl } = location.state;
    const { id } = useParams();
    const navigate = useNavigate();

    async function deleteVideoButtonClick(e) {
        try {
            const deleteResults = await api.delete(`/videos/${video.id}`);
            toast.success('Video deleted')
            navigate("/dashboard")
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the video")
        }
    }

  return (
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10">
                <Video video={video} serverUrl={serverUrl} deleteVideoButtonClick={deleteVideoButtonClick} api={api} />
            </div>
        </div>
    </div>
  )
}
export default ViewVideo