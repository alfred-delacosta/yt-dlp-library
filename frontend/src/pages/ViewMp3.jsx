import { useParams, useLocation, useNavigate } from "react-router"
import toast from "react-hot-toast";
import Mp3 from "../components/Mp3";
import { api } from "../lib/axios";

const ViewMp3 = () => {
    const location = useLocation();
    const { mp3, serverUrl } = location.state;
    const { id } = useParams();
    const navigate = useNavigate();

    async function deleteMp3ButtonClick(e) {
        try {
            const deleteResults = await api.delete(`/mp3s/${mp3.id}`);
            toast.success('Mp3 deleted')
            navigate("/dashboard")
        } catch (error) {
            console.log(error);
            toast.error("There was an error deleting the MP3")
        }
    }

  return (
    <div className="container">
        <div className="row justify-content-center">
            <div className="col-12 col-sm-10">
                <Mp3 mp3={mp3} serverUrl={serverUrl} deleteMp3ButtonClick={deleteMp3ButtonClick} api={api} />
            </div>
        </div>
    </div>
  )
}
export default ViewMp3